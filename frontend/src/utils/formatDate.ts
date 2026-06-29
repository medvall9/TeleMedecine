import { format, parseISO, isValid } from "date-fns"
import { fr } from "date-fns/locale"

export function formatDate(value: string | Date, pattern = "dd MMM yyyy"): string {
  const date = typeof value === "string" ? parseISO(value) : value
  if (!isValid(date)) return "—"
  return format(date, pattern, { locale: fr })
}

export function formatDateTime(value: string | Date): string {
  return formatDate(value, "dd MMM yyyy HH:mm")
}

export function formatTime(value: string): string {
  if (!value) return "—"
  const [h, m] = value.split(":")
  return `${h}:${m}`
}

export function calculateAge(birthDate: string): number {
  const birth = parseISO(birthDate)
  if (!isValid(birth)) return 0
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

export function inferAppointmentType(motif: string): "teleconsultation" | "in-person" {
  const lower = motif.toLowerCase()
  if (lower.includes("télé") || lower.includes("tele") || lower.includes("video")) {
    return "teleconsultation"
  }
  return "in-person"
}

export function exportToCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: { key: keyof T; label: string }[],
  filename: string,
): void {
  const header = columns.map((c) => c.label).join(",")
  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const val = row[c.key]
          const str = val == null ? "" : String(val)
          return `"${str.replace(/"/g, '""')}"`
        })
        .join(","),
    )
    .join("\n")
  const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function getAvatarColor(seed: string): string {
  const colors = [
    "bg-emerald-100 text-emerald-700",
    "bg-sky-100 text-sky-700",
    "bg-violet-100 text-violet-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
  ]
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}
