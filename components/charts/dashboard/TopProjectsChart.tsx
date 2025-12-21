// components/charts/dashboard/TopProjectsChart.tsx
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

export function TopProjectsChart({
  data,
}: {
  data: { name: string; calls: number }[];
}) {
  const chartConfig: ChartConfig = {
    calls: { label: "API Calls", color: "var(--chart-3)" },
  };
  const hasData =
    Array.isArray(data) && data.length > 0 && data.some((d) => d.calls > 0);
  return (
    <Card className="shadow-none border border-border py-4">
      <CardHeader className="pb-2 px-4">
        <CardTitle className="flex items-center gap-2 font-inter text-sm font-medium">
          Top Projects by API Calls
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {hasData ? (
          <ChartContainer config={chartConfig} className="w-full h-[300px]">
            <BarChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="calls" fill="var(--chart-3)" radius={8} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-48 text-gray-400">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
