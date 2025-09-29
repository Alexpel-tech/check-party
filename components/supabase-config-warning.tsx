"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function SupabaseConfigWarning() {
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseKey, setSupabaseKey] = useState("")
  const [message, setMessage] = useState("")

  const handleSaveConfig = () => {
    if (!supabaseUrl || !supabaseKey) {
      setMessage("Por favor, preencha todos os campos")
      return
    }

    // Salvar no localStorage para desenvolvimento
    localStorage.setItem("SUPABASE_URL", supabaseUrl)
    localStorage.setItem("SUPABASE_KEY", supabaseKey)

    setMessage("Configuração salva! Recarregue a página para aplicar.")
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Configuração do Supabase Necessária</CardTitle>
          <CardDescription>
            As variáveis de ambiente do Supabase não estão configuradas. Isso é necessário para o funcionamento do
            sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription>
              Esta configuração é apenas para desenvolvimento. Em produção, configure as variáveis de ambiente no
              servidor.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supabaseUrl">URL do Supabase</Label>
              <Input
                id="supabaseUrl"
                placeholder="https://xxxxxxxxxxxx.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supabaseKey">Chave Anônima do Supabase</Label>
              <Input
                id="supabaseKey"
                type="password"
                placeholder="eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
              />
            </div>

            {message && (
              <Alert variant={message.includes("Recarregue") ? "default" : "destructive"} className="mt-4">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveConfig} className="w-full">
            Salvar Configuração
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
