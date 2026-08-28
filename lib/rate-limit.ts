// Rate limiter simples, em memória, para proteger rotas sensíveis
// (login, cadastro, esqueci senha) contra força bruta e abuso.
//
// LIMITAÇÃO IMPORTANTE: como a Vercel roda funções serverless, cada
// instância do servidor tem sua própria memória — em picos de tráfego,
// múltiplas instâncias podem coexistir, cada uma com seu próprio contador.
// Isso significa que o limite real pode acabar sendo N vezes o valor
// configurado (N = nº de instâncias ativas). Para um limite realmente
// garantido em produção com múltiplas instâncias, o recomendado é usar
// um store compartilhado como Upstash Redis (@upstash/ratelimit) — mas
// esta versão já barra a grande maioria dos ataques automatizados simples
// sem precisar de nenhum serviço externo pago.

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

// Limpa entradas antigas periodicamente para não vazar memória
setInterval(
  () => {
    const now = Date.now()
    for (const [key, bucket] of buckets.entries()) {
      if (bucket.resetAt < now) buckets.delete(key)
    }
  },
  5 * 60 * 1000,
)

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

/**
 * Verifica e consome uma tentativa do limite para a chave informada
 * (normalmente `${ip}:${rota}`).
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (existing.count >= limit) {
    return { success: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count += 1
  return { success: true, remaining: limit - existing.count, resetAt: existing.resetAt }
}

/** Extrai um identificador razoável do cliente a partir dos headers da requisição */
export function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) return forwardedFor.split(",")[0].trim()
  const realIp = request.headers.get("x-real-ip")
  if (realIp) return realIp
  return "unknown"
}
