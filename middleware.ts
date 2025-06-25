import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// Rotas que precisam de autenticação
const protectedRoutes = ["/admin/dashboard", "/checkout"]

// Rotas de autenticação
const authRoutes = ["/admin/login", "/admin/register", "/admin/forgot-password"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Criar cliente Supabase
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Se for uma rota protegida e não estiver autenticado, redirecionar para login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/admin/login", request.url)
    redirectUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Se for uma rota de autenticação e estiver autenticado, redirecionar para dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/checkout/:path*"],
}
