"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { usePatient } from "@/queries/usePatients"
import { useAppointments } from "@/queries/useAppointments"
import { usePatientMedicalRecords } from "@/queries/useMedicalRecords"
import { formatDate, formatTime } from "@/utils/formatDate"

export function PatientProfileView({ patientId }: { patientId: number }) {
  const { data: patient, isLoading } = usePatient(patientId)
  const { appointments } = useAppointments()
  const patientAppointments = appointments.filter((a) => a.patient === patientId)
  const rendezvousIds = patientAppointments.map((a) => a.id)
  const { data: records, isLoading: recordsLoading } = usePatientMedicalRecords(patientId, rendezvousIds)

  if (isLoading) return <TableSkeleton rows={4} />
  if (!patient) return <EmptyState title="Patient introuvable" />

  return (
    <>
      <Link href="/patients" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Retour aux patients
      </Link>
      <PageHeader
        title={patient.name ?? `Patient #${patient.id}`}
        description={`${patient.age} ans · ${patient.sexe} · ${patient.email ?? ""}`}
      />

      <Tabs defaultValue="history" className="mt-6">
        <TabsList>
          <TabsTrigger value="history">Antécédents</TabsTrigger>
          <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-4">
          <Card className="p-5 space-y-4">
            <div>
              <h3 className="font-medium">Allergies</h3>
              <p className="text-sm text-muted-foreground">{patient.allergies || "Aucune allergie connue"}</p>
            </div>
            <div>
              <h3 className="font-medium">Antécédents</h3>
              <p className="text-sm text-muted-foreground">{patient.antecedents || "Aucun antécédent"}</p>
            </div>
            {recordsLoading ? (
              <TableSkeleton rows={2} />
            ) : (
              <div>
                <h3 className="font-medium mb-2">Consultations</h3>
                {(records?.consultations ?? []).map((c) => (
                  <div key={c.id} className="mb-2 rounded-lg border border-border p-3 text-sm">
                    <p className="font-medium">{formatDate(c.date_consultation)}</p>
                    <p className="text-muted-foreground">{c.diagnostic}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="mt-4">
          <Card className="divide-y divide-border p-0">
            {patientAppointments.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">Aucun rendez-vous</p>
            ) : (
              patientAppointments.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-4 text-sm">
                  <div>
                    <p className="font-medium">{formatDate(a.date)} {formatTime(a.heure)}</p>
                    <p className="text-muted-foreground">{a.motif}</p>
                  </div>
                  <StatusBadge status={a.statut} />
                </div>
              ))
            )}
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions" className="mt-4">
          <Card className="p-5 space-y-3">
            {(records?.ordonnances ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune prescription</p>
            ) : (
              records?.ordonnances.map((o) => (
                <div key={o.id} className="rounded-lg border border-border p-3 text-sm">
                  <p className="font-medium">{formatDate(o.date)}</p>
                  <p className="text-muted-foreground">{o.remarque}</p>
                  {o.medicaments?.map((m) => (
                    <p key={m.id} className="mt-1">· {m.nom} — {m.dosage}</p>
                  ))}
                </div>
              ))
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
