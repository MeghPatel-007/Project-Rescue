"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LifeBuoy } from "lucide-react";

interface ActivityPoint {
  date: string;
  proposed: number;
  approved: number;
  completed: number;
}

export function RecoveryActivityChart({ data }: { data: ActivityPoint[] }) {
  return (
    <Card className="border-border/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <LifeBuoy className="size-4 text-primary" />
            <span>AI Recovery Pipeline Velocity</span>
          </span>
          <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-amber-500" /> Proposed
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-blue-500" /> Approved
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-emerald-500" /> Completed
            </span>
          </div>
        </CardTitle>
        <CardDescription className="text-xs">
          Recovery strategies proposed by AI vs human approvals and executed patches.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.every((d) => d.proposed === 0 && d.approved === 0 && d.completed === 0) ? (
          <div className="flex h-56 items-center justify-center text-xs text-muted-foreground font-mono">
            Zero recovery jobs initiated yet. Detected blockers will seed automated plans.
          </div>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="proposedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D97706" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#D97706" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="approvedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                <XAxis
                  dataKey="date"
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
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as ActivityPoint;
                      return (
                        <div className="rounded-lg border border-border bg-popover p-2.5 shadow-md text-xs font-mono">
                          <p className="font-semibold text-foreground mb-1">{item.date}</p>
                          <p className="text-amber-500">Proposed: {item.proposed}</p>
                          <p className="text-blue-500">Approved: {item.approved}</p>
                          <p className="text-emerald-500">Completed: {item.completed}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="proposed"
                  stroke="#D97706"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#proposedGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="approved"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#approvedGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
