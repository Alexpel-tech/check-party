"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { NotificationToast, type NotificationProps } from "@/components/ui/notification-toast"
import { v4 as uuidv4 } from "uuid"

type NotificationWithId = NotificationProps & { id: string }

interface NotificationContextType {
  showNotification: (notification: Omit<NotificationProps, "onClose">) => string
  dismissNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationWithId[]>([])

  const showNotification = useCallback((notification: Omit<NotificationProps, "onClose">) => {
    const id = uuidv4()
    setNotifications((prev) => [...prev, { ...notification, id }])
    return id
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }, [])

  return (
    <NotificationContext.Provider value={{ showNotification, dismissNotification }}>
      {children}
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          title={notification.title}
          message={notification.message}
          variant={notification.variant}
          position={notification.position}
          duration={notification.duration}
          onClose={() => dismissNotification(notification.id)}
        />
      ))}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}
