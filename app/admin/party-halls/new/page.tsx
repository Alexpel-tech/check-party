"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { ArrowLeft, Save, Building2, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import { createPartyHall } from "@/lib/actions/party-halls"
import { useToast } from "@/hooks/use-toast"
import type { NewPartyHall } from "@/lib/types"

export default function NewPartyHall() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    idade_maxima_crianca: 8,
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    telefone: "",
    email: "",
    responsavel: "",
    cnpj: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Extrair apenas os campos necessários para o NewPartyHall
      const newPartyHall: NewPartyHall = {
        name: formData.name,
        idade_maxima_crianca: formData.idade_maxima_crianca,
        administrator_id: "00000000-0000-0000-0000-000000000000", // ID temporário
        // Em uma implementação real, armazenaríamos os dados adicionais em uma tabela separada
        // ou em um campo JSON na tabela party_halls
      }

      await createPartyHall(newPartyHall)

      toast({
        title: "Salão criado com sucesso",
        description: "O novo salão de festas foi cadastrado como cliente.",
      })

      // Redirecionar para o dashboard após sucesso
      router.push("/admin/dashboard?tab=party-halls")
    } catch (error) {
      console.error("Erro ao criar salão:", error)
      toast({
        title: "Erro ao criar salão",
        description: "Ocorreu um erro ao criar o salão. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminHeader />

      <div className="flex flex-1">
        <AdminSidebar activeTab="party-halls" />

        <main className="flex-1 p-6">
          <div className="mb-6">
            <Link
              href="/admin/dashboard?tab=party-halls"
              className="inline-flex items-center text-purple-600 hover:text-purple-800"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para Salões
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-purple-800 mb-6">Novo Cliente - Salão de Festas</h1>

          <Card>
            <CardHeader>
              <CardTitle>Cadastro de Novo Cliente</CardTitle>
              <CardDescription>
                Preencha os dados do salão de festas para cadastrá-lo como cliente no sistema
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="bg-purple-50 p-4 rounded-md border border-purple-100 mb-4">
                  <h3 className="font-medium text-purple-800 flex items-center mb-2">
                    <Building2 className="h-4 w-4 mr-2" />
                    Informações do Salão
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Salão</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Ex: Salão Arco-Íris"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="idade_maxima_crianca">Idade Máxima para Crianças</Label>
                      <Input
                        id="idade_maxima_crianca"
                        name="idade_maxima_crianca"
                        type="number"
                        min="0"
                        max="18"
                        value={formData.idade_maxima_crianca}
                        onChange={handleChange}
                        required
                      />
                      <p className="text-xs text-gray-500">
                        Idade máxima para considerar como criança nas contagens de convidados
                      </p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input
                        id="cnpj"
                        name="cnpj"
                        placeholder="00.000.000/0000-00"
                        value={formData.cnpj}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-4">
                  <h3 className="font-medium text-blue-800 flex items-center mb-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    Endereço
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="endereco">Endereço Completo</Label>
                      <Textarea
                        id="endereco"
                        name="endereco"
                        placeholder="Rua, número, complemento, bairro"
                        value={formData.endereco}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        name="cidade"
                        placeholder="Cidade"
                        value={formData.cidade}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="estado">Estado</Label>
                        <Input
                          id="estado"
                          name="estado"
                          placeholder="UF"
                          maxLength={2}
                          value={formData.estado}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cep">CEP</Label>
                        <Input
                          id="cep"
                          name="cep"
                          placeholder="00000-000"
                          value={formData.cep}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-md border border-green-100">
                  <h3 className="font-medium text-green-800 flex items-center mb-2">
                    <Phone className="h-4 w-4 mr-2" />
                    Contato
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="responsavel">Nome do Responsável</Label>
                      <Input
                        id="responsavel"
                        name="responsavel"
                        placeholder="Nome completo"
                        value={formData.responsavel}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        name="telefone"
                        placeholder="(00) 00000-0000"
                        value={formData.telefone}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="contato@exemplo.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end space-x-4 border-t pt-6">
                <Button type="button" variant="outline" onClick={() => router.push("/admin/dashboard?tab=party-halls")}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Salvando...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Save className="h-4 w-4 mr-2" />
                      Cadastrar Cliente
                    </span>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </main>
      </div>
    </div>
  )
}
