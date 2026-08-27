"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, Clock, MapPin, Users, Edit, Trash, Plus } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { deleteParty } from "@/lib/actions/parties"
import { toast } from "@/components/ui/use-toast"

export function PartyList({ parties, showActions = true }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [partyToDelete, setPartyToDelete] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredParties, setFilteredParties] = useState(parties)

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredParties(parties)
    } else {
      const filtered = parties.filter(
        (party) =>
          party.nome_aniversariante?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          party.local_detalhado?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredParties(filtered)
    }
  }, [searchTerm, parties])

  const handleDeleteClick = (party) => {
    setPartyToDelete(party)
    setIsDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!partyToDelete) return

    setIsDeleting(true)
    try {
      await deleteParty(partyToDelete.id)
      toast({
        title: "Festa excluída",
        description: "A festa foi excluída com sucesso.",
      })
      // Remover a festa da lista local
      setFilteredParties(filteredParties.filter((p) => p.id !== partyToDelete.id))
    } catch (error) {
      console.error("Erro ao excluir festa:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir a festa.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDialogOpen(false)
      setPartyToDelete(null)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return format(date, "PPP", { locale: ptBR })
  }

  const formatTime = (timeString) => {
    if (!timeString) return ""
    return timeString.substring(0, 5)
  }

  if (!parties || parties.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium mb-2">Nenhuma festa encontrada</h3>
        <p className="text-muted-foreground mb-6">Comece criando sua primeira festa</p>
        <Link href="/admin/parties/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Festa
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Input
          placeholder="Buscar festas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParties.map((party) => (
          <Card key={party.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle>{party.nome_aniversariante}</CardTitle>
              <CardDescription>{party.theme || "Sem tema definido"}</CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(party.data)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{formatTime(party.horario)}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{party.local_detalhado || "Local não informado"}</span>
                </div>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>
                    {party.confirmados ?? 0}/{party.total_convidados ?? 0} confirmados
                  </span>
                </div>
              </div>
            </CardContent>
            {showActions && (
              <CardFooter className="flex justify-between pt-3">
                <Link href={`/admin/parties/${party.id}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => handleDeleteClick(party)}>
                  <Trash className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a festa "{partyToDelete?.nome_aniversariante}"? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
