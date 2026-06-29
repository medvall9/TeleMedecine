"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { questionnaireService } from "@/services/questionnaireService"
import { getErrorMessage } from "@/services/apiClient"
import type { Questionnaire } from "@/types/patient.types"

export const questionnaireKeys = {
  all: ["questionnaires"] as const,
  detail: (id: number) => ["questionnaires", id] as const,
}

export function useQuestionnaires() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: questionnaireKeys.all,
    queryFn: () => questionnaireService.getAll(),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: questionnaireKeys.all })

  const createMutation = useMutation({
    mutationFn: (payload: Partial<Questionnaire>) => questionnaireService.create(payload),
    onSuccess: () => {
      toast.success("Questionnaire enregistré")
      invalidate()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Questionnaire> }) =>
      questionnaireService.update(id, payload),
    onSuccess: () => {
      toast.success("Questionnaire mis à jour")
      invalidate()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return {
    questionnaires: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createQuestionnaire: createMutation.mutateAsync,
    updateQuestionnaire: updateMutation.mutateAsync,
  }
}
