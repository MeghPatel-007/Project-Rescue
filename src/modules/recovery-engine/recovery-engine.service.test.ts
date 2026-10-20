import { describe, expect, it } from "bun:test";
import { RecoveryEngineService } from "./recovery-engine.service";

const analyzedAt = new Date("2026-10-20T12:00:00.000Z");

describe("RecoveryEngineService", () => {
  it("orders prerequisites before dependent work while retaining explainable priority scores", () => {
    const result = RecoveryEngineService.analyze({
      analyzedAt,
      issues: [
        { id: "auth", title: "Fix authentication", state: "open", criticality: "critical", assigneeCount: 1, labels: [], updatedAt: "2026-10-19", estimatedHours: 3, releaseRequired: true },
        { id: "demo", title: "Finish demo flow", state: "open", criticality: "high", assigneeCount: 1, labels: [], updatedAt: "2026-10-19", estimatedHours: 4, releaseRequired: true },
        { id: "polish", title: "Polish copy", state: "open", criticality: "low", assigneeCount: 1, labels: [], updatedAt: "2026-10-19", estimatedHours: 1 },
      ],
      dependencies: [{ blockingIssueId: "auth", blockedIssueId: "demo", dependencyType: "blocks" }],
    });

    expect(result.plan.valid).toBe(true);
    expect(result.plan.items.map((item) => item.issueId)).toEqual(["auth", "demo", "polish"]);
    expect(result.plan.items[1]?.prerequisites).toEqual(["auth"]);
    expect(result.priorityScores.find((score) => score.issueId === "auth")?.score).toBeGreaterThan(0);
    expect(result.findings.some((finding) => finding.category === "dependency_blocker" && finding.issueId === "demo")).toBe(true);
  });

  it("reports cycles as validation failures instead of issuing an executable schedule", () => {
    const result = RecoveryEngineService.analyze({
      analyzedAt,
      issues: [
        { id: "one", title: "One", state: "open", criticality: "high", updatedAt: analyzedAt },
        { id: "two", title: "Two", state: "open", criticality: "high", updatedAt: analyzedAt },
      ],
      dependencies: [
        { blockingIssueId: "one", blockedIssueId: "two" },
        { blockingIssueId: "two", blockedIssueId: "one" },
      ],
    });

    expect(result.plan.valid).toBe(false);
    expect(result.cycles).toEqual([["one", "two", "one"]]);
    expect(result.plan.validationFindings[0]).toContain("Dependency cycle");
    expect(result.plan.items).toEqual([]);
  });

  it("separates observed stale and release blockers from an inferred assignment risk", () => {
    const result = RecoveryEngineService.analyze({
      analyzedAt,
      staleAfterDays: 7,
      issues: [
        { id: "deploy", title: "Stabilize deployment", state: "open", criticality: "critical", assigneeCount: 0, labels: [], updatedAt: "2026-10-01", releaseRequired: true },
      ],
      dependencies: [],
    });

    expect(result.findings).toEqual(expect.arrayContaining([
      expect.objectContaining({ category: "stale_work_blocker", observed: true }),
      expect.objectContaining({ category: "release_blocker", observed: true }),
      expect.objectContaining({ category: "assignment_risk", observed: false }),
    ]));
    expect(result.priorityScores[0]?.confidence).toBeLessThan(1);
  });

  it("rejects malformed dependency references as a data-quality validation failure", () => {
    const result = RecoveryEngineService.analyze({
      analyzedAt,
      issues: [{ id: "known", title: "Known", state: "open", criticality: "medium", updatedAt: analyzedAt }],
      dependencies: [{ blockingIssueId: "missing", blockedIssueId: "known" }],
    });

    expect(result.plan.valid).toBe(false);
    expect(result.invalidDependencies).toHaveLength(1);
    expect(result.findings[0]).toMatchObject({ category: "data_quality_blocker", observed: true });
  });
});
