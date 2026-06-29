"use client"

import { useMemo } from "react"
import { useAuthContext } from "@/queries/useAuth"
import { useAppointments } from "@/queries/useAppointments"
import { usePermissions } from "@/hooks/usePermissions"

/** Resolve patient/medecin FK ids from profile API, with appointment fallback. */
export function useActorIds() {
  const { user } = useAuthContext()
  const { role } = usePermissions()
  const { appointments } = useAppointments()

  return useMemo(() => {
    const medecinId =
      role === "medecin"
        ? user?.medecin_id ?? appointments.find((a) => a.medecin)?.medecin ?? null
        : null

    const patientId =
      role === "patient"
        ? user?.patient_id ?? appointments.find((a) => a.patient)?.patient ?? null
        : null

    return {
      role,
      userId: user?.id ?? null,
      medecinId,
      patientId,
      hasMedecinProfile: role === "medecin" ? !!medecinId : true,
      hasPatientProfile: role === "patient" ? !!patientId : true,
    }
  }, [appointments, role, user?.id, user?.medecin_id, user?.patient_id])
}
