"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useDiscordMessages } from '@/hooks/useDiscordMessages';
import { useDiscordCategories } from '@/hooks/useDiscordCategories';
import { DiscordLogin } from '@/components/auth/DiscordLogin';

export function DashboardAvancado() {
  const { data: session } = useSession();
  const [loadingAccess, setLoadingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  
  // Verificação de acesso - IDs específicos
  const REQUIRED_ROLE_ID = '1443295095632695354';
  const REQUIRED_GUILD_ID = '1443295095112863758';
  
  // IDs permitidos (você pode adicionar mais se necessário)
  const ALLOWED_USER_IDS = [
    '1329449358709755946', // Admin existente
    // Adicione outros IDs permitidos aqui se necessário
  ];
  
  // Verifica se o usuário tem permissão
  useEffect(() => {
    const checkAccess = async () => {
      if (!session?.user || !('id' in session.user)) {
        setHasAccess(false);
        setLoadingAccess(false);
        return;
      }

      const userId = String(session.user.id);
      
      // Se estiver na lista de permitidos, concede acesso imediatamente
      if (ALLOWED_USER_IDS.includes(userId)) {
        setHasAccess(true);
        setLoadingAccess(false);
        return;
      }

      try {
        // Verifica se o usuário tem o cargo específico
        const response = await fetch('/api/check-role', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            roleId: REQUIRED_ROLE_ID,
            guildId: REQUIRED_GUILD_ID,
          }),
        });

        const data = await response.json();
        setHasAccess(data.hasRole || false);
      } catch (error) {
        console.error('Erro ao verificar permissão:', error);
        setHasAccess(false);
      } finally {
        setLoadingAccess(false);
      }
    };

    checkAccess();
  }, [session]);
  
  // Enquanto verifica o acesso, mostra loading
  if (loadingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Verificando permissões...</p>
        </div>
      </div>
    );
  }
  
  // Se não tiver acesso, mostra tela de acesso negado
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full border border-white/20 shadow-2xl text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Acesso Restrito</h2>
          <p className="text-gray-400 mb-6">
            Você não tem permissão para acessar este dashboard. 
            É necessário ter o cargo específico no servidor Discord.
          </p>
          <div className="space-y-3">
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Cargo Requerido:</p>
              <p className="text-sm text-white font-mono">ID: {REQUIRED_ROLE_ID}</p>
            </div>
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Servidor:</p>
              <p className="text-sm text-white font-mono">ID: {REQUIRED_GUILD_ID}</p>
            </div>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Voltar para Página Inicial
          </button>
        </div>
      </div>
    );
  }
  
  const { 
    messages, // Para interface (lazy loading)
    allMessages, // Para busca (todas as mensagens)
    loading, 
    error, 
    selectedChannel, 
    setSelectedChannel, 
    channels,
    channelsLoading,
    hasMore,
    loadingMore,
    loadMoreMessages
  } = useDiscordMessages();
  // Sistema de busca avançada com inputs separados
  const [searchTerm, setSearchTerm] = useState(''); // Busca de conteúdo
  const [channelSearchTerm, setChannelSearchTerm] = useState(''); // Busca de canal
  const [searchResults, setSearchResults] = useState<{message: any, highlights: string[]}[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  
  // Hook para buscar categorias do Discord
  const { categories, loading: categoriesLoading, error: categoriesError } = useDiscordCategories();
  
  // Apenas o usuário 1329449358709755946 pode ver o botão Admin
  const showAdminButton = session?.user && 'id' in session.user && session.user.id === '1329449358709755946';

// Estrutura de categorias e canais do Discord
  const discordStructure = useMemo(() => {
    // Usar categorias reais do Discord
    if (categories.length > 0) {
      console.log('🔍 Usando categorias reais do Discord:', categories.length);
      return categories;
    }
    
    // Fallback: Agrupar canais por categoria baseada no nome
    const fallbackCategories: Record<string, any[]> = {};
    
    // TODOS os canais (sem filtro de tipo)
    const allChannels = channels;
    
    console.log('🔍 Debug - Canais recebidos:', allChannels.length);
    console.log('📋 Canais:', allChannels);
    
    // Simular categorias baseadas nos nomes dos canais
    allChannels.forEach((channel: any) => {
      const name = channel.name.toLowerCase();
      let category = 'GERAL';
      
      // Categorizar baseado no nome do canal
      if (name.includes('log') || name.includes('logs')) {
        category = '📋 LOGS';
      } else if (name.includes('bot') || name.includes('command')) {
        category = '🤖 BOTS';
      } else if (name.includes('admin') || name.includes('staff') || name.includes('mod')) {
        category = '👑 ADMINISTRAÇÃO';
      } else if (name.includes('general') || name.includes('geral') || name.includes('chat')) {
        category = '💬 GERAL';
      } else if (name.includes('announcement') || name.includes('aviso') || name.includes('news')) {
        category = '📢 ANÚNCIOS';
      } else if (name.includes('help') || name.includes('suporte') || name.includes('support')) {
        category = '❓ AJUDA';
      } else if (name.includes('dev') || name.includes('development') || name.includes('code')) {
        category = '💻 DESENVOLVIMENTO';
      } else if (name.includes('off') || name.includes('random') || name.includes('meme')) {
        category = '🎮 OFF-TOPIC';
      }
      
      if (!fallbackCategories[category]) {
        fallbackCategories[category] = [];
      }
      fallbackCategories[category].push(channel);
    });
    
    console.log('📊 Categorias criadas:', Object.keys(fallbackCategories));
    console.log('🗂️ Estrutura final:', fallbackCategories);
    
    // Converter para o formato esperado
    return Object.entries(fallbackCategories).map(([name, chans]) => ({
      id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: name,
      type: 'category',
      channels: chans
    }));
  }, [categories, channels]);

  // Função para obter highlights de uma mensagem
const getMessageHighlights = (messageId: string) => {
  const result = searchResults.find(r => r.message.id === messageId);
  return result?.highlights || [];
};

// Função para formatar mensagem como embed do Discord
const formatMessageAsEmbed = (content: string) => {
  if (!content) return '<Sem conteúdo>';
  
  // Converter formatação Discord para HTML
  let formatted = content
    // **texto** -> <strong>texto</strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // *texto* -> <em>texto</em>
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // _texto_ -> <em>texto</em>
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // ```código``` -> <pre><code>código</code></pre>
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-black/30 rounded p-2 text-xs mt-2 overflow-x-auto"><code>$1</code></pre>')
    // `código` -> <code>código</code>
    .replace(/`(.*?)`/g, '<code class="bg-black/20 px-1 rounded text-xs">$1</code>')
    // --- -> <hr>
    .replace(/---/g, '<hr class="border-white/20 my-2">')
    // Quebras de linha
    .replace(/\n/g, '<br />');
  
  return formatted;
};

// Contar mensagens por canal
  const channelMessageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    messages.forEach((msg: any) => {
      counts[msg.channel_id] = (counts[msg.channel_id] || 0) + 1;
    });
    return counts;
  }, [messages]);

  // Função de busca de conteúdo (mensagens e usuários) - usa TODAS as mensagens
  const searchContentMessages = useMemo(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return allMessages; // Usa allMessages para busca
    }

    setIsSearching(true);
    const term = searchTerm.toLowerCase().trim();
    const results: {message: any, highlights: string[]}[] = [];

    // Se tiver um canal selecionado (não "all"), filtrar por canal primeiro
    let messagesToSearch = allMessages; // Usa allMessages para busca
    if (selectedChannel !== 'all') {
      messagesToSearch = allMessages.filter((msg: any) => msg.channel_id === selectedChannel);
    }

    console.log('🔍 Debug - Busca de conteúdo:');
    console.log(`   • Canal selecionado: ${selectedChannel}`);
    console.log(`   • Termo de busca: "${term}"`);
    console.log(`   • Total de mensagens disponíveis: ${allMessages.length}`);
    console.log(`   • Mensagens para buscar: ${messagesToSearch.length}`);

    messagesToSearch.forEach((message: any) => {
      // Buscar apenas em conteúdo e autor (não em canal)
      const searchableText = [
        message.content || '',
        message.author?.username || ''
      ].join(' ').toLowerCase();

      if (searchableText.includes(term)) {
        // Gerar highlights
        const highlights: string[] = [];
        const content = message.content || '';
        
        // Highlight no conteúdo
        if (content.toLowerCase().includes(term)) {
          const regex = new RegExp(`(${term})`, 'gi');
          const highlightedContent = content.replace(regex, '<mark class="bg-yellow-500/30 text-yellow-300 px-1 rounded">$1</mark>');
          highlights.push(highlightedContent);
        }
        
        // Highlight no autor
        if (message.author?.username?.toLowerCase().includes(term)) {
          const regex = new RegExp(`(${term})`, 'gi');
          const highlightedAuthor = message.author.username.replace(regex, '<mark class="bg-blue-500/30 text-blue-300 px-1 rounded">$1</mark>');
          highlights.push(`Autor: ${highlightedAuthor}`);
        }

        results.push({ message, highlights });
      }
    });

    console.log(`   • Resultados encontrados: ${results.length}`);
    setSearchResults(results);
    setIsSearching(false);
    return results.map(r => r.message);
  }, [searchTerm, allMessages, selectedChannel]); // Usa allMessages

  // Função de busca de canal - usa TODAS as mensagens
  const searchChannelMessages = useMemo(() => {
    if (!channelSearchTerm.trim()) {
      return allMessages; // Usa allMessages para busca
    }

    const term = channelSearchTerm.toLowerCase().trim().replace('#', '');
    const results: {message: any, highlights: string[]}[] = [];

    console.log('🔍 Debug - Busca de canal:');
    console.log(`   • Termo de busca: "${term}"`);
    console.log(`   • Total de mensagens disponíveis: ${allMessages.length}`);

    // Busca em todas as mensagens (ignora canal selecionado)
    allMessages.forEach((message: any) => { // Usa allMessages
      // Buscar apenas em nome do canal
      const channel = channels.find(ch => ch.id === message.channel_id);
      if (channel?.name?.toLowerCase().includes(term)) {
        // Gerar highlights
        const highlights: string[] = [];
        
        // Highlight no canal
        const regex = new RegExp(`(${term})`, 'gi');
        const highlightedChannel = channel.name.replace(regex, '<mark class="bg-green-500/30 text-green-300 px-1 rounded">$1</mark>');
        highlights.push(`Canal: #${highlightedChannel}`);

        results.push({ message, highlights });
      }
    });

    console.log(`   • Resultados encontrados: ${results.length}`);
    return results.map(r => r.message);
  }, [channelSearchTerm, allMessages, channels]); // Usa allMessages

  // Combinar resultados das buscas
  const searchMessages = useMemo(() => {
    const hasContentSearch = searchTerm.trim();
    const hasChannelSearch = channelSearchTerm.trim();
    
    if (hasContentSearch && hasChannelSearch) {
      // Ambas as buscas ativas - intersecção
      const contentIds = new Set(searchContentMessages.map(m => m.id));
      const channelIds = new Set(searchChannelMessages.map(m => m.id));
      const intersection = [...contentIds].filter(id => channelIds.has(id));
      return allMessages.filter(m => intersection.includes(m.id));
    } else if (hasContentSearch) {
      // Apenas busca de conteúdo
      return searchContentMessages;
    } else if (hasChannelSearch) {
      // Apenas busca de canal
      return searchChannelMessages;
    } else {
      // Nenhuma busca - retorna allMessages para busca completa
      return allMessages;
    }
  }, [searchContentMessages, searchChannelMessages, searchTerm, channelSearchTerm, allMessages]);

  // Filtrar mensagens com base nos filtros
  const filteredMessages = useMemo(() => {
    // Se não há busca, usa messages (interface com lazy loading)
    if (!searchTerm.trim() && !channelSearchTerm.trim()) {
      let filtered = messages; // Usa messages para interface
      if (selectedChannel !== 'all') {
        filtered = filtered.filter((msg: any) => msg.channel_id === selectedChannel);
      }
      return filtered;
    }
    
    // Se há busca, usa searchMessages (baseado em allMessages)
    return searchMessages;
  }, [searchMessages, selectedChannel, messages, searchTerm, channelSearchTerm]);

  // Estatísticas em tempo real - usa allMessages para busca completa
  const stats = useMemo(() => {
    // Usa allMessages quando há busca, messages quando não há busca
    const messagesForStats = (searchTerm.trim() || channelSearchTerm.trim()) ? searchMessages : messages;
    
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    return {
      total: messagesForStats.length,
      lastHour: messagesForStats.filter((m: any) => new Date(m.timestamp) > oneHourAgo).length,
      lastDay: messagesForStats.filter((m: any) => new Date(m.timestamp) > oneDayAgo).length,
      embedsCount: messagesForStats.filter((m: any) => m.embeds && m.embeds.length > 0).length,
      webhooksCount: messagesForStats.filter((m: any) => (m as any).webhook_id).length,
      uniqueUsers: new Set(messagesForStats.map((m: any) => m.author?.username)).size,
      hourlyActivity: Array.from({length: 24}, (_, i) => {
        const hour = (now.getHours() - i + 24) % 24;
        const hourMessages = messagesForStats.filter((m: any) => new Date(m.timestamp).getHours() === hour);
        return { hour, count: hourMessages.length };
      }).reverse(),
      topUsers: Object.entries(
        messagesForStats.reduce((acc: any, m: any) => {
          const username = m.author?.username || 'Unknown';
          acc[username] = (acc[username] || 0) + 1;
          return acc;
        }, {})
      )
      .sort(([,a]: any, [,b]: any) => b - a)
      .map(([username, count]) => ({ username, count }))
      .slice(0, 10)
    };
  }, [filteredMessages, searchMessages, messages]);

  // Análise de atividade por hora
  const hourlyActivity = useMemo(() => {
    const activity = Array.from({length: 24}, (_, i) => ({ hour: i, count: 0 }));
    
    filteredMessages.forEach(msg => {
      const hour = new Date(msg.timestamp).getHours();
      activity[hour].count++;
    });
    
    return activity;
  }, [filteredMessages]);

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Header Principal */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Franca Analytics Pro
              </h1>
              <p className="text-gray-300 text-xs">Sistema Avançado</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-xs">Live</span>
            </div>
            {showAdminButton && (
              <Link 
                href="/admin"
                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-all"
              >
                Admin
              </Link>
            )}
            <DiscordLogin />
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100%-60px)]">
        {/* Sidebar Discord-Style com cores do dashboard */}
        <aside className="w-64 bg-black/20 backdrop-blur-lg border-r border-white/10 text-white p-2 overflow-y-auto">
          {/* Header do Servidor */}
          <div className="mb-2">
            <div className="px-2 py-2 flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <div>
                <div className="font-semibold text-white text-sm">França Logs</div>
                <div className="text-xs text-gray-400">Servidor de Logs</div>
              </div>
            </div>
          </div>

          {/* Campo de Busca de Canais na Sidebar */}
          <div className="mb-4 px-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar #canais..."
                value={channelSearchTerm}
                onChange={(e) => setChannelSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded px-3 py-1.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <svg className="w-3 h-3 text-gray-400 absolute right-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            {channelSearchTerm && (
              <div className="mt-1 text-xs text-gray-400 px-2">
                {searchChannelMessages.length} canal{searchChannelMessages.length !== 1 ? 's' : ''} encontrado{searchChannelMessages.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Categorias e Canais */}
          <div className="space-y-1">
            {/* Canal Todos */}
            <div className="px-2">
              <button
                onClick={() => setSelectedChannel('all')}
                className={`w-full flex items-center justify-between px-2 py-1 rounded text-xs transition-all ${
                  selectedChannel === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">📁</span>
                  <span>Todos os Canais</span>
                </div>
                <span className="text-gray-400 text-xs">{messages.length}</span>
              </button>
            </div>

            {/* Debug: Mostrar canais brutos se não houver categorias */}
            {Object.keys(discordStructure).length === 0 && channels.length > 0 && (
              <div className="px-2">
                <div className="flex items-center space-x-1 px-2 py-1">
                  <span className="font-semibold text-xs text-gray-400 uppercase tracking-wide">
                    📋 TODOS OS CANAIS
                  </span>
                </div>
                <div className="ml-2 space-y-0.5">
                  {channels.map((channel: any) => {
                    const messageCount = channelMessageCounts[channel.id] || 0;
                    const isSelected = selectedChannel === channel.id;
                    
                    return (
                      <button
                        key={channel.id}
                        onClick={() => setSelectedChannel(channel.id)}
                        className={`w-full flex items-center justify-between px-2 py-0.5 rounded text-xs transition-all ${
                          isSelected 
                            ? 'bg-blue-600 text-white' 
                            : 'hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">#</span>
                          <span className="truncate">{channel.name}</span>
                        </div>
                        {messageCount > 0 && (
                          <span className="text-gray-400 text-xs">{messageCount}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Canais Agrupados por Categoria */}
            {discordStructure.map((category: any) => (
              <div key={category.id} className="px-2">
                {/* Header da Categoria */}
                <div className="flex items-center space-x-1 px-2 py-1 cursor-pointer hover:text-white transition-colors">
                  <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold text-xs text-gray-400 uppercase tracking-wide">
                    {category.name} ({category.channels?.length || 0})
                  </span>
                </div>

                {/* Canais da Categoria */}
                <div className="ml-2 space-y-0.5">
                  {(category.channels || []).map((channel: any) => {
                    const messageCount = channelMessageCounts[channel.id] || 0;
                    const isSelected = selectedChannel === channel.id;
                    
                    return (
                      <button
                        key={channel.id}
                        onClick={() => setSelectedChannel(channel.id)}
                        className={`w-full flex items-center justify-between px-2 py-0.5 rounded text-xs transition-all ${
                          isSelected 
                            ? 'bg-blue-600 text-white' 
                            : 'hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">#</span>
                          <span className="truncate">{channel.name}</span>
                        </div>
                        {messageCount > 0 && (
                          <span className="text-gray-400 text-xs">{messageCount}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Debug Info */}
            <div className="px-2 mt-4 p-2 bg-white/5 rounded text-xs text-gray-400">
              <div>Debug Info:</div>
              <div>• Canais totais: {channels.length}</div>
              <div>• Categorias: {Object.keys(discordStructure).length}</div>
              <div>• Selecionado: {selectedChannel}</div>
            </div>
          </div>

          {/* Rodapé da Sidebar */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="px-2 text-xs text-gray-400">
              <div className="flex items-center justify-between mb-1">
                <span>Total de Mensagens</span>
                <span className="text-white">{messages.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Canais Ativos</span>
                <span className="text-white">{channels.length}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Conteúdo Principal */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Header do Conteúdo */}
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h2 className="text-lg font-bold text-white">
                  {selectedChannel === 'all' ? 'Todos os Canais' : 
                   discordStructure.find(cat => cat.channels?.some((ch: any) => ch.id === selectedChannel))?.name || 'Canal Selecionado'}
                </h2>
                <span className="text-gray-400 text-xs">
                  {(searchTerm.trim() || channelSearchTerm.trim()) 
                    ? `${searchMessages.length} mensagem${searchMessages.length !== 1 ? 's' : ''} encontradas`
                    : `${filteredMessages.length} mensagem${filteredMessages.length !== 1 ? 's' : ''}`
                  }
                </span>
              </div>

              {/* Campo de Busca de Conteúdo no Topo */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar mensagens e usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 bg-white/10 border border-white/20 rounded px-3 py-1.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <svg className="w-3 h-3 text-gray-400 absolute right-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {isSearching && (
                  <div className="absolute right-8 top-1.5">
                    <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {searchTerm && (
                  <div className="absolute -bottom-5 left-0 text-xs text-gray-400">
                    {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Barra de Ferramentas */}
          <div className="bg-black/20 backdrop-blur-lg border-b border-white/10 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-semibold">
                  {selectedChannel === 'all' ? 'Todos' : channels.find(c => c.id === selectedChannel)?.name || 'Canal'}
                </h2>
                <span className="bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded-full text-xs">
                  {filteredMessages.length}
                </span>
              </div>
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="px-2 py-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded text-xs transition-all flex items-center space-x-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Análise</span>
              </button>
            </div>
          </div>

          {/* Painel de Análise */}
          {showAnalytics && (
            <div className="bg-black/20 backdrop-blur-lg border-b border-white/10 p-3">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Gráfico de Atividade */}
                <div className="bg-white/5 rounded-lg p-3">
                  <h3 className="text-blue-400 font-semibold mb-2 text-xs">Atividade por Hora</h3>
                  <div className="space-y-0.5">
                    {hourlyActivity.slice(0, 12).map(({hour, count}) => {
                      const maxCount = Math.max(...hourlyActivity.slice(0, 12).map(h => h.count));
                      const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                      
                      return (
                        <div key={hour} className="flex items-center space-x-1">
                          <span className="text-gray-400 text-xs w-4">{hour}h</span>
                          <div className="flex-1 bg-white/10 rounded-full h-1 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                              style={{width: `${percentage}%`}}
                            />
                          </div>
                          <span className="text-gray-300 text-xs w-4">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top Usuários */}
                <div className="bg-white/5 rounded-lg p-3">
                  <h3 className="text-green-400 font-semibold mb-2 text-xs">Top Usuários</h3>
                  <div className="space-y-1">
                    {stats.topUsers.slice(0, 5).map((user, index) => (
                      <div key={user.username} className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-400 text-xs w-3">#{index + 1}</span>
                          <span className="text-green-300 text-xs truncate max-w-[80px]">{user.username}</span>
                        </div>
                        <span className="text-gray-300 text-xs">{user.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Estatísticas Detalhadas */}
                <div className="bg-white/5 rounded-lg p-3">
                  <h3 className="text-purple-400 font-semibold mb-2 text-xs">Estatísticas</h3>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs">Total</span>
                      <span className="text-white text-xs font-medium">{stats.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs">24h</span>
                      <span className="text-green-400 text-xs font-medium">{stats.lastDay}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs">Embeds</span>
                      <span className="text-blue-400 text-xs font-medium">{stats.embedsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs">Webhooks</span>
                      <span className="text-purple-400 text-xs font-medium">{stats.webhooksCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs">Usuários</span>
                      <span className="text-yellow-400 text-xs font-medium">{stats.uniqueUsers}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Mensagens */}
          <div className="flex-1 overflow-y-auto p-3">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-400 text-sm">Carregando...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-400 text-sm">Erro ao carregar</p>
                <p className="text-gray-400 text-xs mt-1">{error}</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-400 text-sm">Nenhuma mensagem</p>
                <p className="text-gray-500 text-xs mt-1">
                  {searchTerm ? 'Ajuste os filtros' : 'Aguarde novas mensagens'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMessages.map(message => (
                  <div 
                    key={message.id} 
                    className="bg-white/5 hover:bg-white/10 rounded-lg p-3 transition-all hover:scale-[1.01] cursor-pointer border border-white/10"
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-xs">
                            {message.author.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-blue-300 text-sm">{message.author.username}</span>
                            <span className="text-gray-400 text-xs">
                              {new Date(message.timestamp).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {(message as any).webhook_id && (
                              <span className="px-1.5 py-0.5 bg-purple-600/30 text-purple-300 text-xs rounded-full">Webhook</span>
                            )}
                            {message.embeds && message.embeds.length > 0 && (
                              <span className="px-1.5 py-0.5 bg-blue-600/30 text-blue-300 text-xs rounded-full">Embed</span>
                            )}
                            {message.attachments && message.attachments.length > 0 && (
                              <span className="px-1.5 py-0.5 bg-green-600/30 text-green-300 text-xs rounded-full">Anexo</span>
                            )}
                          </div>
                          <div 
                            className="text-gray-100 text-xs leading-relaxed break-words"
                            dangerouslySetInnerHTML={{ 
                              __html: searchTerm && getMessageHighlights(message.id).length > 0 
                                ? getMessageHighlights(message.id)[0] 
                                : formatMessageAsEmbed(message.content)
                            }}
                          />
                          {searchTerm && getMessageHighlights(message.id).length > 1 && (
                            <div className="mt-1 space-y-1">
                              {getMessageHighlights(message.id).slice(1).map((highlight: any, index: number) => (
                                <div key={index} className="text-xs text-gray-300" dangerouslySetInnerHTML={{ __html: highlight }} />
                              ))}
                            </div>
                          )}
                          {message.embeds && message.embeds.length > 0 && (
                            <div className="mt-1 space-y-1">
                              {message.embeds.slice(0, 1).map((embed: any, index: number) => (
                                <div key={index} className="bg-white/5 rounded p-2 border-l-2 border-blue-500">
                                  {embed.title && (
                                    <div className="font-semibold text-white text-xs mb-1">{embed.title}</div>
                                  )}
                                  {embed.description && (
                                    <div className="text-gray-300 text-xs line-clamp-2">{embed.description}</div>
                                  )}
                                </div>
                              ))}
                              {message.embeds.length > 1 && (
                                <div className="text-blue-400 text-xs">+{message.embeds.length - 1} embeds</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Botão Carregar Mais */}
            {hasMore && !loading && (
              <div className="p-4 text-center">
                <button
                  onClick={loadMoreMessages}
                  disabled={loadingMore}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2 mx-auto"
                >
                  {loadingMore ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Carregando...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      <span>Carregar mais mensagens</span>
                    </>
                  )}
                </button>
                <p className="text-gray-400 text-xs mt-2">
                  Mostrando {messages.length} mensagens
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal de Mensagem Detalhada */}
      {selectedMessage && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedMessage(null);
            }
          }}
        >
          <div className="bg-gray-900 rounded-xl p-4 max-w-lg w-full max-h-[80vh] overflow-y-auto border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Mensagem Detalhada</h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {selectedMessage.author.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-white font-semibold">{selectedMessage.author.username}</div>
                  <div className="text-gray-400 text-xs">
                    {new Date(selectedMessage.timestamp).toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <div 
                  className="text-gray-100 text-sm whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ 
                    __html: formatMessageAsEmbed(selectedMessage.content) 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
