"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { cn } from "@/lib/utils";
import {
  analyticsApi,
  type ApiCallData,
  type CallsOverTimeParams,
} from "@/lib/api/analytics";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ApiCallsChartProps {
  projectId?: string;
  className?: string;
  title?: string;
  description?: string;
}

type DateRange = "7" | "30" | "90";

const DATE_RANGE_OPTIONS = [
  { value: "7" as DateRange, label: "Last 7 days" },
  { value: "30" as DateRange, label: "Last 30 days" },
  { value: "90" as DateRange, label: "Last 90 days" },
];

// Define chartConfig
const chartConfig = {
  totalCalls: {
    label: "API Calls",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

// Helper function to generate complete time series with 0 values
const generateCompleteTimeSeries = (dateRange: DateRange): ApiCallData[] => {
  const series: ApiCallData[] = [];
  const days = Number.parseInt(dateRange);
  const today = new Date();

  // Generate days going backwards from today
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    series.push({
      label: format(date, "yyyy-MM-dd"),
      totalCalls: 0,
    });
  }

  return series;
};

// Helper function to merge API data with complete time series
const mergeWithCompleteTimeSeries = (
  completeTimeSeries: ApiCallData[],
  apiData: ApiCallData[]
): ApiCallData[] => {
  const dataMap = new Map<string, number>();

  // Create a map of API data for quick lookup
  apiData.forEach((item) => {
    dataMap.set(item.label, item.totalCalls);
  });

  // Merge the data
  return completeTimeSeries.map((item) => ({
    ...item,
    totalCalls: dataMap.get(item.label) || 0,
  }));
};

export function ApiCallsChart({
  projectId = "123abc",
  className,
  title = "API Calls Over Time",
}: // description = "Monitor your API usage patterns and trends",
ApiCallsChartProps) {
  const [data, setData] = useState<ApiCallData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states - groupBy is now constant as "day"
  const [dateRange, setDateRange] = useState<DateRange>("7");
  // const groupBy = "day"; // Constant value

  // Fetch data function
  const fetchApiCallsData = useCallback(async () => {
    if (!projectId) return;

    setIsLoading(true);
    setError(null);

    try {
      const params: CallsOverTimeParams = {
        projectId,
        range: dateRange,
        groupBy: "day", // Always use day grouping
      };

      const apiData = await analyticsApi.getCallsOverTime(params);

      // Generate complete time series and merge with API data
      const completeTimeSeries = generateCompleteTimeSeries(dateRange);
      const mergedData = mergeWithCompleteTimeSeries(
        completeTimeSeries,
        apiData
      );

      setData(mergedData);
    } catch (err: unknown) {
      console.error("Failed to fetch API calls data:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load API calls data";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, dateRange]);

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchApiCallsData();
  }, [fetchApiCallsData]);

  // Format chart labels
  const formatLabel = (label: string): string => {
    try {
      // Handle "yyyy-MM-dd" format
      if (label.includes("-") && label.length === 10) {
        return format(new Date(label), "MMM dd");
      }
      return label;
    } catch {
      return label;
    }
  };

  // Calculate total calls for summary
  // const totalCalls = data.reduce((sum, item) => sum + item.totalCalls, 0);
  // const averageCalls =
  //   data.length > 0 ? Math.round(totalCalls / data.length) : 0;

  return (
    <Card
      className={cn("w-full shadow-none border border-border py-4", className)}
    >
      <CardHeader className="pb-2 px-4">
        {/* Filters */}
        <div className="flex items-center justify-between">
          {/* Date Range Selector */}
          <CardTitle className="flex items-center gap-2 font-inter text-sm font-medium">
            {title}
          </CardTitle>
          <Select
            value={dateRange}
            onValueChange={(value: DateRange) => setDateRange(value)}
          >
            <SelectTrigger className="w-[140px] h-7">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="px-4">
        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && data.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No API calls found
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              No API calls were made in the last {dateRange} days
            </p>
          </div>
        )}

        {/* Area Chart with Gradient */}
        {!isLoading && !error && data.length > 0 && (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart
              accessibilityLayer
              data={data}
              margin={{
                top: 10,
                right: 20,
                left: 20,
                bottom: 10,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickFormatter={formatLabel}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                interval="preserveStartEnd"
              />
              {/* <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                allowDecimals={false}
              /> */}
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel={false}
                    formatter={(value) => [`${value} calls`, "API Calls"]}
                    labelFormatter={(label) => formatLabel(String(label))}
                  />
                }
              />
              <defs>
                <linearGradient id="fillTotalCalls" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-totalCalls)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-totalCalls)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <Area
                dataKey="totalCalls"
                type="monotone"
                fill="url(#fillTotalCalls)"
                fillOpacity={0.4}
                stroke="var(--color-totalCalls)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
