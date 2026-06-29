"use client"

import { Button } from "@/components/ui/button"
import { Bell, Download, Trash2 } from "lucide-react"

interface BulkActionsBarProps {
  count: number
  onDelete?: () => void
  onExport?: () => void
  onNotify?: () => void
  canDelete?: boolean
}

export function BulkActionsBar({
  count,
  onDelete,
  onExport,
  onNotify,
  canDelete = true,
}: BulkActionsBarProps) {
  if (count === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5">
      <span className="text-sm font-medium text-foreground">{count} sélectionné(s)</span>
      <div className="ml-auto flex flex-wrap gap-2">
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="size-4" />
            Exporter CSV
          </Button>
        )}
        {onNotify && (
          <Button variant="outline" size="sm" onClick={onNotify}>
            <Bell className="size-4" />
            Notifier
          </Button>
        )}
        {canDelete && onDelete && (
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="size-4" />
            Supprimer
          </Button>
        )}
      </div>
    </div>
  )
}
