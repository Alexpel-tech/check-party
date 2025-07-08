import { supabase } from "@/lib/supabase/client"
import QRCode from "qrcode"

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

export async function generateCheckInQRCode(guestId: string, partyId: string): Promise<string> {
  try {
    // Gerar token único para o check-in
    const token = `${guestId}-${partyId}-${Date.now()}`
    const checkInUrl = `${window.location.origin}/check-in/${token}`

    // Salvar o token no banco de dados
    const { error } = await supabase.from("qr_codes").insert({
      guest_id: guestId,
      party_id: partyId,
      token,
      check_in_url: checkInUrl,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
    })

    if (error) throw error

    // Gerar QR Code com a URL
    return await generateQRCode(checkInUrl)
  } catch (error) {
    console.error("Erro ao gerar QR Code de check-in:", error)
    throw new Error("Erro ao gerar QR Code de check-in")
  }
}

export async function validateCheckInToken(token: string) {
  try {
    const { data, error } = await supabase
      .from("qr_codes")
      .select(`
        *,
        guests(*),
        parties(*)
      `)
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Erro ao validar token de check-in:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Token inválido ou expirado",
    }
  }
}

export async function processCheckIn(token: string) {
  try {
    // Validar token
    const validation = await validateCheckInToken(token)
    if (!validation.success || !validation.data) {
      throw new Error(validation.error || "Token inválido")
    }

    const { guests, parties } = validation.data

    // Marcar convidado como presente
    const { error: updateError } = await supabase
      .from("guests")
      .update({
        status: "confirmed",
        checked_in: true,
        checked_in_at: new Date().toISOString(),
      })
      .eq("id", guests.id)

    if (updateError) throw updateError

    // Marcar QR Code como usado
    const { error: qrError } = await supabase
      .from("qr_codes")
      .update({
        used: true,
        used_at: new Date().toISOString(),
      })
      .eq("token", token)

    if (qrError) throw qrError

    return {
      success: true,
      guest: guests,
      party: parties,
    }
  } catch (error) {
    console.error("Erro ao processar check-in:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao processar check-in",
    }
  }
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
