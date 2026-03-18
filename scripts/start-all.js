import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cores para console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Verificar se o token do bot está configurado
function checkBotToken() {
  const envPath = path.join(__dirname, '../.env');
  
  if (!fs.existsSync(envPath)) {
    log('❌ Arquivo .env não encontrado!', 'red');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasToken = envContent.includes('DISCORD_BOT_TOKEN=') && 
                  !envContent.includes('DISCORD_BOT_TOKEN=your-bot-token-here');
  
  if (!hasToken) {
    log('⚠️  Token do bot não configurado no .env', 'yellow');
    log('   Configure o token em: DISCORD_BOT_TOKEN=seu-token-aqui', 'yellow');
    return false;
  }
  
  return true;
}

// Iniciar Dashboard Next.js
function startDashboard() {
  log('🚀 Iniciando Dashboard Next.js...', 'cyan');
  
  const dashboard = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    shell: true
  });
  
  dashboard.on('error', (error) => {
    log(`❌ Erro ao iniciar dashboard: ${error.message}`, 'red');
  });
  
  dashboard.on('close', (code) => {
    if (code !== 0) {
      log(`❌ Dashboard fechado com código: ${code}`, 'red');
    }
  });
  
  return dashboard;
}

// Iniciar Bot Discord
function startBot() {
  log('🤖 Iniciando Bot Discord...', 'magenta');
  
  const bot = spawn('node', ['scripts/start-bot.js'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    shell: true,
    env: { ...process.env }
  });
  
  bot.on('error', (error) => {
    log(`❌ Erro ao iniciar bot: ${error.message}`, 'red');
  });
  
  bot.on('close', (code) => {
    if (code !== 0) {
      log(`❌ Bot fechado com código: ${code}`, 'red');
    }
  });
  
  return bot;
}

// Função principal
async function main() {
  log('='.repeat(60), 'cyan');
  log('🎯 Iniciando Dashboard + Bot Discord', 'bright');
  log('='.repeat(60), 'cyan');
  
  // Verificar configuração
  if (!checkBotToken()) {
    log('\n📝 Para configurar o bot:', 'yellow');
    log('   1. Acesse: /admin no dashboard', 'yellow');
    log('   2. Configure o token do bot', 'yellow');
    log('   3. Execute este script novamente', 'yellow');
    process.exit(1);
  }
  
  // Iniciar aplicações
  const dashboard = startDashboard();
  
  // Aguardar um pouco antes de iniciar o bot
  setTimeout(() => {
    const bot = startBot();
    
    // Manipular encerramento
    process.on('SIGINT', () => {
      log('\n🛑 Encerrando aplicações...', 'yellow');
      dashboard.kill('SIGINT');
      bot.kill('SIGINT');
      process.exit(0);
    });
  }, 3000);
  
  log('\n✅ Aplicações iniciadas!', 'green');
  log('📱 Dashboard: http://localhost:3000', 'green');
  log('🤖 Bot: Conectando ao Discord...', 'green');
  log('⚙️  Admin: http://localhost:3000/admin', 'green');
  log('\nPressione Ctrl+C para encerrar', 'yellow');
}

// Executar
main().catch(console.error);
