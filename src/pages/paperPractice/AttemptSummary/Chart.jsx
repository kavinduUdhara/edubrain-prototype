"use client";

import {
  Bar,
  BarChart,
  Label,
  Rectangle,
  ReferenceLine,
  XAxis,
} from "recharts";

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
import { useEffect, useState } from "react";
import { formatTime } from "./AnalyticsFunctions";

// Accepting data as a prop
export default function Chart({ data = [] }) { // Default to empty array if no data provided
  const [avgDuration, setAvgDuration] = useState(0);

  useEffect(() => {
    if (data.length > 0) {

      // Calculating average duration
      function calculateAverageDuration(arr) {
        const totalDuration = arr.reduce((sum, item) => sum + item.duration, 0);
        return totalDuration / arr.length;
      }
      
      const averageDuration = calculateAverageDuration(data);
      setAvgDuration(averageDuration);
    }
  }, [data]); // Recalculate when data changes

  return (
    <>
      <CardHeader className="space-y-0 pb-2 sticky left-0 top-0">
        <CardDescription>Max time spent in a question</CardDescription>
        <CardTitle className="text-4xl tabular-nums">
          30{" "}
          <span className="font-sans text-sm font-normal tracking-normal text-muted-foreground">
            seconds
          </span>
        </CardTitle>
      </CardHeader>
      <Card className="shadow-none border-none" style={{ minWidth: "1160px" }}>
        <CardContent>
          <ChartContainer
            config={{
              steps: {
                label: "duration",
                color: "hsl(var(--chart-1))",
              },
            }}
            style={{ height: "200px" }}
            className="w-full"
          >
            <BarChart
              accessibilityLayer
              margin={{
                left: -4,
                right: -4,
              }}
              data={data} // Using passed data prop
              height={100}
            >
              <Bar
                dataKey="duration"
                fill="#31b4bb"
                radius={5}
                fillOpacity={0.8}
                activeBar={<Rectangle fillOpacity={1} />}
              />
              <XAxis
                dataKey="id"
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                tickFormatter={(value) => {
                  return value.slice(-2);
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideIndicator
                    labelFormatter={(value) => {
                      return `Question No: ${value.slice(-2)}`;
                    }}
                    formatter={(value) => {return `Duration: ${formatTime(value)}`}}
                  />
                }
                cursor={false}
              />
              <ReferenceLine
                y={avgDuration}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="3 3"
                strokeWidth={1}
              >
                <Label
                  position="insideBottomLeft"
                  value="Average Duration"
                  offset={10}
                  fill="hsl(var(--foreground))"
                />
                <Label
                  position="insideTopLeft"
                  value={(Math.round(avgDuration * 10) / 10) + " sec"}
                  className="text-lg"
                  fill="hsl(var(--foreground))"
                  offset={10}
                  startOffset={100}
                />
              </ReferenceLine>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <CardFooter className="flex-col items-start gap-1 sticky left-0 top-0">
        <CardDescription>
          Spent a lot of time on question no.{" "}
          <span className="font-medium text-foreground">37</span>.
        </CardDescription>
        <CardDescription>
          {"Don’t forget to tackle Unit "} <span className="font-medium text-foreground">5 Programming</span>{"! "}
          Keep it up!
        </CardDescription>
      </CardFooter>
    </>
  );
}
