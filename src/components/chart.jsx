"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
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

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-3))",
  },
};

export function UserCountChart() {
  return (
    <Card className="border-none shadow-none bg-none bg-opacity-0 flex gap-x-5 gap-y-1 items-center flex-wrap">
      <CardHeader className="sr-only">
        <CardTitle>Bar Chart</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ChartContainer config={chartConfig} className="h-16">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent  />}
            />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8}/>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm p-0">
        <div className="flex gap-2 font-medium leading-none">
          10 new users last week <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground text-xs flex gap-1 items-center">
          <div className="w-[5px] h-[5px] rounded-full bg-blue-500 "></div>
          From latest data
        </div>
      </CardFooter>
    </Card>
  );
}

export function TimeSpentChart() {
  return (
    <Card className="w-full shadow-none border-none">
      <CardHeader className="flex flex-col items-start">
        <CardTitle>Activity</CardTitle>
        <CardDescription>20 hours for last 24 hours</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
