"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download } from "lucide-react"
import { createGuest } from "@/lib/actions/guests"
import type { Party, NewGuest } from "@/lib/types"
import Papa from "papaparse"

interface ContactImporterProps {
  party: Party
  onImportComplete?: () => void
}

export function ContactImporter({ party, onImportComplete }: ContactImporterProps) {
  const [activeTab, setActiveTab] = useState("csv")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [importStats, setImportStats] = useState<{
    total: number
    imported: number
    failed: number
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Função para processar arquivo CSV
  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError("")
    setSuccess("")
    setImportStats(null)
    setUploadProgress(0)

    try {
      // Usar PapaParse para processar o CSV
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const { data, errors } = results

          if (errors.length > 0) {
            setError(`Erro ao processar CSV: ${errors[0].message}`)
            setIsUploading(false)
            return
          }

          if (!Array.isArray(data) || data.length === 0) {
            setError("Nenhum dado encontrado no arquivo CSV")
            setIsUploading(false)
            return
          }

          // Estatísticas de importação
          let imported = 0
          let failed = 0
          const total = data.length

          // Processar cada linha do CSV
          for (let i = 0; i < data.length; i++) {
            const row = data[i]

            try {
              // Mapear campos do CSV para o modelo de convidado.
              // quantidade_total é calculado automaticamente pelo banco
              // (adultos + crianças) — não deve ser enviado no insert.
              const quantidadeCriancas = Number.parseInt(row.criancas || row.children || "0") || 0
              const quantidadeTotalCsv = Number.parseInt(row.quantidade || row.total || "1") || 1
              const quantidadeAdultos = Math.max(1, quantidadeTotalCsv - quantidadeCriancas)

              const newGuest: NewGuest = {
                party_id: party.id,
                nome_principal: row.nome || row.name || "",
                email: row.email || "",
                whatsapp: row.whatsapp || row.telefone || row.phone || null,
                quantidade_adultos: quantidadeAdultos,
                quantidade_criancas: quantidadeCriancas,
                status_confirmacao_pais: false,
                status_confirmacao_final: false,
                data_envio_formulario: new Date().toISOString(),
              }

              // Validar dados mínimos
              if (!newGuest.nome_principal) {
                throw new Error("Nome não fornecido")
              }

              // Criar convidado no banco de dados
              await createGuest(newGuest)
              imported++
            } catch (error) {
              console.error("Erro ao importar convidado:", error)
              failed++
            }

            // Atualizar progresso
            const progress = Math.round(((i + 1) / total) * 100)
            setUploadProgress(progress)
          }

          // Atualizar estatísticas finais
          setImportStats({
            total,
            imported,
            failed,
          })

          if (imported > 0) {
            setSuccess(`Importação concluída! ${imported} convidados importados com sucesso.`)

            // Chamar callback se fornecido
            if (onImportComplete) {
              onImportComplete()
            }
          } else {
            setError("Nenhum convidado foi importado. Verifique o formato do arquivo.")
          }

          setIsUploading(false)

          // Limpar input de arquivo
          if (fileInputRef.current) {
            fileInputRef.current.value = ""
          }
        },
        error: (error) => {
          setError(`Erro ao processar arquivo: ${error.message}`)
          setIsUploading(false)
        },
      })
    } catch (error: any) {
      setError(`Erro ao processar arquivo: ${error.message}`)
      setIsUploading(false)
    }
  }

  // Função para baixar modelo de CSV
  const downloadCSVTemplate = () => {
    const headers = ["nome", "email", "whatsapp", "acompanhante", "quantidade_total", "quantidade_criancas"]
    const sampleData = [
      ["João Silva", "joao@email.com", "11999999999", "sim", "3", "1"],
      ["Maria Souza", "maria@email.com", "11988888888", "não", "1", "0"],
    ]

    const csvContent = [headers.join(","), ...sampleData.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "modelo_convidados.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          Importar Convidados
        </CardTitle>
        <CardDescription>Importe sua lista de convidados de diferentes fontes</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="csv">Arquivo CSV</TabsTrigger>
            <TabsTrigger value="manual">Entrada Manual</TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">Importe seus convidados a partir de um arquivo CSV</p>
              <Button variant="outline" size="sm" onClick={downloadCSVTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Baixar Modelo
              </Button>
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="csv-file">Arquivo CSV</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleCSVUpload}
                disabled={isUploading}
              />
              <p className="text-xs text-gray-500">O arquivo deve conter colunas para nome, email, whatsapp, etc.</p>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Progresso</Label>
                  <span className="text-xs text-gray-500">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {importStats && (
              <div className="p-4 bg-gray-50 rounded-md border space-y-2">
                <h4 className="font-medium">Resultado da Importação</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-lg font-bold">{importStats.total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Importados</p>
                    <p className="text-lg font-bold text-green-600">{importStats.imported}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Falhas</p>
                    <p className="text-lg font-bold text-red-600">{importStats.failed}</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <p className="text-sm text-gray-500">Adicione múltiplos convidados manualmente (em desenvolvimento)</p>

            <div className="p-8 border border-dashed rounded-md flex flex-col items-center justify-center text-gray-500">
              <FileSpreadsheet className="h-12 w-12 mb-4 text-gray-400" />
              <p>Funcionalidade em desenvolvimento</p>
              <p className="text-sm">Em breve você poderá adicionar múltiplos convidados de uma vez</p>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="default" className="mt-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
