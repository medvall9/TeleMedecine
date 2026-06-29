"use client"

import type { ReactNode } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/shared/empty-state"
import { Inbox } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CardGridItem {
  id: number | string
  title: ReactNode
  description?: ReactNode
  badges?: ReactNode
  actions?: ReactNode
}

interface CardGridProps {
  items: CardGridItem[]
  selected?: string[]
  onSelectedChange?: (ids: string[]) => void
  emptyTitle?: string
}

export function CardGrid({
  items,
  selected = [],
  onSelectedChange,
  emptyTitle = "Aucune donnée",
}: CardGridProps) {
  if (items.length === 0) {
    return <EmptyState icon={Inbox} title={emptyTitle} />
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Card
          key={item.id}
          className={cn(
            "relative p-4 transition-shadow hover:shadow-md",
            selected.includes(String(item.id)) && "ring-2 ring-primary/30",
          )}
        >
          {onSelectedChange && (
            <Checkbox
              className="absolute right-3 top-3"
              checked={selected.includes(String(item.id))}
              onCheckedChange={(checked) => {
                const id = String(item.id)
                onSelectedChange(
                  checked ? [...selected, id] : selected.filter((s) => s !== id),
                )
              }}
            />
          )}
          <div className="space-y-2 pr-8">
            <div className="font-medium text-foreground">{item.title}</div>
            {item.description && (
              <div className="text-sm text-muted-foreground">{item.description}</div>
            )}
            {item.badges && <div className="flex flex-wrap gap-1.5">{item.badges}</div>}
          </div>
          {item.actions && <div className="mt-3 flex justify-end">{item.actions}</div>}
        </Card>
      ))}
    </div>
  )
}
