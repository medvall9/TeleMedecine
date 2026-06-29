"use client"

import { useQuery } from "@tanstack/react-query"
import { medicalRecordService } from "@/services/medicalRecordService"

export const medicalRecordKeys = {
  all: ["medical-records"] as const,
  patient: (patientId: number, rendezvousIds: number[]) =>
    ["medical-records", patientId, rendezvousIds] as const,
}

export function useMedicalRecords() {
  const query = useQuery({
    queryKey: medicalRecordKeys.all,
    queryFn: () => medicalRecordService.getAll(),
  })

  return {
    records: query.data,
    consultations: query.data?.consultations ?? [],
    ordonnances: query.data?.ordonnances ?? [],
    constantes: query.data?.constantes ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

export function usePatientMedicalRecords(patientId: number, rendezvousIds: number[]) {
  return useQuery({
    queryKey: medicalRecordKeys.patient(patientId, rendezvousIds),
    queryFn: () => medicalRecordService.getByPatientId(patientId, rendezvousIds),
    enabled: !!patientId && rendezvousIds.length >= 0,
  })
}
