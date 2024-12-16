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
import { useEffect, useState } from "react";
import { db, auth } from "@/firebase";
import { getDoc, doc } from "firebase/firestore";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FiInfo } from "react-icons/fi";

const chartConfig = {
  performance: {
    label: "Performance",
    color: "#0197f6", // Customize as needed
  },
};

export function UnitAvgMarksChart() {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [attempt_count, setAttemptCount] = useState(0);
  const [avg_grades, setAvgGrades] = useState(0);

  useEffect(() => {
    if (!auth.currentUser) return;
    const fetchData = async () => {
      const avgPerformanceDoc = await getDoc(
        doc(
          db,
          "users",
          auth.currentUser.uid,
          "user-sensitive-info",
          "avg_performance"
        )
      );
      const unitDoc = await getDoc(doc(db, "brief_det", "units"));
      const unitData = unitDoc.exists() ? unitDoc.data().data : {};
      console.log("getting user data");
      if (avgPerformanceDoc.exists()) {
        const perfromanceData = avgPerformanceDoc.data();
        const performanceData = avgPerformanceDoc.data().data; // Array of performance data
        const attemptCount = avgPerformanceDoc.data().attempt_count;

        const excludedUnitIds = ["1", "2", "3", "4", "11"]; // Ensure it's a string array
        const enrichedData = performanceData
          .filter(
            (performance) => !excludedUnitIds.includes(performance.unit_id)
          ) // Exclude units
          .map((performance) => {
            const unitDetails = unitData[performance.unit_id]; // Match by unit_id
            return {
              ...performance,
              avg_grades: parseFloat((performance.avg_grades * 100).toFixed(1)), // Convert to percentage and round to 1 decimal point
              ...unitDetails, // Add unit details
            };
          });
        const totalAvgGrades = enrichedData.reduce(
          (sum, unit) => sum + unit.avg_grades,
          0
        );
        const avgPerformance =
          enrichedData.length > 0
            ? (totalAvgGrades / enrichedData.length).toFixed(1)
            : 0;
        setAvgGrades(avgPerformance); // Update average performance
        console.log(enrichedData);
        setChartData(enrichedData); // Update chart data with enriched details
        setAttemptCount(attemptCount); // Update attempt count
        setLoading(false); // Loading is done
      } else {
        console.log("No data found");
        setLoading(false); // Loading is done
      }
    };
    fetchData();
  }, []);

  return (
    <Card className="flex flex-col m-1 mt-0 shadow-sm border-none max-w-80 w-full bg-slate-50">
      <CardHeader>
        <CardTitle>Your average performance</CardTitle>
        <CardDescription>in each unit</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="def-loading-box bg-white h-32">
            <div className="absolute z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 bg-white p-1 px-2 rounded-full shadow-md">
              <AiOutlineLoading3Quarters className="def-loading-svg" />
              Loading...
            </div>
          </div>
        )}
        {chartData.length == 0 && !loading && (
          <div className="bg-white py-9 px-3 rounded-md shadow text-center text-slate-700"><FiInfo className="inline-block mr-2 -mt-[3px]"/>Do atleast 1 paper to unlock analytics data</div>
        )}
        {chartData.length != 0 && !loading && (
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
                dataKey="shrt"
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
              <Bar dataKey="avg_grades" fill="var(--color-desktop)" radius={8}>
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
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none items-center">
          Overall performance is{" "}
          <span className="text-lg">{avg_grades ? `${avg_grades}%` : "¬_¬"}</span>{" "}
        </div>
        <div className="leading-none text-muted-foreground">
          Data from your all {attempt_count && `(${attempt_count})`} attempts
        </div>
      </CardFooter>
    </Card>
  );
}
