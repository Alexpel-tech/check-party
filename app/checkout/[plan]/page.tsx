"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, CreditCard, Building2, Check, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-provider"

// Definição dos planos
const PLANS = {
  trimestral: {
    name: "Plano Trimestral",
    price: 297,
    duration: "3 meses",
    color: "blue",
    features: ["Até 10 festas por mês", "Confirmações ilimitadas", "Suporte por email"],
  },
  semestral: {
    name: "Plano Semestral",
    price: 497,
    duration: "6 meses",
    color: "purple",
    features: [
      "Até 20 festas por mês",
      "Confirmações ilimitadas",
      "Suporte prioritário",
      "Personalização de formulários",
    ],
  },
  anual: {
    name: "Plano Anual",
    price: 897,
    duration: "12 meses",
    color: "pink",
    features: [
      "Festas ilimitadas",
      "Confirmações ilimitadas",
      "Suporte VIP 24/7",
      "Personalização completa",
      "Integração com WhatsApp",
    ],
    bonus: "3 meses GRÁTIS incluídos!",
  },
}

export default function CheckoutPage({ params }: { params: { plan: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [formData, setFormData] = useState({
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    companyName: "",
    cnpj: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  })

  // Verificar se o plano é válido
  const planKey = params.plan as keyof typeof PLANS
  const plan = PLANS[planKey]

  useEffect(() => {
    // Redirecionar para login se não estiver autenticado
    if (!authLoading && !user) {
      toast({
        title: "Acesso restrito",
        description: "Você precisa estar logado para assinar um plano.",
        variant: "destructive",
      })
      router.push("/admin/login?redirect=/checkout/" + params.plan)
    }
  }, [user, authLoading, router, params.plan, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulação de processamento de pagamento
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Assinatura realizada com sucesso!",
        description: `Seu ${plan.name} foi ativado. Você receberá um email com os detalhes.`,
      })

      // Redirecionar para o dashboard após o pagamento
      router.push("/admin/dashboard")
    } catch (error) {
      console.error("Erro ao processar pagamento:", error)
      toast({
        title: "Erro ao processar pagamento",
        description: "Ocorreu um erro ao processar seu pagamento. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Plano não encontrado</CardTitle>
            <CardDescription>O plano selecionado não existe.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/planos">
              <Button>Ver planos disponíveis</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-lg text-purple-800">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-4 pt-20">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <Link href="/planos" className="inline-flex items-center text-purple-600 hover:text-purple-800">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar para planos
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Checkout</CardTitle>
                <CardDescription>Complete seu pagamento para ativar o {plan.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="credit-card" onValueChange={(value) => setPaymentMethod(value)}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="credit-card">Cartão de Crédito</TabsTrigger>
                    <TabsTrigger value="boleto">Boleto Bancário</TabsTrigger>
                  </TabsList>

                  <TabsContent value="credit-card">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardName">Nome no Cartão</Label>
                        <Input
                          id="cardName"
                          name="cardName"
                          placeholder="Nome como aparece no cartão"
                          value={formData.cardName}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Número do Cartão</Label>
                        <Input
                          id="cardNumber"
                          name="cardNumber"
                          placeholder="0000 0000 0000 0000"
                          value={formData.cardNumber}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardExpiry">Validade</Label>
                          <Input
                            id="cardExpiry"
                            name="cardExpiry"
                            placeholder="MM/AA"
                            value={formData.cardExpiry}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardCvc">CVC</Label>
                          <Input
                            id="cardCvc"
                            name="cardCvc"
                            placeholder="123"
                            value={formData.cardCvc}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="pt-4">
                        <h3 className="text-lg font-medium mb-2">Dados do Salão</h3>
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
                            <Label htmlFor="cnpj">CNPJ</Label>
                            <Input
                              id="cnpj"
                              name="cnpj"
                              placeholder="00.000.000/0000-00"
                              value={formData.cnpj}
                              onChange={handleChange}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="address">Endereço</Label>
                            <Input
                              id="address"
                              name="address"
                              placeholder="Endereço completo"
                              value={formData.address}
                              onChange={handleChange}
                              required
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="city">Cidade</Label>
                              <Input
                                id="city"
                                name="city"
                                placeholder="Cidade"
                                value={formData.city}
                                onChange={handleChange}
                                required
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-2">
                                <Label htmlFor="state">Estado</Label>
                                <Input
                                  id="state"
                                  name="state"
                                  placeholder="UF"
                                  maxLength={2}
                                  value={formData.state}
                                  onChange={handleChange}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="zipCode">CEP</Label>
                                <Input
                                  id="zipCode"
                                  name="zipCode"
                                  placeholder="00000-000"
                                  value={formData.zipCode}
                                  onChange={handleChange}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className={`w-full mt-6 bg-${plan.color}-600 hover:bg-${plan.color}-700`}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processando...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <CreditCard className="mr-2 h-4 w-4" />
                            Finalizar Pagamento
                          </span>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="boleto">
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                        <Label htmlFor="cnpj">CNPJ</Label>
                        <Input
                          id="cnpj"
                          name="cnpj"
                          placeholder="00.000.000/0000-00"
                          value={formData.cnpj}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Endereço</Label>
                        <Input
                          id="address"
                          name="address"
                          placeholder="Endereço completo"
                          value={formData.address}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">Cidade</Label>
                          <Input
                            id="city"
                            name="city"
                            placeholder="Cidade"
                            value={formData.city}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label htmlFor="state">Estado</Label>
                            <Input
                              id="state"
                              name="state"
                              placeholder="UF"
                              maxLength={2}
                              value={formData.state}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zipCode">CEP</Label>
                            <Input
                              id="zipCode"
                              name="zipCode"
                              placeholder="00000-000"
                              value={formData.zipCode}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-50 rounded-md border border-yellow-100 mt-4">
                        <p className="text-sm text-yellow-800">
                          Após a confirmação, você receberá o boleto por email. O acesso ao sistema será liberado após a
                          confirmação do pagamento (1-3 dias úteis).
                        </p>
                      </div>

                      <Button
                        type="submit"
                        className={`w-full mt-6 bg-${plan.color}-600 hover:bg-${plan.color}-700`}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Gerando boleto...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Building2 className="mr-2 h-4 w-4" />
                            Gerar Boleto
                          </span>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader className={`bg-${plan.color}-600 text-white rounded-t-lg`}>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription className="text-white opacity-90">Resumo do pedido</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Plano:</span>
                    <span>{plan.name}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Duração:</span>
                    <span>{plan.duration}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Valor:</span>
                    <span>R$ {plan.price.toFixed(2)}</span>
                  </div>

                  {plan.bonus && (
                    <div className="bg-yellow-100 text-yellow-800 p-3 rounded-md text-sm font-medium">{plan.bonus}</div>
                  )}

                  <div className="pt-2">
                    <h4 className="font-medium mb-2">O que está incluído:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className={`h-5 w-5 text-${plan.color}-500 mr-2 flex-shrink-0 mt-0.5`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
