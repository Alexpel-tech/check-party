"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Loader2, Phone, MessageSquare, QrCode, Bell, Database } from "lucide-react"
import { runAllDatabaseTests } from "@/lib/tests/database-test"
import { runAllSMSTests } from "@/lib/tests/sms-test"
import { runAllWhatsAppTests } from "@/lib/tests/whatsapp-test"
import { runAllQRCodeTests } from "@/lib/tests/qr-code-test"
import { runAllNotificationTests } from "@/lib/tests/notification-test"

interface TestResult {
  success: boolean
  message: string
  details?: any
  error?: string
}

export function TestDashboard() {
  const [loading, setLoading] = useState<string | null>(null)
  const [results, setResults] = useState<{ [key: string]: TestResult[] }>({})
  const [phoneNumber, setPhoneNumber] = useState("")

  const runTest = async (testType: string, testFunction: () => Promise<TestResult[]>) => {
    setLoading(testType)
    try {
      const testResults = await testFunction()
      setResults((prev) => ({ ...prev, [testType]: testResults }))
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [testType]: [
          {
            success: false,
            message: `Erro ao executar teste ${testType}`,
            error: error instanceof Error ? error.message : "Erro desconhecido",
          },
        ],
      }))
    } finally {
      setLoading(null)
    }
  }

  const runAllTests = async () => {
    setLoading("all")
    try {
      const [dbResults, smsResults, whatsappResults, qrResults, notificationResults] = await Promise.all([
        runAllDatabaseTests(),
        runAllSMSTests(phoneNumber || undefined),
        runAllWhatsAppTests(phoneNumber || undefined),
        runAllQRCodeTests(),
        runAllNotificationTests(),
      ])

      setResults({
        database: dbResults,
        sms: smsResults,
        whatsapp: whatsappResults,
        qrcode: qrResults,
        notifications: notificationResults,
      })
    } catch (error) {
      console.error("Erro ao executar todos os testes:", error)
    } finally {
      setLoading(null)
    }
  }

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    )
  }

  const getStatusBadge = (success: boolean) => {
    return <Badge variant={success ? "default" : "destructive"}>{success ? "Sucesso" : "Falha"}</Badge>
  }

  const TestResultCard = ({
    title,
    icon,
    results,
  }: {
    title: string
    icon: React.ReactNode
    results: TestResult[]
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {results.map((result, index) => (
            <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(result.success)}
                  <span className="font-medium">{result.message}</span>
                </div>
                {result.error && <p className="text-sm text-red-600 mt-1">{result.error}</p>}
                {result.details && (
                  <pre className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                )}
              </div>
              <div className="ml-2">{getStatusBadge(result.success)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Centro de Testes</h1>
          <p className="text-gray-600">Teste todas as funcionalidades do sistema</p>
        </div>
        <Button onClick={runAllTests} disabled={loading === "all"} size="lg">
          {loading === "all" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Executar Todos os Testes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuração de Testes</CardTitle>
          <CardDescription>Configure os parâmetros para os testes de SMS e WhatsApp</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Número de Telefone (com código do país)</Label>
              <Input
                id="phone"
                placeholder="+5511999999999"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Formato: +55 11 99999-9999</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual">Testes Individuais</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Banco de Dados
                </CardTitle>
                <CardDescription>Teste conexão e estrutura do banco</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => runTest("database", runAllDatabaseTests)}
                  disabled={loading === "database"}
                  className="w-full"
                >
                  {loading === "database" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Testar Banco
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  SMS
                </CardTitle>
                <CardDescription>Teste configuração e envio de SMS</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => runTest("sms", () => runAllSMSTests(phoneNumber || undefined))}
                  disabled={loading === "sms"}
                  className="w-full"
                >
                  {loading === "sms" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Testar SMS
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  WhatsApp
                </CardTitle>
                <CardDescription>Teste configuração e envio de WhatsApp</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => runTest("whatsapp", () => runAllWhatsAppTests(phoneNumber || undefined))}
                  disabled={loading === "whatsapp"}
                  className="w-full"
                >
                  {loading === "whatsapp" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Testar WhatsApp
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  QR Code
                </CardTitle>
                <CardDescription>Teste geração e validação de QR Codes</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => runTest("qrcode", runAllQRCodeTests)}
                  disabled={loading === "qrcode"}
                  className="w-full"
                >
                  {loading === "qrcode" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Testar QR Code
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificações
                </CardTitle>
                <CardDescription>Teste sistema de notificações</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => runTest("notifications", runAllNotificationTests)}
                  disabled={loading === "notifications"}
                  className="w-full"
                >
                  {loading === "notifications" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Testar Notificações
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {Object.keys(results).length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-gray-500">Nenhum teste executado ainda</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {results.database && (
                <TestResultCard
                  title="Banco de Dados"
                  icon={<Database className="h-5 w-5" />}
                  results={results.database}
                />
              )}
              {results.sms && <TestResultCard title="SMS" icon={<Phone className="h-5 w-5" />} results={results.sms} />}
              {results.whatsapp && (
                <TestResultCard
                  title="WhatsApp"
                  icon={<MessageSquare className="h-5 w-5" />}
                  results={results.whatsapp}
                />
              )}
              {results.qrcode && (
                <TestResultCard title="QR Code" icon={<QrCode className="h-5 w-5" />} results={results.qrcode} />
              )}
              {results.notifications && (
                <TestResultCard
                  title="Notificações"
                  icon={<Bell className="h-5 w-5" />}
                  results={results.notifications}
                />
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
