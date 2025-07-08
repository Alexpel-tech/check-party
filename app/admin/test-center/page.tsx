"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { useToast } from "@/hooks/use-toast"
import {
  Loader2,
  MessageSquare,
  MessageCircle,
  QrCode,
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  TestTube,
  Send,
  Database,
} from "lucide-react"

// Import test functions
import { testSMSService } from "@/lib/tests/sms-test"
import { testWhatsAppService } from "@/lib/tests/whatsapp-test"
import { testQRCodeService } from "@/lib/tests/qr-code-test"
import { testNotificationService } from "@/lib/tests/notification-test"
import { testDatabaseConnection } from "@/lib/tests/database-test"

interface TestResult {
  success: boolean
  message: string
  details?: any
  duration?: number
}

interface TestSuite {
  name: string
  tests: TestCase[]
  running: boolean
  results: TestResult[]
}

interface TestCase {
  name: string
  description: string
  testFunction: () => Promise<TestResult>
}

export default function TestCenterPage() {
  const [activeTab, setActiveTab] = useState("sms")
  const [testPhone, setTestPhone] = useState("")
  const [testMessage, setTestMessage] = useState("Esta é uma mensagem de teste do sistema de confirmação de festas.")
  const [testResults, setTestResults] = useState<Record<string, TestResult[]>>({})
  const [runningTests, setRunningTests] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  const testSuites: Record<string, TestSuite> = {
    database: {
      name: "Banco de Dados",
      running: false,
      results: [],
      tests: [
        {
          name: "Conexão Supabase",
          description: "Testa a conexão com o banco de dados Supabase",
          testFunction: () => testDatabaseConnection(),
        },
        {
          name: "Tabelas Existentes",
          description: "Verifica se todas as tabelas necessárias existem",
          testFunction: () => testDatabaseConnection("tables"),
        },
        {
          name: "Permissões RLS",
          description: "Testa as políticas de segurança Row Level Security",
          testFunction: () => testDatabaseConnection("rls"),
        },
      ],
    },
    sms: {
      name: "SMS (Twilio)",
      running: false,
      results: [],
      tests: [
        {
          name: "Configuração Twilio",
          description: "Verifica se as credenciais do Twilio estão configuradas",
          testFunction: () => testSMSService("config"),
        },
        {
          name: "Envio de SMS",
          description: "Testa o envio de SMS para um número específico",
          testFunction: () => testSMSService("send", { to: testPhone, message: testMessage }),
        },
        {
          name: "Histórico SMS",
          description: "Verifica se o histórico de SMS está sendo salvo corretamente",
          testFunction: () => testSMSService("history"),
        },
      ],
    },
    whatsapp: {
      name: "WhatsApp Business",
      running: false,
      results: [],
      tests: [
        {
          name: "Configuração WhatsApp",
          description: "Verifica se as credenciais do WhatsApp Business estão configuradas",
          testFunction: () => testWhatsAppService("config"),
        },
        {
          name: "Envio de Mensagem",
          description: "Testa o envio de mensagem WhatsApp para um número específico",
          testFunction: () => testWhatsAppService("send", { to: testPhone, message: testMessage }),
        },
        {
          name: "Templates Aprovados",
          description: "Verifica se os templates do WhatsApp estão funcionando",
          testFunction: () => testWhatsAppService("templates"),
        },
        {
          name: "Histórico WhatsApp",
          description: "Verifica se o histórico de mensagens está sendo salvo",
          testFunction: () => testWhatsAppService("history"),
        },
      ],
    },
    qrcode: {
      name: "QR Code",
      running: false,
      results: [],
      tests: [
        {
          name: "Geração de QR Code",
          description: "Testa a geração de QR Codes para check-in",
          testFunction: () => testQRCodeService("generate"),
        },
        {
          name: "Validação de Token",
          description: "Testa a validação de tokens de QR Code",
          testFunction: () => testQRCodeService("validate"),
        },
        {
          name: "Processo de Check-in",
          description: "Testa o fluxo completo de check-in via QR Code",
          testFunction: () => testQRCodeService("checkin"),
        },
      ],
    },
    notifications: {
      name: "Notificações",
      running: false,
      results: [],
      tests: [
        {
          name: "Criação de Notificação",
          description: "Testa a criação de notificações no sistema",
          testFunction: () => testNotificationService("create"),
        },
        {
          name: "Busca de Notificações",
          description: "Testa a busca de notificações por usuário",
          testFunction: () => testNotificationService("fetch"),
        },
        {
          name: "Marcar como Lida",
          description: "Testa a funcionalidade de marcar notificações como lidas",
          testFunction: () => testNotificationService("read"),
        },
        {
          name: "Notificações em Tempo Real",
          description: "Testa as notificações em tempo real via Supabase Realtime",
          testFunction: () => testNotificationService("realtime"),
        },
      ],
    },
  }

  const runSingleTest = async (suiteKey: string, testIndex: number) => {
    const suite = testSuites[suiteKey]
    const test = suite.tests[testIndex]

    setRunningTests((prev) => ({ ...prev, [`${suiteKey}-${testIndex}`]: true }))

    try {
      const startTime = Date.now()
      const result = await test.testFunction()
      const duration = Date.now() - startTime

      const resultWithDuration = { ...result, duration }

      setTestResults((prev) => ({
        ...prev,
        [suiteKey]: prev[suiteKey]
          ? prev[suiteKey].map((r, i) => (i === testIndex ? resultWithDuration : r))
          : Array(suite.tests.length)
              .fill(null)
              .map((_, i) => (i === testIndex ? resultWithDuration : null)),
      }))

      toast({
        title: result.success ? "Teste Passou" : "Teste Falhou",
        description: `${test.name}: ${result.message}`,
        variant: result.success ? "default" : "destructive",
      })
    } catch (error) {
      const errorResult: TestResult = {
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido",
        duration: 0,
      }

      setTestResults((prev) => ({
        ...prev,
        [suiteKey]: prev[suiteKey]
          ? prev[suiteKey].map((r, i) => (i === testIndex ? errorResult : r))
          : Array(suite.tests.length)
              .fill(null)
              .map((_, i) => (i === testIndex ? errorResult : null)),
      }))

      toast({
        title: "Erro no Teste",
        description: `${test.name}: ${errorResult.message}`,
        variant: "destructive",
      })
    } finally {
      setRunningTests((prev) => ({ ...prev, [`${suiteKey}-${testIndex}`]: false }))
    }
  }

  const runAllTests = async (suiteKey: string) => {
    const suite = testSuites[suiteKey]
    setRunningTests((prev) => ({ ...prev, [suiteKey]: true }))

    const results: TestResult[] = []

    for (let i = 0; i < suite.tests.length; i++) {
      const test = suite.tests[i]

      try {
        const startTime = Date.now()
        const result = await test.testFunction()
        const duration = Date.now() - startTime

        results.push({ ...result, duration })
      } catch (error) {
        results.push({
          success: false,
          message: error instanceof Error ? error.message : "Erro desconhecido",
          duration: 0,
        })
      }
    }

    setTestResults((prev) => ({ ...prev, [suiteKey]: results }))
    setRunningTests((prev) => ({ ...prev, [suiteKey]: false }))

    const passedTests = results.filter((r) => r.success).length
    const totalTests = results.length

    toast({
      title: "Testes Concluídos",
      description: `${suite.name}: ${passedTests}/${totalTests} testes passaram`,
      variant: passedTests === totalTests ? "default" : "destructive",
    })
  }

  const getTestIcon = (result: TestResult | null) => {
    if (!result) return <AlertCircle className="h-4 w-4 text-gray-400" />
    if (result.success) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getTestBadge = (result: TestResult | null) => {
    if (!result) return <Badge variant="secondary">Não executado</Badge>
    if (result.success)
      return (
        <Badge variant="default" className="bg-green-500">
          Passou
        </Badge>
      )
    return <Badge variant="destructive">Falhou</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminHeader />

      <div className="flex flex-1">
        <AdminSidebar activeTab="test-center" />

        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-purple-800 flex items-center gap-2">
                <TestTube className="h-6 w-6" />
                Centro de Testes
              </h1>
              <p className="text-gray-600 mt-1">Teste todas as funcionalidades do sistema de confirmação de festas</p>
            </div>
          </div>

          {/* Configurações de Teste */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Configurações de Teste</CardTitle>
              <CardDescription>Configure os parâmetros para os testes de SMS e WhatsApp</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="testPhone">Número de Teste</Label>
                <Input
                  id="testPhone"
                  placeholder="+55 11 99999-9999"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                />
                <p className="text-xs text-gray-500">Número para testes de SMS e WhatsApp (formato internacional)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="testMessage">Mensagem de Teste</Label>
                <Textarea
                  id="testMessage"
                  placeholder="Mensagem de teste..."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="database" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Banco
              </TabsTrigger>
              <TabsTrigger value="sms" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                SMS
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </TabsTrigger>
              <TabsTrigger value="qrcode" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                QR Code
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notificações
              </TabsTrigger>
            </TabsList>

            {Object.entries(testSuites).map(([suiteKey, suite]) => (
              <TabsContent key={suiteKey} value={suiteKey} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Testes de {suite.name}</h2>
                  <Button
                    onClick={() => runAllTests(suiteKey)}
                    disabled={runningTests[suiteKey]}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {runningTests[suiteKey] ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Executar Todos os Testes
                  </Button>
                </div>

                <div className="grid gap-4">
                  {suite.tests.map((test, index) => {
                    const result = testResults[suiteKey]?.[index]
                    const isRunning = runningTests[`${suiteKey}-${index}`]

                    return (
                      <Card key={index}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getTestIcon(result)}
                              <div>
                                <CardTitle className="text-base">{test.name}</CardTitle>
                                <CardDescription className="text-sm">{test.description}</CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getTestBadge(result)}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => runSingleTest(suiteKey, index)}
                                disabled={isRunning}
                              >
                                {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : "Executar"}
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        {result && (
                          <CardContent className="pt-0">
                            <Alert variant={result.success ? "default" : "destructive"}>
                              <AlertTitle className="text-sm">
                                {result.success ? "Teste Passou" : "Teste Falhou"}
                                {result.duration && (
                                  <span className="ml-2 text-xs font-normal">({result.duration}ms)</span>
                                )}
                              </AlertTitle>
                              <AlertDescription className="text-sm">{result.message}</AlertDescription>
                            </Alert>

                            {result.details && (
                              <details className="mt-2">
                                <summary className="text-xs text-gray-500 cursor-pointer">
                                  Ver detalhes técnicos
                                </summary>
                                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                                  {JSON.stringify(result.details, null, 2)}
                                </pre>
                              </details>
                            )}
                          </CardContent>
                        )}
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </main>
      </div>
    </div>
  )
}
