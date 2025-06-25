"use client"

import {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
  markAllNotificationsAsRead,
  type Notification,
} from "@/lib/services/notification-service"

export const NotificationService = {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
  markAllNotificationsAsRead,
}

export type { Notification }
