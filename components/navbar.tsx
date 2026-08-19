"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PartyPopper } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

export function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <PartyPopper className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-bold text-purple-600">Check Party</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link href="/#como-funciona">
              <Button variant="ghost">Como Funciona</Button>
            </Link>
            <Link href="/#recursos">
              <Button variant="ghost">Recursos</Button>
            </Link>
            <Link href="/planos">
              <Button variant="ghost">Planos</Button>
            </Link>
            <Link href="/#contato">
              <Button variant="ghost">Contato</Button>
            </Link>
            <ThemeToggle />
            <Link href="/admin/login">
              <Button>Entrar</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
