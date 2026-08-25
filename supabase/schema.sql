-- ============================================================================
-- Check Party — Schema do banco de dados (Supabase / PostgreSQL)
-- ============================================================================
-- Como usar:
-- 1. Abra seu projeto em https://supabase.com/dashboard
-- 2. Vá em "SQL Editor" → "New query"
-- 3. Cole este arquivo inteiro e clique em "Run"
-- ============================================================================

create extension if not exists "pgcrypto";

-- ============================================================================
-- party_halls — Salões de festa (proprietário = usuário do Supabase Auth)
-- ============================================================================
create table if not exists party_halls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  address text,
  capacity integer,
  cnpj text,
  idade_maxima_crianca integer default 8,
  endereco text,
  cidade text,
  estado text,
  cep text,
  responsavel text,
  telefone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_party_halls_user_id on party_halls(user_id);

-- ============================================================================
-- parties — Festas cadastradas em um salão
-- ============================================================================
create table if not exists parties (
  id uuid primary key default gen_random_uuid(),
  party_hall_id uuid not null references party_halls(id) on delete cascade,
  nome_aniversariante text not null,
  idade_aniversariante integer not null,
  data date not null,
  horario text not null,
  theme text,
  local_detalhado text,
  status text not null default 'planejada' check (status in ('planejada','em_andamento','finalizada','cancelada')),
  party_parents_id uuid,
  link_confirmacao text,
  qr_code_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_parties_party_hall_id on parties(party_hall_id);

-- ============================================================================
-- party_parents — Credenciais de acesso dos pais/responsáveis (login próprio)
-- ============================================================================
create table if not exists party_parents (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references parties(id) on delete cascade,
  username text not null unique,
  password text not null, -- hash bcrypt, nunca a senha em texto puro
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_party_parents_party_id on party_parents(party_id);

alter table parties
  add constraint fk_parties_party_parents
  foreign key (party_parents_id) references party_parents(id) on delete set null;

-- ============================================================================
-- guests — Convidados de cada festa
-- ============================================================================
create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references parties(id) on delete cascade,
  nome_principal text not null,
  email text,
  whatsapp text,
  quantidade_adultos integer not null default 0,
  quantidade_criancas integer not null default 0,
  quantidade_total integer generated always as (quantidade_adultos + quantidade_criancas) stored,
  status_confirmacao text not null default 'pendente' check (status_confirmacao in ('pendente','confirmado','recusado','talvez')),
  status_confirmacao_final boolean,
  status_confirmacao_pais boolean,
  observacao text,
  check_in_at timestamptz,
  checked_in boolean not null default false,
  checked_in_at timestamptz,
  qr_code_token text,
  data_envio_formulario timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_guests_party_id on guests(party_id);

-- ============================================================================
-- qr_codes — Histórico de QR Codes gerados para check-in
-- ============================================================================
create table if not exists qr_codes (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references guests(id) on delete cascade,
  party_id uuid not null references parties(id) on delete cascade,
  token text not null,
  check_in_url text,
  used boolean not null default false,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create index if not exists idx_qr_codes_guest_id on qr_codes(guest_id);
create index if not exists idx_qr_codes_party_id on qr_codes(party_id);

-- ============================================================================
-- sms_history — Histórico de SMS enviados (Twilio)
-- ============================================================================
create table if not exists sms_history (
  id uuid primary key default gen_random_uuid(),
  party_id uuid references parties(id) on delete cascade,
  guest_id uuid references guests(id) on delete cascade,
  phone_number text not null,
  message text not null,
  status text not null default 'pending' check (status in ('sent','failed','pending')),
  twilio_sid text,
  error_message text,
  sent_at timestamptz default now()
);

create index if not exists idx_sms_history_party_id on sms_history(party_id);

-- ============================================================================
-- whatsapp_history — Histórico de mensagens WhatsApp enviadas
-- ============================================================================
create table if not exists whatsapp_history (
  id uuid primary key default gen_random_uuid(),
  party_id uuid references parties(id) on delete cascade,
  guest_id uuid references guests(id) on delete cascade,
  phone_number text not null,
  message text not null,
  message_type text default 'text',
  template_name text,
  status text not null default 'pending' check (status in ('sent','failed','pending')),
  whatsapp_id text,
  error_message text,
  sent_at timestamptz default now()
);

create index if not exists idx_whatsapp_history_party_id on whatsapp_history(party_id);

-- ============================================================================
-- reminder_configs / reminder_jobs — Lembretes automáticos
-- ============================================================================
create table if not exists reminder_configs (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references parties(id) on delete cascade,
  reminder_type text not null check (reminder_type in ('sms','whatsapp','both')),
  days_before_event integer not null default 1,
  custom_message text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_reminder_configs_party_id on reminder_configs(party_id);

create table if not exists reminder_jobs (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references parties(id) on delete cascade,
  guest_id uuid not null references guests(id) on delete cascade,
  reminder_type text not null check (reminder_type in ('sms','whatsapp')),
  scheduled_for timestamptz not null,
  status text not null default 'pending' check (status in ('pending','sent','failed')),
  message text not null,
  processed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_reminder_jobs_party_id on reminder_jobs(party_id);
create index if not exists idx_reminder_jobs_status on reminder_jobs(status);

-- ============================================================================
-- table_layouts / table_assignments — Planejador de mesas
-- ============================================================================
create table if not exists table_layouts (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references parties(id) on delete cascade,
  name text not null,
  capacity integer not null default 8,
  x_position numeric not null default 0,
  y_position numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_table_layouts_party_id on table_layouts(party_id);

create table if not exists table_assignments (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references table_layouts(id) on delete cascade,
  guest_id uuid not null references guests(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (guest_id)
);

create index if not exists idx_table_assignments_table_id on table_assignments(table_id);

-- ============================================================================
-- notifications — Notificações em tempo real para o admin/dono do salão
-- ============================================================================
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'default' check (type in ('success','error','warning','info','default')),
  read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_id on notifications(user_id);

-- Habilita o Realtime para notificações em tempo real no dashboard
alter publication supabase_realtime add table notifications;

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================
-- Este projeto usa a chave anônima (anon key) tanto no client quanto nas
-- Server Actions (não há uma service_role key configurada). O acesso de
-- "pais/responsáveis" usa um login próprio via cookie (não é Supabase Auth),
-- então não dá para restringir essas tabelas por auth.uid() sem reescrever
-- a autenticação. party_halls JÁ é restrito por dono (auth.uid()) acima —
-- cada usuário administrador só cria/edita/exclui os próprios salões. As
-- demais tabelas abaixo seguem liberadas para qualquer requisição com a
-- anon key; o isolamento por dono nelas é reforçado na camada de aplicação
-- (Server Actions), não no banco — adequado para uso pessoal/familiar, mas
-- não isole dados sensíveis de terceiros aqui sem evoluir também essas políticas.

alter table party_halls enable row level security;
alter table parties enable row level security;
alter table party_parents enable row level security;
alter table guests enable row level security;
alter table qr_codes enable row level security;
alter table sms_history enable row level security;
alter table whatsapp_history enable row level security;
alter table reminder_configs enable row level security;
alter table reminder_jobs enable row level security;
alter table table_layouts enable row level security;
alter table table_assignments enable row level security;
alter table notifications enable row level security;

-- party_halls: cada dono só cria/edita/exclui os próprios salões.
-- A LEITURA fica liberada para todos (inclusive sem login), pois a
-- página pública de confirmação do convidado precisa listar salões
-- para o visitante localizar a festa.
create policy "party_halls_select_own_or_public" on party_halls for select using (true);
create policy "party_halls_insert_own" on party_halls for insert with check (auth.uid() = user_id);
create policy "party_halls_update_own" on party_halls for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "party_halls_delete_own" on party_halls for delete using (auth.uid() = user_id);

create policy "allow all - parties" on parties for all using (true) with check (true);
create policy "allow all - party_parents" on party_parents for all using (true) with check (true);
create policy "allow all - guests" on guests for all using (true) with check (true);
create policy "allow all - qr_codes" on qr_codes for all using (true) with check (true);
create policy "allow all - sms_history" on sms_history for all using (true) with check (true);
create policy "allow all - whatsapp_history" on whatsapp_history for all using (true) with check (true);
create policy "allow all - reminder_configs" on reminder_configs for all using (true) with check (true);
create policy "allow all - reminder_jobs" on reminder_jobs for all using (true) with check (true);
create policy "allow all - table_layouts" on table_layouts for all using (true) with check (true);
create policy "allow all - table_assignments" on table_assignments for all using (true) with check (true);
create policy "allow all - notifications" on notifications for all using (true) with check (true);
