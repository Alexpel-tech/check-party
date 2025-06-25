"use client"

import Link from "next/link"
import { LogOut, Menu } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/lib/auth/auth-provider"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSidebar } from "@/components/ui/sidebar"
import { NotificationMenu } from "@/components/notifications/notification-menu" // Certifique-se que este componente existe e está correto

export function AdminHeader() {
  const { toggleSidebar } = useSidebar()
  const supabase = createClientComponentClient()
  const { user } = useAuth() // Hook para obter o usuário autenticado

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/admin/login" // Redireciona para a página de login
  }

  return (
    <header className="bg-background border-b border-border sticky top-0 z-40 h-16">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            {/* <PartyPopper className="h-6 w-6 text-primary" /> */}
            <span className="text-primary font-bold text-xl">Check Party</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {user && <NotificationMenu userId={user.id} />}
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
