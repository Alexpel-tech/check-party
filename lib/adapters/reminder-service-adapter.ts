import {
  createReminderConfig,
  updateReminderConfig,
  getReminderConfigs,
  scheduleReminders,
  processPendingReminders,
  getReminderJobs,
} from "@/lib/services/reminder-service"

export const ReminderService = {
  createReminderConfig,
  updateReminderConfig,
  getReminderConfigs,
  scheduleReminders,
  processPendingReminders,
  getReminderJobs,
}

// Adapter functions for client components
export async function createReminderConfigAdapter(config: {
  partyId: string
  reminderType: "sms" | "whatsapp" | "both"
  daysBeforeEvent: number
  customMessage?: string
  enabled: boolean
}) {
  return await createReminderConfig(config)
}

export async function updateReminderConfigAdapter(id: string, config: any) {
  return await updateReminderConfig(id, config)
}

export async function getReminderConfigsAdapter(partyId?: string) {
  return await getReminderConfigs(partyId)
}

export async function scheduleRemindersAdapter(partyId: string) {
  return await scheduleReminders(partyId)
}

export async function processPendingRemindersAdapter() {
  return await processPendingReminders()
}

export async function getReminderJobsAdapter(partyId?: string) {
  return await getReminderJobs(partyId)
}
