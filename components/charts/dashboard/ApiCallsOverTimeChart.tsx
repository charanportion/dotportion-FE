"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

export function ApiCallsOverTimeChart({
  data,
}: {
  data: { date: string; calls: number }[];
}) {
  const chartConfig: ChartConfig = {
    calls: {
      label: "API Calls",
      color: "var(--chart-1)",
    },
  };

  const hasData =
    Array.isArray(data) && data.length > 0 && data.some((d) => d.calls > 0);

  return (
    <Card className="shadow-none border border-border py-4">
      <CardHeader className="pb-2 px-4">
        <CardTitle className="flex items-center gap-2 font-inter text-sm font-medium">
          API Calls Overtime
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {hasData ? (
          <ChartContainer config={chartConfig} className="w-full h-[300px]">
            <AreaChart
              accessibilityLayer
              data={data}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <defs>
                <linearGradient id="fillCalls" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-calls)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-calls)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <Area
                dataKey="calls"
                type="natural"
                fill="url(#fillCalls)"
                fillOpacity={0.4}
                stroke="var(--color-calls)"
                strokeWidth={2}
              />
            </AreaChart>
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
