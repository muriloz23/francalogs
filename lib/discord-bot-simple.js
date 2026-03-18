// Bot Discord simplificado para Next.js - Versão JavaScript
// Usa fetch em vez de WebSocket para evitar dependências nativas

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = '1443298554398511227';

// Cache para evitar requisições duplicadas e otimizar performance
const messageCache = new Set();
const lastMessageIds = new Map(); // channel_id -> last_message_id
const channelNames = new Map(); // channel_id -> channel_name
const categoryNames = new Map(); // category_id -> category_name
const channelCategories = new Map(); // channel_id -> category_id
const processedContentCache = new Map(); // message_id -> processed_content
let isRunning = false;
let cacheCleanupInterval = null;

export async function startDiscordBot(token) {
  if (isRunning) {
    console.log('🤖 Bot já está rodando');
    return;
  }

  isRunning = true;
  console.log('🤖 Iniciando bot Discord simplificado...');
  
  // Iniciar limpeza de cache a cada 10 minutos
  cacheCleanupInterval = setInterval(() => {
    // Limpar cache de mensagens mais antigas que 30 minutos
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    
    // Manter apenas mensagens recentes no cache
    const cacheArray = Array.from(messageCache);
    cacheArray.forEach(msgId => {
      // Simplificado: limpar metade do cache periodicamente
      if (Math.random() < 0.5) {
        messageCache.delete(msgId);
        processedContentCache.delete(msgId);
      }
    });
    
    console.log(`🧹 Cache limpo. Tamanho atual: ${messageCache.size}`);
  }, 10 * 60 * 1000); // 10 minutos
  
  // Iniciar polling de mensagens
  pollMessages();
  
  return {
    user: { id: 'bot-simple', tag: 'Bot Simplificado' },
    stop: () => {
      isRunning = false;
      if (cacheCleanupInterval) {
        clearInterval(cacheCleanupInterval);
      }
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
  
  // Primeira busca para mostrar todos os canais disponíveis
  try {
    const allChannels = await getGuildChannels(GUILD_ID);
    
    // Organizar canais por categoria real do Discord
    const categories = new Map();
    const textChannels = [];
    
    // Primeiro, identificar todas as categorias
    allChannels.forEach(channel => {
      if (channel.type === 4) { // Category
        categoryNames.set(channel.id, channel.name);
        categories.set(channel.id, []);
      }
    });
    
    // Depois, organizar canais de texto por categoria
    allChannels.forEach(channel => {
      if (channel.type === 0) { // Text channel
        textChannels.push(channel);
        
        // Associar canal à sua categoria
        if (channel.parent_id && categories.has(channel.parent_id)) {
          channelCategories.set(channel.id, channel.parent_id);
          categories.get(channel.parent_id).push(channel);
        } else {
          // Canal sem categoria - criar categoria "Sem Categoria"
          if (!categories.has('no-category')) {
            categories.set('no-category', []);
          }
          channelCategories.set(channel.id, 'no-category');
          categories.get('no-category').push(channel);
        }
      }
    });
    
    console.log(`📋 Servidor encontrado:`);
    console.log(`   • Total de canais: ${allChannels.length}`);
    console.log(`   • Canais de texto: ${textChannels.length}`);
    console.log(`   • Categorias: ${categories.size}`);
    
    console.log(`\n📁 Estrutura do Discord:`);
    categories.forEach((channelsInCategory, categoryId) => {
      const categoryName = categoryId === 'no-category' ? 'Sem Categoria' : categoryNames.get(categoryId) || 'Categoria Desconhecida';
      console.log(`\n📂 ${categoryName}:`);
      channelsInCategory.forEach(channel => {
        console.log(`   • #${channel.name}`);
      });
    });
    
    console.log(`\n🎯 Bot monitorando TODOS os canais automaticamente!\n`);
    
    // Salvar nome do canal no cache para todos os canais
    textChannels.forEach((channel) => {
      channelNames.set(channel.id, channel.name);
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar canais iniciais:', error);
  }
  
  while (isRunning) {
    try {
      // Buscar TODOS os canais do servidor
      const channels = await getGuildChannels(GUILD_ID);
      
      // Capturar TODOS os canais de texto (type 0)
      const textChannels = channels.filter(
        (channel) => channel.type === 0 // Apenas canais de texto
      );

      // Salvar nome do canal no cache para todos os canais
      textChannels.forEach((channel) => {
        channelNames.set(channel.id, channel.name);
      });
      
      console.log(`📡 Verificando ${textChannels.length} canais de texto...`);

      // Buscar mensagens de cada canal
      for (const channel of textChannels) {
        try {
          // Buscar apenas as últimas mensagens (sem usar after para pegar sempre as mais recentes)
          const messages = await getChannelMessages(channel.id, null);
          
          for (const message of messages) {
            // Ignorar apenas bots reais (webhooks têm webhook_id)
            const isWebhook = !!message.webhook_id;
            const isRealBot = message.author.bot && !isWebhook;
            
            // Verificar se já foi processada OU é bot real
            if (isRealBot || messageCache.has(message.id)) {
              continue;
            }

            // Verificar se é uma mensagem recente (últimos 5 minutos)
            const messageTime = new Date(message.timestamp);
            const now = new Date();
            const timeDiff = now - messageTime;
            const minutesDiff = timeDiff / (1000 * 60);
            
            if (minutesDiff > 5) {
              continue; // Ignorar mensagens mais antigas que 5 minutos
            }

            messageCache.add(message.id);
            
            // Salvar no Supabase
            await saveMessageToSupabase(message);
            
            const messageType = isWebhook ? 'Webhook' : 'Usuário';
            const timeAgo = Math.floor(minutesDiff);
            console.log(`💾 Nova mensagem [${messageType}] de ${message.author.username} em #${channel.name} (${timeAgo}min atrás)`);
          }
        } catch (error) {
          console.error(`❌ Erro ao buscar mensagens do canal ${channel.id} (#${channel.name}):`, error);
        }
      }

      // Log estatísticas
      const totalMessages = messageCache.size;
      const totalChannels = textChannels.length;
      console.log(`📊 Estatísticas: ${totalMessages} mensagens cacheadas, ${totalChannels} canais monitorados`);

      // Esperar 2 segundos para não sobrecarregar
      await sleep(2000);
      
    } catch (error) {
      console.error('❌ Erro no polling:', error);
      await sleep(10000); // Esperar 10 segundos em caso de erro
    }
  }
}

async function getGuildChannels(guildId) {
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

async function getChannelMessages(channelId, after) {
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

async function saveMessageToSupabase(message) {
  const { createClient } = await import('@supabase/supabase-js');
  
  // Verificar se já processamos esta mensagem
  if (processedContentCache.has(message.id)) {
    console.log(`⏭️ Mensagem ${message.id} já processada, ignorando...`);
    return;
  }
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  // Extrair conteúdo formatado como embed do Discord
  let messageContent = message.content || '';
  
  // Se não tiver conteúdo mas tiver embeds, extrair e formatar como embed do Discord
  if (!messageContent && message.embeds && message.embeds.length > 0) {
    const embedTexts = message.embeds.map((embed, index) => {
      const parts = [];
      
      // Título em negrito
      if (embed.title) parts.push(`**${embed.title}**`);
      
      // Descrição normal
      if (embed.description) parts.push(embed.description);
      
      // Fields formatados como chave:valor
      if (embed.fields && embed.fields.length > 0) {
        embed.fields.forEach((field) => {
          parts.push(`**${field.name}**: ${field.value}`);
        });
      }
      
      // Footer se existir
      if (embed.footer) parts.push(`_${embed.footer.text}_`);
      
      return parts.join('\n');
    });
    messageContent = embedTexts.join('\n\n---\n\n');
  }
  
  // Limpar blocos de código para remover linguagens desnecessárias
  if (messageContent) {
    // Remover linguagens de blocos de código (ex: ```ini\n -> ```\n)
    messageContent = messageContent.replace(/```(\w+)\n/g, '```\n');
    
    // Remover formatação que pode causar duplicação
    messageContent = messageContent.replace(/```\n```\n/g, '');
    
    // Remover blocos de código vazios
    messageContent = messageContent.replace(/```\s*```\s*/g, '');
    
    // Limpar espaços extras
    messageContent = messageContent.trim();
    
    // Se ficou vazio após limpeza, não salvar
    if (!messageContent) {
      console.log(`⏭️ Mensagem ${message.id} ficou vazia após limpeza, ignorando...`);
      return;
    }
  }
  
  // Marcar como processado ANTES de salvar
  processedContentCache.set(message.id, messageContent);
  
  // Se for webhook, usar o nome do webhook ou global_name
  const authorName = message.webhook_id 
    ? message.author.global_name || message.author.username || 'Webhook'
    : message.author.username;

  const messageData = {
    id: message.id,
    content: messageContent, // Mensagem formatada como embed
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
    embeds: [], // Removido embeds originais
    mentions: message.mentions?.map((m) => ({
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
    // Log formatado como embed
    const lines = messageContent.split('\n').slice(0, 3);
    const preview = lines.join(' ').substring(0, 80);
    console.log(`✅ Embed salva: ${authorName} | "${preview}"`);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Exportar para uso em outros módulos
export { isRunning, messageCache };
