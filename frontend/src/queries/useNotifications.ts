"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { notificationService } from "@/services/notificationService"
import { getErrorMessage } from "@/services/apiClient"
import type { Notification } from "@/types/patient.types"
import { useAuthContext } from "@/queries/useAuth"

export const notificationKeys = {
  all: ["notifications"] as const,
}

export function useNotifications() {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuthContext()

  const query = useQuery({
    queryKey: notificationKeys.all,
    queryFn: () => notificationService.getAll(),
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 30_000 : false,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: notificationKeys.all })

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })
      const previous = queryClient.getQueryData<Notification[]>(notificationKeys.all)
      queryClient.setQueryData<Notification[]>(notificationKeys.all, (old) =>
        old?.map((n) => (n.id === id ? { ...n, est_lu: true } : n)),
      )
      return { previous }
    },
    onError: (err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(notificationKeys.all, ctx.previous)
      toast.error(getErrorMessage(err))
    },
    onSettled: invalidate,
  })

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unread = (queryClient.getQueryData<Notification[]>(notificationKeys.all) ?? []).filter(
        (n) => !n.est_lu,
      )
      await Promise.all(unread.map((n) => notificationService.markAsRead(n.id)))
    },
    onSuccess: () => {
      toast.success("Toutes les notifications sont lues")
      invalidate()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => notificationService.remove(id),
    onSuccess: () => {
      toast.success("Notification supprimée")
      invalidate()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const createMutation = useMutation({
    mutationFn: (payload: Pick<Notification, "titre" | "message" | "type">) =>
      notificationService.create(payload),
    onSuccess: invalidate,
  })

  const notifications = query.data ?? []
  const unreadCount = notifications.filter((n) => !n.est_lu).length

  return {
    notifications,
    unreadCount,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    markAsRead: markReadMutation.mutateAsync,
    markAllAsRead: markAllReadMutation.mutateAsync,
    deleteNotification: deleteMutation.mutateAsync,
    createNotification: createMutation.mutateAsync,
  }
}
