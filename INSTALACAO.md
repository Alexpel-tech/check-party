# 🚀 Guia de Instalação - Check Party

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta Vercel (para deploy)
- Conta Supabase (banco de dados)
- Conta Twilio (opcional - para SMS)
- Conta WhatsApp Business API (opcional - para WhatsApp)

---

## 1️⃣ Configuração Inicial

### Clone ou baixe o projeto

Se você baixou o ZIP do v0, extraia os arquivos em uma pasta.

```bash
cd check-party
npm install
```

---

## 2️⃣ Configuração das Variáveis de Ambiente

### Opção A: Configurar no Vercel (Recomendado)

1. Acesse o [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá em **Settings** → **Environment Variables**
3. Adicione todas as variáveis listadas abaixo

### Opção B: Configurar localmente

1. Copie o arquivo `.env.example`:
```bash
cp .env.example .env.local
```

2. Edite o arquivo `.env.local` com suas credenciais

---

## 3️⃣ Variáveis Obrigatórias

### Supabase (Banco de Dados)

Você já tem essas configuradas no projeto:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://xvwvtijtxaxtssyymivl.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_JWT_SECRET="St0bFt27RgfLJdBzmb8j99qKYnw85Vre..."
```

✅ **Estas já estão configuradas no seu projeto Vercel!**

### PostgreSQL (via Supabase)

Também já configuradas:

```bash
POSTGRES_URL="postgres://postgres.xvwvtijtxaxtssyymivl:..."
POSTGRES_PRISMA_URL="postgres://postgres.xvwvtijtxaxtssyymivl:..."
POSTGRES_URL_NON_POOLING="postgres://postgres.xvwvtijtxaxtssyymivl:..."
POSTGRES_USER="postgres"
POSTGRES_HOST="db.xvwvtijtxaxtssyymivl.supabase.co"
POSTGRES_PASSWORD="#Benjamin1104"
POSTGRES_DATABASE="postgres"
```

✅ **Estas também já estão configuradas!**

---

## 4️⃣ Variáveis Opcionais (Recursos Avançados)

### Twilio (SMS)

Para enviar SMS de confirmação:

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+5511999999999
```

📍 **Onde obter:**
1. Acesse [console.twilio.com](https://console.twilio.com)
2. Copie o Account SID e Auth Token
3. Compre ou configure um número de telefone

### WhatsApp Business (Mensagens)

Para enviar confirmações via WhatsApp:

```bash
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
```

📍 **Onde obter:**
1. Acesse [developers.facebook.com](https://developers.facebook.com)
2. Configure WhatsApp Business API
3. Gere um access token permanente
4. Copie o Phone Number ID

### JWT Secret (QR Codes)

Para gerar QR Codes seguros:

```bash
JWT_SECRET=your_random_secret_string_min_32_chars
```

💡 **Como gerar:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 5️⃣ Inicializar o Banco de Dados

### Opção A: Usar o script automático (via v0)

Se você ainda está no v0, os scripts SQL na pasta `/scripts` serão executados automaticamente.

### Opção B: Executar manualmente no Supabase

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto: `xvwvtijtxaxtssyymivl`
3. Vá em **SQL Editor**
4. Execute os scripts na seguinte ordem:

```sql
-- 1. Criar tabelas principais
-- Copie e cole o conteúdo de scripts/01_create_tables.sql

-- 2. Configurar Row Level Security
-- Copie e cole o conteúdo de scripts/02_setup_rls.sql

-- 3. Criar dados de exemplo (opcional)
-- Copie e cole o conteúdo de scripts/03_seed_data.sql
```

---

## 6️⃣ Testar Localmente

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

### Páginas para testar:

- `/` - Homepage
- `/admin/login` - Login de salão
- `/pais/login` - Login de pais
- `/admin/system-status` - Status do sistema
- `/admin/test-center` - Centro de testes

---

## 7️⃣ Deploy na Vercel

### Via CLI (Recomendado se já tem projeto)

```bash
npm install -g vercel
vercel
```

### Via Dashboard

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Importe o repositório GitHub ou faça upload do ZIP
3. Configure as variáveis de ambiente
4. Clique em **Deploy**

---

## 8️⃣ Verificar Instalação

Após o deploy, acesse:

### 1. Status do Sistema
```
https://seu-dominio.vercel.app/admin/system-status
```

Verifique se todos os serviços estão funcionando:
- ✅ Database (deve estar verde)
- ⚠️ SMS (amarelo se não configurado)
- ⚠️ WhatsApp (amarelo se não configurado)
- ✅ QR Code (verde se JWT_SECRET configurado)
- ✅ Notifications (deve estar verde)

### 2. Centro de Testes
```
https://seu-dominio.vercel.app/admin/test-center
```

Execute todos os testes para verificar funcionalidades.

---

## 9️⃣ Configurações Pós-Instalação

### Criar primeiro salão de festas

1. Acesse `/admin/register`
2. Preencha os dados do salão
3. Faça login
4. Configure os planos de assinatura

### Testar fluxo completo

1. Crie uma festa no painel admin
2. Adicione os pais da criança
3. Compartilhe o link de confirmação
4. Teste a confirmação como convidado

---

## 🆘 Problemas Comuns

### Erro: "Supabase client not configured"

**Solução:** Verifique se as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão configuradas.

### Erro ao conectar no banco de dados

**Solução:** Verifique se o Supabase está ativo e as credenciais estão corretas.

### SMS/WhatsApp não funciona

**Solução:** Estes são recursos opcionais. Configure as variáveis do Twilio/WhatsApp ou desative nas configurações.

### QR Code não gera

**Solução:** Configure a variável `JWT_SECRET` com uma string aleatória de pelo menos 32 caracteres.

---

## 📚 Próximos Passos

1. Leia a [DOCUMENTACAO.md](./DOCUMENTACAO.md) para entender a arquitetura
2. Consulte o [GUIA_RAPIDO.md](./GUIA_RAPIDO.md) para usar o sistema
3. Personalize o tema e cores em `app/globals.css`
4. Configure domínio personalizado no Vercel

---

## 🔒 Segurança

- ✅ Nunca commite o arquivo `.env.local` no Git
- ✅ Use variáveis de ambiente do Vercel para produção
- ✅ Mantenha o `SUPABASE_SERVICE_ROLE_KEY` em segredo
- ✅ Use HTTPS em produção (automático na Vercel)
- ✅ Configure Row Level Security no Supabase

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique `/admin/system-status` para diagnóstico
2. Execute testes em `/admin/test-center`
3. Consulte os logs no Vercel Dashboard
4. Revise a documentação completa

---

✅ **Instalação completa! Seu sistema Check Party está pronto para uso.**
