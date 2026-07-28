"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrackCountBucket } from "@/lib/types";
import { CHART_GRID, CHART_TEXT, CHART_PALETTE } from "./colors";
import ChartCard from "./ChartCard";

export default function TrackCountHistogram({ data }: { data: TrackCountBucket[] }) {
  return (
    <ChartCard title="Album length" subtitle="Histogram of track counts per album">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -20, right: 10 }}>
          <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="bucketLabel" stroke={CHART_TEXT} fontSize={12} tickLine={false} axisLine={{ stroke: CHART_GRID }} />
          <YAxis stroke={CHART_TEXT} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
            contentStyle={{ background: "#1B1B2B", border: "1px solid #28283C", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#F3F2F8" }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
