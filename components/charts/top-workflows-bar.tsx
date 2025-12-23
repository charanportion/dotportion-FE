"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TopWorkflow } from "@/lib/api/projects";

export const description = "A bar chart";

interface TopWorkflowsBarChartProps {
  topWorkflows: TopWorkflow[];
}

const chartConfig = {
  calls: {
    label: "API Calls",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function TopWorkflowsBarChart({
  topWorkflows,
}: TopWorkflowsBarChartProps) {
  // Prepare data for recharts: [{ name: "Workflow 1", calls: 123 }, ...]
  const chartData = topWorkflows.map((tw) => ({
    name: tw.workflowId?.name ?? "Unknown",
    calls: tw.calls,
  }));

  const hasData =
    topWorkflows.length > 0 && topWorkflows.some((tw) => (tw.calls ?? 0) > 0);

  return (
    <Card className="flex flex-col h-full w-full shadow-none border border-border py-4">
      <CardHeader className="items-center pb-0 px-4">
        <CardTitle className="font-inter text-sm font-medium">
          Top Workflows
        </CardTitle>
        {/* <CardDescription>Most called workflows</CardDescription> */}
      </CardHeader>
      <CardContent className="px-4">
        {hasData ? (
          <ChartContainer config={chartConfig} className="w-full h-[300px]">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="calls" fill="var(--chart-1)" radius={8} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[300px] w-full flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No data available
            </p>
            <p className="text-xs text-muted-foreground">
              API calls will appear here once workflows are executed.
            </p>
          </div>
        )}
      </CardContent>
      {/* <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="text-muted-foreground leading-none">
          Showing most called workflows
        </div>
      </CardFooter> */}
    </Card>
  );
}
