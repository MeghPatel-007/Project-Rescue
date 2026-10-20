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
import { Button } from "@/components/ui/button";
import { useDashboardUIStore, DateRangeOption } from "@/stores/dashboard-ui.store";
import { Activity } from "lucide-react";

interface HealthTrendPoint {
  date: string;
  healthScore: number;
  blockers: number;
}

export function HealthTrendChart({ data }: { data: HealthTrendPoint[] }) {
  const dateRange = useDashboardUIStore((s) => s.dateRange);
  const setDateRange = useDashboardUIStore((s) => s.setDateRange);

  const ranges: DateRangeOption[] = ["7d", "14d", "30d", "90d"];

  return (
    <Card className="border-border/80">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-2">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            <span>Repository Health &amp; Stability Trajectory</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Normalized repository stability score (0–100%) against unresolved dependency bottlenecks.
          </CardDescription>
        </div>
        <div className="flex items-center gap-1 border rounded-md p-0.5 bg-muted/40">
          {ranges.map((r) => (
            <Button
              key={r}
              variant={dateRange === r ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setDateRange(r)}
              className="h-7 px-2.5 text-xs font-mono"
            >
              {r}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-56 items-center justify-center text-xs text-muted-foreground font-mono">
            No telemetry data recorded yet. Connect a repository to start tracking.
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
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
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as HealthTrendPoint;
                      return (
                        <div className="rounded-lg border border-border bg-popover p-2.5 shadow-md text-xs font-mono">
                          <p className="font-semibold text-foreground mb-1">{item.date}</p>
                          <p className="text-primary">Health Score: {item.healthScore}%</p>
                          <p className="text-destructive">Active Blockers: {item.blockers}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="healthScore"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#healthGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
