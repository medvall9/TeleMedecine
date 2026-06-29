"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { constanteService } from "@/services/constanteService"
import { getErrorMessage } from "@/services/apiClient"
import type { Constante } from "@/types/patient.types"

export const constanteKeys = {
  all: ["constantes"] as const,
}

export function useConstantes(enabled = true) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: constanteKeys.all,
    queryFn: () => constanteService.getAll(),
    enabled,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: constanteKeys.all })
    queryClient.invalidateQueries({ queryKey: ["medical-records"] })
  }

  const createMutation = useMutation({
    mutationFn: (payload: Partial<Constante>) => constanteService.create(payload),
    onSuccess: () => {
      toast.success("Constantes enregistrées")
      invalidate()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => constanteService.remove(id),
    onSuccess: () => {
      toast.success("Constantes supprimées")
      invalidate()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return {
    constantes: query.data ?? [],
    isLoading: query.isLoading,
    createConstante: createMutation.mutateAsync,
    deleteConstante: deleteMutation.mutateAsync,
  }
}
