# França Logs - Discord Dashboard

Um dashboard avançado para visualização e busca de logs do Discord com interface moderna e funcionalidades completas.

## 🚀 Funcionalidades

### 📊 **Dashboard Completo**
- **📱 Interface Moderna** - Design inspirado no Discord
- **🔍 Busca Avançada** - Busca por conteúdo, usuários e canais
- **🎯 Highlights Coloridos** - Destaque visual dos termos encontrados
- **📈 Analytics em Tempo Real** - Estatísticas detalhadas das mensagens
- **🔄 Lazy Loading** - Carregamento otimizado para performance

### 🔍 **Sistema de Busca**
- **📝 Busca de Conteúdo** - Encontre mensagens específicas
- **👤 Busca por Usuário** - Filtre por autor das mensagens
- **📁 Busca por Canal** - Localize mensagens de canais específicos
- **🌈 Highlights Inteligentes** - Cores diferentes para cada tipo de匹配
- **⚡ Busca Completa** - Acesso a todo o histórico sem limites

### 🎨 **Interface**
- **📱 Design Responsivo** - Funciona em todos os dispositivos
- **🌙 Tema Dark** - Interface confortável para longas sessões
- **⚡ Performance** - Lazy loading e otimização
- **🔐 Controle de Acesso** - Restrito por cargo do Discord

### 🛡️ **Segurança**
- **🔐 Autenticação Discord** - Login seguro via OAuth
- **👥 Controle de Acesso** - Apenas usuários com cargo específico
- **🚫 Acesso Restrito** - Dashboard protegido
- **📊 Logs de Atividade** - Monitoramento de acessos

## 🛠️ **Tecnologias**

- **⚛️ Next.js 14** - Framework React moderno
- **🎨 Tailwind CSS** - Styling utilitário
- **🔐 NextAuth.js** - Autenticação segura
- **🗄️ Supabase** - Banco de dados em tempo real
- **📡 Discord API** - Integração com Discord
- **⚡ TypeScript** - Tipagem segura

## 📋 **Pré-requisitos**

- Node.js 18+ 
- NPM ou Yarn
- Conta Discord com cargo específico
- Supabase para banco de dados

## 🚀 **Instalação**

1. **Clone o repositório**
```bash
git clone https://github.com/SEU-USUARIO/dashboard-discord.git
cd dashboard-discord
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
```

4. **Preencha as variáveis no `.env.local`**
```env
DISCORD_CLIENT_ID=seu_discord_client_id
DISCORD_CLIENT_SECRET=seu_discord_client_secret
NEXTAUTH_SECRET=seu_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
SUPABASE_URL=sua_supabase_url
SUPABASE_ANON_KEY=sua_supabase_anon_key
DISCORD_BOT_TOKEN=seu_bot_token
GUILD_ID=seu_guild_id
```

5. **Execute o servidor de desenvolvimento**
```bash
npm run dev
# ou
yarn dev
```

6. **Acesse o dashboard**
```
http://localhost:3000
```

## 🔧 **Configuração**

### **Discord Bot Setup**
1. Crie um bot no [Discord Developer Portal](https://discord.com/developers/applications)
2. Adicione os seguintes scopes:
   - `bot`
   - `applications.commands`
   - `identify`
   - `guilds`
3. Configure os Redirect URLs no OAuth2
4. Ative o Gateway Intents necessários

### **Supabase Setup**
1. Crie um projeto no [Supabase](https://supabase.com)
2. Configure a tabela `discord_messages`
3. Adicione as políticas RLS necessárias
4. Configure as chaves de API

### **Controle de Acesso**
Para restringir o acesso, modifique os IDs em `components/DashboardAvancado.tsx`:

```typescript
const REQUIRED_ROLE_ID = '1443295095632695354'; // Cargo requerido
const REQUIRED_GUILD_ID = '1443295095112863758'; // Servidor
const ALLOWED_USER_IDS = [
  '1329449358709755946', // Admin
  // Adicione outros IDs permitidos
];
```

## 📊 **Estrutura do Projeto**

```
├── app/                    # Páginas Next.js
│   ├── api/               # API routes
│   ├── auth/              # Autenticação
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── ui/               # Componentes UI
│   ├── DashboardAvancado.tsx
│   └── ...
├── hooks/                 # Hooks personalizados
│   ├── useDiscordMessages.ts
│   └── useDiscordCategories.ts
├── lib/                   # Utilitários
│   ├── auth.ts
│   ├── discord-roles.ts
│   └── supabase.ts
└── scripts/               # Scripts auxiliares
```

## 🎯 **Funcionalidades Detalhadas**

### **Busca Inteligente**
- Busca em tempo real em todas as mensagens
- Highlights coloridos por tipo (conteúdo, autor, canal)
- Filtros combinados (canal + busca)
- Performance otimizada com lazy loading

### **Analytics**
- Estatísticas em tempo real
- Contagem de mensagens por período
- Top usuários mais ativos
- Atividade horária
- Contagem de embeds e webhooks

### **Interface**
- Sidebar estilo Discord
- Categorias de canais organizadas
- Modal de mensagem detalhada
- Design responsivo e moderno

## 🚀 **Deploy**

### **Vercel (Recomendado)**
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### **Docker**
```bash
docker build -t dashboard-discord .
docker run -p 3000:3000 dashboard-discord
```

## 🤝 **Contribuição**

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 **Licença**

Este projeto está sob licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 **Suporte**

Se você tiver algum problema ou dúvida:

1. Verifique a [documentação](docs/)
2. Abra uma [issue](https://github.com/SEU-USUARIO/dashboard-discord/issues)
3. Entre em contato no Discord

---

**Desenvolvido com ❤️ para a comunidade Discord**
