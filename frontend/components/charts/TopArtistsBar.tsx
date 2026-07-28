"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ArtistCount } from "@/lib/types";
import { CHART_GRID, CHART_TEXT, CHART_PALETTE } from "./colors";
import ChartCard from "./ChartCard";

export default function TopArtistsBar({ data }: { data: ArtistCount[] }) {
  return (
    <ChartCard title="Top artists" subtitle="Who shows up most in your library">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" stroke={CHART_TEXT} fontSize={12} tickLine={false} axisLine={{ stroke: CHART_GRID }} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="artist"
            stroke={CHART_TEXT}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
            contentStyle={{ background: "#1B1B2B", border: "1px solid #28283C", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#F3F2F8" }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={16}>
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
