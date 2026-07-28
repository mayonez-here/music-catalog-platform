"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { YearCount } from "@/lib/types";
import { CHART_GRID, CHART_TEXT } from "./colors";
import ChartCard from "./ChartCard";

export default function ReleasesLineChart({ data }: { data: YearCount[] }) {
  return (
    <ChartCard title="Releases by year" subtitle="When the albums in your library came out">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: -20, right: 10 }}>
          <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="year" stroke={CHART_TEXT} fontSize={12} tickLine={false} axisLine={{ stroke: CHART_GRID }} />
          <YAxis stroke={CHART_TEXT} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: "#1B1B2B", border: "1px solid #28283C", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#F3F2F8" }}
          />
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
          </defs>
          <Line
            type="monotone"
            dataKey="count"
            stroke="url(#lineGradient)"
            strokeWidth={3}
            dot={{ r: 4, fill: "#EC4899", strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
