"use client";

import { TrendingUp } from "lucide-react";
import { LabelList, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const colors = [
  "#2461e6",
  "#60a7fa",
  "#3b85f5",
  "#84b7e9",
  "#0197f6",
  "#bedcfe",
]; // Customize as needed for color variety
// A function to generate dynamic chartConfig based on chartData
const generateChartConfig = (data) => {
  const config = {
    questions: { label: "questions" },
  };
  data.forEach((item, index) => {
    config[item.unit_title] = {
      label: item.unit_title,
      color: colors[index], // Assign colors cyclically
    };
  });
  return config;
};

export function PieChartWeightUnit({ chartData }) {
  const totalCount = chartData.reduce((sum, item) => sum + item.count, 0);
  const remainingCount = 50 - totalCount;
  const modifiedChartData = [
    ...chartData.map((item, index) => ({
      ...item,
      fill: colors[index % colors.length], // Assign a color to each item
    }))];
  const chartConfig = generateChartConfig(modifiedChartData);

  return (
    <Card className="flex flex-col m-1 mt-0 shadow-sm border-none max-w-96">
      <CardHeader className="items-center pb-0">
        <CardDescription>Unit Impact on The Exam</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={modifiedChartData}
              dataKey="count"
              label
              nameKey="unit_title"
            >
              <LabelList
                dataKey="unit_title"
                className="fill-background"
                stroke="none"
                fontSize={12}
                formatter={(value) => chartConfig[value]?.label}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <CardFooter className="flex-col gap-2 text-sm">
          {modifiedChartData.length > 0 && (
            <div className="items-center gap-2 font-medium leading-none">
              {/* Get the highest count value without considering 'other' */}
              {(() => {
                // Filter out the 'other' unit (unit_id: 404)
                const filteredUnits = modifiedChartData.filter(
                  (item) => item.unit_id !== "other"
                );

                const highestCount = Math.max(
                  ...filteredUnits.map((item) => item.count)
                );

                // Filter all units with the highest count
                const highestUnits = filteredUnits.filter(
                  (item) => item.count === highestCount
                );

                // Return a string based on how many units have the highest count
                if (highestUnits.length === 1) {
                  return (
                    <>
                      {highestUnits[0].count}% of questions have been asked by{" "}
                      {highestUnits[0].unit_title}
                      <TrendingUp className="h-4 w-4 inline-block" />
                    </>
                  );
                } else {
                  const unitNames = highestUnits
                    .map((unit) => unit.unit_title)
                    .join(" and ");
                  return (
                    <>
                      {highestUnits[0].count}% of questions have been asked by{" "}
                      {unitNames}
                      <TrendingUp className="h-4 w-4 inline-block" />
                    </>
                  );
                }
              })()}
            </div>
          )}
        </CardFooter>
      </CardContent>
    </Card>
  );
}
