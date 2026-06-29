"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { LayoutGrid, List, MoreHorizontal, Eye, Download, Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SearchBar } from "@/components/shared/search-bar"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { BulkActionsBar } from "@/components/tables/bulk-actions-bar"
import { DataTable, type Column } from "@/components/tables/data-table"
import { CardGrid } from "@/components/cards/card-grid"
import { ConfirmDialog } from "@/components/modals/confirm-dialog"
import { PatientFormModal } from "@/components/forms/patient-form-modal"
import { usePatients } from "@/queries/usePatients"
import { useDebounce } from "@/hooks/useDebounce"
import type { EnrichedPatient } from "@/types/patient.types"
import { exportToCsv, getInitials } from "@/utils/formatDate"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function PatientsView() {
  const { patients, isLoading, deletePatient, refetch } = usePatients()
  const [view, setView] = useState<"list" | "grid">("list")
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query)
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<EnrichedPatient | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EnrichedPatient | null>(null)

  const filtered = useMemo(() => {
    const q = debouncedQuery.toLowerCase()
    return patients.filter(
      (p) =>
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        String(p.id).includes(q),
    )
  }, [patients, debouncedQuery])

  const selectedRows = filtered.filter((p) => selected.includes(String(p.id)))

  const handleExport = () => {
    exportToCsv(
      selectedRows as unknown as Record<string, unknown>[],
      [
        { key: "id", label: "ID" },
        { key: "name", label: "Nom" },
        { key: "email", label: "Email" },
        { key: "sexe", label: "Sexe" },
        { key: "date_naissance", label: "Naissance" },
      ],
      "patients.csv",
    )
    toast.success("Export CSV généré")
  }

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedRows.map((p) => deletePatient(p.id)))
      setSelected([])
    } catch {
      // toasts handled by mutation
    }
  }

  const columns: Column<EnrichedPatient>[] = [
    {
      id: "name",
      header: "Patient",
      cell: (p) => (
        <div className="flex items-center gap-2.5">
          <Avatar className="size-8">
            <AvatarFallback className={p.avatarColor}>{getInitials(p.name ?? "P")}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{p.name}</p>
            <p className="text-xs text-muted-foreground">{p.email}</p>
          </div>
        </div>
      ),
    },
    { id: "age", header: "Âge", cell: (p) => `${p.age ?? "—"} ans` },
    { id: "sexe", header: "Sexe", cell: (p) => p.sexe },
    { id: "blood", header: "Groupe", cell: (p) => p.groupe_sanguin || "—" },
    {
      id: "actions",
      header: "",
      cell: (p) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex size-8 items-center justify-center rounded-lg hover:bg-secondary">
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem render={<Link href={`/patients/${p.id}`} />}>
              <Eye className="size-4" /> Voir profil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setEditTarget(p); setFormOpen(true) }}>
              <Pencil className="size-4" /> Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(p)}>
              <Trash2 className="size-4" /> Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  if (isLoading) return <TableSkeleton rows={6} />

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar value={query} onChange={setQuery} placeholder="Rechercher un patient..." className="sm:w-80" />
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => { setEditTarget(null); setFormOpen(true) }}>
            <Plus className="size-4" /> Ajouter patient
          </Button>
          <span className="text-sm text-muted-foreground">{filtered.length} patients</span>
          <div className="flex rounded-lg border border-border p-0.5">
            <button onClick={() => setView("list")} className={cn("flex size-8 items-center justify-center rounded-md", view === "list" && "bg-primary text-primary-foreground")}>
              <List className="size-4" />
            </button>
            <button onClick={() => setView("grid")} className={cn("flex size-8 items-center justify-center rounded-md", view === "grid" && "bg-primary text-primary-foreground")}>
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <BulkActionsBar
        count={selected.length}
        onExport={handleExport}
        onDelete={handleBulkDelete}
        canDelete
      />

      {view === "list" ? (
        <DataTable
          data={filtered}
          columns={columns}
          selected={selected}
          onSelectedChange={setSelected}
          page={page}
          pageSize={10}
          onPageChange={setPage}
        />
      ) : (
        <CardGrid
          items={filtered.map((p) => ({
            id: p.id,
            title: p.name,
            description: `${p.age} ans · ${p.sexe} · ${p.email ?? ""}`,
            badges: p.groupe_sanguin ? <span className="text-xs">{p.groupe_sanguin}</span> : undefined,
            actions: (
              <div className="flex gap-1">
                <Button variant="outline" size="sm" render={<Link href={`/patients/${p.id}`} />}>
                  <Eye className="size-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setEditTarget(p); setFormOpen(true) }}>
                  <Pencil className="size-4" />
                </Button>
              </div>
            ),
          }))}
          selected={selected}
          onSelectedChange={setSelected}
        />
      )}

      <PatientFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        patient={editTarget}
        onSuccess={() => { setEditTarget(null); refetch() }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Supprimer le patient"
        description={`Supprimer le dossier de ${deleteTarget?.name} ?`}
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={async () => {
          if (deleteTarget) await deletePatient(deleteTarget.id)
        }}
      />
    </div>
  )
}
