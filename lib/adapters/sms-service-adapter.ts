import { sendSMS, getSMSHistory, SMSService } from "@/lib/services/sms-service"

// Adapter functions for client components
export async function sendSMSAdapter(data: {
  to: string
  message: string
  partyId?: string
  guestId?: string
}) {
  return await sendSMS(data)
}

export async function getSMSHistoryAdapter(partyId?: string) {
  return await getSMSHistory(partyId)
}

// Export the service for compatibility
export { SMSService }
