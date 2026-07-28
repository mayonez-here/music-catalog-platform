"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { GenreCount } from "@/lib/types";
import { CHART_PALETTE } from "./colors";
import ChartCard from "./ChartCard";

export default function GenreDonutChart({ data }: { data: GenreCount[] }) {
  return (
    <ChartCard title="Genre mix" subtitle="Share of your library by genre">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="genre"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} stroke="#0A0A12" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "#1B1B2B", border: "1px solid #28283C", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#F3F2F8" }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#8D8CA3" }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
