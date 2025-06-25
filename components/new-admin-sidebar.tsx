"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Settings,
  PartyPopper,
  MessageSquareText,
  BellRing,
  QrCode,
  Contact,
  Table,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building,
  CalendarClock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSidebar } from "@/components/ui/sidebar"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

const navItems = [
  {
    label: "Principal",
    items: [
      { href: "/admin/dashboard", icon: LayoutDashboard, text: "Dashboard" },
      { href: "/admin/parties", icon: PartyPopper, text: "Festas" },
      { href: "/admin/guests", icon: Users, text: "Convidados" },
    ],
  },
  {
    label: "Comunicação",
    items: [
      { href: "/admin/notifications", icon: MessageSquareText, text: "Enviar Mensagens" }, // Página de envio de SMS/WhatsApp
      { href: "/admin/reminders", icon: CalendarClock, text: "Lembretes Automáticos" },
      { href: "/admin/my-notifications", icon: BellRing, text: "Minhas Notificações" }, // Nova página
    ],
  },
  {
    label: "Ferramentas",
    items: [
      { href: "/admin/qr-codes", icon: QrCode, text: "QR Codes Check-in" },
      { href: "/admin/contacts", icon: Contact, text: "Importar Contatos" },
      { href: "/admin/layout-planner", icon: Table, text: "Layout de Mesas" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/admin/analytics", icon: BarChart3, text: "Analytics" },
      { href: "/admin/party-halls", icon: Building, text: "Salões de Festa" },
      { href: "/admin/settings", icon: Settings, text: "Configurações" },
    ],
  },
]

interface NewAdminSidebarProps {
  activeTab?: string // Pode ser usado para forçar um item ativo se necessário
}

export function NewAdminSidebar({ activeTab }: NewAdminSidebarProps) {
  const pathname = usePathname()
  const { isCollapsed, toggleSidebar } = useSidebar()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/admin/login"
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 flex h-screen flex-col border-r bg-background transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-64",
        )}
      >
        <div className={cn("flex h-16 items-center border-b px-4", isCollapsed ? "justify-center" : "justify-between")}>
          {!isCollapsed && (
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <PartyPopper className="h-6 w-6 text-primary" />
              <span className="font-bold text-primary">Check Party</span>
            </Link>
          )}
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className={cn(isCollapsed && "mx-auto")}>
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            <span className="sr-only">{isCollapsed ? "Expandir" : "Recolher"}</span>
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {navItems.map((section) => (
            <div key={section.label} className="mb-3">
              {!isCollapsed && (
                <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  {section.label}
                </h3>
              )}
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`) || activeTab === item.href

                if (isCollapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                            isActive &&
                              "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="sr-only">{item.text}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="flex items-center gap-4">
                        {item.text}
                      </TooltipContent>
                    </Tooltip>
                  )
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                      isActive &&
                        "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.text}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="mt-auto border-t p-2">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-full h-10" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Sair</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sair</TooltipContent>
            </Tooltip>
          ) : (
            <Button variant="ghost" className="w-full justify-start gap-3 px-3 py-2" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              Sair
            </Button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
