"use client"

import {
  sendGuestConfirmation as sendGuestConfirmationServer,
  sendGuestReminder as sendGuestReminderServer,
  sendCustomMessage as sendCustomMessageServer,
  getMessageHistory as getMessageHistoryServer,
} from "../services/whatsapp-service"

export const WhatsAppService = {
  sendGuestConfirmation: sendGuestConfirmationServer,
  sendGuestReminder: sendGuestReminderServer,
  sendCustomMessage: sendCustomMessageServer,
  getMessageHistory: getMessageHistoryServer,
}
