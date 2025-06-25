"use client"

import { useState, useEffect } from "react"
import { Check, X, Search, UserPlus, Trash, Mail, Phone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { deleteGuest } from "@/lib/actions/guests"
import { toast } from "@/components/ui/use-toast"

export function GuestList({ guests, onAddGuest, partyId }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredGuests, setFilteredGuests] = useState(guests || [])
  const [isDeleting, setIsDeleting] = useState(false)
  const [guestToDelete, setGuestToDelete] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (!guests) return

    if (searchTerm.trim() === "") {
      setFilteredGuests(guests)
    } else {
      const filtered = guests.filter(
        (guest) =>
          guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (guest.email && guest.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (guest.phone && guest.phone.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredGuests(filtered)
    }
  }, [searchTerm, guests])

  const handleDeleteClick = (guest) => {
    setGuestToDelete(guest)
    setIsDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!guestToDelete) return

    setIsDeleting(true)
    try {
      await deleteGuest(guestToDelete.id)
      toast({
        title: "Convidado excluído",
        description: "O convidado foi excluído com sucesso.",
      })
      // Remover o convidado da lista local
      setFilteredGuests(filteredGuests.filter((g) => g.id !== guestToDelete.id))
    } catch (error) {
      console.error("Erro ao excluir convidado:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o convidado.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDialogOpen(false)
      setGuestToDelete(null)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmado</Badge>
      case "declined":
        return <Badge variant="destructive">Recusado</Badge>
      default:
        return <Badge variant="outline">Pendente</Badge>
    }
  }

  if (!guests || guests.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium mb-2">Nenhum convidado encontrado</h3>
        <p className="text-muted-foreground mb-6">Adicione convidados à sua festa</p>
        {onAddGuest && (
          <Button onClick={onAddGuest}>
            <UserPlus className="mr-2 h-4 w-4" />
            Adicionar Convidado
          </Button>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar convidados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        {onAddGuest && (
          <Button onClick={onAddGuest}>
            <UserPlus className="mr-2 h-4 w-4" />
            Adicionar Convidado
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGuests.map((guest) => (
          <Card key={guest.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{guest.name}</CardTitle>
                  <CardDescription>{getStatusBadge(guest.status)}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDeleteClick(guest)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-1 text-sm">
                {guest.email && (
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{guest.email}</span>
                  </div>
                )}
                {guest.phone && (
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{guest.phone}</span>
                  </div>
                )}
                <div className="flex items-center mt-2">
                  {guest.status === "confirmed" ? (
                    <div className="flex items-center text-green-500">
                      <Check className="mr-1 h-4 w-4" />
                      <span>Confirmado</span>
                    </div>
                  ) : guest.status === "declined" ? (
                    <div className="flex items-center text-destructive">
                      <X className="mr-1 h-4 w-4" />
                      <span>Recusado</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Aguardando resposta</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o convidado "{guestToDelete?.name}"? Esta ação não pode ser desfeita.
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
