"use client"

import {
  getReminderConfigs,
  createReminderConfig,
  updateReminderConfig,
  deleteReminderConfig,
  getReminderLogs,
  sendReminder,
  processScheduledReminders,
  type ReminderType,
  type ReminderTiming,
} from "../services/reminder-service"

export const ReminderService = {
  getReminderConfigs,
  createReminderConfig,
  updateReminderConfig,
  deleteReminderConfig,
  getReminderLogs,
  sendReminder,
  processScheduledReminders,
}

export type { ReminderType, ReminderTiming }
