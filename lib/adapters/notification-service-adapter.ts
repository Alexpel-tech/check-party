import {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
  notifyGuestConfirmation,
  notifyGuestDecline,
  notifyReminderSent,
  notifyPaymentReceived,
  NotificationService,
} from "@/lib/services/notification-service"

// Adapter functions for client components
export async function createNotificationAdapter(notification: {
  user_id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  link?: string
}) {
  return await createNotification(notification)
}

export async function getNotificationsAdapter(userId: string, unreadOnly = false) {
  return await getNotifications(userId, unreadOnly)
}

export async function markNotificationAsReadAdapter(notificationId: string) {
  return await markNotificationAsRead(notificationId)
}

export async function markAllNotificationsAsReadAdapter(userId: string) {
  return await markAllNotificationsAsRead(userId)
}

export async function deleteNotificationAdapter(notificationId: string) {
  return await deleteNotification(notificationId)
}

export async function getUnreadCountAdapter(userId: string) {
  return await getUnreadCount(userId)
}

export async function notifyGuestConfirmationAdapter(
  userId: string,
  guestName: string,
  partyName: string,
  partyId: string,
  guestId: string,
) {
  return await notifyGuestConfirmation(userId, guestName, partyName, partyId, guestId)
}

export async function notifyGuestDeclineAdapter(
  userId: string,
  guestName: string,
  partyName: string,
  partyId: string,
  guestId: string,
) {
  return await notifyGuestDecline(userId, guestName, partyName, partyId, guestId)
}

export async function notifyReminderSentAdapter(userId: string, count: number, partyName: string, partyId: string) {
  return await notifyReminderSent(userId, count, partyName, partyId)
}

export async function notifyPaymentReceivedAdapter(userId: string, planName: string, amount: number) {
  return await notifyPaymentReceived(userId, planName, amount)
}

// Export the service for compatibility
export { NotificationService }
