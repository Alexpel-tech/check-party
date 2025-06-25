// Funções utilitárias para geração e validação de QR Codes
import { createServerClient } from "../supabase/server"
import type { Guest } from "../types"

// Gerar um token único para o QR Code
export function generateQRToken(guestId: string, partyId: string): string {
  // Combinar IDs e adicionar timestamp para unicidade
  const timestamp = Date.now()
  const token = `${guestId}_${partyId}_${timestamp}`

  // Codificar em base64 para tornar mais compacto
  return Buffer.from(token).toString("base64")
}

// Validar um token de QR Code
export async function validateQRToken(token: string): Promise<{
  valid: boolean
  guest?: Guest | null
  error?: string
}> {
  try {
    // Decodificar o token
    const decoded = Buffer.from(token, "base64").toString()
    const [guestId, partyId] = decoded.split("_")

    if (!guestId || !partyId) {
      return { valid: false, error: "QR Code inválido" }
    }

    // Buscar o convidado no banco de dados
    const supabase = createServerClient()
    const { data, error } = await supabase.from("guests").select("*").eq("id", guestId).eq("party_id", partyId).single()

    if (error || !data) {
      return { valid: false, error: "Convidado não encontrado" }
    }

    return { valid: true, guest: data }
  } catch (error) {
    console.error("Erro ao validar QR Code:", error)
    return { valid: false, error: "Erro ao processar QR Code" }
  }
}

// Registrar check-in do convidado
export async function registerCheckIn(guestId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = createServerClient()

    // Verificar se o convidado já fez check-in
    const { data: existingCheckIn } = await supabase.from("guest_checkins").select("*").eq("guest_id", guestId).single()

    if (existingCheckIn) {
      return {
        success: false,
        error: "Check-in já realizado às " + new Date(existingCheckIn.check_in_time).toLocaleTimeString("pt-BR"),
      }
    }

    // Registrar o check-in
    const { error } = await supabase.from("guest_checkins").insert({
      guest_id: guestId,
      check_in_time: new Date().toISOString(),
    })

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error("Erro ao registrar check-in:", error)
    return { success: false, error: "Erro ao registrar check-in" }
  }
}

// Obter status de check-in de um convidado
export async function getCheckInStatus(guestId: string): Promise<{
  checkedIn: boolean
  checkInTime?: string
}> {
  try {
    const supabase = createServerClient()

    const { data } = await supabase.from("guest_checkins").select("*").eq("guest_id", guestId).single()

    if (data) {
      return {
        checkedIn: true,
        checkInTime: data.check_in_time,
      }
    }

    return { checkedIn: false }
  } catch (error) {
    console.error("Erro ao verificar status de check-in:", error)
    return { checkedIn: false }
  }
}
