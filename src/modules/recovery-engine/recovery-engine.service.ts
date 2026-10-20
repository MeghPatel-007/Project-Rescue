import {
  recoveryAnalysisInputSchema,
  type RecoveryAnalysisInput,
  type RecoveryDependencyInput,
  type RecoveryIssueInput,
} from "@/validation/recovery-analysis.validation.schema";

export type RecoveryFindingCategory =
  | "dependency_blocker"
  | "assignment_risk"
  | "stale_work_blocker"
  | "release_blocker"
  | "data_quality_blocker";

export interface RecoveryFinding {
  category: RecoveryFindingCategory;
  issueId?: string;
  observed: boolean;
  confidence: number;
  evidence: string[];
}

export interface PriorityScore {
  issueId: string;
  score: number;
  confidence: number;
  factors: {
    blockerImpact: number;
    criticalPathRelevance: number;
    releaseRisk: number;
    staleness: number;
    dependencyCentrality: number;
  };
  reasons: string[];
}

export interface RecoveryPlanDraftItem {
  issueId: string;
  title: string;
  orderIndex: number;
  priorityScore: number;
  prerequisites: string[];
  recommendation: string;
}

export interface RecoveryAnalysis {
  findings: RecoveryFinding[];
  cycles: string[][];
  invalidDependencies: RecoveryDependencyInput[];
  priorityScores: PriorityScore[];
  plan: {
    valid: boolean;
    items: RecoveryPlanDraftItem[];
    assumptions: string[];
    validationFindings: string[];
  };
}

const criticalityScore = {
  low: 0.25,
  medium: 0.5,
  high: 0.75,
  critical: 1,
} as const;

const clamp = (value: number) => Math.max(0, Math.min(1, value));

function openBlockingDependencies(
  dependencies: RecoveryDependencyInput[],
  issuesById: Map<string, RecoveryIssueInput>,
) {
  return dependencies.filter((dependency) =>
    dependency.dependencyType === "blocks" &&
    issuesById.get(dependency.blockingIssueId)?.state === "open" &&
    issuesById.get(dependency.blockedIssueId)?.state === "open",
  );
}

function findCycles(issueIds: string[], dependencies: RecoveryDependencyInput[]) {
  const outgoing = new Map(issueIds.map((id) => [id, [] as string[]]));
  for (const dependency of dependencies) {
    if (dependency.dependencyType === "blocks") {
      outgoing.get(dependency.blockingIssueId)?.push(dependency.blockedIssueId);
    }
  }

  const state = new Map<string, "visiting" | "visited">();
  const path: string[] = [];
  const cycles: string[][] = [];
  const signatures = new Set<string>();

  const visit = (issueId: string) => {
    state.set(issueId, "visiting");
    path.push(issueId);

    for (const nextIssueId of outgoing.get(issueId) ?? []) {
      if (state.get(nextIssueId) === "visiting") {
        const cycle = [...path.slice(path.indexOf(nextIssueId)), nextIssueId];
        const signature = [...cycle.slice(0, -1)].sort().join("|");
        if (!signatures.has(signature)) {
          signatures.add(signature);
          cycles.push(cycle);
        }
      } else if (!state.has(nextIssueId)) {
        visit(nextIssueId);
      }
    }

    path.pop();
    state.set(issueId, "visited");
  };

  for (const issueId of issueIds) {
    if (!state.has(issueId)) visit(issueId);
  }
  return cycles;
}

function downstreamCounts(issueIds: string[], dependencies: RecoveryDependencyInput[]) {
  const outgoing = new Map(issueIds.map((id) => [id, [] as string[]]));
  for (const dependency of dependencies) {
    if (dependency.dependencyType === "blocks") {
      outgoing.get(dependency.blockingIssueId)?.push(dependency.blockedIssueId);
    }
  }

  return new Map(issueIds.map((issueId) => {
    const reached = new Set<string>();
    const pending = [...(outgoing.get(issueId) ?? [])];
    while (pending.length > 0) {
      const current = pending.pop();
      if (!current || reached.has(current)) continue;
      reached.add(current);
      pending.push(...(outgoing.get(current) ?? []));
    }
    return [issueId, reached.size];
  }));
}

function recommendationFor(issue: RecoveryIssueInput, findingCategories: Set<RecoveryFindingCategory>) {
  if (findingCategories.has("dependency_blocker")) return "Resolve this prerequisite before scheduling dependent work.";
  if (findingCategories.has("release_blocker")) return "Validate release acceptance criteria and assign an explicit owner.";
  if (findingCategories.has("assignment_risk")) return "Confirm an owner before committing this work to the recovery schedule.";
  if (findingCategories.has("stale_work_blocker")) return "Reconfirm status and remaining effort before scheduling this work.";
  return `Prioritize ${issue.title} according to its recovery score.`;
}

export const RecoveryEngineService = {
  analyze(input: RecoveryAnalysisInput): RecoveryAnalysis {
    const parsed = recoveryAnalysisInputSchema.parse(input);
    const analyzedAt = parsed.analyzedAt ?? new Date();
    const issuesById = new Map(parsed.issues.map((issue) => [issue.id, issue]));
    const duplicateIssueIds = parsed.issues
      .map((issue) => issue.id)
      .filter((id, index, ids) => ids.indexOf(id) !== index);
    if (duplicateIssueIds.length > 0) {
      throw new Error(`Issue IDs must be unique: ${[...new Set(duplicateIssueIds)].join(", ")}`);
    }

    const invalidDependencies = parsed.dependencies.filter((dependency) =>
      dependency.blockingIssueId === dependency.blockedIssueId ||
      !issuesById.has(dependency.blockingIssueId) ||
      !issuesById.has(dependency.blockedIssueId),
    );
    const validDependencies = parsed.dependencies.filter((dependency) => !invalidDependencies.includes(dependency));
    const openIssues = parsed.issues.filter((issue) => issue.state === "open");
    const openIssueIds = openIssues.map((issue) => issue.id);
    const openDependencies = openBlockingDependencies(validDependencies, issuesById);
    const cycles = findCycles(openIssueIds, openDependencies);
    const findings: RecoveryFinding[] = invalidDependencies.map((dependency) => ({
      category: "data_quality_blocker",
      observed: true,
      confidence: 1,
      evidence: [`Dependency ${dependency.blockingIssueId} -> ${dependency.blockedIssueId} references an unknown or identical issue.`],
    }));

    for (const dependency of openDependencies) {
      findings.push({
        category: "dependency_blocker",
        issueId: dependency.blockedIssueId,
        observed: true,
        confidence: dependency.confidence / 100,
        evidence: [`Issue ${dependency.blockedIssueId} cannot proceed until open issue ${dependency.blockingIssueId} is resolved.`],
      });
    }

    for (const cycle of cycles) {
      findings.push({
        category: "data_quality_blocker",
        observed: true,
        confidence: 1,
        evidence: [`Blocking dependency cycle detected: ${cycle.join(" -> ")}.`],
      });
    }

    for (const issue of openIssues) {
      const ageInDays = Math.max(0, (analyzedAt.getTime() - issue.updatedAt.getTime()) / 86_400_000);
      if (ageInDays >= parsed.staleAfterDays) {
        findings.push({
          category: "stale_work_blocker",
          issueId: issue.id,
          observed: true,
          confidence: 1,
          evidence: [`No update for ${Math.floor(ageInDays)} days (threshold: ${parsed.staleAfterDays} days).`],
        });
      }
      if (issue.releaseRequired) {
        findings.push({
          category: "release_blocker",
          issueId: issue.id,
          observed: true,
          confidence: 1,
          evidence: ["This issue is marked as required for the release and remains open."],
        });
      }
      if (issue.assigneeCount === 0 && issue.criticality !== "low") {
        findings.push({
          category: "assignment_risk",
          issueId: issue.id,
          observed: false,
          confidence: 0.6,
          evidence: ["No assignee is recorded for an open medium-or-higher criticality issue."],
        });
      }
    }

    const downstream = downstreamCounts(openIssueIds, openDependencies);
    const maxDownstream = Math.max(1, ...downstream.values());
    const findingCategoriesByIssue = new Map<string, Set<RecoveryFindingCategory>>();
    for (const finding of findings) {
      if (!finding.issueId) continue;
      const categories = findingCategoriesByIssue.get(finding.issueId) ?? new Set<RecoveryFindingCategory>();
      categories.add(finding.category);
      findingCategoriesByIssue.set(finding.issueId, categories);
    }

    const priorityScores = openIssues.map((issue) => {
      const categories = findingCategoriesByIssue.get(issue.id) ?? new Set<RecoveryFindingCategory>();
      const ageInDays = Math.max(0, (analyzedAt.getTime() - issue.updatedAt.getTime()) / 86_400_000);
      const dependencyCentrality = (downstream.get(issue.id) ?? 0) / maxDownstream;
      const blockerImpact = clamp(
        dependencyCentrality + (categories.has("dependency_blocker") ? 0.5 : 0),
      );
      const releaseRisk = clamp(criticalityScore[issue.criticality] + (issue.releaseRequired ? 0.25 : 0));
      const staleness = clamp(ageInDays / Math.max(parsed.staleAfterDays * 4, 1));
      const estimated = issue.estimatedHours !== undefined;
      const confidence = clamp(0.55 + (estimated ? 0.2 : 0) + (issue.assigneeCount > 0 ? 0.15 : 0) + (categories.has("data_quality_blocker") ? -0.3 : 0));
      const score = 100 * (
        0.3 * blockerImpact +
        0.25 * dependencyCentrality +
        0.25 * releaseRisk +
        0.1 * staleness +
        0.1 * dependencyCentrality
      );
      const reasons = [
        `Blocker impact: ${Math.round(blockerImpact * 100)}%.`,
        `Release risk: ${Math.round(releaseRisk * 100)}%.`,
        `Dependency centrality: ${Math.round(dependencyCentrality * 100)}%.`,
      ];
      if (!estimated) reasons.push("Confidence is reduced because the effort estimate is unknown.");

      return {
        issueId: issue.id,
        score: Math.round(score * 10) / 10,
        confidence: Math.round(confidence * 100) / 100,
        factors: { blockerImpact, criticalPathRelevance: dependencyCentrality, releaseRisk, staleness, dependencyCentrality },
        reasons,
      };
    }).sort((left, right) => right.score - left.score || left.issueId.localeCompare(right.issueId));

    const scoresByIssueId = new Map(priorityScores.map((score) => [score.issueId, score]));
    const prerequisitesByIssue = new Map(openIssueIds.map((id) => [id, [] as string[]]));
    const outgoingByIssue = new Map(openIssueIds.map((id) => [id, [] as string[]]));
    for (const dependency of openDependencies) {
      prerequisitesByIssue.get(dependency.blockedIssueId)?.push(dependency.blockingIssueId);
      outgoingByIssue.get(dependency.blockingIssueId)?.push(dependency.blockedIssueId);
    }

    const indegree = new Map(openIssueIds.map((id) => [id, prerequisitesByIssue.get(id)?.length ?? 0]));
    const ready = openIssueIds.filter((id) => indegree.get(id) === 0);
    const orderedIssueIds: string[] = [];
    while (ready.length > 0) {
      ready.sort((left, right) => (scoresByIssueId.get(right)?.score ?? 0) - (scoresByIssueId.get(left)?.score ?? 0));
      const issueId = ready.shift();
      if (!issueId) break;
      orderedIssueIds.push(issueId);
      for (const dependentIssueId of outgoingByIssue.get(issueId) ?? []) {
        const nextIndegree = (indegree.get(dependentIssueId) ?? 1) - 1;
        indegree.set(dependentIssueId, nextIndegree);
        if (nextIndegree === 0) ready.push(dependentIssueId);
      }
    }

    const validationFindings = [
      ...invalidDependencies.map((dependency) => `Invalid dependency: ${dependency.blockingIssueId} -> ${dependency.blockedIssueId}.`),
      ...cycles.map((cycle) => `Dependency cycle prevents scheduling: ${cycle.join(" -> ")}.`),
    ];
    const planValid = validationFindings.length === 0;
    const items = orderedIssueIds.map((issueId, orderIndex) => {
      const issue = issuesById.get(issueId)!;
      return {
        issueId,
        title: issue.title,
        orderIndex,
        priorityScore: scoresByIssueId.get(issueId)?.score ?? 0,
        prerequisites: prerequisitesByIssue.get(issueId) ?? [],
        recommendation: recommendationFor(issue, findingCategoriesByIssue.get(issueId) ?? new Set()),
      };
    });

    return {
      findings,
      cycles,
      invalidDependencies,
      priorityScores,
      plan: {
        valid: planValid,
        items,
        assumptions: [
          "Only explicit 'blocks' relationships constrain the schedule.",
          "Priority scores are explainable heuristics, not calibrated probabilities.",
          "Generated recommendations do not create or execute GitHub changes.",
        ],
        validationFindings,
      },
    };
  },
};
