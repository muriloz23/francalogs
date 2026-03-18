// Bot Discord simplificado para Next.js
// Usa fetch em vez de WebSocket para evitar dependências nativas

interface DiscordMessage {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    discriminator: string;
    avatar?: string;
  };
  channel_id: string;
  guild_id: string;
  timestamp: string;
  edited_timestamp?: string;
  attachments: any[];
  embeds: any[];
  mentions: any[];
}

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = '1443298554398511227';
const CATEGORY_ID = '1466188857241243863';

// Cache para evitar requisições duplicadas e otimizar performance
const messageCache = new Set<string>();
const lastMessageIds = new Map<string, string>(); // channel_id -> last_message_id
const channelNames = new Map<string, string>(); // channel_id -> channel_name
let isRunning = false;

export async function startDiscordBot(token: string) {
  if (isRunning) {
    console.log('🤖 Bot já está rodando');
    return;
  }

  isRunning = true;
  console.log('🤖 Iniciando bot Discord simplificado...');
  
  // Iniciar polling de mensagens
  pollMessages();
  
  return {
    user: { id: 'bot-simple', tag: 'Bot Simplificado' },
    stop: () => {
      isRunning = false;
      console.log('🛑 Bot encerrado');
    }
  };
}

async function pollMessages() {
  if (!BOT_TOKEN) {
    console.error('❌ Token do bot não encontrado');
    return;
  }

  console.log('🔄 Iniciando polling de mensagens...');
  
  while (isRunning) {
    try {
      // Buscar canais da categoria
      const channels = await getGuildChannels(GUILD_ID);
      const textChannels = channels.filter(
        (channel: any) => 
          channel.type === 0 && // Text channel
          channel.parent_id === CATEGORY_ID
      );

      // Salvar nome do canal no cache
      textChannels.forEach((channel: any) => {
        channelNames.set(channel.id, channel.name);
      });
      
      console.log(`📡 Encontrados ${textChannels.length} canais na categoria`);

      // Buscar mensagens de cada canal
      for (const channel of textChannels) {
        try {
          const lastId = lastMessageIds.get(channel.id);
          const messages = await getChannelMessages(channel.id, lastId);
          
          for (const message of messages) {
            // Ignorar apenas bots reais (webhooks têm webhook_id)
            const isWebhook = !!message.webhook_id;
            const isRealBot = message.author.bot && !isWebhook;
            
            if (isRealBot || messageCache.has(message.id)) {
              continue;
            }

            messageCache.add(message.id);
            
            // Salvar no Supabase
            await saveMessageToSupabase(message);
            
            const messageType = isWebhook ? 'Webhook' : 'Usuário';
            console.log(`💾 Nova mensagem [${messageType}] de ${message.author.username} em ${channel.name}`);
          }
          
          // Atualizar último ID do canal
          if (messages.length > 0) {
            lastMessageIds.set(channel.id, messages[0].id);
          }
        } catch (error) {
          console.error(`❌ Erro ao buscar mensagens do canal ${channel.id}:`, error);
        }
      }

      // Esperar 500ms para resposta quase instantânea
      await sleep(500);
      
    } catch (error) {
      console.error('❌ Erro no polling:', error);
      await sleep(10000); // Esperar 10 segundos em caso de erro
    }
  }
}

async function getGuildChannels(guildId: string) {
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/channels`,
    {
      headers: {
        'Authorization': `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

async function getChannelMessages(channelId: string, after?: string) {
  let url = `https://discord.com/api/v10/channels/${channelId}/messages?limit=10`;
  if (after) {
    url += `&after=${after}`;
  }
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bot ${BOT_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

async function saveMessageToSupabase(message: any) {
  const { supabase } = await import('./supabase');
  
  // Extrair conteúdo de embeds e webhooks
  let messageContent = message.content || '';
  
  // Se não tiver conteúdo mas tiver embeds, extrair das embeds
  if (!messageContent && message.embeds && message.embeds.length > 0) {
    const embedTexts = message.embeds.map((embed: any) => {
      const parts = [];
      if (embed.title) parts.push(`**${embed.title}**`);
      if (embed.description) parts.push(embed.description);
      if (embed.fields && embed.fields.length > 0) {
        embed.fields.forEach((field: any) => {
          parts.push(`**${field.name}**: ${field.value}`);
        });
      }
      return parts.join('\n');
    });
    messageContent = embedTexts.join('\n---\n');
  }
  
  // Se for webhook, usar o nome do webhook ou global_name
  const authorName = message.webhook_id 
    ? message.author.global_name || message.author.username || 'Webhook'
    : message.author.username;

  const messageData: DiscordMessage = {
    id: message.id,
    content: messageContent,
    author: {
      id: message.author.id,
      username: authorName,
      discriminator: message.author.discriminator,
      avatar: message.author.avatar,
    },
    channel_id: message.channel_id,
    guild_id: message.guild_id,
    timestamp: message.timestamp,
    edited_timestamp: message.edited_timestamp,
    attachments: message.attachments || [],
    embeds: message.embeds || [],
    mentions: message.mentions?.map((m: any) => ({
      id: m.id,
      username: m.username,
      discriminator: m.discriminator,
    })) || [],
  };

  const { error } = await supabase
    .from('discord_messages')
    .upsert(messageData, { onConflict: 'id' });

  if (error) {
    console.error('❌ Erro ao salvar mensagem:', error);
  } else {
    // Log detalhado para debug
    console.log(`✅ Mensagem salva: ${authorName} | Embeds: ${message.embeds?.length || 0} | Anexos: ${message.attachments?.length || 0}`);
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Exportar para uso em outros módulos
export { isRunning, messageCache };
