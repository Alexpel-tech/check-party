"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { isSupabaseConfigured } from "@/lib/supabase/client"

export function SupabaseConfigChecker() {
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseKey, setSupabaseKey] = useState("")
  const [isConfigured, setIsConfigured] = useState(true) // Assume configurado por padrão
  const [isChecking, setIsChecking] = useState(true)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    // Verifica se as variáveis de ambiente estão configuradas
    setIsConfigured(isSupabaseConfigured())

    // Tenta obter valores do localStorage
    if (typeof window !== "undefined") {
      const storedUrl = localStorage.getItem("SUPABASE_URL")
      const storedKey = localStorage.getItem("SUPABASE_KEY")

      if (storedUrl) setSupabaseUrl(storedUrl)
      if (storedKey) setSupabaseKey(storedKey)
    }

    setIsChecking(false)
  }, [])

  const saveConfig = () => {
    // Salva no localStorage para desenvolvimento
    localStorage.setItem("SUPABASE_URL", supabaseUrl)
    localStorage.setItem("SUPABASE_KEY", supabaseKey)

    setIsSaved(true)

    // Recarrega a página após 2 segundos para aplicar as alterações
    setTimeout(() => {
      window.location.reload()
    }, 2000)
  }

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando configuração do Supabase...</p>
        </div>
      </div>
    )
  }

  if (isConfigured) {
    return null // Não mostra nada se já estiver configurado
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Configuração do Supabase</CardTitle>
          <CardDescription>
            Configure suas credenciais do Supabase para continuar. Isso é necessário para o funcionamento do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSaved ? (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Configuração Salva!</AlertTitle>
              <AlertDescription className="text-green-700">
                Recarregando a página para aplicar as alterações...
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro de Configuração</AlertTitle>
              <AlertDescription>
                As variáveis de ambiente do Supabase não estão configuradas. Isso é necessário para o funcionamento do
                sistema.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="supabase-url">URL do Supabase</Label>
              <Input
                id="supabase-url"
                placeholder="https://seu-projeto.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
              />
              <p className="text-xs text-gray-500">Ex: https://abcdefghijklm.supabase.co</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="supabase-key">Chave Anônima do Supabase</Label>
              <Input
                id="supabase-key"
                type="password"
                placeholder="sua-chave-anon"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Encontrada nas configurações do projeto no painel do Supabase, em API {">"} anon public
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={saveConfig} className="w-full" disabled={!supabaseUrl || !supabaseKey || isSaved}>
            {isSaved ? "Configuração Salva!" : "Salvar Configuração"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
