"use client"

import { Select } from "@/components/ui/select"

import { SelectItem, SelectContent, SelectValue, SelectTrigger } from "@/components/ui/select"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Plus, Trash2, AlertCircle, CheckCircle, Users, TableIcon } from "lucide-react"
import {
  getTableLayout,
  createTable as createTableAction,
  updateTablePosition,
  deleteTable as deleteTableAction,
  getTableAssignments,
  assignGuestToTable as assignGuestToTableAction,
  removeGuestAssignment as removeGuestAssignmentAction,
} from "@/lib/actions/table-layout"
import { getGuestsByParty } from "@/lib/actions/guests"
import type { Party, Guest, TableLayout, TableAssignment } from "@/lib/types"

interface TablePlannerProps {
  party: Party
}

export function TablePlanner({ party }: TablePlannerProps) {
  const [activeTab, setActiveTab] = useState("layout")
  const [tables, setTables] = useState<TableLayout[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [assignments, setAssignments] = useState<TableAssignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Estado para o modal de nova mesa
  const [newTableDialog, setNewTableDialog] = useState(false)
  const [newTable, setNewTable] = useState({
    name: "",
    capacity: 8,
  })

  // Referência para o canvas de layout
  const canvasRef = useRef<HTMLDivElement>(null)

  // Estado para controlar o arrasto de mesas
  const [draggedTable, setDraggedTable] = useState<string | null>(null)

  // Carregar dados iniciais
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const tablesData = await getTableLayout(party.id)
        setTables(tablesData)

        const guestsData = await getGuestsByParty(party.id)
        setGuests(guestsData)

        const assignmentsData = await getTableAssignments(party.id)
        setAssignments(assignmentsData)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        setError("Erro ao carregar dados do layout")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [party.id])

  // Função para adicionar nova mesa
  const handleAddTable = async () => {
    if (!newTable.name.trim() || newTable.capacity < 1) {
      setError("Nome e capacidade são obrigatórios")
      return
    }

    try {
      const canvas = canvasRef.current
      const x = canvas ? canvas.clientWidth / 2 : 200
      const y = canvas ? canvas.clientHeight / 2 : 200

      const tableData = {
        party_id: party.id,
        name: newTable.name,
        capacity: newTable.capacity,
        x_position: x,
        y_position: y,
      }

      const result = await createTableAction(tableData)

      if (!result) {
        throw new Error("Erro ao criar mesa")
      }

      setTables((prev) => [...prev, result])
      setSuccess(`Mesa "${newTable.name}" criada com sucesso!`)
      setNewTableDialog(false)
      setNewTable({
        name: "",
        capacity: 8,
      })
    } catch (error) {
      console.error("Erro ao adicionar mesa:", error)
      setError("Erro ao adicionar mesa")
    }
  }

  // Função para excluir mesa
  const handleDeleteTable = async (tableId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta mesa?")) {
      return
    }

    try {
      const result = await deleteTableAction(tableId)

      if (!result) {
        throw new Error("Erro ao excluir mesa")
      }

      setTables((prev) => prev.filter((table) => table.id !== tableId))
      setSuccess("Mesa excluída com sucesso!")
    } catch (error) {
      console.error("Erro ao excluir mesa:", error)
      setError("Erro ao excluir mesa")
    }
  }

  // Função para iniciar arrasto de mesa
  const handleDragStart = (tableId: string) => {
    setDraggedTable(tableId)
  }

  // Função para finalizar arrasto de mesa
  const handleDragEnd = async (tableId: string, x: number, y: number) => {
    try {
      await updateTablePosition(tableId, x, y)

      setTables((prev) =>
        prev.map((table) => (table.id === tableId ? { ...table, x_position: x, y_position: y } : table)),
      )
    } catch (error) {
      console.error("Erro ao atualizar posição da mesa:", error)
    } finally {
      setDraggedTable(null)
    }
  }

  // Função para atribuir convidado a uma mesa
  const handleAssignGuest = async (tableId: string, guestId: string) => {
    try {
      const result = await assignGuestToTableAction(tableId, guestId)

      if (!result) {
        throw new Error("Erro ao atribuir convidado à mesa")
      }

      setAssignments((prev) => {
        const existing = prev.find((a) => a.guest_id === guestId)
        if (existing) {
          return prev.map((a) => (a.guest_id === guestId ? { ...a, table_id: tableId } : a))
        } else {
          return [...prev, result]
        }
      })

      setSuccess("Convidado atribuído à mesa com sucesso!")
    } catch (error) {
      console.error("Erro ao atribuir convidado:", error)
      setError("Erro ao atribuir convidado à mesa")
    }
  }

  // Função para remover atribuição de convidado
  const handleRemoveAssignment = async (guestId: string) => {
    try {
      const result = await removeGuestAssignmentAction(guestId)

      if (!result) {
        throw new Error("Erro ao remover atribuição")
      }

      setAssignments((prev) => prev.filter((a) => a.guest_id !== guestId))
      setSuccess("Atribuição removida com sucesso!")
    } catch (error) {
      console.error("Erro ao remover atribuição:", error)
      setError("Erro ao remover atribuição")
    }
  }

  // Função para obter mesa de um convidado
  const getGuestTable = (guestId: string) => {
    const assignment = assignments.find((a) => a.guest_id === guestId)
    if (!assignment) return null

    return tables.find((t) => t.id === assignment.table_id)
  }

  // Função para obter convidados de uma mesa
  const getTableGuests = (tableId: string) => {
    const tableAssignments = assignments.filter((a) => a.table_id === tableId)
    return tableAssignments.map((a) => guests.find((g) => g.id === a.guest_id)).filter(Boolean) as Guest[]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TableIcon className="h-5 w-5 mr-2" />
          Planejador de Layout
        </CardTitle>
        <CardDescription>Organize mesas e assentos para a festa de {party.nome_aniversariante}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="layout">Layout de Mesas</TabsTrigger>
            <TabsTrigger value="assignments">Atribuição de Convidados</TabsTrigger>
          </TabsList>

          <TabsContent value="layout" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Mesas</h3>
              <Button onClick={() => setNewTableDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Mesa
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : (
              <div ref={canvasRef} className="relative w-full h-96 border rounded-md bg-gray-50 overflow-hidden">
                {tables.map((table) => (
                  <div
                    key={table.id}
                    className={`absolute flex flex-col items-center justify-center p-2 rounded-full bg-purple-100 border-2 border-purple-300 cursor-move ${
                      draggedTable === table.id ? "z-10 opacity-70" : ""
                    }`}
                    style={{
                      left: `${table.x_position}px`,
                      top: `${table.y_position}px`,
                      width: "100px",
                      height: "100px",
                      transform: "translate(-50%, -50%)",
                    }}
                    draggable
                    onDragStart={() => handleDragStart(table.id)}
                    onDragEnd={(e) => {
                      const rect = canvasRef.current?.getBoundingClientRect()
                      if (rect) {
                        const x = e.clientX - rect.left
                        const y = e.clientY - rect.top
                        handleDragEnd(table.id, x, y)
                      }
                    }}
                  >
                    <span className="font-medium text-sm">{table.name}</span>
                    <div className="flex items-center text-xs text-gray-600">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{table.capacity}</span>
                    </div>
                    <button
                      className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteTable(table.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {tables.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <TableIcon className="h-12 w-12 mb-2 text-gray-300" />
                    <p>Nenhuma mesa adicionada</p>
                    <p className="text-sm">Clique em "Nova Mesa" para começar</p>
                  </div>
                )}
              </div>
            )}

            <div className="text-sm text-gray-500 text-center">Arraste as mesas para posicioná-las no layout</div>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <h3 className="text-lg font-medium">Atribuição de Convidados</h3>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : tables.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Adicione mesas primeiro na aba "Layout de Mesas"</AlertDescription>
              </Alert>
            ) : guests.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Nenhum convidado encontrado para esta festa</AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Convidados</h4>
                  <div className="border rounded-md divide-y max-h-96 overflow-y-auto">
                    {guests.map((guest) => {
                      const table = getGuestTable(guest.id)
                      return (
                        <div key={guest.id} className="p-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{guest.nome_principal}</p>
                            <p className="text-xs text-gray-500">
                              {guest.quantidade_total} {guest.quantidade_total > 1 ? "pessoas" : "pessoa"}
                            </p>
                          </div>
                          <div className="flex items-center">
                            {table ? (
                              <div className="flex items-center">
                                <span className="text-sm text-gray-600 mr-2">Mesa: {table.name}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 bg-transparent"
                                  onClick={() => handleRemoveAssignment(guest.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Select onValueChange={(tableId) => handleAssignGuest(tableId, guest.id)}>
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Mesa" />
                                </SelectTrigger>
                                <SelectContent>
                                  {tables.map((table) => (
                                    <SelectItem key={table.id} value={table.id}>
                                      {table.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Mesas</h4>
                  <div className="border rounded-md divide-y max-h-96 overflow-y-auto">
                    {tables.map((table) => {
                      const tableGuests = getTableGuests(table.id)
                      return (
                        <div key={table.id} className="p-3">
                          <div className="flex justify-between items-center mb-2">
                            <p className="font-medium">{table.name}</p>
                            <span className="text-sm text-gray-600">
                              {tableGuests.length}/{table.capacity}
                            </span>
                          </div>
                          {tableGuests.length > 0 ? (
                            <div className="space-y-1">
                              {tableGuests.map((guest) => (
                                <div key={guest.id} className="flex justify-between items-center text-sm">
                                  <span>{guest.nome_principal}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => handleRemoveAssignment(guest.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">Nenhum convidado atribuído</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mt-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Dialog open={newTableDialog} onOpenChange={setNewTableDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Mesa</DialogTitle>
              <DialogDescription>Adicione uma nova mesa ao layout da festa</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="table-name">Nome da Mesa</Label>
                <Input
                  id="table-name"
                  placeholder="Ex: Mesa 1, Mesa VIP, etc."
                  value={newTable.name}
                  onChange={(e) => setNewTable((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="table-capacity">Capacidade</Label>
                <Input
                  id="table-capacity"
                  type="number"
                  min="1"
                  value={newTable.capacity}
                  onChange={(e) => setNewTable((prev) => ({ ...prev, capacity: Number.parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewTableDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddTable}>Adicionar Mesa</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
