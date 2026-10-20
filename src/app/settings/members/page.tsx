"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Users, UserPlus, Shield, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useWorkspace } from "@/providers/WorkspaceProvider";

interface Member {
  id: string;
  userId: string;
  role: "owner" | "admin" | "member" | "viewer";
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

function WorkspaceMembersContent() {
  const { currentWorkspace } = useWorkspace();
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get("workspaceId") || currentWorkspace?.id || null;

  const [members, setMembers] = React.useState<Member[]>([]);
  const [loading, setLoading] = React.useState(Boolean(workspaceId));
  const [error, setError] = React.useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = React.useState(0);

  const [targetUserId, setTargetUserId] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState<"owner" | "admin" | "member" | "viewer">("member");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!workspaceId) {
      return;
    }

    let active = true;

    fetch(`/api/workspaces/${workspaceId}/members`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load members");
        return res.json();
      })
      .then((data) => {
        if (active) {
          setMembers(data.members || []);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Error loading members");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [workspaceId, refreshIndex]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId, role: selectedRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add member");
      }

      setTargetUserId("");
      setRefreshIndex((prev) => prev + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error adding member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!workspaceId) return;
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/members/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove member");
      }

      setRefreshIndex((prev) => prev + 1);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error removing member");
    }
  };

  if (!workspaceId) {
    return (
      <AppShell>
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-foreground">Workspace Members</h1>
          <Card className="p-12 text-center border-dashed">
            <p className="text-xs font-mono text-muted-foreground mb-4">
              Please select a workspace from the workspace switcher or workspace list.
            </p>
            <Link href="/workspaces">
              <Button size="sm" className="font-mono text-xs shadow-none">Go to Workspaces</Button>
            </Link>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <Link href="/workspaces" className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="size-3.5" /> Back to Workspaces
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="size-4 text-foreground" />
              <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-foreground">
                Workspace Members
              </h1>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm font-sans">
              Role-based access control (RBAC) and team governance for this workspace.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3.5 text-xs font-mono text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* Members List */}
          <Card className="md:col-span-2 border-border bg-card">
            <CardHeader className="pb-3 border-b border-border/70">
              <CardTitle className="text-base font-medium font-sans flex items-center gap-2">
                <Users className="size-4 text-foreground" /> Team Members ({members.length})
              </CardTitle>
              <CardDescription className="text-xs font-sans text-muted-foreground">
                Authorized accounts with scoped access to repositories and recovery plans.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-xs font-mono text-muted-foreground">
                  Loading member directory...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/70">
                      <TableHead className="font-mono text-xs">User</TableHead>
                      <TableHead className="font-mono text-xs">Role</TableHead>
                      <TableHead className="font-mono text-xs">Joined</TableHead>
                      <TableHead className="text-right font-mono text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id} className="border-b border-border/60">
                        <TableCell>
                          <div className="font-medium text-xs font-sans text-foreground">{member.user.name || "Member"}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">{member.user.email}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={member.role === "owner" ? "default" : "secondary"} className="capitalize text-[10px] font-mono">
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[11px] font-mono text-muted-foreground">
                          {new Date(member.joinedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {member.role !== "owner" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveMember(member.userId)}
                              className="text-muted-foreground hover:text-destructive h-7 w-7"
                              title="Remove member"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Add Member Card */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3 border-b border-border/70">
              <CardTitle className="text-base font-medium font-sans flex items-center gap-2">
                <UserPlus className="size-4 text-foreground" /> Add Member
              </CardTitle>
              <CardDescription className="text-xs font-sans text-muted-foreground">
                Grant workspace access to an existing user.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 font-mono text-xs">
              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="userId" className="text-xs font-sans">User ID</Label>
                  <Input
                    id="userId"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    placeholder="Enter User ID"
                    className="text-xs font-mono h-8"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="role" className="text-xs font-sans">Role</Label>
                  <Select
                    value={selectedRole}
                    onValueChange={(v) => setSelectedRole(v as "owner" | "admin" | "member" | "viewer")}
                  >
                    <SelectTrigger id="role" className="text-xs font-mono h-8">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer (Read-only)</SelectItem>
                      <SelectItem value="member">Member (Can analyze &amp; plan)</SelectItem>
                      <SelectItem value="admin">Admin (Manage integrations &amp; members)</SelectItem>
                      <SelectItem value="owner">Owner (Full control)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-md bg-muted/30 border border-border/70 p-3 text-[11px] text-muted-foreground space-y-1 font-sans">
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <Shield className="size-3.5" /> RBAC Guidelines
                  </div>
                  <div><strong>Admin:</strong> Manage GitHub connection &amp; approve changes.</div>
                  <div><strong>Member:</strong> View repos &amp; generate recovery plans.</div>
                </div>
                <Button type="submit" className="w-full text-xs font-mono h-8 shadow-none" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Member"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

export default function WorkspaceMembersPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs font-mono text-muted-foreground">Loading members...</div>}>
      <WorkspaceMembersContent />
    </React.Suspense>
  );
}
