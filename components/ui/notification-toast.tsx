"use client"

import { useState, useEffect } from "react"
import { X, Bell, Check, AlertCircle, Info } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const notificationVariants = cva(
  "fixed flex items-center gap-3 p-4 rounded-lg shadow-lg transition-all duration-300 transform",
  {
    variants: {
      variant: {
        default: "bg-background border border-border",
        success: "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800",
        error: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800",
        warning: "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800",
        info: "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",
      },
      position: {
        topRight: "top-4 right-4",
        topLeft: "top-4 left-4",
        bottomRight: "bottom-4 right-4",
        bottomLeft: "bottom-4 left-4",
      },
      visibility: {
        visible: "opacity-100 translate-y-0",
        hidden: "opacity-0 translate-y-2",
      },
    },
    defaultVariants: {
      variant: "default",
      position: "topRight",
      visibility: "hidden",
    },
  },
)

export interface NotificationProps extends VariantProps<typeof notificationVariants> {
  title: string
  message: string
  duration?: number
  onClose?: () => void
  className?: string
}

export function NotificationToast({
  title,
  message,
  variant = "default",
  position = "topRight",
  duration = 5000,
  onClose,
  className,
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show notification with a small delay for animation
    const showTimeout = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    // Auto-hide after duration
    const hideTimeout = setTimeout(() => {
      setIsVisible(false)

      // Call onClose after animation completes
      setTimeout(() => {
        onClose?.()
      }, 300)
    }, duration)

    return () => {
      clearTimeout(showTimeout)
      clearTimeout(hideTimeout)
    }
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)

    // Call onClose after animation completes
    setTimeout(() => {
      onClose?.()
    }, 300)
  }

  const getIcon = () => {
    switch (variant) {
      case "success":
        return <Check className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return <Bell className="h-5 w-5 text-foreground" />
    }
  }

  return (
    <div
      className={cn(
        notificationVariants({ variant, position, visibility: isVisible ? "visible" : "hidden" }),
        className,
      )}
      role="alert"
    >
      <div className="flex-shrink-0">{getIcon()}</div>
      <div className="flex-1">
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground mt-1">{message}</p>
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-muted-foreground hover:text-foreground"
        aria-label="Fechar notificação"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
