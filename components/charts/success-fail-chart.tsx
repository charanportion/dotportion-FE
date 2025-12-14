"use client";

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A radial bar chart with stacked sections";

const chartConfig = {
  success: {
    label: "Success",
    color: "var(--chart-1)",
  },
  failed: {
    label: "Failed",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

interface SuccessFailChartProps {
  successCalls: number;
  failedCalls: number;
}

export function SuccessFailChart({
  successCalls,
  failedCalls,
}: SuccessFailChartProps) {
  const chartData = [{ success: successCalls, failed: failedCalls }];
  const totalCalls = successCalls + failedCalls;

  return (
    <Card className="flex flex-col h-full w-full shadow-none border border-neutral-300 py-4">
      <CardHeader className="items-center pb-0 px-4">
        <CardTitle className="font-inter text-sm font-medium">
          API Success vs Failed
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-0 flex flex-col items-center justify-end mt-auto px-4 -mb-16">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={chartData}
            endAngle={180}
            innerRadius={80}
            outerRadius={160}
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
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {totalCalls.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground"
                        >
                          Total Calls
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
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
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
      </CardFooter>
    </Card>
  );
}
