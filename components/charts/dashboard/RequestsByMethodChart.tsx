"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

export function RequestsByMethodChart({
  data,
}: {
  data: { method: string; count: number }[];
}) {
  const chartConfig: ChartConfig = {
    count: { label: "Requests", color: "var(--chart-4)" },
  };

  const hasData =
    Array.isArray(data) && data.length > 0 && data.some((d) => d.count > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔀 Requests by Method</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer config={chartConfig}>
            <BarChart data={data} width={400} height={250}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="method"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="count" fill="var(--chart-4)" radius={8} />
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
