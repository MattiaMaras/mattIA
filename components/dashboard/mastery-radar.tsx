"use client"

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

export interface MasteryDatum {
  topic: string
  mastery: number // 0..100
}

export function MasteryRadar({ data }: { data: MasteryDatum[] }) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="topic"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          />
          <PolarRadiusAxis
            domain={[0, 100]}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            axisLine={false}
          />
          <Radar
            name="Padronanza"
            dataKey="mastery"
            stroke="var(--primary)"
            fill="var(--primary)"
            fillOpacity={0.35}
          />
          <Tooltip
            formatter={(value) => [`${Math.round(Number(value))}%`, "Padronanza"]}
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              fontSize: 12,
              color: "var(--popover-foreground)",
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
