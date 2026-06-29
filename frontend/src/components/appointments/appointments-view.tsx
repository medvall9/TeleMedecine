"use client"

import { useMemo, useState } from "react"
import {
  LayoutGrid,
  List,
  MoreHorizontal,
  Eye,
  Pencil,
  XCircle,
  Trash2,
  Plus,
} from "lucide-react"
import { Card } from "@/components/ui/card"
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
import { StatusBadge, TypeBadge } from "@/components/shared/status-badge"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { FiltersPanel } from "@/components/tables/filters-panel"
import { BulkActionsBar } from "@/components/tables/bulk-actions-bar"
import { DataTable, type Column } from "@/components/tables/data-table"
import { CardGrid } from "@/components/cards/card-grid"
import { ConfirmDialog } from "@/components/modals/confirm-dialog"
import { AppointmentFormModal } from "@/components/forms/appointment-form-modal"
import { useAppointments } from "@/queries/useAppointments"
import { usePermissions } from "@/hooks/usePermissions"
import { useDebounce } from "@/hooks/useDebounce"
import type { EnrichedAppointment } from "@/types/appointment.types"
import { exportToCsv, formatDateTime, formatTime, getInitials } from "@/utils/formatDate"
import { cn } from "@/lib/utils"
import { notificationService } from "@/services/notificationService"
import { notificationKeys } from "@/queries/useNotifications"
import { toast } from "sonner"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { medecinService } from "@/services/medecinService"

const statusOptions = [
  { value: "confirme", label: "Confirmé" },
  { value: "en_attente", label: "En attente" },
  { value: "annule", label: "Annulé" },
  { value: "termine", label: "Terminé" },
]

const typeOptions = [
  { value: "teleconsultation", label: "Téléconsultation" },
  { value: "in-person", label: "Présentiel" },
]

export function AppointmentsView() {
  const queryClient = useQueryClient()
  const {
    appointments,
    isLoading,
    cancelAppointment,
    deleteAppointment,
    refetch,
  } = useAppointments()
  const { canDeleteAppointment, canEditAppointment, role } = usePermissions()
  const { data: medecins = [] } = useQuery({
    queryKey: ["medecins"],
    queryFn: () => medecinService.getAll(),
    enabled: role === "admin",
  })

  const [view, setView] = useState<"list" | "grid">("list")
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query)
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [typeFilter, setTypeFilter] = useState<string[]>([])
  const [doctorFilter, setDoctorFilter] = useState<string[]>([])
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<EnrichedAppointment | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EnrichedAppointment | null>(null)
  const [viewTarget, setViewTarget] = useState<EnrichedAppointment | null>(null)

  const doctorOptions = useMemo(() => {
    const names = new Set(appointments.map((a) => a.doctorName).filter(Boolean) as string[])
    medecins.forEach((m) => m.name && names.add(m.name))
    return [...names].map((n) => ({ value: n, label: n }))
  }, [appointments, medecins])

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      const q = debouncedQuery.toLowerCase()
      const matchesQuery =
        !q ||
        a.patientName?.toLowerCase().includes(q) ||
        a.doctorName?.toLowerCase().includes(q) ||
        String(a.id).includes(q) ||
        a.motif.toLowerCase().includes(q)
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(a.statut)
      const matchesType = typeFilter.length === 0 || (a.type && typeFilter.includes(a.type))
      const matchesDoctor =
        doctorFilter.length === 0 || (a.doctorName && doctorFilter.includes(a.doctorName))
      const matchesDateFrom = !dateFrom || a.date >= dateFrom
      const matchesDateTo = !dateTo || a.date <= dateTo
      return matchesQuery && matchesStatus && matchesType && matchesDoctor && matchesDateFrom && matchesDateTo
    })
  }, [appointments, debouncedQuery, statusFilter, typeFilter, doctorFilter, dateFrom, dateTo])

  const selectedRows = filtered.filter((a) => selected.includes(String(a.id)))

  const handleBulkExport = () => {
    exportToCsv(
      selectedRows as unknown as Record<string, unknown>[],
      [
        { key: "id", label: "ID" },
        { key: "patientName", label: "Patient" },
        { key: "doctorName", label: "Médecin" },
        { key: "date", label: "Date" },
        { key: "heure", label: "Heure" },
        { key: "statut", label: "Statut" },
        { key: "motif", label: "Motif" },
      ],
      "rendez-vous.csv",
    )
    toast.success("Export CSV généré")
  }

  const handleBulkNotify = async () => {
    try {
      await Promise.all(
        selectedRows.map((a) =>
          notificationService.create({
            titre: "Rappel rendez-vous",
            message: `Rappel pour le rendez-vous du ${a.date} à ${formatTime(a.heure)}`,
            type: "rendezvous",
          }),
        ),
      )
      toast.success("Notifications envoyées")
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
      setSelected([])
    } catch {
      toast.error("Erreur lors de l'envoi des notifications")
    }
  }

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedRows.map((a) => deleteAppointment(a.id)))
      setSelected([])
    } catch {
      // individual errors toasted by mutation
    }
  }

  const rowActions = (apt: EnrichedAppointment) => (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"
        aria-label="Actions"
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => setViewTarget(apt)}>
          <Eye className="size-4" /> Voir détails
        </DropdownMenuItem>
        {canEditAppointment && (
          <DropdownMenuItem onClick={() => { setEditTarget(apt); setFormOpen(true) }}>
            <Pencil className="size-4" /> Modifier
          </DropdownMenuItem>
        )}
        {canEditAppointment && apt.statut !== "annule" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => cancelAppointment(apt.id)}>
              <XCircle className="size-4" /> Annuler
            </DropdownMenuItem>
          </>
        )}
        {canDeleteAppointment && (
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(apt)}>
            <Trash2 className="size-4" /> Supprimer
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const columns: Column<EnrichedAppointment>[] = [
    {
      id: "patient",
      header: "Patient",
      cell: (apt) => (
        <div className="flex items-center gap-2.5">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {getInitials(apt.patientName ?? "P")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{apt.patientName}</p>
            <p className="text-xs text-muted-foreground">#{apt.id}</p>
          </div>
        </div>
      ),
    },
    { id: "doctor", header: "Médecin", cell: (apt) => apt.doctorName },
    {
      id: "date",
      header: "Date",
      cell: (apt) => `${formatDateTime(apt.date).split(" ")[0]} ${formatTime(apt.heure)}`,
    },
    { id: "status", header: "Statut", cell: (apt) => <StatusBadge status={apt.statut} /> },
    {
      id: "type",
      header: "Type",
      cell: (apt) => apt.type ? <TypeBadge type={apt.type} /> : "—",
    },
    { id: "actions", header: "", cell: (apt) => rowActions(apt) },
  ]

  if (isLoading) return <TableSkeleton rows={6} />

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Patient, médecin ou motif..."
            className="w-full sm:w-72"
          />
          <FiltersPanel
            filters={[
              { id: "status", label: "Statut", options: statusOptions, values: statusFilter, onChange: setStatusFilter },
              ...(role === "admin"
                ? [{ id: "doctor", label: "Médecin", options: doctorOptions, values: doctorFilter, onChange: setDoctorFilter }]
                : []),
              { id: "type", label: "Type", options: typeOptions, values: typeFilter, onChange: setTypeFilter },
            ]}
          />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-9 rounded-lg border border-border bg-background px-2 text-sm"
            aria-label="Date début"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-9 rounded-lg border border-border bg-background px-2 text-sm"
            aria-label="Date fin"
          />
        </div>

        <div className="flex items-center gap-2">
          {canEditAppointment && (
            <Button size="sm" onClick={() => { setEditTarget(null); setFormOpen(true) }}>
              <Plus className="size-4" />
              Nouveau
            </Button>
          )}
          <span className="text-sm text-muted-foreground">{filtered.length} rendez-vous</span>
          <div className="flex rounded-lg border border-border p-0.5">
            <button
              onClick={() => setView("list")}
              className={cn(
                "flex size-8 items-center justify-center rounded-md",
                view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              <List className="size-4" />
            </button>
            <button
              onClick={() => setView("grid")}
              className={cn(
                "flex size-8 items-center justify-center rounded-md",
                view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <BulkActionsBar
        count={selected.length}
        onExport={handleBulkExport}
        onNotify={handleBulkNotify}
        onDelete={canDeleteAppointment ? handleBulkDelete : undefined}
        canDelete={canDeleteAppointment}
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
          emptyTitle="Aucun rendez-vous ne correspond à votre recherche"
        />
      ) : (
        <CardGrid
          items={filtered.map((apt) => ({
            id: apt.id,
            title: apt.patientName,
            description: (
              <>
                <p>{apt.motif}</p>
                <p className="mt-1 text-xs">{apt.doctorName} · {formatDateTime(apt.date)} {formatTime(apt.heure)}</p>
              </>
            ),
            badges: (
              <>
                <StatusBadge status={apt.statut} />
                {apt.type && <TypeBadge type={apt.type} />}
              </>
            ),
            actions: rowActions(apt),
          }))}
          selected={selected}
          onSelectedChange={setSelected}
        />
      )}

      <AppointmentFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        appointment={editTarget}
        onSuccess={() => { setEditTarget(null); refetch() }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Supprimer le rendez-vous"
        description="Cette action est irréversible."
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={async () => {
          if (deleteTarget) await deleteAppointment(deleteTarget.id)
        }}
      />

      {viewTarget && (
        <Card className="p-5">
          <h3 className="font-semibold">Détails du rendez-vous #{viewTarget.id}</h3>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div><dt className="text-muted-foreground">Patient</dt><dd>{viewTarget.patientName}</dd></div>
            <div><dt className="text-muted-foreground">Médecin</dt><dd>{viewTarget.doctorName}</dd></div>
            <div><dt className="text-muted-foreground">Date</dt><dd>{viewTarget.date} {formatTime(viewTarget.heure)}</dd></div>
            <div><dt className="text-muted-foreground">Statut</dt><dd><StatusBadge status={viewTarget.statut} /></dd></div>
            <div className="sm:col-span-2"><dt className="text-muted-foreground">Motif</dt><dd>{viewTarget.motif}</dd></div>
          </dl>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => setViewTarget(null)}>Fermer</Button>
        </Card>
      )}
    </div>
  )
}
