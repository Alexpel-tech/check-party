import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Verificar se as variáveis de ambiente do Supabase estão configuradas
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("Supabase environment variables not configured")
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
          },
        },
      },
    )

    // Verificar autenticação apenas para rotas protegidas
    const { pathname } = request.nextUrl

    // Rotas que requerem autenticação
    const protectedRoutes = ["/admin", "/pais"]
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

    if (isProtectedRoute) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Permitir acesso às páginas de login/registro mesmo sem autenticação
      const authPages = ["/admin/login", "/admin/register", "/admin/forgot-password", "/pais/login"]
      const isAuthPage = authPages.some((page) => pathname.startsWith(page))

      if (!user && !isAuthPage) {
        // Redirecionar para login baseado no tipo de rota
        const loginUrl = pathname.startsWith("/admin") ? "/admin/login" : "/pais/login"
        return NextResponse.redirect(new URL(loginUrl, request.url))
      }

      if (user && isAuthPage) {
        // Redirecionar usuários autenticados para dashboard
        const dashboardUrl = pathname.startsWith("/admin") ? "/admin/dashboard" : "/pais/dashboard"
        return NextResponse.redirect(new URL(dashboardUrl, request.url))
      }
    }

    return supabaseResponse
  } catch (error) {
    console.error("Middleware error:", error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
