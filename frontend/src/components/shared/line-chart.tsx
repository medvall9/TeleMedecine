"use client"

import { useId } from "react"

export interface ChartPoint {
  label: string
  current: number
  previous: number
}

interface LineChartProps {
  data: ChartPoint[]
  showPrevious?: boolean
  height?: number
}

export function LineChart({ data, showPrevious = false, height = 240 }: LineChartProps) {
  const gradientId = useId()
  const width = 720
  const padX = 16
  const padY = 24
  const max = Math.max(...data.flatMap((d) => [d.current, showPrevious ? d.previous : 0])) * 1.15 || 1

  const xFor = (i: number) => padX + (i * (width - padX * 2)) / Math.max(1, data.length - 1)
  const yFor = (v: number) => padY + (1 - v / max) * (height - padY * 2)

  const toPath = (key: "current" | "previous") =>
    data.map((d, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(d[key])}`).join(" ")

  const areaPath = `${toPath("current")} L ${xFor(data.length - 1)} ${height - padY} L ${xFor(0)} ${height - padY} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ height }}
      role="img"
      aria-label="Graphique d'évolution des consultations"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line
          key={t}
          x1={padX}
          x2={width - padX}
          y1={padY + t * (height - padY * 2)}
          y2={padY + t * (height - padY * 2)}
          stroke="var(--border)"
          strokeDasharray="4 6"
        />
      ))}

      <path d={areaPath} fill={`url(#${gradientId})`} />

      {showPrevious && (
        <path d={toPath("previous")} fill="none" stroke="var(--muted-foreground)" strokeWidth={2} strokeDasharray="5 5" opacity={0.6} />
      )}

      <path d={toPath("current")} fill="none" stroke="var(--chart-1)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      {data.map((d, i) => (
        <g key={d.label}>
          <circle cx={xFor(i)} cy={yFor(d.current)} r={3.5} fill="var(--card)" stroke="var(--chart-1)" strokeWidth={2} />
          <text x={xFor(i)} y={height - 4} textAnchor="middle" className="fill-muted-foreground" fontSize={11}>
            {d.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
