"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { ShieldAlert } from "lucide-react";

interface SeverityPoint {
  severity: string;
  count: number;
  fill: string;
}

export function FindingsDistributionChart({ data }: { data: SeverityPoint[] }) {
  const router = useRouter();
  const { getWorkspaceUrl } = useWorkspace();

  const handleBarClick = (entry: SeverityPoint) => {
    router.push(getWorkspaceUrl(`/findings?severity=${entry.severity.toLowerCase()}`));
  };

  return (
    <Card className="border-border/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-amber-500" />
            <span>Findings by Severity</span>
          </span>
          <span className="text-xs font-mono text-muted-foreground font-normal">
            Click bar to filter
          </span>
        </CardTitle>
        <CardDescription className="text-xs">
          Open findings classified by topological impact and blast radius.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.every((d) => d.count === 0) ? (
          <div className="flex h-56 items-center justify-center text-xs text-muted-foreground font-mono">
            Zero open findings detected across workspace repositories.
          </div>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                <XAxis
                  dataKey="severity"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as SeverityPoint;
                      return (
                        <div className="rounded-lg border border-border bg-popover p-2.5 shadow-md text-xs font-mono">
                          <p className="font-semibold text-foreground">{item.severity} Severity</p>
                          <p className="text-muted-foreground">{item.count} open issues</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="count"
                  radius={[4, 4, 0, 0]}
                  onClick={(entry) => handleBarClick(entry as unknown as SeverityPoint)}
                  className="cursor-pointer"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
