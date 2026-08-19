"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Send, PartyPopper, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { getPartyByLink } from "@/lib/actions/parties"
import { createGuest } from "@/lib/actions/guests"
import type { Party, NewGuest } from "@/lib/types"
import { formatDate } from "@/lib/utils"

export default function GuestForm({ params }: { params: { link: string } }) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [party, setParty] = useState<Party | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState({
    nome_principal: "",
    email: "",
    whatsapp: "",
    leva_acompanhante: false,
    quantidade_total: 1,
    quantidade_criancas: 0,
  })

  useEffect(() => {
    async function loadParty() {
      try {
        const partyData = await getPartyByLink(params.link)
        setParty(partyData)
      } catch (error) {
        console.error("Erro ao carregar festa:", error)
        toast({
          title: "Erro ao carregar festa",
          description: "Não foi possível encontrar a festa solicitada.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadParty()
  }, [params.link, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        quantidade_total: checked ? 2 : 1, // Reset to 2 if checked, 1 if unchecked
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value = Number.parseInt(e.target.value) || 0

    if (field === "quantidade_total") {
      // Ensure quantidade_total is at least 1 (the main guest)
      const newValue = Math.max(1, value)
      setFormData((prev) => ({ ...prev, quantidade_total: newValue }))
    } else if (field === "quantidade_criancas") {
      // Ensure quantidade_criancas is not negative and not more than quantidade_total - 1
      const maxCriancas = formData.quantidade_total - 1
      const newValue = Math.min(Math.max(0, value), maxCriancas)
      setFormData((prev) => ({ ...prev, quantidade_criancas: newValue }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!party) {
      toast({
        title: "Erro ao enviar formulário",
        description: "Não foi possível identificar a festa.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      // Criar novo convidado
      const newGuest: NewGuest = {
        party_id: party.id,
        nome_principal: formData.nome_principal,
        email: formData.email,
        whatsapp: formData.whatsapp || null,
        leva_acompanhante: formData.leva_acompanhante,
        quantidade_total: formData.quantidade_total,
        quantidade_criancas: formData.quantidade_criancas,
        status_confirmacao_pais: false,
        status_confirmacao_final: false,
        data_envio_formulario: new Date().toISOString(),
      }

      await createGuest(newGuest)

      // Mostrar mensagem de sucesso
      setShowSuccess(true)
    } catch (error) {
      console.error("Erro ao enviar formulário:", error)
      toast({
        title: "Erro ao enviar formulário",
        description: "Ocorreu um erro ao processar sua confirmação. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-purple-50 p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-lg text-purple-800">Carregando formulário...</p>
        </div>
      </div>
    )
  }

  if (!party) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-purple-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-purple-800">Festa não encontrada</CardTitle>
            <CardDescription>O link que você acessou não corresponde a nenhuma festa ativa.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-gray-700">
              Verifique se o link está correto ou entre em contato com quem te convidou.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para a página inicial
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-purple-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <PartyPopper className="h-12 w-12 text-purple-600 mx-auto mb-2" />
            <CardTitle className="text-2xl font-bold text-purple-800">Pré-confirmação Recebida!</CardTitle>
            <CardDescription>
              Obrigado por confirmar sua presença na festa de {party.nome_aniversariante}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-gray-700">
              Sua pré-confirmação foi recebida com sucesso! Os pais do aniversariante irão revisar a lista de convidados
              e você receberá uma confirmação final com todos os detalhes da festa em breve.
            </p>
            <div className="p-4 bg-purple-50 rounded-md border border-purple-100 mb-4">
              <h3 className="font-medium text-purple-800 mb-2">Próximos passos:</h3>
              <p className="text-sm text-gray-600">
                1. Os pais do aniversariante irão revisar a lista de convidados
                <br />
                2. Após aprovação, você receberá um e-mail e mensagem de WhatsApp
                <br />
                3. A confirmação final incluirá todos os detalhes da festa
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para a página inicial
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-purple-50 p-4 pt-20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-purple-800">Confirmação de Presença</CardTitle>
          <CardDescription>
            Festa de {party.theme} do {party.nome_aniversariante} - {formatDate(party.data)}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome_principal">Nome Completo</Label>
              <Input
                id="nome_principal"
                name="nome_principal"
                placeholder="Seu nome completo"
                value={formData.nome_principal}
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
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                placeholder="(00) 00000-0000"
                value={formData.whatsapp}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500">Opcional, mas recomendado para receber confirmações</p>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="leva_acompanhante"
                name="leva_acompanhante"
                checked={formData.leva_acompanhante}
                onCheckedChange={(checked) => {
                  setFormData((prev) => ({
                    ...prev,
                    leva_acompanhante: checked === true,
                    quantidade_total: checked === true ? 2 : 1,
                  }))
                }}
              />
              <Label
                htmlFor="leva_acompanhante"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Levarei acompanhante(s)
              </Label>
            </div>

            {formData.leva_acompanhante && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="quantidade_total">Total de pessoas</Label>
                  <Input
                    id="quantidade_total"
                    type="number"
                    min="2"
                    max="10"
                    value={formData.quantidade_total}
                    onChange={(e) => handleNumberChange(e, "quantidade_total")}
                    required
                  />
                  <p className="text-xs text-gray-500">Incluindo você</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantidade_criancas">Crianças (até 8 anos)</Label>
                  <Input
                    id="quantidade_criancas"
                    type="number"
                    min="0"
                    max={formData.quantidade_total - 1}
                    value={formData.quantidade_criancas}
                    onChange={(e) => handleNumberChange(e, "quantidade_criancas")}
                    required
                  />
                </div>
              </div>
            )}

            <div className="pt-2">
              <p className="text-sm text-gray-600">
                Ao confirmar sua presença, você receberá uma pré-confirmação. Após a aprovação dos pais do
                aniversariante, você receberá os detalhes completos da festa.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Link href="/">
              <Button variant="outline" type="button">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
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
                  Enviando...
                </span>
              ) : (
                <span className="flex items-center">
                  <Send className="h-4 w-4 mr-2" />
                  Confirmar Presença
                </span>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
