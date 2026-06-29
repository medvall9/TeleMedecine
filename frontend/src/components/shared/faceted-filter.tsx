"use client"

import { Check, PlusCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface FacetedFilterProps {
  label: string
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (values: string[]) => void
}

export function FacetedFilter({ label, options, selected, onChange }: FacetedFilterProps) {
  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-9 items-center gap-2 rounded-lg border border-dashed border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
        <PlusCircle className="size-4 text-muted-foreground" />
        {label}
        {selected.length > 0 && (
          <span className="ml-1 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
            {selected.length}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 p-1.5">
        {options.map((opt) => {
          const active = selected.includes(opt.value)
          return (
            <button
              key={opt.value}
              onClick={() => toggle(opt.value)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <span
                className={cn(
                  "flex size-4 items-center justify-center rounded border",
                  active ? "border-primary bg-primary text-primary-foreground" : "border-border",
                )}
              >
                {active && <Check className="size-3" />}
              </span>
              {opt.label}
            </button>
          )
        })}
        {selected.length > 0 && (
          <button
            onClick={() => onChange([])}
            className="mt-1 w-full rounded-md border-t border-border px-2 py-1.5 text-center text-xs text-muted-foreground hover:text-foreground"
          >
            Réinitialiser
          </button>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
