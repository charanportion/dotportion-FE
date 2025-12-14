"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

export function SuccessFailPieChart({
  data,
}: {
  data: { success: number; failed: number };
}) {
  const chartData = [{ success: data.success, failed: data.failed }];

  const chartConfig: ChartConfig = {
    success: {
      label: "Success",
      color: "var(--chart-1)",
    },
    failed: {
      label: "Failed",
      color: "var(--chart-2)",
    },
  };

  const hasData = data && (data.success > 0 || data.failed > 0);
  const total = data.success + data.failed;

  return (
    <Card className="shadow-none border border-neutral-300 py-4">
      <CardHeader className="pb-2 px-4">
        <CardTitle className="flex items-center gap-2 font-inter text-sm font-medium">
          API Success vs Failed
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {hasData ? (
          <>
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-w-[250px]"
            >
              <RadialBarChart
                data={chartData}
                endAngle={180}
                innerRadius={80}
                outerRadius={130}
              >
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) - 16}
                              className="fill-foreground text-2xl font-bold"
                            >
                              {total.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 4}
                              className="fill-muted-foreground"
                            >
                              Total
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </PolarRadiusAxis>
                <RadialBar
                  dataKey="success"
                  stackId="a"
                  cornerRadius={5}
                  fill="var(--color-success)"
                  className="stroke-transparent stroke-2"
                />
                <RadialBar
                  dataKey="failed"
                  fill="var(--color-failed)"
                  stackId="a"
                  cornerRadius={5}
                  className="stroke-transparent stroke-2"
                />
              </RadialBarChart>
            </ChartContainer>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[var(--chart-1)]" />
                <span className="text-sm text-muted-foreground">Success</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[var(--chart-2)]" />
                <span className="text-sm text-muted-foreground">Failed</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-48 text-gray-400">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
