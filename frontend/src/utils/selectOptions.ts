"use client"

import { useMemo } from "react"
import type { Consultation } from "@/types/patient.types"
import type { EnrichedAppointment } from "@/types/appointment.types"
import type { SelectOption } from "@/components/shared/labeled-select"

export function buildConsultationOptions(
  consultations: Consultation[],
  appointments: EnrichedAppointment[],
): SelectOption[] {
  const aptMap = new Map(appointments.map((a) => [a.id, a]))
  return consultations.map((c) => {
    const apt = aptMap.get(c.rendezvous)
    const patient = apt?.patientName ?? "Patient"
    const doctor = apt?.doctorName ?? "Médecin"
    return {
      value: String(c.id),
      label: `${patient} · ${doctor} — ${c.diagnostic} (${c.date_consultation})`,
    }
  })
}

export function buildAppointmentOptions(appointments: EnrichedAppointment[]): SelectOption[] {
  return appointments.map((a) => ({
    value: String(a.id),
    label: `${a.date} ${a.heure?.slice(0, 5) ?? ""} — ${a.patientName} / ${a.doctorName} (${a.motif})`,
  }))
}

export function useConsultationSelectOptions(
  consultations: Consultation[],
  appointments: EnrichedAppointment[],
) {
  return useMemo(
    () => buildConsultationOptions(consultations, appointments),
    [consultations, appointments],
  )
}

export function useAppointmentSelectOptions(appointments: EnrichedAppointment[]) {
  return useMemo(() => buildAppointmentOptions(appointments), [appointments])
}
