import type { LucideIcon } from "lucide-react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string
  trend?: number
  icon: LucideIcon
  hint?: string
  accent?: string
}

export function StatCard({ title, value, trend = 0, icon: Icon, hint, accent = "var(--primary)" }: StatCardProps) {
  const positive = trend >= 0
  return (
    <Card className="relative overflow-hidden p-5">
      <div
        className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full opacity-10 blur-xl"
        style={{ backgroundColor: accent }}
        aria-hidden
      />
      <div className="flex items-start justify-between">
        <div
          className="flex size-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `color-mix(in oklab, ${accent} 14%, transparent)`, color: accent }}
        >
          <Icon className="size-5" />
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
            positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
          )}
        >
          {positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
          {Math.abs(trend)}%
        </span>
      </div>
      <div className="mt-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </Card>
  )
}
