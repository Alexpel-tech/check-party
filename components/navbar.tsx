"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  // Não mostrar a navbar em rotas específicas
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/guest/") ||
    pathname === "/convidado" ||
    pathname.startsWith("/check-in/")
  ) {
    return null
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-primary font-bold text-xl">
                Check Party
              </Link>
            </div>
          </div>

          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === "/" ? "text-primary" : "text-foreground hover:text-primary"}`}
            >
              Início
            </Link>
            <Link
              href="/planos"
              className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === "/planos" ? "text-primary" : "text-foreground hover:text-primary"}`}
            >
              Planos
            </Link>
            <Link
              href="/admin/login"
              className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === "/admin/login" ? "text-primary" : "text-foreground hover:text-primary"}`}
            >
              Login
            </Link>
            <Link
              href="/admin/register"
              className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === "/admin/register" ? "text-primary" : "text-foreground hover:text-primary"}`}
            >
              Cadastro
            </Link>
            <div className="ml-3">
              <ThemeToggle />
            </div>
          </div>

          <div className="flex items-center md:hidden">
            <ThemeToggle />
            <Button variant="ghost" onClick={toggleMenu} className="ml-2">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-border">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === "/" ? "text-primary" : "text-foreground hover:text-primary"}`}
            >
              Início
            </Link>
            <Link
              href="/planos"
              className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === "/planos" ? "text-primary" : "text-foreground hover:text-primary"}`}
            >
              Planos
            </Link>
            <Link
              href="/admin/login"
              className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === "/admin/login" ? "text-primary" : "text-foreground hover:text-primary"}`}
            >
              Login
            </Link>
            <Link
              href="/admin/register"
              className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === "/admin/register" ? "text-primary" : "text-foreground hover:text-primary"}`}
            >
              Cadastro
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
