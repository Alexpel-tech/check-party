import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { AuthProvider } from "@/lib/auth/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { SupabaseCheck } from "@/components/supabase-check"
import { NotificationProvider } from "@/lib/contexts/notification-context"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Check Party - Sistema de Confirmação de Presença",
  description: "Sistema para gerenciar confirmações de presença em festas",
  keywords: "festa, confirmação, presença, aniversário, salão de festas",
  authors: [{ name: "Check Party" }],
  openGraph: {
    title: "Check Party - Sistema de Confirmação de Presença",
    description: "Sistema para gerenciar confirmações de presença em festas",
    url: "https://checkparty.com.br",
    siteName: "Check Party",
    locale: "pt_BR",
    type: "website",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <SupabaseCheck>
            <AuthProvider>
              <NotificationProvider>
                <Navbar />
                <main className="min-h-screen bg-background text-foreground">{children}</main>
                <Toaster />
              </NotificationProvider>
            </AuthProvider>
          </SupabaseCheck>
        </ThemeProvider>
      </body>
    </html>
  )
}
