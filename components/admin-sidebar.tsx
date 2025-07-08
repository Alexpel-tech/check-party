"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Calendar,
  Users,
  Settings,
  BarChart3,
  MessageSquare,
  MessageCircle,
  QrCode,
  Bell,
  TestTube,
  Building2,
  UserPlus,
  Clock,
  Layout,
  FileText,
  Activity,
} from "lucide-react"

interface SidebarProps {
  activeTab?: string
}

export function AdminSidebar({ activeTab }: SidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: BarChart3,
      key: "dashboard",
    },
    {
      title: "Festas",
      href: "/admin/parties",
      icon: Calendar,
      key: "parties",
    },
    {
      title: "Convidados",
      href: "/admin/guests",
      icon: Users,
      key: "guests",
    },
    {
      title: "Salões",
      href: "/admin/party-halls",
      icon: Building2,
      key: "party-halls",
    },
    {
      title: "QR Codes",
      href: "/admin/qr-codes",
      icon: QrCode,
      key: "qr-codes",
    },
    {
      title: "SMS",
      href: "/admin/sms",
      icon: MessageSquare,
      key: "sms",
    },
    {
      title: "WhatsApp",
      href: "/admin/whatsapp",
      icon: MessageCircle,
      key: "whatsapp",
    },
    {
      title: "Lembretes",
      href: "/admin/reminders",
      icon: Clock,
      key: "reminders",
    },
    {
      title: "Notificações",
      href: "/admin/notifications",
      icon: Bell,
      key: "notifications",
    },
    {
      title: "Minhas Notificações",
      href: "/admin/my-notifications",
      icon: Bell,
      key: "my-notifications",
    },
    {
      title: "Contatos",
      href: "/admin/contacts",
      icon: UserPlus,
      key: "contacts",
    },
    {
      title: "Layout da Mesa",
      href: "/admin/layout-planner",
      icon: Layout,
      key: "layout-planner",
    },
    {
      title: "Relatórios",
      href: "/admin/analytics",
      icon: FileText,
      key: "analytics",
    },
    {
      title: "Centro de Testes",
      href: "/admin/test-center",
      icon: TestTube,
      key: "test-center",
    },
    {
      title: "Status do Sistema",
      href: "/admin/system-status",
      icon: Activity,
      key: "system-status",
    },
    {
      title: "Configurações",
      href: "/admin/settings",
      icon: Settings,
      key: "settings",
    },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-purple-800 mb-6">Painel Administrativo</h2>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = activeTab === item.key || pathname === item.href

            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-purple-100 text-purple-800" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
