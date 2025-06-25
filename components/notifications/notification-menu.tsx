import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell } from "lucide-react"

interface Notification {
  id: string
  message: string
  createdAt: Date
}

interface NotificationMenuProps {
  notifications: Notification[]
  isLoading: boolean
}

export function NotificationMenu({ notifications, isLoading }: NotificationMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button>
          <Bell className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        {notifications.length === 0 && !isLoading && (
          <DropdownMenuItem disabled className="text-center text-sm text-muted-foreground py-2">
            Nenhuma notificação nova
          </DropdownMenuItem>
        )}
        {notifications.map((notification) => (
          <DropdownMenuItem key={notification.id}>{notification.message}</DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem>Marcar todas como lidas</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
