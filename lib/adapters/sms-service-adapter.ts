"use client"

import { sendGuestConfirmation, sendGuestReminder, sendCustomMessage, getMessageHistory } from "../services/sms-service"

// Adapter para uso em componentes cliente
export const SMSService = {
  sendGuestConfirmation,
  sendGuestReminder,
  sendCustomMessage,
  getMessageHistory,
}
