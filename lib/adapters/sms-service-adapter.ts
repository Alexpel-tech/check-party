"use client"

import {
  sendGuestConfirmation as sendGuestConfirmationServer,
  sendGuestReminder as sendGuestReminderServer,
  sendCustomMessage as sendCustomMessageServer,
  getMessageHistory as getMessageHistoryServer,
} from "../services/sms-service"

export const SMSService = {
  sendGuestConfirmation: sendGuestConfirmationServer,
  sendGuestReminder: sendGuestReminderServer,
  sendCustomMessage: sendCustomMessageServer,
  getMessageHistory: getMessageHistoryServer,
}
