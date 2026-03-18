-- Corrigir Row Level Security para a tabela discord_messages
-- Permitir inserções de qualquer origem (bot, webhook, etc.)

-- 1. Desabilitar RLS temporariamente
ALTER TABLE discord_messages DISABLE ROW LEVEL SECURITY;

-- 2. Criar política que permite todas as operações
DROP POLICY IF EXISTS "Users can view their own messages" ON discord_messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON discord_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON discord_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON discord_messages;

-- 3. Criar política permissiva para o bot
CREATE POLICY "Enable all operations for discord_messages" ON discord_messages
    USING (true) WITH CHECK (true);

-- 4. Reabilitar RLS
ALTER TABLE discord_messages ENABLE ROW LEVEL SECURITY;

-- 5. Conceder permissões para o service role
GRANT ALL ON discord_messages TO authenticated;
GRANT ALL ON discord_messages TO anon;
GRANT ALL ON discord_messages TO service_role;

-- 6. Garantir que a tabela existe com a estrutura correta
CREATE TABLE IF NOT EXISTS discord_messages (
  id TEXT PRIMARY KEY,
  content TEXT,
  author JSONB,
  channel_id TEXT,
  guild_id TEXT,
  timestamp TEXT,
  edited_timestamp TEXT,
  attachments JSONB DEFAULT '[]',
  embeds JSONB DEFAULT '[]',
  mentions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_discord_messages_timestamp ON discord_messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_discord_messages_channel_id ON discord_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_discord_messages_author_id ON discord_messages((author->>'id'));

-- 8. Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE discord_messages;
