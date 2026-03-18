# 🤖 Dashboard + Bot Discord

Sistema completo para coletar e exibir mensagens do Discord em tempo real.

## 🚀 Início Rápido

### 1. Configurar Ambiente

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente no .env
DISCORD_BOT_TOKEN=seu-token-aqui
NEXT_PUBLIC_SUPABASE_URL=sua-url-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-supabase
```

### 2. Criar Tabela no Supabase

Execute o SQL em `database/schema.sql` no painel do Supabase.

### 3. Criar Bot Discord

1. Vá para [Discord Developer Portal](https://discord.com/developers/applications)
2. Create Application → Bot
3. Ative os intents:
   - ✅ GUILD_MESSAGES
   - ✅ MESSAGE_CONTENT
4. Copie o token do bot
5. Convide o bot para o servidor:
   - OAuth2 URL Generator
   - Scopes: `bot`
   - Permissions: `Read Messages/View Channels`
   - Guild ID: `1443298554398511227`

## 🎮 Como Usar

### Opção 1: Tudo Junto (Recomendado)

```bash
npm run start:all
```

### Opção 2: Separado

```bash
# Terminal 1 - Dashboard
npm run start:dashboard

# Terminal 2 - Bot
npm run start:bot
```

### Opção 3: Apenas Dashboard

```bash
npm run dev
```

## 📱 Acessos

- **Dashboard**: http://localhost:3000
- **Painel Admin**: http://localhost:3000/admin
- **Login**: Faça login com Discord

## ⚙️ Configuração do Bot

### Via Interface (Recomendado)

1. Acesse http://localhost:3000/admin
2. Faça login com Discord
3. Cole o token do bot
4. Clique "Iniciar Bot"

### Via Terminal

O bot é configurado automaticamente para:
- **Guild ID**: `1443298554398511227`
- **Categoria ID**: `1466188857241243863`
- Coletar mensagens de todos os canais textuais da categoria

## 📋 Funcionalidades

### Dashboard
- ✅ Exibição em tempo real das mensagens
- ✅ Interface responsiva e moderna
- ✅ Login seguro via Discord OAuth
- ✅ Scroll infinito com histórico
- ✅ Avatares automáticos dos usuários

### Bot Discord
- ✅ Coleta automática de mensagens
- ✅ Filtro por categoria específica
- ✅ Salvamento no Supabase
- ✅ Busca de histórico (últimas 100 mensagens)
- ✅ Ignora mensagens de outros bots

### Admin
- ✅ Painel de configuração
- ✅ Status do bot em tempo real
- ✅ Instruções detalhadas
- ✅ Acesso restrito

## 🔧 Scripts Disponíveis

```bash
npm run start:all       # Inicia dashboard + bot
npm run start:dashboard # Apenas dashboard
npm run start:bot       # Apenas bot
npm run dev            # Dashboard (development)
npm run build          # Build para produção
npm run start          # Produção
```

## 📁 Estrutura do Projeto

```
next-app/
├── app/
│   ├── admin/              # Painel admin
│   ├── api/
│   │   ├── auth/          # NextAuth
│   │   ├── bot/           # API do bot
│   │   └── webhook/       # Webhook Discord
│   ├── login/             # Página de login
│   └── page.tsx           # Dashboard principal
├── components/
│   ├── auth/              # Componentes de auth
│   ├── ui/                # UI components
│   ├── HeroScrollDemo.tsx # Dashboard
│   └── LoginPage.tsx      # Login
├── lib/
│   ├── auth.ts            # NextAuth config
│   ├── discord-bot.ts     # Bot Discord
│   └── supabase.ts        # Cliente Supabase
├── hooks/
│   └── useDiscordMessages.ts # Hook para mensagens
├── scripts/
│   └── start-all.js       # Script inicialização
└── database/
    └── schema.sql         # Schema Supabase
```

## 🛠️ Troubleshooting

### Porta 3000 em uso
```bash
# Matar processo na porta 3000
npx kill-port 3000
# Ou usar outra porta
PORT=3001 npm run dev
```

### Bot não conecta
- Verifique se o token está correto
- Confirme se os intents estão ativos
- Verifique se o bot está no servidor

### Mensagens não aparecem
- Confirme a tabela no Supabase
- Verifique se o bot está online
- Cheque o console para erros

## 🔐 Variáveis de Ambiente

```env
# Discord OAuth
DISCORD_CLIENT_ID=seu-client-id
DISCORD_CLIENT_SECRET=seu-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=seu-secret

# Bot Discord
DISCORD_BOT_TOKEN=seu-bot-token

# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave
```

## 📊 Monitoramento

O sistema exibe:
- **Status Live**: Indicador verde quando online
- **Contador de mensagens**: Em tempo real
- **Timestamp**: Data e hora de cada mensagem
- **Autor**: Username e avatar automático

---

**Desenvolvido por zn • Powered by França City** 🚀
