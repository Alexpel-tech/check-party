import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { checkRateLimit, getClientIdentifier } from "./lib/rate-limit"

// Rotas sensíveis a proteger contra força bruta/abuso (login, cadastro,
// recuperação de senha) — só limitamos requisições POST (envio de
// formulário/Server Action), não GET (carregar a página é inofensivo).
const RATE_LIMITED_ROUTES: Record<string, { limit: number; windowMs: number }> = {
  "/admin/login": { limit: 10, windowMs: 60 * 1000 }, // 10 tentativas por minuto
  "/admin/register": { limit: 5, windowMs: 60 * 1000 },
  "/admin/forgot-password": { limit: 5, windowMs: 60 * 1000 },
  "/pais/login": { limit: 10, windowMs: 60 * 1000 },
}

export async function middleware(request: NextRequest) {
  // Rate limiting em rotas sensíveis (somente POST — envio de formulário)
  if (request.method === "POST") {
    const { pathname } = request.nextUrl
    const rule = RATE_LIMITED_ROUTES[pathname]
    if (rule) {
      const identifier = getClientIdentifier(request)
      const result = checkRateLimit(`${identifier}:${pathname}`, rule.limit, rule.windowMs)
      if (!result.success) {
        return NextResponse.json(
          { error: "Muitas tentativas. Aguarde um momento antes de tentar novamente." },
          { status: 429, headers: { "Retry-After": Math.ceil((result.resetAt - Date.now()) / 1000).toString() } },
        )
      }
    }
  }

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

    // Rotas que requerem autenticação via Supabase Auth (admin/salão).
    // /pais/* usa um sistema de login próprio (cookie "parent_session",
    // verificado dentro de cada página/action, não aqui) — não deve ser
    // checado contra supabase.auth.getUser(), que sempre será null para
    // os pais.
    const protectedRoutes = ["/admin"]
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

    if (isProtectedRoute) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Permitir acesso às páginas de login/registro mesmo sem autenticação
      const authPages = ["/admin/login", "/admin/register", "/admin/forgot-password"]
      const isAuthPage = authPages.some((page) => pathname.startsWith(page))

      if (!user && !isAuthPage) {
        return NextResponse.redirect(new URL("/admin/login", request.url))
      }

      if (user && isAuthPage) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url))
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
