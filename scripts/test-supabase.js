import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testSupabase() {
  try {
    // Importar Supabase
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Credenciais Supabase não configuradas');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Testar conexão
    console.log('🔍 Testando conexão com Supabase...');
    
    // Verificar se tabela existe
    const { data, error } = await supabase
      .from('discord_messages')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Erro ao acessar tabela discord_messages:');
      console.log('   ', error.message);
      console.log('\n💡 Execute o SQL em database/schema.sql no painel Supabase');
    } else {
      console.log('✅ Tabela discord_messages encontrada!');
      console.log(`📊 Total de mensagens: ${data.length}`);
      
      // Buscar últimas mensagens
      const { data: messages, error: msgError } = await supabase
        .from('discord_messages')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(5);
      
      if (msgError) {
        console.log('❌ Erro ao buscar mensagens:', msgError.message);
      } else if (messages && messages.length > 0) {
        console.log('\n📨 Últimas mensagens:');
        messages.forEach((msg, i) => {
          console.log(`   ${i+1}. ${msg.author?.username || 'Unknown'}: ${msg.content?.substring(0, 50)}...`);
        });
      } else {
        console.log('\n📭 Nenhuma mensagem encontrada');
      }
    }
    
  } catch (error) {
    console.log('❌ Erro ao testar Supabase:', error.message);
  }
}

testSupabase();
