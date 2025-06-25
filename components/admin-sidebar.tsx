"use client"

import Link from "next/link"
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Building2,
  Settings,
  MessageSquare,
  Bell,
  QrCode,
  Clock,
  Upload,
  LayoutGrid,
  BarChart,
} from "lucide-react"

interface AdminSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const menuItems = [
    {
      id: "overview",
      label: "Visão Geral",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/admin/dashboard",
    },
    {
      id: "parties",
      label: "Festas",
      icon: <CalendarDays className="h-5 w-5" />,
      href: "/admin/dashboard?tab=parties",
    },
    {
      id: "guests",
      label: "Convidados",
      icon: <Users className="h-5 w-5" />,
      href: "/admin/dashboard?tab=guests",
    },
    {
      id: "party-halls",
      label: "Salões",
      icon: <Building2 className="h-5 w-5" />,
      href: "/admin/dashboard?tab=party-halls",
    },
    {
      id: "notifications",
      label: "Notificações",
      icon: <Bell className="h-5 w-5" />,
      href: "/admin/notifications",
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: <MessageSquare className="h-5 w-5" />,
      href: "/admin/whatsapp",
    },
    // Novos itens de menu
    {
      id: "qr-codes",
      label: "QR Codes",
      icon: <QrCode className="h-5 w-5" />,
      href: "/admin/qr-codes",
    },
    {
      id: "reminders",
      label: "Lembretes",
      icon: <Clock className="h-5 w-5" />,
      href: "/admin/reminders",
    },
    {
      id: "contacts",
      label: "Importar Contatos",
      icon: <Upload className="h-5 w-5" />,
      href: "/admin/contacts",
    },
    {
      id: "layout-planner",
      label: "Planejador de Layout",
      icon: <LayoutGrid className="h-5 w-5" />,
      href: "/admin/layout-planner",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart className="h-5 w-5" />,
      href: "/admin/analytics",
    },
    {
      id: "settings",
      label: "Configurações",
      icon: <Settings className="h-5 w-5" />,
      href: "/admin/dashboard?tab=settings",
    },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-purple-800">Admin</h2>
      </div>
      <nav className="mt-2">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`flex items-center px-6 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 ${
                  activeTab === item.id ? "bg-purple-50 text-purple-700 border-r-4 border-purple-600" : ""
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="mr-3 text-gray-500">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
