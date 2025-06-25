"use client" // This adapter is for client-side consumption

// Import all individual server actions from the service file
import {
  createReminderConfig,
  updateReminderConfig,
  getReminderConfigsByParty,
  deleteReminderConfig,
  sendReminder,
  getReminderLogsByParty,
  processScheduledReminders,
  // Import types if they are defined in the service file and needed by the client
  type ReminderType,
  type ReminderTiming,
} from "../services/reminder-service"

// Re-export types for convenience if components need them
export type { ReminderType, ReminderTiming }

// This is the object that client components will import
export const ReminderService = {
  createReminderConfig,
  updateReminderConfig,
  getReminderConfigsByParty,
  deleteReminderConfig,
  sendReminder,
  getReminderLogsByParty,
  processScheduledReminders,
}
