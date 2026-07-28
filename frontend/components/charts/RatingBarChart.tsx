"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { RatingBreakdown } from "@/lib/types";
import { CHART_GRID, CHART_TEXT } from "./colors";
import ChartCard from "./ChartCard";

export default function RatingBarChart({ data }: { data: RatingBreakdown[] }) {
  const withLabels = data.map((d) => ({ ...d, label: `${d.rating}★` }));
  return (
    <ChartCard title="Your ratings" subtitle="How you've scored the albums you've rated">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={withLabels} margin={{ left: -20, right: 10 }}>
          <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" stroke={CHART_TEXT} fontSize={12} tickLine={false} axisLine={{ stroke: CHART_GRID }} />
          <YAxis stroke={CHART_TEXT} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
            contentStyle={{ background: "#1B1B2B", border: "1px solid #28283C", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#F3F2F8" }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#FBBF24" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
