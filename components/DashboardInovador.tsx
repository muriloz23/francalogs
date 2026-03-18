"use client";
import React, { useState, useEffect } from 'react';
import { DiscordLogin } from "@/components/auth/DiscordLogin";
import { useDiscordMessages } from '@/hooks/useDiscordMessages';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export function DashboardInovador() {
  const { 
    messages, 
    loading, 
    error, 
    selectedChannel, 
    setSelectedChannel, 
    channels,
    channelsLoading
  } = useDiscordMessages();
  
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all'); // all, messages, channels, users
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [timeRange, setTimeRange] = useState('24h'); // 1h, 24h, 7d, 30d
  const [selectedMessage, setSelectedMessage] = useState(null);
  
  // Apenas o usuário 1329449358709755946 pode ver o botão Admin
  const showAdminButton = session?.user && 'id' in session.user && session.user.id === '1329449358709755946';

  // Estatísticas em tempo real
  const stats = {
    totalMessages: messages.length,
    totalChannels: channels.length,
    activeUsers: new Set(messages.map(m => m.author.username)).size,
    embedsCount: messages.filter(m => m.embeds && m.embeds.length > 0).length,
    lastHourMessages: messages.filter(m => {
      const messageTime = new Date(m.timestamp);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return messageTime > oneHourAgo;
    }).length
  };

  // Sistema de busca avançado
  const searchResults = () => {
    if (!searchTerm) return [];
    
    const term = searchTerm.toLowerCase();
    
    switch (searchType) {
      case 'messages':
        return messages.filter(msg => 
          msg.content && msg.content.toLowerCase().includes(term)
        );
      case 'channels':
        return channels.filter(channel =>
          channel.name.toLowerCase().includes(term)
        );
      case 'users':
        return Array.from(new Set(messages.map(m => m.author.username)))
          .filter(user => user.toLowerCase().includes(term))
          .map(user => ({
            username: user,
            messageCount: messages.filter(m => m.author.username === user).length
          }));
      default:
        return {
          messages: messages.filter(msg => 
            msg.content && msg.content.toLowerCase().includes(term)
          ),
          channels: channels.filter(channel =>
            channel.name.toLowerCase().includes(term)
          ),
          users: Array.from(new Set(messages.map(m => m.author.username)))
            .filter(user => user.toLowerCase().includes(term))
            .map(user => ({
              username: user,
              messageCount: messages.filter(m => m.author.username === user).length
            }))
        };
    }
  };

  const results = searchResults();

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 overflow-y-auto">
      {/* Header Futurista */}
      <header className="border-b border-white/10 backdrop-blur-lg bg-white/5 rounded-t-2xl sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Franca Analytics</h1>
                <p className="text-blue-300 text-sm">Sistema Inteligente de Monitoramento</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {showAdminButton && (
                <Link 
                  href="/admin"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all hover:scale-105"
                >
                  Admin
                </Link>
              )}
              <DiscordLogin />
            </div>
          </div>
        </div>
      </header>

      {/* Sistema de Busca Avançado */}
      <div className="px-6 py-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Campo de Busca Principal */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Busca inteligente de mensagens, canais, usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filtros de Busca */}
            <div className="flex gap-2">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="messages">Mensagens</option>
                <option value="channels">Canais</option>
                <option value="users">Usuários</option>
              </select>

              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1h">1 hora</option>
                <option value="24h">24 horas</option>
                <option value="7d">7 dias</option>
                <option value="30d">30 dias</option>
              </select>

              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all hover:scale-105 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Análise</span>
              </button>
            </div>
          </div>

          {/* Sugestões de Busca Rápida */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-gray-400 text-sm">Busca rápida:</span>
            {['ban', 'kick', 'warn', 'error', 'cmd', 'staff'].map(tag => (
              <button
                key={tag}
                onClick={() => setSearchTerm(tag)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-xs text-blue-300 transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 backdrop-blur-lg rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm">Total Mensagens</p>
                <p className="text-2xl font-bold text-white">{stats.totalMessages.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600/20 to-purple-700/20 backdrop-blur-lg rounded-xl p-4 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm">Canais Ativos</p>
                <p className="text-2xl font-bold text-white">{stats.totalChannels}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-600/20 to-green-700/20 backdrop-blur-lg rounded-xl p-4 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm">Usuários Ativos</p>
                <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 backdrop-blur-lg rounded-xl p-4 border border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-300 text-sm">Embeds</p>
                <p className="text-2xl font-bold text-white">{stats.embedsCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-600/20 to-red-700/20 backdrop-blur-lg rounded-xl p-4 border border-red-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-300 text-sm">Última Hora</p>
                <p className="text-2xl font-bold text-white">{stats.lastHourMessages}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resultados da Busca */}
      {searchTerm && (
        <div className="container mx-auto px-6 mb-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Resultados da Busca</h3>
            
            {searchType === 'all' ? (
              <div className="space-y-6">
                {results.messages && results.messages.length > 0 && (
                  <div>
                    <h4 className="text-blue-400 font-semibold mb-2">Mensagens ({results.messages.length})</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {results.messages.slice(0, 5).map(msg => (
                        <div key={msg.id} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors cursor-pointer"
                             onClick={() => setSelectedMessage(msg)}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-blue-300">{msg.author.username}</span>
                              <span className="text-gray-400 text-xs">{new Date(msg.timestamp).toLocaleString()}</span>
                            </div>
                            <span className="text-gray-300 text-sm truncate max-w-md">{msg.content}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {results.channels && results.channels.length > 0 && (
                  <div>
                    <h4 className="text-purple-400 font-semibold mb-2">Canais ({results.channels.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {results.channels.map(channel => (
                        <button
                          key={channel.id}
                          onClick={() => setSelectedChannel(channel.id)}
                          className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 rounded-full text-purple-300 text-sm transition-colors"
                        >
                          #{channel.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {results.users && results.users.length > 0 && (
                  <div>
                    <h4 className="text-green-400 font-semibold mb-2">Usuários ({results.users.length})</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {results.users.map(user => (
                        <div key={user.username} className="bg-white/5 rounded-lg p-2">
                          <div className="text-green-300 font-medium">{user.username}</div>
                          <div className="text-gray-400 text-xs">{user.messageCount} mensagens</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {Array.isArray(results) && results.length === 0 && (
                  <p className="text-gray-400 text-center py-8">Nenhum resultado encontrado para "{searchTerm}"</p>
                )}
                {searchType === 'messages' && Array.isArray(results) && results.map(msg => (
                  <div key={msg.id} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors cursor-pointer mb-2"
                       onClick={() => setSelectedMessage(msg)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-300">{msg.author.username}</span>
                        <span className="text-gray-400 text-xs">{new Date(msg.timestamp).toLocaleString()}</span>
                      </div>
                      <span className="text-gray-300 text-sm truncate max-w-md">{msg.content}</span>
                    </div>
                  </div>
                ))}
                {searchType === 'channels' && Array.isArray(results) && (
                  <div className="flex flex-wrap gap-2">
                    {results.map(channel => (
                      <button
                        key={channel.id}
                        onClick={() => setSelectedChannel(channel.id)}
                        className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 rounded-full text-purple-300 text-sm transition-colors"
                      >
                        #{channel.name}
                      </button>
                    ))}
                  </div>
                )}
                {searchType === 'users' && Array.isArray(results) && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {results.map(user => (
                      <div key={user.username} className="bg-white/5 rounded-lg p-2">
                        <div className="text-green-300 font-medium">{user.username}</div>
                        <div className="text-gray-400 text-xs">{user.messageCount} mensagens</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Mensagem Detalhada */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Mensagem Detalhada</h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{selectedMessage.author.username.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <div className="text-white font-semibold">{selectedMessage.author.username}</div>
                  <div className="text-gray-400 text-sm">{new Date(selectedMessage.timestamp).toLocaleString()}</div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-gray-100 whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>
              
              {selectedMessage.embeds && selectedMessage.embeds.length > 0 && (
                <div>
                  <h4 className="text-blue-400 font-semibold mb-2">Embeds</h4>
                  {selectedMessage.embeds.map((embed, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 border-l-4 border-blue-500">
                      {embed.title && <div className="text-white font-bold mb-2">{embed.title}</div>}
                      {embed.description && <div className="text-gray-300 mb-2">{embed.description}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Painel de Análise */}
      {showAnalytics && (
        <div className="container mx-auto px-6 mb-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6">Análise Avançada</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Atividade */}
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-blue-400 font-semibold mb-4">Atividade por Hora</h4>
                <div className="space-y-2">
                  {Array.from({length: 24}, (_, i) => {
                    const hourMessages = messages.filter(m => 
                      new Date(m.timestamp).getHours() === i
                    ).length;
                    const percentage = messages.length > 0 ? (hourMessages / messages.length) * 100 : 0;
                    
                    return (
                      <div key={i} className="flex items-center space-x-2">
                        <span className="text-gray-400 text-xs w-8">{i}h</span>
                        <div className="flex-1 bg-white/10 rounded-full h-4 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                            style={{width: `${percentage}%`}}
                          />
                        </div>
                        <span className="text-gray-300 text-xs w-8">{hourMessages}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Top Usuários */}
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-green-400 font-semibold mb-4">Usuários Mais Ativos</h4>
                <div className="space-y-2">
                  {Array.from(new Set(messages.map(m => m.author.username)))
                    .map(username => ({
                      username,
                      count: messages.filter(m => m.author.username === username).length
                    }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10)
                    .map((user, index) => (
                      <div key={user.username} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400 text-xs w-4">#{index + 1}</span>
                          <span className="text-green-300">{user.username}</span>
                        </div>
                        <span className="text-gray-300 text-sm">{user.count} msgs</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Mensagens em Tempo Real */}
      <div className="container mx-auto px-6 pb-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Mensagens em Tempo Real</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm">Live</span>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-400">Carregando mensagens...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400">Erro: {error}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.slice(-10).reverse().map(message => (
                <div key={message.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all hover:scale-[1.02] cursor-pointer"
                     onClick={() => setSelectedMessage(message)}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{message.author.username.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-blue-300 font-medium">{message.author.username}</span>
                          <span className="text-gray-400 text-xs">{new Date(message.timestamp).toLocaleTimeString()}</span>
                          {message.embeds && message.embeds.length > 0 && (
                            <span className="px-2 py-0.5 bg-purple-600/30 text-purple-300 text-xs rounded-full">Embed</span>
                          )}
                        </div>
                        <p className="text-gray-100 text-sm truncate">{message.content || '<Sem conteúdo>'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
