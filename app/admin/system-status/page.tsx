"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  MessageSquare,
  MessageCircle,
  QrCode,
  Bell,
  RefreshCw,
  AlertTriangle,
  Server,
  Wifi,
} from "lucide-react"

interface ServiceStatus {
  name: string
  icon: React.ComponentType<any>
  status: "healthy" | "error" | "warning" | "checking"
  message: string
  lastCheck: Date
  responseTime?: number
  details?: any
}

export default function SystemStatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: "Banco de Dados",
      icon: Database,
      status: "checking",
      message: "Verificando conexão...",
      lastCheck: new Date(),
    },
    {
      name: "SMS (Twilio)",
      icon: MessageSquare,
      status: "checking",
      message: "Verificando configuração...",
      lastCheck: new Date(),
    },
    {
      name: "WhatsApp Business",
      icon: MessageCircle,
      status: "checking",
      message: "Verificando API...",
      lastCheck: new Date(),
    },
    {
      name: "QR Code",
      icon: QrCode,
      status: "checking",
      message: "Verificando geração...",
      lastCheck: new Date(),
    },
    {
      name: "Notificações",
      icon: Bell,
      status: "checking",
      message: "Verificando sistema...",
      lastCheck: new Date(),
    },
  ])

  const [isChecking, setIsChecking] = useState(false)
  const [lastFullCheck, setLastFullCheck] = useState<Date>(new Date())

  const checkAllServices = async () => {
    setIsChecking(true)

    const updatedServices = [...services]

    // Verificar cada serviço
    for (let i = 0; i < updatedServices.length; i++) {
      const service = updatedServices[i]
      updatedServices[i] = { ...service, status: "checking", message: "Verificando..." }
      setServices([...updatedServices])

      const startTime = Date.now()

      try {
        let result
        switch (service.name) {
          case "Banco de Dados":
            result = await checkDatabaseService()
            break
          case "SMS (Twilio)":
            result = await checkSMSService()
            break
          case "WhatsApp Business":
            result = await checkWhatsAppService()
            break
          case "QR Code":
            result = await checkQRCodeService()
            break
          case "Notificações":
            result = await checkNotificationService()
            break
          default:
            result = { success: false, message: "Serviço não reconhecido" }
        }

        const responseTime = Date.now() - startTime

        updatedServices[i] = {
          ...service,
          status: result.success ? "healthy" : "error",
          message: result.message,
          lastCheck: new Date(),
          responseTime,
          details: result.details,
        }
      } catch (error) {
        updatedServices[i] = {
          ...service,
          status: "error",
          message: error instanceof Error ? error.message : "Erro desconhecido",
          lastCheck: new Date(),
        }
      }

      setServices([...updatedServices])

      // Pequena pausa entre verificações
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setLastFullCheck(new Date())
    setIsChecking(false)
  }

  const checkDatabaseService = async () => {
    try {
      const response = await fetch("/api/health/database")
      const result = await response.json()
      return {
        success: response.ok,
        message: result.message || "Banco de dados funcionando",
        details: result.details,
      }
    } catch (error) {
      return {
        success: false,
        message: "Erro ao conectar com o banco de dados",
      }
    }
  }

  const checkSMSService = async () => {
    try {
      const response = await fetch("/api/health/sms")
      const result = await response.json()
      return {
        success: response.ok,
        message: result.message || "SMS configurado corretamente",
        details: result.details,
      }
    } catch (error) {
      return {
        success: false,
        message: "Erro ao verificar serviço SMS",
      }
    }
  }

  const checkWhatsAppService = async () => {
    try {
      const response = await fetch("/api/health/whatsapp")
      const result = await response.json()
      return {
        success: response.ok,
        message: result.message || "WhatsApp configurado corretamente",
        details: result.details,
      }
    } catch (error) {
      return {
        success: false,
        message: "Erro ao verificar serviço WhatsApp",
      }
    }
  }

  const checkQRCodeService = async () => {
    try {
      const response = await fetch("/api/health/qrcode")
      const result = await response.json()
      return {
        success: response.ok,
        message: result.message || "QR Code funcionando corretamente",
        details: result.details,
      }
    } catch (error) {
      return {
        success: false,
        message: "Erro ao verificar serviço QR Code",
      }
    }
  }

  const checkNotificationService = async () => {
    try {
      const response = await fetch("/api/health/notifications")
      const result = await response.json()
      return {
        success: response.ok,
        message: result.message || "Notificações funcionando corretamente",
        details: result.details,
      }
    } catch (error) {
      return {
        success: false,
        message: "Erro ao verificar serviço de notificações",
      }
    }
  }

  useEffect(() => {
    checkAllServices()

    // Auto-refresh a cada 30 segundos
    const interval = setInterval(checkAllServices, 30000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "healthy":
        return "text-green-600"
      case "error":
        return "text-red-600"
      case "warning":
        return "text-yellow-600"
      case "checking":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "checking":
        return <Activity className="h-5 w-5 text-blue-600 animate-pulse" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-500 hover:bg-green-600">Saudável</Badge>
      case "error":
        return <Badge variant="destructive">Erro</Badge>
      case "warning":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Atenção</Badge>
      case "checking":
        return <Badge variant="outline">Verificando...</Badge>
      default:
        return <Badge variant="secondary">Desconhecido</Badge>
    }
  }

  const healthyServices = services.filter((s) => s.status === "healthy").length
  const totalServices = services.length
  const overallHealth = (healthyServices / totalServices) * 100

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-purple-800 flex items-center gap-2">
            <Activity className="h-8 w-8" />
            Status do Sistema
          </h1>
          <p className="text-gray-600 mt-1">Monitoramento em tempo real de todos os serviços</p>
        </div>
      </div>

      {/* Status Geral */}
      <Card className="border-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Server className="h-5 w-5" />
              Status Geral do Sistema
            </CardTitle>
            <CardDescription className="text-base mt-1">
              {healthyServices} de {totalServices} serviços funcionando corretamente
            </CardDescription>
          </div>
          <Button onClick={checkAllServices} disabled={isChecking} size="lg" variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
            {isChecking ? "Verificando..." : "Verificar Novamente"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Saúde do Sistema</span>
              <span className="text-sm text-gray-600 font-bold">{Math.round(overallHealth)}%</span>
            </div>
            <Progress value={overallHealth} className="w-full h-3" />

            {overallHealth === 100 && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800 font-bold">Sistema Saudável</AlertTitle>
                <AlertDescription className="text-green-700">
                  Todos os serviços estão funcionando corretamente. Última verificação:{" "}
                  {lastFullCheck.toLocaleTimeString()}
                </AlertDescription>
              </Alert>
            )}

            {overallHealth < 100 && overallHealth > 50 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800 font-bold">Atenção Necessária</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  Alguns serviços precisam de atenção. Verifique os detalhes abaixo e configure as variáveis de ambiente
                  necessárias.
                </AlertDescription>
              </Alert>
            )}

            {overallHealth <= 50 && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle className="font-bold">Problemas Críticos</AlertTitle>
                <AlertDescription>
                  Múltiplos serviços com problemas. Verificação urgente necessária. Configure as variáveis de ambiente e
                  verifique as conexões.
                </AlertDescription>
              </Alert>
            )}

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  Auto-refresh ativo (30s)
                </span>
                <span>Última verificação completa: {lastFullCheck.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Individual dos Serviços */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service, index) => {
          const IconComponent = service.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <IconComponent className="h-5 w-5" />
                  {service.name}
                </CardTitle>
                {getStatusIcon(service.status)}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getStatusBadge(service.status)}
                  <p className={`text-sm font-medium ${getStatusColor(service.status)}`}>{service.message}</p>

                  {service.details && (
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(service.details, null, 2)}</pre>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span>Última verificação:</span>
                      <span className="font-medium">{service.lastCheck.toLocaleTimeString()}</span>
                    </div>
                    {service.responseTime && (
                      <div className="flex items-center justify-between">
                        <span>Tempo de resposta:</span>
                        <span className="font-medium">{service.responseTime}ms</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Server className="h-5 w-5" />
            Informações do Sistema
          </CardTitle>
          <CardDescription>Detalhes técnicos e configurações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-bold mb-3 text-purple-800">Configurações</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                  <span>Auto-refresh: 30 segundos</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                  <span>Timeout de verificação: 10 segundos</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                  <span>Última atualização: {new Date().toLocaleString()}</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-3 text-purple-800">Ações Disponíveis</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <Activity className="h-4 w-4 mt-0.5 text-blue-600" />
                  <span>Verificação manual de serviços</span>
                </li>
                <li className="flex items-start gap-2">
                  <Activity className="h-4 w-4 mt-0.5 text-blue-600" />
                  <span>Monitoramento em tempo real</span>
                </li>
                <li className="flex items-start gap-2">
                  <Activity className="h-4 w-4 mt-0.5 text-blue-600" />
                  <span>Histórico de status</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-3 text-purple-800">Variáveis de Ambiente</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <Database className="h-4 w-4 mt-0.5 text-purple-600" />
                  <span>NEXT_PUBLIC_SUPABASE_*</span>
                </li>
                <li className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 mt-0.5 text-purple-600" />
                  <span>TWILIO_*</span>
                </li>
                <li className="flex items-start gap-2">
                  <MessageCircle className="h-4 w-4 mt-0.5 text-purple-600" />
                  <span>WHATSAPP_*</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
