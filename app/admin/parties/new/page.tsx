"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { ArrowLeft, Save, Copy, Loader2 } from "lucide-react"
import Link from "next/link"
import { createParty } from "@/lib/actions/parties"
import { getPartyHalls } from "@/lib/actions/party-halls"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-provider"
import type { NewParty as NewPartyType, PartyHall } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function NewParty() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showCredentials, setShowCredentials] = useState(false)
  const [parentCredentials, setParentCredentials] = useState<{ username: string; password: string } | null>(null)
  const [partyHalls, setPartyHalls] = useState<PartyHall[]>([])
  const [formData, setFormData] = useState<Omit<NewPartyType, "party_hall_id"> & { party_hall_id: string }>({
    party_hall_id: "",
    theme: "",
    nome_aniversariante: "",
    idade_aniversariante: 0,
    data: "",
    horario: "",
    local_detalhado: "",
    link_confirmacao: null,
    campos_adicionais_formulario: null,
  })

  useEffect(() => {
    async function loadPartyHalls() {
      try {
        const halls = await getPartyHalls()
        setPartyHalls(halls)

        if (halls.length > 0) {
          setFormData((prev) => ({
            ...prev,
            party_hall_id: halls[0].id,
          }))
        }
      } catch (error) {
        console.error("Erro ao carregar salões:", error)
        toast({
          title: "Erro ao carregar salões",
          description: "Não foi possível carregar a lista de salões. Tente novamente mais tarde.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadPartyHalls()
  }, [toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "idade_aniversariante" ? Number(value) : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!formData.party_hall_id) {
        throw new Error("Selecione um salão de festas")
      }

      const result = await createParty(formData)

      if (result.parentCredentials) {
        setParentCredentials(result.parentCredentials)
        setShowCredentials(true)
      } else {
        toast({
          title: "Festa criada com sucesso",
          description: "A nova festa foi criada, mas não foi possível gerar credenciais para os pais.",
        })
        router.push("/admin/dashboard?tab=parties")
      }
    } catch (error) {
      console.error("Erro ao criar festa:", error)
      toast({
        title: "Erro ao criar festa",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao criar a festa. Tente novamente.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const copyCredentials = () => {
    if (!parentCredentials) return

    const text = `Credenciais para acesso à área dos pais:
Nome de usuário: ${parentCredentials.username}
Senha: ${parentCredentials.password}
Link: ${window.location.origin}/pais/login`

    navigator.clipboard.writeText(text)
    toast({
      title: "Credenciais copiadas",
      description: "As credenciais foram copiadas para a área de transferência.",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AdminHeader />
        <div className="flex flex-1">
          <AdminSidebar activeTab="parties" />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
              <p className="text-lg text-purple-800">Carregando salões de festa...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (partyHalls.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AdminHeader />
        <div className="flex flex-1">
          <AdminSidebar activeTab="parties" />
          <main className="flex-1 p-6">
            <div className="mb-6">
              <Link
                href="/admin/dashboard?tab=parties"
                className="inline-flex items-center text-purple-600 hover:text-purple-800"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar para Festas
              </Link>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Nenhum Salão Disponível</CardTitle>
                <CardDescription>
                  Não é possível criar uma festa sem um salão. Por favor, cadastre um salão primeiro.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href="/admin/dashboard?tab=party-halls">
                  <Button>Gerenciar Salões</Button>
                </Link>
              </CardFooter>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  if (showCredentials && parentCredentials) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AdminHeader />

        <div className="flex flex-1">
          <AdminSidebar activeTab="parties" />

          <main className="flex-1 p-6">
            <div className="mb-6">
              <Link
                href="/admin/dashboard?tab=parties"
                className="inline-flex items-center text-purple-600 hover:text-purple-800"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar para Festas
              </Link>
            </div>

            <h1 className="text-2xl font-bold text-purple-800 mb-6">Festa Criada com Sucesso</h1>

            <Card>
              <CardHeader>
                <CardTitle>Credenciais de Acesso para os Pais</CardTitle>
                <CardDescription>
                  Forneça estas credenciais aos pais do aniversariante para que eles possam gerenciar os convidados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-md border border-yellow-100">
                  <h3 className="font-medium text-yellow-800 mb-2">Importante!</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Estas credenciais serão exibidas apenas uma vez. Certifique-se de copiá-las ou anotá-las.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Nome de Usuário</Label>
                  <div className="flex items-center">
                    <Input value={parentCredentials.username} readOnly className="bg-gray-50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Senha</Label>
                  <div className="flex items-center">
                    <Input value={parentCredentials.password} readOnly className="bg-gray-50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Link de Acesso</Label>
                  <div className="flex items-center">
                    <Input value={`${window.location.origin}/pais/login`} readOnly className="bg-gray-50" />
                  </div>
                </div>

                <Button className="w-full mt-4" onClick={copyCredentials}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Credenciais
                </Button>
              </CardContent>
              <CardFooter className="flex justify-end border-t pt-6">
                <Button onClick={() => router.push("/admin/dashboard?tab=parties")}>Ir para o Dashboard</Button>
              </CardFooter>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminHeader />

      <div className="flex flex-1">
        <AdminSidebar activeTab="parties" />

        <main className="flex-1 p-6">
          <div className="mb-6">
            <Link
              href="/admin/dashboard?tab=parties"
              className="inline-flex items-center text-purple-600 hover:text-purple-800"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para Festas
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-purple-800 mb-6">Nova Festa</h1>

          <Card>
            <CardHeader>
              <CardTitle>Informações da Festa</CardTitle>
              <CardDescription>
                Preencha os detalhes da nova festa para gerar o link de confirmação de presença
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="party_hall_id">Salão de Festas</Label>
                  <Select
                    value={formData.party_hall_id}
                    onValueChange={(value) => handleSelectChange("party_hall_id", value)}
                  >
                    <SelectTrigger id="party_hall_id">
                      <SelectValue placeholder="Selecione o salão de festas" />
                    </SelectTrigger>
                    <SelectContent>
                      {partyHalls.map((hall) => (
                        <SelectItem key={hall.id} value={hall.id}>
                          {hall.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Tema da Festa</Label>
                    <Input
                      id="theme"
                      name="theme"
                      placeholder="Ex: Super Heróis"
                      value={formData.theme}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nome_aniversariante">Nome do Aniversariante</Label>
                    <Input
                      id="nome_aniversariante"
                      name="nome_aniversariante"
                      placeholder="Nome completo"
                      value={formData.nome_aniversariante}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="idade_aniversariante">Idade</Label>
                    <Input
                      id="idade_aniversariante"
                      name="idade_aniversariante"
                      type="number"
                      min="1"
                      max="20"
                      placeholder="Idade"
                      value={formData.idade_aniversariante || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data">Data da Festa</Label>
                    <Input id="data" name="data" type="date" value={formData.data} onChange={handleChange} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="horario">Horário</Label>
                    <Input
                      id="horario"
                      name="horario"
                      type="time"
                      value={formData.horario}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="local_detalhado">Local Detalhado</Label>
                  <Textarea
                    id="local_detalhado"
                    name="local_detalhado"
                    placeholder="Endereço completo e informações adicionais sobre o local"
                    rows={3}
                    value={formData.local_detalhado}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="p-4 bg-purple-50 rounded-md border border-purple-100">
                  <h3 className="font-medium text-purple-800 mb-2">Acesso dos Pais</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Ao criar a festa, serão geradas credenciais de acesso para os pais do aniversariante. Eles poderão
                    gerenciar os convidados e aprovar as confirmações de presença.
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end space-x-4 border-t pt-6">
                <Button type="button" variant="outline" onClick={() => router.push("/admin/dashboard?tab=parties")}>
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
                      Salvar Festa
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
