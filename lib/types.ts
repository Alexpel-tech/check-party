export interface PartyHall {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  capacity?: number
  cnpj?: string
  idade_maxima_crianca?: number
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  responsavel?: string
  telefone?: string
  created_at: string
  updated_at: string
  user_id: string // ID do usuário proprietário do salão
}

// Campos que o formulário de criação envia. O user_id (dono) é sempre
// definido no servidor a partir da sessão logada, nunca pelo cliente.
export type NewPartyHall = Omit<PartyHall, "id" | "created_at" | "updated_at" | "user_id">

export interface Party {
  id: string
  party_hall_id: string // ID do salão de festas
  nome_aniversariante: string
  idade_aniversariante: number
  data: string // Formato YYYY-MM-DD
  horario: string // Formato HH:MM
  theme?: string
  local_detalhado?: string // Endereço completo, pode ser diferente do salão
  status: "planejada" | "em_andamento" | "finalizada" | "cancelada"
  created_at: string
  updated_at: string
  party_parents_id?: string // ID dos pais/responsáveis pela festa
  link_confirmacao?: string // Link único para confirmação
  qr_code_token?: string // Token para QR Code de check-in
}

export interface Guest {
  id: string
  party_id: string
  nome_principal: string
  email?: string
  whatsapp?: string // Número de telefone para WhatsApp e SMS
  quantidade_adultos: number
  quantidade_criancas: number
  quantidade_total: number // Calculado (adultos + crianças)
  status_confirmacao: "pendente" | "confirmado" | "recusado" | "talvez"
  status_confirmacao_final?: boolean // True se confirmado, False se recusado, Null se pendente/talvez
  status_confirmacao_pais?: boolean
  observacao?: string
  data_envio_formulario?: string
  created_at: string
  updated_at: string
  check_in_at?: string // Data e hora do check-in
  checked_in?: boolean
  checked_in_at?: string
  qr_code_token?: string // Token individual do QR Code do convidado
}

// Campos que o formulário de confirmação envia. quantidade_total é
// calculado automaticamente pelo banco (adultos + crianças) e NÃO deve
// ser enviado no insert.
export type NewGuest = Omit<
  Guest,
  "id" | "quantidade_total" | "status_confirmacao" | "created_at" | "updated_at" | "checked_in" | "checked_in_at"
>

export interface PartyParent {
  id: string
  user_id: string // ID do usuário Supabase Auth
  name: string
  email: string // Email do usuário Supabase Auth
  phone?: string
  created_at: string
  updated_at: string
}

export interface Plan {
  id: string
  name: string
  price: number
  features: string[]
  description?: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  status: "active" | "inactive" | "canceled" | "past_due"
  start_date: string
  end_date?: string
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  subscription_id: string
  amount: number
  status: "pending" | "paid" | "failed"
  payment_method: "credit_card" | "boleto" | "pix"
  transaction_id?: string // ID da transação do gateway de pagamento
  created_at: string
  updated_at: string
}

export interface ReminderConfig {
  id: string
  party_id: string
  type: "whatsapp" | "sms" | "email"
  timing: "1_day" | "2_days" | "3_days" | "1_week" | "custom"
  custom_days?: number | null
  message: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ReminderLog {
  id: string
  guest_id: string
  party_id: string
  reminder_config_id?: string | null // Adicionado
  reminder_type: "whatsapp" | "sms" | "email"
  message: string
  status: "sent" | "failed" | "pending"
  message_id?: string | null
  error_message?: string | null // Adicionado
  created_at: string
}

export interface Contact {
  id: string
  user_id: string // ID do usuário que importou o contato
  name: string
  phone?: string | null
  email?: string | null
  source?: string // Ex: "CSV Import", "Manual"
  created_at: string
  updated_at: string
}

export interface TableLayout {
  id: string
  party_id: string
  name: string // Ex: "Mesa dos Noivos", "Mesa 1"
  capacity: number
  assigned_guests: string[] // Array de IDs de convidados
  position_x: number
  position_y: number
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: "success" | "error" | "warning" | "info" | "default"
  read: boolean
  created_at: string
  link?: string // Opcional: link para direcionar o usuário ao clicar na notificação
}
