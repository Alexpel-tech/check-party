"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Clock, MessageSquare, Phone, Mail, Plus, Trash2, AlertCircle, CheckCircle } from "lucide-react"
import { ReminderService } from "@/lib/services/reminder-service"
import type { Party, ReminderConfig, ReminderLog } from "@/lib/types"

interface ReminderConfigProps {
  party: Party
}

export function ReminderConfigComponent({ party }: ReminderConfigProps) {
  const [activeTab, setActiveTab] = useState("config")
  const [configs, setConfigs] = useState<ReminderConfig[]>([])
  const [logs, setLogs] = useState<ReminderLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Estado para o formulário de nova configuração
  const [newConfig, setNewConfig] = useState<{
    type: string
    timing: string
    custom_days?: number
    message: string
    is_active: boolean
  }>({
    type: "whatsapp",
    timing: "1_day",
    message: `Olá [nome do convidado], não esqueça da festa de ${party.nome_aniversariante} amanhã, dia [data] às ${party.horario}. Esperamos você lá!`,
    is_active: true,
  })

  // Carregar configurações e logs existentes
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const configsData = await ReminderService.getReminderConfigsByParty(party.id)
        setConfigs(configsData)

        const logsData = await ReminderService.getReminderLogsByParty(party.id)
        setLogs(logsData)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        setError("Erro ao carregar configurações de lembretes")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [party.id])

  // Atualizar mensagem padrão quando o tipo ou timing mudar
  useEffect(() => {
    let defaultMessage = ""

    if (newConfig.timing === "1_day") {
      defaultMessage = `Olá [nome do convidado], não esqueça da festa de ${party.nome_aniversariante} amanhã, dia [data] às ${party.horario}. Esperamos você lá!`
    } else if (newConfig.timing === "1_week") {
      defaultMessage = `Olá [nome do convidado], a festa de ${party.nome_aniversariante} está chegando! Será no dia [data] às ${party.horario}. Não esqueça de confirmar sua presença.`
    } else {
      defaultMessage = `Olá [nome do convidado], lembramos que a festa de ${party.nome_aniversariante} será no dia [data] às ${party.horario} no endereço: ${party.local_detalhado}. Contamos com sua presença!`
    }

    setNewConfig((prev) => ({
      ...prev,
      message: defaultMessage,
    }))
  }, [newConfig.timing, newConfig.type, party.nome_aniversariante, party.horario, party.local_detalhado, party.data])

  // Função para salvar nova configuração
  const handleSaveConfig = async () => {
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const configData = {
        party_id: party.id,
        type: newConfig.type,
        timing: newConfig.timing,
        custom_days: newConfig.timing === "custom" ? newConfig.custom_days : undefined,
        message: newConfig.message,
        is_active: newConfig.is_active,
      }

      const result = await ReminderService.createReminderConfig(configData)

      if (!result) {
        throw new Error("Erro ao salvar configuração")
      }

      setConfigs((prev) => [result, ...prev])
      setSuccess("Configuração de lembrete salva com sucesso!")

      // Resetar formulário
      setNewConfig({
        type: "whatsapp",
        timing: "1_day",
        message: `Olá [nome do convidado], não esqueça da festa de ${party.nome_aniversariante} amanhã, dia [data] às ${party.horario}. Esperamos você lá!`,
        is_active: true,
      })
    } catch (error) {
      console.error("Erro ao salvar configuração:", error)
      setError("Erro ao salvar configuração de lembrete")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Função para excluir configuração
  const handleDeleteConfig = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta configuração de lembrete?")) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await ReminderService.deleteReminderConfig(id)

      if (!result) {
        throw new Error("Erro ao excluir configuração")
      }

      setConfigs((prev) => prev.filter((config) => config.id !== id))
      setSuccess("Configuração de lembrete excluída com sucesso!")
    } catch (error) {
      console.error("Erro ao excluir configuração:", error)
      setError("Erro ao excluir configuração de lembrete")
    } finally {
      setIsLoading(false)
    }
  }

  // Função para atualizar status de ativação
  const handleToggleActive = async (id: string, isActive: boolean) => {
    setIsLoading(true)
    setError("")

    try {
      const result = await ReminderService.updateReminderConfig(id, {
        is_active: isActive,
      })

      if (!result) {
        throw new Error("Erro ao atualizar configuração")
      }

      setConfigs((prev) => prev.map((config) => (config.id === id ? { ...config, is_active: isActive } : config)))
    } catch (error) {
      console.error("Erro ao atualizar configuração:", error)
      setError("Erro ao atualizar configuração de lembrete")
    } finally {
      setIsLoading(false)
    }
  }

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Função para formatar tipo de lembrete
  const formatReminderType = (type: string) => {
    switch (type) {
      case "whatsapp":
        return "WhatsApp"
      case "sms":
        return "SMS"
      case "email":
        return "Email"
      default:
        return type
    }
  }

  // Função para formatar timing de lembrete
  const formatReminderTiming = (timing: string, customDays?: number) => {
    switch (timing) {
      case "1_day":
        return "1 dia antes"
      case "2_days":
        return "2 dias antes"
      case "3_days":
        return "3 dias antes"
      case "1_week":
        return "1 semana antes"
      case "custom":
        return customDays ? `${customDays} dias antes` : "Personalizado"
      default:
        return timing
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Lembretes Automáticos
        </CardTitle>
        <CardDescription>Configure lembretes automáticos para enviar aos convidados antes da festa</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="config">Configurações</TabsTrigger>
            <TabsTrigger value="logs">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nova Configuração de Lembrete</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reminder-type">Tipo de Lembrete</Label>
                    <Select
                      value={newConfig.type}
                      onValueChange={(value) => setNewConfig((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger id="reminder-type">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp">
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-2 text-green-600" />
                            WhatsApp
                          </div>
                        </SelectItem>
                        <SelectItem value="sms">
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-blue-600" />
                            SMS
                          </div>
                        </SelectItem>
                        <SelectItem value="email">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-purple-600" />
                            Email
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reminder-timing">Quando Enviar</Label>
                    <Select
                      value={newConfig.timing}
                      onValueChange={(value) => setNewConfig((prev) => ({ ...prev, timing: value }))}
                    >
                      <SelectTrigger id="reminder-timing">
                        <SelectValue placeholder="Selecione quando enviar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1_day">1 dia antes</SelectItem>
                        <SelectItem value="2_days">2 dias antes</SelectItem>
                        <SelectItem value="3_days">3 dias antes</SelectItem>
                        <SelectItem value="1_week">1 semana antes</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {newConfig.timing === "custom" && (
                  <div className="space-y-2">
                    <Label htmlFor="custom-days">Dias antes da festa</Label>
                    <Input
                      id="custom-days"
                      type="number"
                      min="1"
                      max="30"
                      value={newConfig.custom_days || ""}
                      onChange={(e) =>
                        setNewConfig((prev) => ({
                          ...prev,
                          custom_days: Number.parseInt(e.target.value) || undefined,
                        }))
                      }
                      placeholder="Número de dias antes da festa"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reminder-message">Mensagem</Label>
                  <Textarea
                    id="reminder-message"
                    value={newConfig.message}
                    onChange={(e) => setNewConfig((prev) => ({ ...prev, message: e.target.value }))}
                    rows={4}
                    placeholder="Digite a mensagem do lembrete"
                  />
                  <p className="text-xs text-gray-500">
                    Você pode usar [nome do convidado], [nome do aniversariante], [data], [hora], [local] e [tema] como
                    placeholders.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-active"
                    checked={newConfig.is_active}
                    onCheckedChange={(checked) => setNewConfig((prev) => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is-active">Ativar lembrete</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSaveConfig}
                  disabled={isSubmitting || !newConfig.message.trim()}
                  className="w-full"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Adicionar Lembrete
                </Button>
              </CardFooter>
            </Card>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Lembretes Configurados</h3>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                </div>
              ) : configs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Nenhum lembrete configurado</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Quando</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {configs.map((config) => (
                        <TableRow key={config.id}>
                          <TableCell>
                            <div className="flex items-center">
                              {config.type === "whatsapp" && <MessageSquare className="h-4 w-4 mr-2 text-green-600" />}
                              {config.type === "sms" && <Phone className="h-4 w-4 mr-2 text-blue-600" />}
                              {config.type === "email" && <Mail className="h-4 w-4 mr-2 text-purple-600" />}
                              {formatReminderType(config.type)}
                            </div>
                          </TableCell>
                          <TableCell>{formatReminderTiming(config.timing, config.custom_days)}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Switch
                                checked={config.is_active}
                                onCheckedChange={(checked) => handleToggleActive(config.id, checked)}
                                disabled={isLoading}
                              />
                              <span className="ml-2">{config.is_active ? "Ativo" : "Inativo"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500"
                              onClick={() => handleDeleteConfig(config.id)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <h3 className="text-lg font-medium">Histórico de Lembretes Enviados</h3>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Nenhum lembrete enviado ainda</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Convidado</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{formatDate(log.created_at)}</TableCell>
                        <TableCell>{(log as any).guests?.nome_principal || "Convidado"}</TableCell>
                        <TableCell>{formatReminderType(log.reminder_type)}</TableCell>
                        <TableCell>
                          {log.status === "sent" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Enviado
                            </span>
                          ) : log.status === "failed" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Falhou
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {log.status}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
