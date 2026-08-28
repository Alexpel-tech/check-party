/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Força HTTPS por 2 anos, inclusive em subdomínios
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Impede que o site seja carregado dentro de um <iframe> de outra origem (clickjacking)
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Impede que o navegador tente "adivinhar" o tipo de um arquivo
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Controla quanta informação de referrer é enviada entre sites
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Restringe acesso a APIs sensíveis do navegador (câmera, microfone, geolocalização)
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Content Security Policy: restringe de onde o navegador pode carregar
          // scripts, estilos, imagens e conexões. Ajustado às necessidades reais
          // do projeto (Supabase, fontes do Google, QR Code em base64).
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ]
  },
}

export default nextConfig
