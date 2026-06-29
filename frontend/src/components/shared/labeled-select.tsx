"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface SelectOption {
  value: string
  label: string
}

interface LabeledSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

/** Select that always shows human-readable labels (Base UI Value can display raw ids). */
export function LabeledSelect({
  value,
  onValueChange,
  options,
  placeholder = "Sélectionner",
  disabled,
  className,
}: LabeledSelectProps) {
  const selected = options.find((o) => o.value === value)

  return (
    <Select value={value} onValueChange={(v) => onValueChange(v ?? "")} disabled={disabled}>
      <SelectTrigger className={cn("w-full", className)}>
        <span className={cn("truncate text-left text-sm", !selected && "text-muted-foreground")}>
          {selected?.label ?? placeholder}
        </span>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
