"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, PartyPopper, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useAuth } from "@/lib/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"

export default function Register() {
  const router = useRouter()
  const { signUp } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Validar senha
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.")
      setIsLoading(false)
      return
    }

    try {
      const { error: signUpError, user } = await signUp(formData.email, formData.password, {
        companyName: formData.companyName,
        userType: "salon",
      })

      if (signUpError) {
        throw new Error(signUpError.message)
      }

      if (user) {
        toast({
          title: "Conta criada com sucesso!",
          description: "Bem-vindo ao Check Party. Você será redirecionado para escolher um plano.",
        })

        // Redirecionar para a página de planos
        setTimeout(() => {
          router.push("/planos")
        }, 1500)
      }
    } catch (error: any) {
      console.error("Erro ao criar conta:", error)
      setError(error.message || "Ocorreu um erro ao criar sua conta. Verifique seus dados e tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <PartyPopper className="h-10 w-10 text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-purple-800">Criar Conta</CardTitle>
          <CardDescription className="text-center">
            Cadastre seu salão de festas e comece a gerenciar confirmações de presença
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome do Salão</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  placeholder="Nome do seu salão de festas"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full mt-6 bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </span>
              ) : (
                "Criar Conta"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            <span className="text-gray-600">Já tem uma conta? </span>
            <Link href="/admin/login" className="text-purple-600 hover:text-purple-800 font-medium">
              Faça login
            </Link>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Ao criar uma conta, você concorda com nossos{" "}
            <Link href="#" className="text-purple-600 hover:text-purple-800">
              Termos de Serviço
            </Link>{" "}
            e{" "}
            <Link href="#" className="text-purple-600 hover:text-purple-800">
              Política de Privacidade
            </Link>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
