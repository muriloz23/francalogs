import { fileURLToPath } from 'url';
import path from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
config({ path: path.join(__dirname, '../.env') });

const token = process.env.DISCORD_BOT_TOKEN;

if (!token) {
  console.log('❌ Token do bot não encontrado no .env');
  process.exit(1);
}

console.log('🚀 Iniciando bot Discord...');

// Importar dinamicamente o arquivo TypeScript
async function startBot() {
  try {
    // Usar import dinâmico para carregar o TypeScript
    const { startDiscordBot } = await import('../lib/discord-bot-simple.js');
    await startDiscordBot(token);
  } catch (error) {
    console.error('❌ Erro ao iniciar bot:', error.message);
    process.exit(1);
  }
}

startBot();
