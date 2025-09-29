"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Calendar,
  QrCode,
  MessageCircle,
  Bell,
  Settings,
  BarChart3,
  Building2,
  TestTube,
  Activity,
  Clock,
  Phone,
  Mail,
  MapPin,
} from "lucide-react"

interface AdminSidebarProps {
  activeTab?: string
}

export function AdminSidebar({ activeTab }: AdminSidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      key: "dashboard",
    },
    {
      title: "Festas",
      href: "/admin/parties",
      icon: Calendar,
      key: "parties",
    },
    {
      title: "Nova Festa",
      href: "/admin/parties/new",
      icon: Calendar,
      key: "new-party",
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
      title: "Novo Salão",
      href: "/admin/party-halls/new",
      icon: Building2,
      key: "new-party-hall",
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
      icon: Phone,
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
      icon: Mail,
      key: "contacts",
    },
    {
      title: "Layout da Mesa",
      href: "/admin/layout-planner",
      icon: MapPin,
      key: "layout-planner",
    },
    {
      title: "Análises",
      href: "/admin/analytics",
      icon: BarChart3,
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
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = activeTab === item.key || pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-purple-100 text-purple-700 border-r-2 border-purple-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.title}
              </Link>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}
