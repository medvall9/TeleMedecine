"use client"

import { FacetedFilter } from "@/components/shared/faceted-filter"

export interface FilterConfig {
  id: string
  label: string
  options: { value: string; label: string }[]
  values: string[]
  onChange: (values: string[]) => void
}

interface FiltersPanelProps {
  filters: FilterConfig[]
}

export function FiltersPanel({ filters }: FiltersPanelProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => (
        <FacetedFilter
          key={filter.id}
          label={filter.label}
          options={filter.options}
          selected={filter.values}
          onChange={filter.onChange}
        />
      ))}
    </div>
  )
}
