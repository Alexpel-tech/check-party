import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export function SupabaseFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Configuração Necessária</span>
          </div>
          <CardTitle>Supabase não configurado</CardTitle>
          <CardDescription>O sistema precisa das credenciais do Supabase para funcionar corretamente.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">Para configurar o Supabase, você precisa:</p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>Criar uma conta no Supabase (supabase.com)</li>
            <li>Criar um novo projeto</li>
            <li>Obter a URL e a chave anônima do projeto</li>
            <li>Configurar as variáveis de ambiente</li>
          </ol>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link href="/" className="w-full">
            <Button className="w-full">Voltar para a página inicial</Button>
          </Link>
          <a
            href="https://supabase.com/docs/guides/getting-started"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            Saiba mais sobre como configurar o Supabase
          </a>
        </CardFooter>
      </Card>
    </div>
  )
}
