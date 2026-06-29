import type { Notification } from "@/types/patient.types"
import { notificationService } from "@/services/notificationService"

type NotifyPayload = Pick<Notification, "titre" | "message" | "type">

/** Create a notification for the current user (backend assigns utilisateur). */
export async function notifySelf(payload: NotifyPayload) {
  try {
    await notificationService.create(payload)
  } catch {
    // Non-blocking — main action already succeeded
  }
}
