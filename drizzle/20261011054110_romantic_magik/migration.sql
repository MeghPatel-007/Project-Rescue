CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL UNIQUE,
	"description" text,
	"owner_id" text NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"workspace_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" varchar(50) DEFAULT 'member' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "github_installations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"workspace_id" uuid NOT NULL,
	"installation_id" bigint NOT NULL,
	"account_login" varchar(255) NOT NULL,
	"account_type" varchar(50) NOT NULL,
	"repository_selection" varchar(50) DEFAULT 'all' NOT NULL,
	"permissions" jsonb DEFAULT '{}',
	"installed_by_user_id" text,
	"encrypted_token" text,
	"token_expires_at" timestamp with time zone,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"workspace_id" uuid NOT NULL,
	"github_installation_id" uuid,
	"name" varchar(255) NOT NULL,
	"repo_owner" varchar(255) NOT NULL,
	"repo_name" varchar(255) NOT NULL,
	"github_repo_id" bigint NOT NULL,
	"default_branch" varchar(100) DEFAULT 'main' NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"health_score" integer DEFAULT 100,
	"version" integer DEFAULT 1 NOT NULL,
	"last_synced_at" timestamp with time zone,
	"settings" jsonb DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "github_issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"project_id" uuid NOT NULL,
	"github_issue_id" bigint NOT NULL,
	"issue_number" integer NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"state" varchar(50) DEFAULT 'open' NOT NULL,
	"state_reason" varchar(100),
	"author_login" varchar(255),
	"assignees" jsonb DEFAULT '[]',
	"labels" jsonb DEFAULT '[]',
	"is_blocked" boolean DEFAULT false NOT NULL,
	"blocker_count" integer DEFAULT 0 NOT NULL,
	"criticality" varchar(50) DEFAULT 'medium',
	"github_created_at" timestamp with time zone,
	"github_updated_at" timestamp with time zone,
	"github_closed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "github_pull_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"project_id" uuid NOT NULL,
	"github_pr_id" bigint NOT NULL,
	"pr_number" integer NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"state" varchar(50) DEFAULT 'open' NOT NULL,
	"is_draft" boolean DEFAULT false NOT NULL,
	"head_ref" varchar(255),
	"base_ref" varchar(255),
	"author_login" varchar(255),
	"assignees" jsonb DEFAULT '[]',
	"labels" jsonb DEFAULT '[]',
	"merged_at" timestamp with time zone,
	"github_created_at" timestamp with time zone,
	"github_updated_at" timestamp with time zone,
	"github_closed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "issue_dependencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"project_id" uuid NOT NULL,
	"blocking_issue_id" uuid NOT NULL,
	"blocked_issue_id" uuid NOT NULL,
	"dependency_type" varchar(50) DEFAULT 'blocks' NOT NULL,
	"discovered_by" varchar(50) DEFAULT 'ai_agent' NOT NULL,
	"confidence" integer DEFAULT 100,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"project_id" uuid NOT NULL,
	"trigger" varchar(50) DEFAULT 'scheduled' NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"issues_synced" integer DEFAULT 0,
	"prs_synced" integer DEFAULT 0,
	"dependencies_detected" integer DEFAULT 0,
	"error_message" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"snapshot_reference" text
);
--> statement-breakpoint
CREATE TABLE "recovery_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"project_id" uuid NOT NULL,
	"created_by_id" text,
	"title" varchar(255) NOT NULL,
	"description" text,
	"version" integer DEFAULT 1 NOT NULL,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"risk_level" varchar(50) DEFAULT 'medium',
	"assumptions" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recovery_plan_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"plan_id" uuid NOT NULL,
	"issue_id" uuid,
	"order_index" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"action_type" varchar(100) NOT NULL,
	"action_payload" jsonb DEFAULT '{}' NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"requires_approval" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"plan_item_id" uuid NOT NULL,
	"requested_by_id" text,
	"decision_by_id" text,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"decision_note" text,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"decided_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "action_executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"approval_id" uuid,
	"plan_item_id" uuid NOT NULL,
	"idempotency_key" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"executed_by" varchar(50) DEFAULT 'system' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"execution_payload" jsonb DEFAULT '{}',
	"result" jsonb DEFAULT '{}',
	"error_message" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"project_id" uuid NOT NULL,
	"plan_id" uuid,
	"trigger" varchar(50) DEFAULT 'manual' NOT NULL,
	"status" varchar(50) DEFAULT 'running' NOT NULL,
	"prompt" text,
	"model" varchar(100),
	"tokens_used" integer,
	"summary" text,
	"error_message" text,
	"mongo_artifact_ids" jsonb DEFAULT '[]',
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"workspace_id" uuid NOT NULL,
	"project_id" uuid,
	"user_id" text,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" varchar(255) NOT NULL,
	"details" jsonb DEFAULT '{}',
	"ip_address" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "github_delivery_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"delivery_id" varchar(255) NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"installation_id" bigint,
	"repo_name" varchar(255),
	"status" varchar(50) DEFAULT 'received' NOT NULL,
	"error_message" text,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
CREATE INDEX "workspace_owner_id_idx" ON "workspaces" ("owner_id");--> statement-breakpoint
CREATE INDEX "workspace_slug_idx" ON "workspaces" ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_members_workspace_user_unique" ON "workspace_members" ("workspace_id","user_id");--> statement-breakpoint
CREATE INDEX "workspace_members_workspace_id_idx" ON "workspace_members" ("workspace_id");--> statement-breakpoint
CREATE INDEX "workspace_members_user_id_idx" ON "workspace_members" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "github_installations_installation_id_unique" ON "github_installations" ("installation_id");--> statement-breakpoint
CREATE INDEX "github_installations_workspace_id_idx" ON "github_installations" ("workspace_id");--> statement-breakpoint
CREATE INDEX "github_installations_account_login_idx" ON "github_installations" ("account_login");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_workspace_repo_unique" ON "projects" ("workspace_id","repo_owner","repo_name");--> statement-breakpoint
CREATE INDEX "projects_workspace_id_idx" ON "projects" ("workspace_id");--> statement-breakpoint
CREATE INDEX "projects_github_installation_id_idx" ON "projects" ("github_installation_id");--> statement-breakpoint
CREATE INDEX "projects_github_repo_id_idx" ON "projects" ("github_repo_id");--> statement-breakpoint
CREATE UNIQUE INDEX "github_issues_github_issue_id_unique" ON "github_issues" ("github_issue_id");--> statement-breakpoint
CREATE UNIQUE INDEX "github_issues_project_number_unique" ON "github_issues" ("project_id","issue_number");--> statement-breakpoint
CREATE INDEX "github_issues_project_state_idx" ON "github_issues" ("project_id","state");--> statement-breakpoint
CREATE INDEX "github_issues_project_is_blocked_idx" ON "github_issues" ("project_id","is_blocked");--> statement-breakpoint
CREATE UNIQUE INDEX "github_prs_github_pr_id_unique" ON "github_pull_requests" ("github_pr_id");--> statement-breakpoint
CREATE UNIQUE INDEX "github_prs_project_number_unique" ON "github_pull_requests" ("project_id","pr_number");--> statement-breakpoint
CREATE INDEX "github_prs_project_state_idx" ON "github_pull_requests" ("project_id","state");--> statement-breakpoint
CREATE UNIQUE INDEX "issue_dependencies_blocking_blocked_unique" ON "issue_dependencies" ("blocking_issue_id","blocked_issue_id");--> statement-breakpoint
CREATE INDEX "issue_dependencies_project_id_idx" ON "issue_dependencies" ("project_id");--> statement-breakpoint
CREATE INDEX "issue_dependencies_blocking_idx" ON "issue_dependencies" ("blocking_issue_id");--> statement-breakpoint
CREATE INDEX "issue_dependencies_blocked_idx" ON "issue_dependencies" ("blocked_issue_id");--> statement-breakpoint
CREATE INDEX "sync_runs_project_started_idx" ON "sync_runs" ("project_id","started_at");--> statement-breakpoint
CREATE INDEX "sync_runs_status_idx" ON "sync_runs" ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "recovery_plans_project_version_unique" ON "recovery_plans" ("project_id","version");--> statement-breakpoint
CREATE INDEX "recovery_plans_project_status_idx" ON "recovery_plans" ("project_id","status");--> statement-breakpoint
CREATE INDEX "recovery_plans_created_by_idx" ON "recovery_plans" ("created_by_id");--> statement-breakpoint
CREATE INDEX "recovery_plan_items_plan_order_idx" ON "recovery_plan_items" ("plan_id","order_index");--> statement-breakpoint
CREATE INDEX "recovery_plan_items_issue_idx" ON "recovery_plan_items" ("issue_id");--> statement-breakpoint
CREATE INDEX "recovery_plan_items_status_idx" ON "recovery_plan_items" ("status");--> statement-breakpoint
CREATE INDEX "approvals_plan_item_idx" ON "approvals" ("plan_item_id");--> statement-breakpoint
CREATE INDEX "approvals_status_requested_idx" ON "approvals" ("status","requested_at");--> statement-breakpoint
CREATE INDEX "approvals_decision_by_idx" ON "approvals" ("decision_by_id");--> statement-breakpoint
CREATE UNIQUE INDEX "action_executions_idempotency_key_unique" ON "action_executions" ("idempotency_key");--> statement-breakpoint
CREATE INDEX "action_executions_plan_item_idx" ON "action_executions" ("plan_item_id");--> statement-breakpoint
CREATE INDEX "action_executions_approval_idx" ON "action_executions" ("approval_id");--> statement-breakpoint
CREATE INDEX "action_executions_status_idx" ON "action_executions" ("status");--> statement-breakpoint
CREATE INDEX "agent_runs_project_started_idx" ON "agent_runs" ("project_id","started_at");--> statement-breakpoint
CREATE INDEX "agent_runs_plan_idx" ON "agent_runs" ("plan_id");--> statement-breakpoint
CREATE INDEX "agent_runs_status_idx" ON "agent_runs" ("status");--> statement-breakpoint
CREATE INDEX "audit_events_workspace_created_idx" ON "audit_events" ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_events_project_created_idx" ON "audit_events" ("project_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_events_user_created_idx" ON "audit_events" ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_events_action_idx" ON "audit_events" ("action");--> statement-breakpoint
CREATE UNIQUE INDEX "github_delivery_events_delivery_id_unique" ON "github_delivery_events" ("delivery_id");--> statement-breakpoint
CREATE INDEX "github_delivery_events_event_type_status_idx" ON "github_delivery_events" ("event_type","status");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_owner_id_user_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "github_installations" ADD CONSTRAINT "github_installations_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "github_installations" ADD CONSTRAINT "github_installations_installed_by_user_id_user_id_fkey" FOREIGN KEY ("installed_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_github_installation_id_github_installations_id_fkey" FOREIGN KEY ("github_installation_id") REFERENCES "github_installations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "github_issues" ADD CONSTRAINT "github_issues_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "github_pull_requests" ADD CONSTRAINT "github_pull_requests_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "issue_dependencies" ADD CONSTRAINT "issue_dependencies_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "issue_dependencies" ADD CONSTRAINT "issue_dependencies_blocking_issue_id_github_issues_id_fkey" FOREIGN KEY ("blocking_issue_id") REFERENCES "github_issues"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "issue_dependencies" ADD CONSTRAINT "issue_dependencies_blocked_issue_id_github_issues_id_fkey" FOREIGN KEY ("blocked_issue_id") REFERENCES "github_issues"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sync_runs" ADD CONSTRAINT "sync_runs_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "recovery_plans" ADD CONSTRAINT "recovery_plans_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "recovery_plans" ADD CONSTRAINT "recovery_plans_created_by_id_user_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "recovery_plan_items" ADD CONSTRAINT "recovery_plan_items_plan_id_recovery_plans_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "recovery_plans"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "recovery_plan_items" ADD CONSTRAINT "recovery_plan_items_issue_id_github_issues_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "github_issues"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_plan_item_id_recovery_plan_items_id_fkey" FOREIGN KEY ("plan_item_id") REFERENCES "recovery_plan_items"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_requested_by_id_user_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_decision_by_id_user_id_fkey" FOREIGN KEY ("decision_by_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "action_executions" ADD CONSTRAINT "action_executions_approval_id_approvals_id_fkey" FOREIGN KEY ("approval_id") REFERENCES "approvals"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "action_executions" ADD CONSTRAINT "action_executions_plan_item_id_recovery_plan_items_id_fkey" FOREIGN KEY ("plan_item_id") REFERENCES "recovery_plan_items"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_plan_id_recovery_plans_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "recovery_plans"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL;