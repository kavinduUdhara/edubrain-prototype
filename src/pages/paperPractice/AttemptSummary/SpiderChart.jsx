"use client";

import { TrendingUp } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A radar chart with dots";

// ChartConfig to use for radar fill color, etc.
const chartConfig = {
  performance: {
    label: "Performance",
    color: "#0197f6", // Customize as needed
  },
};

export default function SpiderChart({ chartData, attemptId }) {
  // Find the lowest performance score for the footer message
  const filteredData = chartData.filter((item) => item.unit_title !== "Other");
  const lowestPerformance = filteredData.reduce(
    (prev, current) =>
      prev.performance < current.performance ? prev : current,
    filteredData[0]
  );

  return (
    <Card className="flex flex-col m-1 mt-0 shadow-sm border-none max-w-96">
      <CardHeader className="items-center">
        <CardDescription>
          The score that you have taken in each unit
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} formatter={(value) => {return `Performance: ${value}%` }}/>
            <PolarAngleAxis
              dataKey="unit_title"
              tick={({ x, y, textAnchor, value, index, ...props }) => {
                const data = chartData[index];
                return (
                  <text
                    x={x}
                    y={index === 0 ? y - 10 : y}
                    textAnchor={textAnchor}
                    fontSize={13}
                    fontWeight={500}
                    {...props}
                  >
                    <tspan>{data.performance}%</tspan>
                    <tspan
                      x={x}
                      dy={"1rem"}
                      fontSize={12}
                      className="fill-muted-foreground"
                    >
                      {data.unit_title}
                    </tspan>
                  </text>
                );
              }}
            />
            <PolarGrid />
            <Radar
              dataKey="performance"
              fill="var(--color-performance)" // Use the configured color
              fillOpacity={0.6}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Your lowest score is for {lowestPerformance.unit_title}. Try working on it{" "}
        </div>
        <div className="flex items-center gap-2 leading-none text-muted-foreground">
          #{attemptId}
        </div>
      </CardFooter>
    </Card>
  );
}
