"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { LineChart } from "@/components/shared/line-chart"
import { cn } from "@/lib/utils"
import type { EnrichedAppointment } from "@/types/appointment.types"
import { format, subDays, eachDayOfInterval } from "date-fns"
import { fr } from "date-fns/locale"

const ranges = [
  { key: "7d", label: "7 jours", days: 7 },
  { key: "30d", label: "30 jours", days: 30 },
  { key: "12m", label: "12 mois", days: 365 },
] as const

function buildTrend(appointments: EnrichedAppointment[], days: number) {
  const end = new Date()
  const start = subDays(end, days - 1)
  const interval = eachDayOfInterval({ start, end })

  return interval.map((day) => {
    const key = format(day, "yyyy-MM-dd")
    const previousDay = subDays(day, days)
    const previousKey = format(previousDay, "yyyy-MM-dd")
    const count = appointments.filter((a) => a.date === key).length
    const previousCount = appointments.filter((a) => a.date === previousKey).length
    return {
      label: format(day, days <= 7 ? "EEE" : "dd MMM", { locale: fr }),
      current: count,
      previous: previousCount,
    }
  })
}

export function AnalyticsPanel({ appointments = [] }: { appointments?: EnrichedAppointment[] }) {
  const [range, setRange] = useState<(typeof ranges)[number]["key"]>("7d")
  const [compare, setCompare] = useState(false)

  const rangeConfig = ranges.find((r) => r.key === range) ?? ranges[0]
  const data = useMemo(
    () => buildTrend(appointments, rangeConfig.days),
    [appointments, rangeConfig.days],
  )
  const total = data.reduce((s, d) => s + d.current, 0)

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Évolution des rendez-vous</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="text-xl font-semibold text-foreground">{total.toLocaleString("fr-FR")}</span>{" "}
            rendez-vous sur la période
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-secondary p-2">
            <Switch id="compare" checked={compare} onCheckedChange={setCompare} />
            <Label htmlFor="compare" className="cursor-pointer text-xs text-muted-foreground">
              Comparer
            </Label>
          </div>
          <div className="flex rounded-lg border border-border p-0.5">
            {ranges.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  range === r.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded-full bg-chart-1" /> Période actuelle
        </span>
        {compare && (
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full border-b-2 border-dashed border-muted-foreground" />
            Période précédente
          </span>
        )}
      </div>

      <LineChart data={data} showPrevious={compare} />
    </Card>
  )
}
