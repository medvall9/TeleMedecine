"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { appointmentService } from "@/services/appointmentService"
import { getErrorMessage } from "@/services/apiClient"
import { notifySelf } from "@/utils/notifySelf"
import { notificationKeys } from "@/queries/useNotifications"
import type {
  CreateRendezVousPayload,
  EnrichedAppointment,
  UpdateRendezVousPayload,
} from "@/types/appointment.types"

export const appointmentKeys = {
  all: ["appointments"] as const,
  detail: (id: number) => ["appointments", id] as const,
}

export function useAppointments() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: appointmentKeys.all,
    queryFn: () => appointmentService.getAll(),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: appointmentKeys.all })

  const createMutation = useMutation({
    mutationFn: (payload: CreateRendezVousPayload) => appointmentService.create(payload),
    onSuccess: async (_data, payload) => {
      toast.success("Rendez-vous créé")
      await notifySelf({
        titre: "Nouveau rendez-vous",
        message: `Rendez-vous planifié le ${payload.date} à ${payload.heure?.slice(0, 5) ?? payload.heure}`,
        type: "rendezvous",
      })
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
      invalidate()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateRendezVousPayload }) =>
      appointmentService.update(id, payload),
    onSuccess: () => {
      toast.success("Rendez-vous mis à jour")
      invalidate()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => appointmentService.cancel(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: appointmentKeys.all })
      const previous = queryClient.getQueryData<EnrichedAppointment[]>(appointmentKeys.all)
      queryClient.setQueryData<EnrichedAppointment[]>(appointmentKeys.all, (old) =>
        old?.map((a) => (a.id === id ? { ...a, statut: "annule" as const } : a)),
      )
      return { previous }
    },
    onError: (err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(appointmentKeys.all, ctx.previous)
      toast.error(getErrorMessage(err))
    },
    onSuccess: async () => {
      toast.success("Rendez-vous annulé")
      await notifySelf({
        titre: "Rendez-vous annulé",
        message: "Un rendez-vous a été annulé.",
        type: "rendezvous",
      })
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
    onSettled: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => appointmentService.remove(id),
    onSuccess: () => {
      toast.success("Rendez-vous supprimé")
      invalidate()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return {
    appointments: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createAppointment: createMutation.mutateAsync,
    updateAppointment: updateMutation.mutateAsync,
    cancelAppointment: cancelMutation.mutateAsync,
    deleteAppointment: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  }
}
