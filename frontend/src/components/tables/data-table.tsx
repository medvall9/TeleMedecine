"use client"

import type { ReactNode } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState } from "@/components/shared/empty-state"
import { Pagination } from "@/components/tables/pagination"
import { Inbox } from "lucide-react"

export interface Column<T> {
  id: string
  header: ReactNode
  cell: (row: T) => ReactNode
  sortValue?: (row: T) => string | number
  searchValue?: (row: T) => string
}

interface DataTableProps<T extends { id: number | string }> {
  data: T[]
  columns: Column<T>[]
  selected?: string[]
  onSelectedChange?: (ids: string[]) => void
  page?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  columnSearch?: Record<string, string>
  emptyTitle?: string
}

export function DataTable<T extends { id: number | string }>({
  data,
  columns,
  selected = [],
  onSelectedChange,
  page = 1,
  pageSize = 10,
  onPageChange,
  emptyTitle = "Aucune donnée",
}: DataTableProps<T>) {
  const paginated = data.slice((page - 1) * pageSize, page * pageSize)
  const allSelected = paginated.length > 0 && paginated.every((r) => selected.includes(String(r.id)))

  const toggleAll = () => {
    if (!onSelectedChange) return
    if (allSelected) {
      onSelectedChange(selected.filter((id) => !paginated.some((r) => String(r.id) === id)))
    } else {
      const ids = new Set([...selected, ...paginated.map((r) => String(r.id))])
      onSelectedChange([...ids])
    }
  }

  if (data.length === 0) {
    return <EmptyState icon={Inbox} title={emptyTitle} />
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            {onSelectedChange && (
              <TableHead className="w-10">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </TableHead>
            )}
            {columns.map((col) => (
              <TableHead key={col.id}>{col.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((row) => (
            <TableRow key={row.id}>
              {onSelectedChange && (
                <TableCell>
                  <Checkbox
                    checked={selected.includes(String(row.id))}
                    onCheckedChange={(checked) => {
                      const id = String(row.id)
                      onSelectedChange(
                        checked ? [...selected, id] : selected.filter((s) => s !== id),
                      )
                    }}
                  />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell key={col.id}>{col.cell(row)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {onPageChange && (
        <Pagination
          page={page}
          pageSize={pageSize}
          total={data.length}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}
