import { createClient } from "@/lib/supabase/client"
import QRCode from "qrcode"
import jwt from "jsonwebtoken"

const supabase = createClient()

export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 256,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })
    return qrCodeDataURL
  } catch (error) {
    console.error("Erro ao gerar QR Code:", error)
    throw new Error("Erro ao gerar QR Code")
  }
}

export async function generateQRToken(guestId: string, partyId: string): Promise<string> {
  try {
    const payload = {
      guestId,
      partyId,
      timestamp: Date.now(),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 horas
    }

    const secret = process.env.JWT_SECRET || "fallback-secret-key"
    const token = jwt.sign(payload, secret)

    return token
  } catch (error) {
    console.error("Erro ao gerar token QR:", error)
    throw new Error("Erro ao gerar token QR")
  }
}

export async function validateQRToken(token: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const secret = process.env.JWT_SECRET || "fallback-secret-key"
    const decoded = jwt.verify(token, secret) as any

    if (!decoded.guestId || !decoded.partyId) {
      return { success: false, error: "Token inválido" }
    }

    // Verificar se o convidado existe
    const { data: guest, error: guestError } = await supabase
      .from("guests")
      .select("*, parties(*)")
      .eq("id", decoded.guestId)
      .eq("party_id", decoded.partyId)
      .single()

    if (guestError || !guest) {
      return { success: false, error: "Convidado não encontrado" }
    }

    return { success: true, data: { guest, token: decoded } }
  } catch (error) {
    console.error("Erro ao validar token QR:", error)
    return { success: false, error: "Token inválido ou expirado" }
  }
}

export async function registerCheckIn(token: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Validar token primeiro
    const validation = await validateQRToken(token)
    if (!validation.success || !validation.data) {
      return { success: false, error: validation.error || "Token inválido" }
    }

    const { guest } = validation.data

    // Verificar se já fez check-in
    if (guest.checked_in) {
      return { success: false, error: "Check-in já realizado" }
    }

    // Realizar check-in
    const { error: updateError } = await supabase
      .from("guests")
      .update({
        status: "confirmed",
        checked_in: true,
        checked_in_at: new Date().toISOString(),
      })
      .eq("id", guest.id)

    if (updateError) {
      throw updateError
    }

    // Registrar no histórico de QR codes
    const { error: historyError } = await supabase.from("qr_codes").insert({
      guest_id: guest.id,
      party_id: guest.party_id,
      token,
      used: true,
      used_at: new Date().toISOString(),
      check_in_url: `${typeof window !== "undefined" ? window.location.origin : ""}/check-in/${token}`,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })

    if (historyError) {
      console.warn("Erro ao registrar histórico:", historyError)
    }

    return {
      success: true,
      data: {
        guest: { ...guest, checked_in: true, checked_in_at: new Date().toISOString() },
        party: guest.parties,
      },
    }
  } catch (error) {
    console.error("Erro ao registrar check-in:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao processar check-in",
    }
  }
}

export async function generateCheckInQRCode(guestId: string, partyId: string): Promise<string> {
  try {
    // Gerar token JWT
    const token = await generateQRToken(guestId, partyId)
    const checkInUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/check-in/${token}`

    // Salvar o token no banco de dados
    const { error } = await supabase.from("qr_codes").insert({
      guest_id: guestId,
      party_id: partyId,
      token,
      check_in_url: checkInUrl,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
    })

    if (error) {
      console.warn("Erro ao salvar QR code no banco:", error)
    }

    // Gerar QR Code com a URL
    return await generateQRCode(checkInUrl)
  } catch (error) {
    console.error("Erro ao gerar QR Code de check-in:", error)
    throw new Error("Erro ao gerar QR Code de check-in")
  }
}

export async function validateCheckInToken(token: string) {
  return await validateQRToken(token)
}

export async function processCheckIn(token: string) {
  return await registerCheckIn(token)
}

export async function getQRCodeHistory(partyId?: string) {
  try {
    let query = supabase
      .from("qr_codes")
      .select(`
        *,
        guests(name, email, phone),
        parties(name, date)
      `)
      .order("created_at", { ascending: false })

    if (partyId) {
      query = query.eq("party_id", partyId)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Erro ao buscar histórico de QR Codes:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar histórico",
    }
  }
}
