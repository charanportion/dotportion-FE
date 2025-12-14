// components/charts/dashboard/SecretsByProviderPieChart.tsx
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Pie, PieChart } from "recharts";

export function SecretsByProviderPieChart({
  data,
}: {
  data: { provider: string; count: number }[];
}) {
  const chartData = data.map((d, i) => ({
    name: d.provider,
    value: d.count,
    fill: `var(--chart-${(i % 5) + 1})`,
  }));

  const chartConfig: ChartConfig = {
    value: { label: "Count" },
  };
  const hasData =
    Array.isArray(data) && data.length > 0 && data.some((d) => d.count > 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>🔑 Secrets by Provider</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart width={300} height={250}>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie data={chartData} dataKey="value" nameKey="name" />
            </PieChart>
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
