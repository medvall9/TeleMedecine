"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { prescriptionService } from "@/services/prescriptionService"
import { getErrorMessage } from "@/services/apiClient"
import { notifySelf } from "@/utils/notifySelf"
import { notificationKeys } from "@/queries/useNotifications"
import type { Medicament, Ordonnance } from "@/types/patient.types"

export const prescriptionKeys = {
  all: ["prescriptions"] as const,
}

export function usePrescriptions(enabled = true) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: prescriptionKeys.all,
    queryFn: () => prescriptionService.getAll(),
    enabled,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: prescriptionKeys.all })
    queryClient.invalidateQueries({ queryKey: ["medical-records"] })
  }

  const createMutation = useMutation({
    mutationFn: (payload: Partial<Ordonnance>) => prescriptionService.create(payload),
    onSuccess: async () => {
      toast.success("Ordonnance créée")
      await notifySelf({
        titre: "Nouvelle ordonnance",
        message: "Une ordonnance a été créée.",
        type: "ordonnance",
      })
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
      invalidate()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => prescriptionService.remove(id),
    onSuccess: () => {
      toast.success("Ordonnance supprimée")
      invalidate()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const createMedicamentMutation = useMutation({
    mutationFn: (payload: Partial<Medicament>) => prescriptionService.createMedicament(payload),
    onSuccess: () => {
      toast.success("Médicament ajouté")
      invalidate()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return {
    ordonnances: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    createOrdonnance: createMutation.mutateAsync,
    deleteOrdonnance: deleteMutation.mutateAsync,
    createMedicament: createMedicamentMutation.mutateAsync,
  }
}
