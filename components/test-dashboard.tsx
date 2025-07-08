"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Database,
  MessageSquare,
  MessageCircle,
  QrCode,
  Bell,
} from "lucide-react"

interface ServiceStatus {
  name: string
  status: "online" | "offline" | "warning"
  lastCheck: Date
  responseTime?: number
  icon: React.ReactNode
}

export function TestDashboard() {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: "Banco de Dados",
      status: "offline",
      lastCheck: new Date(),
      icon: <Database className="h-4 w-4" />,
    },
    {
      name: "SMS (Twilio)",
      status: "offline",
      lastCheck: new Date(),
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      name: "WhatsApp",
      status: "offline",
      lastCheck: new Date(),
      icon: <MessageCircle className="h-4 w-4" />,
    },
    {
      name: "QR Code",
      status: "offline",
      lastCheck: new Date(),
      icon: <QrCode className="h-4 w-4" />,
    },
    {
      name: "Notificações",
      status: "offline",
      lastCheck: new Date(),
      icon: <Bell className="h-4 w-4" />,
    },
  ])

  const [isChecking, setIsChecking] = useState(false)

  const checkAllServices = async () => {
    setIsChecking(true)

    // Simular verificação de serviços
    const updatedServices = await Promise.all(
      services.map(async (service) => {
        const startTime = Date.now()

        try {
          // Simular chamada de API para verificar status
          await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000 + 500))

          const responseTime = Date.now() - startTime
          const isHealthy = Math.random() > 0.2 // 80% chance de estar online

          return {
            ...service,
            status: isHealthy ? ("online" as const) : ("offline" as const),
            lastCheck: new Date(),
            responseTime,
          }
        } catch (error) {
          return {
            ...service,
            status: "offline" as const,
            lastCheck: new Date(),
            responseTime: Date.now() - startTime,
          }
        }
      }),
    )

    setServices(updatedServices)
    setIsChecking(false)
  }

  useEffect(() => {
    checkAllServices()

    // Verificar serviços a cada 30 segundos
    const interval = setInterval(checkAllServices, 30000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "online":
        return "text-green-500"
      case "warning":
        return "text-yellow-500"
      case "offline":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusIcon = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "offline":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "online":
        return (
          <Badge variant="default" className="bg-green-500">
            Online
          </Badge>
        )
      case "warning":
        return (
          <Badge variant="secondary" className="bg-yellow-500">
            Aviso
          </Badge>
        )
      case "offline":
        return <Badge variant="destructive">Offline</Badge>
      default:
        return <Badge variant="secondary">Desconhecido</Badge>
    }
  }

  const onlineServices = services.filter((s) => s.status === "online").length
  const totalServices = services.length
  const healthPercentage = (onlineServices / totalServices) * 100

  return (
    <div className="space-y-6">
      {/* Status Geral */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Status Geral do Sistema
              </CardTitle>
              <CardDescription>Monitoramento em tempo real de todos os serviços</CardDescription>
            </div>
            <Button onClick={checkAllServices} disabled={isChecking} variant="outline" size="sm">
              {isChecking ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Verificar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Saúde do Sistema</span>
              <span className="text-sm text-gray-500">
                {onlineServices}/{totalServices} serviços online
              </span>
            </div>
            <Progress value={healthPercentage} className="h-2" />
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Última verificação: {new Date().toLocaleTimeString()}</span>
              <span>•</span>
              <span
                className={
                  healthPercentage >= 80
                    ? "text-green-500"
                    : healthPercentage >= 60
                      ? "text-yellow-500"
                      : "text-red-500"
                }
              >
                {healthPercentage.toFixed(0)}% operacional
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Individual dos Serviços */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {service.icon}
                  <CardTitle className="text-base">{service.name}</CardTitle>
                </div>
                {getStatusIcon(service.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  {getStatusBadge(service.status)}
                </div>

                {service.responseTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Tempo de Resposta</span>
                    <span className="text-sm font-medium">{service.responseTime}ms</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Última Verificação</span>
                  <span className="text-sm font-medium">{service.lastCheck.toLocaleTimeString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
