import { fileURLToPath } from 'url';
import path from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
config({ path: path.join(__dirname, '../.env') });

async function debugFull() {
  console.log('🔍 DEBUG COMPLETO DO SISTEMA');
  console.log('='.repeat(50));

  // 1. Testar variáveis de ambiente
  console.log('\n1️⃣ VARIÁVEIS DE AMBIENTE:');
  const envVars = {
    DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN ? '✅ Configurado' : '❌ Não configurado',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurado' : '❌ Não configurado',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ Não configurado',
  };
  
  Object.entries(envVars).forEach(([key, status]) => {
    console.log(`   ${key}: ${status}`);
  });

  // 2. Testar Supabase
  console.log('\n2️⃣ SUPABASE:');
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Testar conexão básica
    const { data, error } = await supabase
      .from('discord_messages')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.log('   ❌ Erro na tabela:', error.message);
    } else {
      console.log('   ✅ Tabela acessível');
      
      // Buscar mensagens
      const { data: messages, error: msgError } = await supabase
        .from('discord_messages')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(5);

      if (msgError) {
        console.log('   ❌ Erro ao buscar mensagens:', msgError.message);
      } else {
        console.log(`   ✅ ${messages.length} mensagens encontradas`);
        messages.forEach((msg, i) => {
          console.log(`      ${i+1}. ${msg.author?.username}: ${msg.content?.substring(0, 30)}...`);
        });
      }

      // Testar Realtime
      console.log('\n3️⃣ REALTIME SUBSCRIPTION:');
      const channel = supabase
        .channel('test_connection')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'discord_messages' },
          (payload) => {
            console.log('   📨 Evento recebido:', payload.eventType, payload.new?.id);
          }
        )
        .subscribe((status) => {
          console.log('   📡 Status Realtime:', status);
        });

      // Esperar um pouco para ver o status
      await new Promise(resolve => setTimeout(resolve, 2000));
      channel.unsubscribe();
    }
  } catch (error) {
    console.log('   ❌ Erro no Supabase:', error.message);
  }

  // 4. Testar token Discord (se configurado)
  if (process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_BOT_TOKEN !== 'your-bot-token-here') {
    console.log('\n4️⃣ DISCORD API:');
    try {
      const response = await fetch('https://discord.com/api/v10/users/@me', {
        headers: {
          'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const bot = await response.json();
        console.log(`   ✅ Bot válido: ${bot.username}#${bot.discriminator}`);
        
        // Testar acesso ao servidor
        const guildResponse = await fetch(
          `https://discord.com/api/v10/guilds/1443298554398511227/channels`,
          {
            headers: {
              'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (guildResponse.ok) {
          const channels = await guildResponse.json();
          const targetChannels = channels.filter(c => c.parent_id === '1466188857241243863');
          console.log(`   ✅ ${targetChannels.length} canais encontrados na categoria`);
        } else {
          console.log('   ❌ Erro ao acessar servidor:', guildResponse.status);
        }
      } else {
        console.log(`   ❌ Token inválido: ${response.status}`);
      }
    } catch (error) {
      console.log('   ❌ Erro Discord:', error.message);
    }
  } else {
    console.log('\n4️⃣ DISCORD: ⚠️ Token não configurado');
  }

  console.log('\n🏁 DEBUG CONCLUÍDO');
}

debugFull().catch(console.error);
