"use client";

import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
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

// Updated chart data structure
const chartData = [
  { sub: "Net & Com", performance: 20 },
  { sub: "Sys Dev", performance: 10 },
  { sub: "DBMS", performance: 30 },
  { sub: "Coding", performance: 50 },
  { sub: "Web Dev", performance: 40 },
  { sub: "OS", performance: 20 },
];

const chartConfig = {
  performance: {
    label: "Performance",
    color: "#0197f6", // Customize as needed
  },
};

export function UnitAvgMarksChart() {
  return (
    <Card className="flex flex-col m-1 mt-0 shadow-sm border-none max-w-80 w-full bg-slate-50">
      <CardHeader>
        <CardTitle>Your average performance</CardTitle>
        <CardDescription>in each unit</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            {/* Updated X-axis to use 'sub' */}
            <XAxis
              dataKey="sub"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 4)} // Optional formatter
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value) => `Performance: ${value}%`}
                  custom={(payload) => {
                    if (!payload || !payload.length) return null;
                    const { payload: barData } = payload[0];
                    return (
                      <div className="p-2 bg-white shadow-md rounded text-sm">
                        <div>{`Subject: ${barData.sub}`}</div>
                        <div>{`Performance: ${barData.performance}%`}</div>
                      </div>
                    );
                  }}
                />
              }
            />
            {/* Updated Bar to use 'performance' */}
            <Bar dataKey="performance" fill="var(--color-desktop)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
                formatter={(value) => `${value}%`}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none items-center">
          Overall performance is <span className="text-lg">40%</span>{" "}
        </div>
        <div className="leading-none text-muted-foreground">
          Data from your all attempts
        </div>
      </CardFooter>
    </Card>
  );
}
