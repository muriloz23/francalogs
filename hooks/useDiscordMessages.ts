import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface DiscordMessage {
  id: string
  content: string
  author: {
    id: string
    username: string
    discriminator: string
    avatar?: string
  }
  channel_id: string
  guild_id: string
  timestamp: string
  edited_timestamp?: string
  attachments: any[]
  embeds: any[]
  mentions: any[]
  created_at?: string
}

export function useDiscordMessages() {
  const [messages, setMessages] = useState<DiscordMessage[]>([])
  const [allMessages, setAllMessages] = useState<DiscordMessage[]>([]) // Todas as mensagens para busca
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newMessageCount, setNewMessageCount] = useState(0)
  const [selectedChannel, setSelectedChannel] = useState<string>('all')
  const [channels, setChannels] = useState<{id: string, name: string}[]>([])
  const [channelsLoading, setChannelsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    console.log('🔄 Iniciando hook de mensagens Discord...')
    fetchMessages() // Para interface (lazy loading)
    fetchAllMessages() // Para busca (todas as mensagens)
    fetchChannels()
    
    // Configurar subscription para tempo real
    const subscription = supabase
      .channel('discord_messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'discord_messages' 
        },
        (payload) => {
          console.log('📨 Nova mensagem recebida via subscription:', payload.new)
          // Adiciona à interface
          setMessages(prev => [payload.new as DiscordMessage, ...prev])
          // Adiciona ao array de busca
          setAllMessages(prev => [payload.new as DiscordMessage, ...prev])
          setNewMessageCount(prev => prev + 1)
          
          // Resetar contador após 2 segundos (mais rápido)
          setTimeout(() => {
            setNewMessageCount(prev => Math.max(0, prev - 1))
          }, 2000)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchChannels = async () => {
    try {
      console.log('🔍 Buscando canais...')
      setChannelsLoading(true)
      
      // Buscar canais via API de categorias do Discord
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch channels');
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error('❌ Erro ao buscar canais:', data.error);
        return;
      }
      
      // Extrair todos os canais de todas as categorias
      const allChannels: {id: string, name: string}[] = [];
      data.categories.forEach((category: any) => {
        if (category.channels && category.channels.length > 0) {
          category.channels.forEach((channel: any) => {
            allChannels.push({
              id: channel.id,
              name: channel.name
            });
          });
        }
      });
      
      console.log(`✅ ${allChannels.length} canais encontrados em ${data.categories.length} categorias`)
      setChannels(allChannels)
    } catch (err) {
      console.error('❌ Erro ao buscar canais:', err)
    } finally {
      setChannelsLoading(false)
    }
  }

  const fetchAllMessages = async () => {
    try {
      console.log('🔍 Buscando TODAS as mensagens para busca...')
      const { data, error } = await supabase
        .from('discord_messages')
        .select('*')
        .order('timestamp', { ascending: false })

      if (error) {
        console.error('❌ Erro ao buscar todas as mensagens:', error)
        throw error
      }
      
      console.log(`✅ ${data?.length || 0} mensagens totais para busca`)
      setAllMessages(data || [])
    } catch (err) {
      console.error('❌ Erro ao buscar todas as mensagens:', err)
    }
  }

  const fetchMessages = async (loadMore = false) => {
    try {
      console.log('🔍 Buscando mensagens do Supabase para interface...')
      if (!loadMore) {
        setLoading(true)
        setMessages([])
      } else {
        setLoadingMore(true)
      }
      
      const limit = loadMore ? 100 : 100
      const offset = loadMore ? messages.length : 0
      
      const { data, error } = await supabase
        .from('discord_messages')
        .select('*')
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('❌ Erro do Supabase:', error)
        throw error
      }
      
      console.log(`✅ ${data?.length || 0} mensagens encontradas (offset: ${offset})`)
      
      if (loadMore) {
        setMessages(prev => [...prev, ...(data || [])])
      } else {
        setMessages(data || [])
      }
      
      // Verifica se há mais mensagens para carregar
      setHasMore((data?.length || 0) === limit)
    } catch (err) {
      console.error('❌ Erro ao buscar mensagens:', err)
      setError('Erro ao carregar mensagens')
    } finally {
      if (!loadMore) {
        setLoading(false)
      } else {
        setLoadingMore(false)
      }
    }
  }

  const loadMoreMessages = () => {
    if (hasMore && !loadingMore) {
      fetchMessages(true)
    }
  }

  return { 
    messages, // Para interface (com limite/lazy loading)
    allMessages, // Para busca (todas as mensagens)
    loading, 
    error, 
    refetch: () => fetchMessages(false), 
    newMessageCount,
    selectedChannel,
    setSelectedChannel,
    channels,
    channelsLoading,
    hasMore,
    loadingMore,
    loadMoreMessages
  }
}
