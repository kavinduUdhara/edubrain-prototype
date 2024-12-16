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
    label: "weight",
    color: "#001f3f", // Customize as needed
  },
};

export default function UnitWeightChart({}) {
  const chartData = [
    {
      unit_id: 6,
      shrt: "Net & Com",
      question_frequency: 24,
      avg_correctness: 0.0625,
      weight: 3.339583668300758,
      percentage_weight: 13.630870187418253
    },
    {
      unit_id: 7,
      shrt: "Sys Des",
      question_frequency: 22,
      avg_correctness: 0.15384615384615385,
      weight: 2.966659911994503,
      percentage_weight: 12.108741737616176
    },
    {
      unit_id: 8,
      shrt: "DBMS",
      question_frequency: 22,
      avg_correctness: 0.26666666666666666,
      weight: 2.6129118466076249,
      percentage_weight: 10.664880934214791
    },
    {
      unit_id: 9,
      shrt: "Coding",
      question_frequency: 22,
      avg_correctness: 0.5,
      weight: 1.8812965295574897,
      percentage_weight: 7.6787142726346485
    },
    {
      unit_id: 10,
      shrt: "Web Dev",
      question_frequency: 16,
      avg_correctness: 0.6,
      weight: 1.4166066720281081,
      percentage_weight: 5.7820326037439269
    },
    {
      unit_id: 3,
      shrt: "Num Sys",
      question_frequency: 14,
      avg_correctness: 0.0,
      weight: 2.9788552212124308,
      percentage_weight: 12.158518204791674
    },
    {
      unit_id: 5,
      shrt: "OS",
      question_frequency: 10,
      avg_correctness: 0.0,
      weight: 2.6376848000782078,
      percentage_weight: 10.765994410161415
    },
    // {
    //   unit_id: 2,
    //   shrt: "Comp Intr",
    //   question_frequency: 6,
    //   avg_correctness: 0.25,
    //   weight: 1.6540236266970161,
    //   percentage_weight: 6.7510754578283958
    // },
  //   {
  //     unit_id: 4,
  //     shrt: "Logic Gts",
  //     question_frequency: 6,
  //     avg_correctness: 0.0,
  //     weight: 2.1405011639608444,
  //     percentage_weight: 8.736685886601455
  //   },{
  //   unit_id: 1,
  //   shrt: "ICT Basic",
  //   question_frequency: 5,
  //   avg_correctness: 0.0,
  //   weight: 1.9709354161508605,
  //   percentage_weight: 8.0445850362561071
  // }, {
  //   unit_id: 13,
  //   shrt: "New Tech",
  //   question_frequency: 1,
  //   avg_correctness: 1.0,
  //   weight: 0.069314718055994526,
  //   percentage_weight: 0.28291548221024188
  // }, {
  //   unit_id: 12,
  //   shrt: "ICT Biz",
  //   question_frequency: 1,
  //   avg_correctness: 1.0,
  //   weight: 0.069314718055994526,
  //   percentage_weight: 0.28291548221024188
  // },
  // {
  //   unit_id: 11,
  //   shrt: "IoT",
  //   question_frequency: 1,
  //   avg_correctness: 0.0,
  //   weight: 0.76246189861593983,
  //   percentage_weight: 3.112070304312661
  // }
  ];

  return (
    <Card className="flex flex-col m-1 mt-0 shadow-sm border-none max-w-80 w-full bg-slate-50">
      <CardHeader>
        <CardTitle>Weight in each unit</CardTitle>
        <CardDescription>not every unit is important as you think it is</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} formatter={(value) => {return `Weight: ${value}` }}/>
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
                    <tspan>{data.percentage_weight.toFixed(1)}%  </tspan>
                    <tspan
                      x={x}
                      dy={"1rem"}
                      fontSize={12}
                      className="fill-muted-foreground"
                    >
                      {data.shrt}
                    </tspan>
                  </text>
                );
              }}
            />
            <PolarGrid />
            <Radar
              dataKey="weight"
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
      {/* <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Your lowest score is for {lowestPerformance.unit_title}. Try working on it{" "}
        </div>
        <div className="flex items-center gap-2 leading-none text-muted-foreground">
          #{attemptId}
        </div>
      </CardFooter> */}
    </Card>
  );
}
