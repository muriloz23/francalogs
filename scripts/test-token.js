import { fileURLToPath } from 'url';
import path from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
config({ path: path.join(__dirname, '../.env') });

async function testToken() {
  const token = process.env.DISCORD_BOT_TOKEN;
  
  if (!token || token === 'your-bot-token-here') {
    console.log('❌ Token não configurado. Configure DISCORD_BOT_TOKEN no .env');
    return;
  }

  try {
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const bot = await response.json();
      console.log('✅ Token válido!');
      console.log(`🤖 Bot: ${bot.username}#${bot.discriminator}`);
      console.log(`🆔 ID: ${bot.id}`);
    } else {
      console.log(`❌ Token inválido: HTTP ${response.status}`);
      console.log(`   ${response.statusText}`);
    }
  } catch (error) {
    console.log('❌ Erro ao testar token:', error.message);
  }
}

testToken();
