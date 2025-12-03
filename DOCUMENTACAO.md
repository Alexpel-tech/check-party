# 📚 Documentação Completa - Check Party

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Funcionalidades](#funcionalidades)
4. [Instalação e Configuração](#instalação-e-configuração)
5. [Estrutura do Projeto](#estrutura-do-projeto)
6. [Banco de Dados](#banco-de-dados)
7. [APIs e Serviços](#apis-e-serviços)
8. [Integrações](#integrações)
9. [Fluxos de Usuário](#fluxos-de-usuário)
10. [Testes](#testes)
11. [Segurança](#segurança)
12. [Deploy](#deploy)

---

## 🎯 Visão Geral

O **Check Party** é um sistema completo de gerenciamento de confirmações de presença para festas infantis. A plataforma conecta três tipos de usuários:

- **Salões de Festa**: Gerenciam múltiplas festas e convidados
- **Pais/Responsáveis**: Aprovam a lista de convidados e acompanham confirmações
- **Convidados**: Confirmam presença através de formulários personalizados

### Tecnologias Principais

- **Framework**: Next.js 16 com App Router
- **Linguagem**: TypeScript
- **Banco de Dados**: Supabase (PostgreSQL)
- **Estilização**: Tailwind CSS + shadcn/ui
- **Autenticação**: Supabase Auth
- **Comunicação**: Twilio (SMS) + WhatsApp Business API
- **Geração de QR Code**: JWT + QRCode.js
- **Deploy**: Vercel

---

## 🏗️ Arquitetura do Sistema

### Camadas da Aplicação

\`\`\`
┌─────────────────────────────────────────┐
│           Interface (App Router)        │
│  /admin  |  /pais  |  /convidado        │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Server Actions & API Routes     │
│  lib/actions  |  app/api                │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│           Serviços & Adapters           │
│  SMS | WhatsApp | Notificações          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│        Banco de Dados (Supabase)        │
│  PostgreSQL + Realtime + Auth           │
└─────────────────────────────────────────┘
\`\`\`

### Padrões de Projeto

1. **Server Actions**: Todas as operações de dados usam Server Actions do Next.js
2. **Adapter Pattern**: Separação entre lógica server (`"use server"`) e cliente
3. **Singleton Pattern**: Clientes Supabase reutilizáveis
4. **Repository Pattern**: Actions isoladas por entidade (guests, parties, etc.)

---

## ✨ Funcionalidades

### Para Salões de Festa

#### Gerenciamento de Festas
- Criar festas com informações detalhadas (nome, data, tema, local)
- Gerar links únicos de confirmação
- Definir capacidade máxima de convidados
- Vincular pais/responsáveis às festas

#### Gerenciamento de Convidados
- Visualizar lista completa de convidados
- Acompanhar status de confirmação (pendente/confirmado/recusado)
- Ver confirmações de pais e confirmações finais
- Exportar listas para Excel/PDF

#### Dashboard e Relatórios
- Estatísticas em tempo real de confirmações
- Gráficos de evolução diária
- Taxa de confirmação por festa
- Distribuição de convidados

#### Comunicação
- Enviar SMS em massa para convidados
- Enviar mensagens pelo WhatsApp
- Configurar lembretes automáticos
- Histórico completo de comunicações

#### Check-in com QR Code
- Gerar QR Codes individuais para convidados
- Escanear QR Codes na entrada da festa
- Registrar horário de check-in
- Validação de segurança com JWT

### Para Pais/Responsáveis

#### Gerenciamento de Lista
- Login com credenciais fornecidas pelo salão
- Visualizar todos os convidados cadastrados
- Aprovar ou rejeitar confirmações de convidados
- Adicionar observações aos convidados

#### Acompanhamento
- Ver status em tempo real das confirmações
- Receber notificações de novas confirmações
- Acompanhar número total vs confirmados

#### Perfil
- Atualizar dados de contato
- Gerenciar informações da festa

### Para Convidados

#### Confirmação de Presença
- Buscar festa pelo nome do aniversariante
- Preencher formulário de confirmação
- Informar quantidade de acompanhantes
- Adicionar observações/restrições alimentares

#### Gestão de Confirmação
- Visualizar dados da confirmação
- Atualizar informações se necessário
- Cancelar confirmação

---

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js 18+ instalado
- Conta Vercel (para deploy)
- Projeto Supabase configurado
- Conta Twilio (para SMS)
- WhatsApp Business API (opcional)

### Passo 1: Clonar o Repositório

\`\`\`bash
git clone https://github.com/seu-usuario/check-party.git
cd check-party
\`\`\`

### Passo 2: Instalar Dependências

\`\`\`bash
npm install
\`\`\`

### Passo 3: Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_publica

# Supabase (server-side)
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role

# Twilio (SMS)
TWILIO_ACCOUNT_SID=seu_account_sid
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_PHONE_NUMBER=+5511999999999

# WhatsApp Business
WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id
WHATSAPP_ACCESS_TOKEN=seu_access_token

# JWT (para QR Code)
JWT_SECRET=sua_chave_secreta_muito_segura
\`\`\`

### Passo 4: Configurar Banco de Dados

Execute os scripts SQL no Supabase para criar as tabelas necessárias. Acesse o SQL Editor no dashboard do Supabase e execute cada script na pasta `/scripts`.

### Passo 5: Executar Localmente

\`\`\`bash
npm run dev
\`\`\`

Acesse `http://localhost:3000`

### Passo 6: Deploy na Vercel

1. Faça push do código para GitHub
2. Importe o projeto na Vercel
3. Configure as variáveis de ambiente na Vercel
4. Deploy automático será executado

---

## 📁 Estrutura do Projeto

\`\`\`
check-party/
├── app/                          # App Router do Next.js
│   ├── admin/                    # Área administrativa (salões)
│   │   ├── dashboard/           # Dashboard principal
│   │   ├── parties/             # Gerenciamento de festas
│   │   ├── guests/              # Gerenciamento de convidados
│   │   ├── reminders/           # Configuração de lembretes
│   │   ├── check-in/            # Sistema de check-in
│   │   ├── test-center/         # Centro de testes
│   │   └── system-status/       # Status do sistema
│   ├── pais/                     # Área dos pais/responsáveis
│   │   ├── dashboard/           # Dashboard dos pais
│   │   └── login/               # Login dos pais
│   ├── convidado/               # Área dos convidados
│   ├── guest/                    # Confirmação de presença
│   ├── api/                      # API Routes
│   │   ├── health/              # Endpoints de health check
│   │   └── test/                # Endpoints de teste
│   ├── layout.tsx               # Layout raiz
│   ├── page.tsx                 # Homepage
│   └── globals.css              # Estilos globais
│
├── components/                   # Componentes React
│   ├── ui/                      # Componentes shadcn/ui
│   ├── admin-sidebar.tsx        # Sidebar administrativa
│   ├── admin-header.tsx         # Header administrativa
│   ├── navbar.tsx               # Navbar principal
│   ├── sms-sender.tsx           # Componente de envio SMS
│   ├── whatsapp-sender.tsx      # Componente WhatsApp
│   └── reminders/               # Componentes de lembretes
│
├── lib/                          # Lógica de negócio
│   ├── actions/                 # Server Actions
│   │   ├── guests.ts            # Ações de convidados
│   │   ├── parties.ts           # Ações de festas
│   │   ├── party-halls.ts       # Ações de salões
│   │   └── party-parents.ts     # Ações de pais
│   ├── services/                # Serviços (use server)
│   │   ├── sms-service.ts       # Serviço de SMS
│   │   ├── whatsapp-service.ts  # Serviço WhatsApp
│   │   ├── reminder-service.ts  # Serviço de lembretes
│   │   └── notification-service.ts # Serviço de notificações
│   ├── adapters/                # Adapters (client-side)
│   │   ├── sms-service-adapter.ts
│   │   ├── whatsapp-service-adapter.ts
│   │   ├── reminder-service-adapter.ts
│   │   └── notification-service-adapter.ts
│   ├── supabase/                # Clientes Supabase
│   │   ├── client.ts            # Cliente browser
│   │   └── server.ts            # Cliente server
│   ├── auth/                    # Autenticação
│   ├── contexts/                # React Contexts
│   ├── hooks/                   # Custom Hooks
│   ├── tests/                   # Testes do sistema
│   ├── utils/                   # Utilitários
│   │   ├── qr-code.ts           # Geração/validação QR
│   │   └── chart-data.ts        # Dados para gráficos
│   └── types.ts                 # Definições TypeScript
│
├── scripts/                      # Scripts SQL
│   └── *.sql                    # Migrations do banco
│
├── public/                       # Arquivos estáticos
├── middleware.ts                 # Middleware do Next.js
├── next.config.mjs              # Configuração Next.js
├── tailwind.config.ts           # Configuração Tailwind
└── package.json                 # Dependências
\`\`\`

---

## 🗄️ Banco de Dados

### Schema Principal

#### Tabela: `party_halls` (Salões de Festa)
\`\`\`sql
CREATE TABLE party_halls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);
\`\`\`

#### Tabela: `parties` (Festas)
\`\`\`sql
CREATE TABLE parties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  party_hall_id UUID REFERENCES party_halls(id) ON DELETE CASCADE,
  birthday_child_name TEXT NOT NULL,
  party_date DATE NOT NULL,
  party_time TIME,
  theme TEXT,
  location TEXT,
  max_guests INTEGER DEFAULT 50,
  link TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'active'
);
\`\`\`

#### Tabela: `guests` (Convidados)
\`\`\`sql
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  party_id UUID REFERENCES parties(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  companions INTEGER DEFAULT 0,
  observations TEXT,
  confirmation_status TEXT DEFAULT 'pending',
  parent_confirmation BOOLEAN DEFAULT FALSE,
  final_confirmation BOOLEAN DEFAULT FALSE,
  checked_in BOOLEAN DEFAULT FALSE,
  check_in_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### Tabela: `party_parents` (Pais/Responsáveis)
\`\`\`sql
CREATE TABLE party_parents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  party_id UUID REFERENCES parties(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  parent_name TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### Tabela: `notifications` (Notificações)
\`\`\`sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  party_id UUID REFERENCES parties(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### Tabela: `reminder_configs` (Configuração de Lembretes)
\`\`\`sql
CREATE TABLE reminder_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  party_id UUID REFERENCES parties(id) ON DELETE CASCADE,
  days_before INTEGER NOT NULL,
  message_template TEXT,
  method TEXT DEFAULT 'sms',
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### Tabela: `reminder_jobs` (Jobs de Lembretes)
\`\`\`sql
CREATE TABLE reminder_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  party_id UUID REFERENCES parties(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### Tabela: `sms_logs` (Logs de SMS)
\`\`\`sql
CREATE TABLE sms_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  party_id UUID REFERENCES parties(id),
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT,
  sent_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### Tabela: `whatsapp_logs` (Logs de WhatsApp)
\`\`\`sql
CREATE TABLE whatsapp_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  party_id UUID REFERENCES parties(id),
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT,
  sent_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### Row Level Security (RLS)

O sistema utiliza RLS para garantir que:
- Salões só acessam suas próprias festas
- Pais só acessam festas vinculadas a eles
- Convidados só veem suas próprias confirmações

---

## 🔌 APIs e Serviços

### Server Actions

#### `lib/actions/guests.ts`
- `getGuests()` - Lista todos os convidados
- `getGuestsByParty(partyId)` - Convidados por festa
- `createGuest(guest)` - Criar convidado
- `updateGuest(id, data)` - Atualizar convidado
- `updateParentConfirmation(id, status)` - Aprovação dos pais
- `updateFinalConfirmation(id, status)` - Confirmação final
- `deleteGuest(id)` - Remover convidado

#### `lib/actions/parties.ts`
- `getParties()` - Lista todas as festas
- `getPartiesWithGuestCount()` - Festas com contagem
- `getPartyById(id)` - Buscar festa por ID
- `getPartyByLink(link)` - Buscar por link único
- `createParty(party)` - Criar festa
- `updateParty(id, data)` - Atualizar festa
- `deleteParty(id)` - Remover festa
- `getPartiesByHall(hallId)` - Festas de um salão

#### `lib/actions/party-halls.ts`
- `getPartyHalls()` - Lista salões
- `getPartyHallById(id)` - Buscar salão
- `createPartyHall(hall)` - Criar salão
- `updatePartyHall(id, data)` - Atualizar salão
- `deletePartyHall(id)` - Remover salão

#### `lib/actions/party-parents.ts`
- `createPartyParent(parent)` - Criar acesso para pais
- `verifyParentCredentials(credentials)` - Autenticar pais
- `getParentSession()` - Obter sessão atual
- `logoutParent()` - Fazer logout
- `generateParentUsername(name)` - Gerar username
- `generateRandomPassword()` - Gerar senha

### Serviços de Comunicação

#### SMS Service (`lib/services/sms-service.ts`)
\`\`\`typescript
// Enviar SMS
await sendSMS({
  to: "+5511999999999",
  message: "Sua mensagem aqui",
  partyId: "uuid-da-festa"
})

// Obter histórico
const history = await getSMSHistory(partyId)
\`\`\`

#### WhatsApp Service (`lib/services/whatsapp-service.ts`)
\`\`\`typescript
// Enviar mensagem
await sendWhatsAppMessage({
  to: "+5511999999999",
  message: "Sua mensagem aqui",
  partyId: "uuid-da-festa"
})

// Lembrete de confirmação
await sendConfirmationReminder({
  to: "+5511999999999",
  guestName: "João Silva",
  partyName: "Festa do Pedro",
  partyDate: "15/06/2025",
  confirmationLink: "https://..."
})

// Agradecimento pela confirmação
await sendConfirmationThankYou({
  to: "+5511999999999",
  guestName: "João Silva",
  partyName: "Festa do Pedro",
  partyDate: "15/06/2025"
})
\`\`\`

#### Notification Service (`lib/services/notification-service.ts`)
\`\`\`typescript
// Criar notificação
await createNotification({
  userId: "uuid",
  partyId: "uuid",
  type: "guest_confirmation",
  title: "Nova confirmação",
  message: "João Silva confirmou presença"
})

// Buscar notificações
const notifications = await getNotifications(userId, true) // unread only

// Marcar como lida
await markNotificationAsRead(notificationId)

// Marcar todas como lidas
await markAllNotificationsAsRead(userId)

// Deletar notificação
await deleteNotification(notificationId)

// Obter contagem não lidas
const count = await getUnreadCount(userId)
\`\`\`

#### Reminder Service (`lib/services/reminder-service.ts`)
\`\`\`typescript
// Criar configuração de lembrete
await createReminderConfig({
  partyId: "uuid",
  daysB before: 7,
  messageTemplate: "Lembre-se da festa em {days} dias!",
  method: "sms",
  enabled: true
})

// Agendar lembretes para uma festa
await scheduleReminders(partyId)

// Processar lembretes pendentes
await processPendingReminders()

// Obter jobs agendados
const jobs = await getReminderJobs(partyId)
\`\`\`

### QR Code Service (`lib/utils/qr-code.ts`)

\`\`\`typescript
// Gerar QR Code para check-in
const qrCodeDataUrl = await generateCheckInQRCode(guestId, partyId)

// Validar token do QR Code
const result = await validateQRToken(token)

// Processar check-in
const checkInResult = await processCheckIn(token)

// Obter histórico de check-ins
const history = await getQRCodeHistory(partyId)
\`\`\`

### API Routes

#### Health Check Endpoints
- `GET /api/health/database` - Status do banco de dados
- `GET /api/health/sms` - Status do serviço SMS
- `GET /api/health/whatsapp` - Status do WhatsApp
- `GET /api/health/qrcode` - Status do QR Code
- `GET /api/health/notifications` - Status de notificações

#### Test Endpoints
- `POST /api/test/sms` - Testar envio de SMS
- `POST /api/test/whatsapp` - Testar envio WhatsApp
- `POST /api/test/qrcode` - Testar geração QR Code

---

## 🔗 Integrações

### Supabase

#### Configuração
\`\`\`typescript
// Cliente Browser (lib/supabase/client.ts)
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Cliente Server (lib/supabase/server.ts)
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
\`\`\`

#### Realtime Subscriptions
\`\`\`typescript
// Escutar novas notificações
const channel = supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('Nova notificação:', payload.new)
  })
  .subscribe()
\`\`\`

### Twilio (SMS)

#### Configuração
\`\`\`env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+5511999999999
\`\`\`

#### Uso
O serviço SMS abstrai a integração com Twilio. Use as funções em `lib/services/sms-service.ts`.

### WhatsApp Business API

#### Configuração
\`\`\`env
WHATSAPP_PHONE_NUMBER_ID=123456789
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxx
\`\`\`

#### Uso
O serviço WhatsApp abstrai a API. Use as funções em `lib/services/whatsapp-service.ts`.

### JWT (QR Code)

#### Configuração
\`\`\`env
JWT_SECRET=sua_chave_secreta_muito_segura_minimo_32_caracteres
\`\`\`

#### Uso
Tokens JWT são gerados automaticamente pelo sistema de QR Code para garantir segurança.

---

## 👥 Fluxos de Usuário

### Fluxo do Salão de Festa

1. **Cadastro**
   - Acessa `/admin/register`
   - Preenche dados do salão
   - Cria conta com Supabase Auth

2. **Criar Festa**
   - Acessa `/admin/parties/new`
   - Preenche informações da festa
   - Sistema gera link único
   - Cria credenciais para os pais

3. **Gerenciar Convidados**
   - Visualiza dashboard em `/admin/dashboard`
   - Acompanha confirmações em tempo real
   - Aprova/rejeita convidados

4. **Comunicação**
   - Envia SMS/WhatsApp em massa
   - Configura lembretes automáticos
   - Visualiza histórico de mensagens

5. **Check-in no Dia**
   - Acessa `/admin/check-in`
   - Escaneia QR Codes dos convidados
   - Registra entrada automaticamente

### Fluxo dos Pais

1. **Receber Credenciais**
   - Salão fornece username e senha
   - Informações enviadas por SMS/WhatsApp

2. **Login**
   - Acessa `/pais/login`
   - Insere credenciais
   - Acessa dashboard

3. **Aprovar Convidados**
   - Visualiza lista de confirmações
   - Aprova convidados conhecidos
   - Rejeita convidados não autorizados
   - Adiciona observações

4. **Acompanhamento**
   - Recebe notificações de novas confirmações
   - Vê estatísticas em tempo real
   - Monitora capacidade da festa

### Fluxo do Convidado

1. **Receber Convite**
   - Recebe link por SMS/WhatsApp
   - Link formato: `https://checkparty.com/guest/festa-pedro-2025`

2. **Acessar Formulário**
   - Clica no link
   - Vê informações da festa
   - Preenche formulário

3. **Confirmar Presença**
   - Informa nome completo
   - Indica número de acompanhantes
   - Adiciona observações (opcional)
   - Submete confirmação

4. **Confirmação**
   - Recebe mensagem de confirmação
   - Aguarda aprovação dos pais
   - Recebe confirmação final

5. **Dia da Festa**
   - Apresenta QR Code na entrada
   - Check-in registrado automaticamente

---

## 🧪 Testes

### Centro de Testes (`/admin/test-center`)

Interface visual para testar todos os serviços:

1. **Teste de Banco de Dados**
   - Conexão com Supabase
   - Estrutura de tabelas
   - Autenticação

2. **Teste de SMS**
   - Configuração Twilio
   - Envio de mensagem teste
   - Histórico de mensagens

3. **Teste de WhatsApp**
   - Configuração da API
   - Envio de mensagem teste
   - Verificação de status

4. **Teste de QR Code**
   - Geração de tokens JWT
   - Validação de tokens
   - API de check-in

5. **Teste de Notificações**
   - Criação de notificações
   - Realtime updates
   - Contagem não lidas

### Monitoramento (`/admin/system-status`)

Dashboard em tempo real com:
- Status de todos os serviços
- Tempo de resposta
- Saúde geral do sistema (0-100%)
- Alertas automáticos
- Refresh a cada 30 segundos

### Testes Programáticos

\`\`\`typescript
// Executar todos os testes de banco
import { runAllDatabaseTests } from '@/lib/tests/database-test'
const results = await runAllDatabaseTests()

// Executar testes de SMS
import { runAllSMSTests } from '@/lib/tests/sms-test'
const results = await runAllSMSTests('+5511999999999')

// Executar testes de WhatsApp
import { runAllWhatsAppTests } from '@/lib/tests/whatsapp-test'
const results = await runAllWhatsAppTests('+5511999999999')

// Executar testes de QR Code
import { runAllQRCodeTests } from '@/lib/tests/qr-code-test'
const results = await runAllQRCodeTests()

// Executar testes de notificações
import { runAllNotificationTests } from '@/lib/tests/notification-test'
const results = await runAllNotificationTests()
\`\`\`

---

## 🔒 Segurança

### Autenticação

- **Salões**: Supabase Auth com email/senha
- **Pais**: Credenciais personalizadas armazenadas com bcrypt
- **Convidados**: Acesso por link único (sem autenticação)

### Autorização

- **RLS (Row Level Security)**: Políticas no Supabase
- **Middleware**: Verificação de sessão em rotas protegidas
- **Server Actions**: Validação de permissões em cada ação

### Proteção de Dados

- **Variáveis de Ambiente**: Nunca commitadas no Git
- **JWT**: Tokens assinados com secret para QR Codes
- **HTTPS**: Obrigatório em produção
- **CORS**: Configurado apenas para domínios autorizados

### Validação

- **Input Sanitization**: Todos os inputs são validados
- **SQL Injection**: Prevenido por Supabase prepared statements
- **XSS**: React escapa automaticamente strings

---

## 🚀 Deploy

### Vercel (Recomendado)

1. **Conectar Repositório**
   \`\`\`bash
   vercel --prod
   \`\`\`

2. **Configurar Variáveis**
   - Acesse projeto na Vercel
   - Settings → Environment Variables
   - Adicione todas as variáveis necessárias

3. **Deploy Automático**
   - Push para branch `main`
   - Deploy automático executado
   - Preview branches para PRs

### Variáveis de Ambiente Necessárias

\`\`\`env
# Supabase (Obrigatório)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# JWT (Obrigatório)
JWT_SECRET=

# Twilio (Opcional - para SMS)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# WhatsApp (Opcional)
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
\`\`\`

### Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados Supabase criado e migrado
- [ ] RLS policies habilitadas
- [ ] Domínio personalizado configurado (opcional)
- [ ] SSL/HTTPS ativo
- [ ] Testes executados em produção
- [ ] Monitoramento ativo

---

## 📊 Modelos de Dados

### Guest (Convidado)
\`\`\`typescript
interface Guest {
  id: string
  partyId: string
  guestName: string
  phone?: string
  email?: string
  companions: number
  observations?: string
  confirmationStatus: 'pending' | 'confirmed' | 'declined'
  parentConfirmation: boolean
  finalConfirmation: boolean
  checkedIn: boolean
  checkInTime?: Date
  createdAt: Date
  updatedAt: Date
}
\`\`\`

### Party (Festa)
\`\`\`typescript
interface Party {
  id: string
  partyHallId: string
  birthdayChildName: string
  partyDate: string
  partyTime?: string
  theme?: string
  location?: string
  maxGuests: number
  link: string
  status: 'active' | 'completed' | 'cancelled'
  createdAt: Date
}
\`\`\`

### PartyHall (Salão)
\`\`\`typescript
interface PartyHall {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  userId?: string
  createdAt: Date
}
\`\`\`

### Notification (Notificação)
\`\`\`typescript
interface Notification {
  id: string
  userId: string
  partyId?: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: Date
}
\`\`\`

---

## 🎨 Personalização

### Temas e Cores

O sistema usa Tailwind CSS com design tokens personalizáveis em `app/globals.css`:

\`\`\`css
:root {
  --primary: 270 50% 60%;      /* Roxo principal */
  --secondary: 210 40% 96.1%;  /* Cinza claro */
  --accent: 210 40% 96.1%;     /* Accent */
  --destructive: 0 84.2% 60.2%; /* Vermelho */
}
\`\`\`

### Componentes UI

Baseados em shadcn/ui, totalmente customizáveis em `components/ui/`.

### Templates de Mensagens

Personalize mensagens SMS/WhatsApp em:
- `lib/services/sms-service.ts`
- `lib/services/whatsapp-service.ts`
- `lib/services/reminder-service.ts`

---

## 📞 Suporte

Para suporte técnico ou dúvidas:

- **Email**: contato@checkparty.com.br
- **Telefone**: (11) 99999-9999
- **GitHub Issues**: https://github.com/seu-usuario/check-party/issues

---

## 📝 Licença

Copyright © 2025 Check Party. Todos os direitos reservados.

---

## 🔄 Changelog

### Versão 1.0.0 (2025-01-19)
- Lançamento inicial do sistema
- Gerenciamento completo de festas e convidados
- Integração com SMS e WhatsApp
- Sistema de QR Code para check-in
- Dashboard administrativo
- Área dos pais e convidados
- Sistema de notificações em tempo real
- Centro de testes e monitoramento

---

**Desenvolvido com ❤️ para facilitar a organização de festas infantis**
