"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { consultationService } from "@/services/consultationService"
import { getErrorMessage } from "@/services/apiClient"
import { notifySelf } from "@/utils/notifySelf"
import { notificationKeys } from "@/queries/useNotifications"
import type { Consultation } from "@/types/patient.types"

export const consultationKeys = {
  all: ["consultations"] as const,
  detail: (id: number) => ["consultations", id] as const,
}

export function useConsultations(enabled = true) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: consultationKeys.all,
    queryFn: () => consultationService.getAll(),
    enabled,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: consultationKeys.all })
    queryClient.invalidateQueries({ queryKey: ["medical-records"] })
  }

  const createMutation = useMutation({
    mutationFn: (payload: Partial<Consultation>) => consultationService.create(payload),
    onSuccess: async (_data, payload) => {
      toast.success("Consultation créée")
      await notifySelf({
        titre: "Consultation enregistrée",
        message: payload.diagnostic
          ? `Consultation : ${payload.diagnostic}`
          : "Une nouvelle consultation a été enregistrée.",
        type: "consultation",
      })
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
      invalidate()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Consultation> }) =>
      consultationService.update(id, payload),
    onSuccess: () => {
      toast.success("Consultation mise à jour")
      invalidate()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => consultationService.remove(id),
    onSuccess: () => {
      toast.success("Consultation supprimée")
      invalidate()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return {
    consultations: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createConsultation: createMutation.mutateAsync,
    updateConsultation: updateMutation.mutateAsync,
    deleteConsultation: deleteMutation.mutateAsync,
  }
}
