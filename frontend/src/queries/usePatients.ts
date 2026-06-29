"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { patientService } from "@/services/patientService"
import { getErrorMessage } from "@/services/apiClient"
import type { CreatePatientPayload } from "@/types/patient.types"

export const patientKeys = {
  all: ["patients"] as const,
  detail: (id: number) => ["patients", id] as const,
}

export function usePatients(enabled = true) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: patientKeys.all,
    queryFn: () => patientService.getAll(),
    enabled,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: patientKeys.all })

  const createMutation = useMutation({
    mutationFn: (payload: CreatePatientPayload) => patientService.create(payload),
    onSuccess: () => {
      toast.success("Patient créé")
      invalidate()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CreatePatientPayload> }) =>
      patientService.update(id, payload),
    onSuccess: () => {
      toast.success("Patient mis à jour")
      invalidate()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => patientService.remove(id),
    onSuccess: () => {
      toast.success("Patient supprimé")
      invalidate()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return {
    patients: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createPatient: createMutation.mutateAsync,
    updatePatient: updateMutation.mutateAsync,
    deletePatient: deleteMutation.mutateAsync,
  }
}

export function usePatient(id: number) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => patientService.getById(id),
    enabled: !!id,
  })
}
