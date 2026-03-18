-- Criar tabela para armazenar mensagens do Discord
CREATE TABLE IF NOT EXISTS discord_messages (
  id TEXT PRIMARY KEY,
  content TEXT,
  author JSONB,
  channel_id TEXT,
  guild_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE,
  edited_timestamp TIMESTAMP WITH TIME ZONE,
  attachments JSONB DEFAULT '[]'::jsonb,
  embeds JSONB DEFAULT '[]'::jsonb,
  mentions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_discord_messages_timestamp ON discord_messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_discord_messages_channel_id ON discord_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_discord_messages_guild_id ON discord_messages(guild_id);
CREATE INDEX IF NOT EXISTS idx_discord_messages_created_at ON discord_messages(created_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE discord_messages ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura pública (ajuste conforme necessário)
CREATE POLICY "Enable read access for all users" ON discord_messages
  FOR SELECT USING (true);

-- Criar política para permitir inserção via webhook
CREATE POLICY "Enable insert for webhook" ON discord_messages
  FOR INSERT WITH CHECK (true);

-- Criar função para limpar mensagens antigas (opcional)
CREATE OR REPLACE FUNCTION cleanup_old_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM discord_messages 
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Comentar se quiser agendar a limpeza automática
-- SELECT cron.schedule('cleanup-discord-messages', '0 2 * * *', 'SELECT cleanup_old_messages();');
