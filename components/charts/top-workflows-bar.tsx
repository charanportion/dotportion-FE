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

  return (
    <Card className="flex flex-col h-full w-full shadow-none border border-border py-4">
      <CardHeader className="items-center pb-0 px-4">
        <CardTitle className="font-inter text-sm font-medium">
          Top Workflows
        </CardTitle>
        {/* <CardDescription>Most called workflows</CardDescription> */}
      </CardHeader>
      <CardContent className="px-4">
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
      </CardContent>
      {/* <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="text-muted-foreground leading-none">
          Showing most called workflows
        </div>
      </CardFooter> */}
    </Card>
  );
}
