import {
  sendWhatsAppMessage,
  getWhatsAppHistory,
  sendConfirmationReminder,
  sendConfirmationThankYou,
} from "@/lib/services/whatsapp-service"

// Adapter functions for client components
export async function sendWhatsAppMessageAdapter(data: {
  to: string
  message: string
  partyId?: string
  guestId?: string
  type?: "text" | "template"
  templateName?: string
  templateParams?: string[]
}) {
  return await sendWhatsAppMessage(data)
}

export async function getWhatsAppHistoryAdapter(partyId?: string) {
  return await getWhatsAppHistory(partyId)
}

export async function sendConfirmationReminderAdapter(
  to: string,
  guestName: string,
  partyName: string,
  partyDate: string,
  partyId: string,
  guestId: string,
) {
  return await sendConfirmationReminder(to, guestName, partyName, partyDate, partyId, guestId)
}

export async function sendConfirmationThankYouAdapter(
  to: string,
  guestName: string,
  partyName: string,
  partyId: string,
  guestId: string,
) {
  return await sendConfirmationThankYou(to, guestName, partyName, partyId, guestId)
}

export const WhatsAppService = {
  sendWhatsAppMessage,
  getWhatsAppHistory,
  sendConfirmationReminder,
  sendConfirmationThankYou,
}
