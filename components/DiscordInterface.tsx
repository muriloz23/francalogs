"use client";
import React, { useState, useEffect } from 'react';
import { DiscordMessage } from './DiscordMessage';
import { useDiscordMessages } from '@/hooks/useDiscordMessages';
import { useSession, signOut } from 'next-auth/react';

export function DiscordInterface() {
  const { 
    messages, 
    loading, 
    error, 
    newMessageCount, 
    selectedChannel, 
    setSelectedChannel, 
    channels,
    channelsLoading
  } = useDiscordMessages();
  
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar mensagens por canal
  const filteredMessages = selectedChannel === 'all' 
    ? messages 
    : messages.filter(msg => msg.channel_id === selectedChannel);

  // Simular usuários digitando
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance
        const users = ['João', 'Maria', 'Carlos', 'Ana'];
        const randomUser = users[Math.floor(Math.random() * users.length)];
        setTypingUsers([randomUser]);
        
        setTimeout(() => setTypingUsers([]), 3000);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Fechar menu quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu]);

  // Filtrar canais por busca
  const filteredChannels = channels.filter(channel => 
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar mensagens por data
  const groupMessagesByDate = (messages: any[]) => {
    const groups: { [date: string]: any[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.timestamp).toLocaleDateString('pt-BR');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate(filteredMessages);

  return (
    <div className="w-full h-full max-w-6xl mx-auto bg-gray-900 flex rounded-lg overflow-hidden shadow-2xl">
      {/* Sidebar - Lista de Canais */}
      <div className="w-60 bg-gray-800 flex flex-col h-full">
        {/* Header do Servidor */}
        <div className="h-12 bg-gray-900 border-b border-gray-700 flex items-center px-4 flex-shrink-0">
          <svg className="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-white font-semibold">França Logs</span>
          <svg className="w-4 h-4 text-gray-400 ml-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Canais */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-2 py-2">
            {/* Campo de busca */}
            <div className="mb-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Procurar canais..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-700 text-white text-sm px-8 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-2 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-white"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            <div className="text-gray-400 uppercase text-xs font-semibold mb-1 px-2">CANAIS</div>
            
            <div className="space-y-1">
              <button
                onClick={() => setSelectedChannel('all')}
                className={`w-full flex items-center px-2 py-1 rounded text-sm hover:bg-gray-700 ${
                  selectedChannel === 'all' ? 'bg-gray-700 text-white' : 'text-gray-400'
                }`}
              >
                <span className="mr-2">#</span>
                todos-os-canais
              </button>
              
              {filteredChannels.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={`w-full flex items-center px-2 py-1 rounded text-sm hover:bg-gray-700 ${
                    selectedChannel === channel.id ? 'bg-gray-700 text-white' : 'text-gray-400'
                  }`}
                >
                  <span className="mr-2">#</span>
                  {channel.name}
                </button>
              ))}
              
              {filteredChannels.length === 0 && searchTerm && (
                <div className="text-gray-500 text-sm px-2 py-2 text-center">
                  Nenhum canal encontrado para "{searchTerm}"
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="h-14 bg-gray-850 border-t border-gray-700 flex items-center px-4 flex-shrink-0 relative">
          {/* Avatar do usuário */}
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center mr-2 overflow-hidden">
            {session?.user?.image ? (
              <img 
                src={session.user.image} 
                alt={session.user.name || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-sm font-bold">
                {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          
          {/* Info do usuário */}
          <div className="flex-1 cursor-pointer" onClick={() => setShowUserMenu(!showUserMenu)}>
            <div className="text-white text-sm font-semibold">
              {session?.user?.name || 'Usuário'}
            </div>
            <div className="text-gray-400 text-xs">
              {(session?.user as any)?.discriminator ? `#${(session?.user as any).discriminator}` : '#0001'}
            </div>
          </div>
          
          {/* Menu de usuário */}
          <div className="relative">
            <button 
              className="text-gray-400 hover:text-white p-1"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            
            {/* Dropdown menu */}
            {showUserMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1 z-50">
                <div className="px-3 py-2 border-b border-gray-700">
                  <div className="text-white text-sm font-semibold">
                    {session?.user?.name || 'Usuário'}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {(session?.user as any)?.discriminator ? `#${(session?.user as any).discriminator}` : '#0001'}
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="w-full text-left px-3 py-2 text-red-400 hover:bg-gray-700 text-sm flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sair</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-850 h-full">
        {/* Header do Canal */}
        <div className="h-12 bg-gray-850 border-b border-gray-700 flex items-center px-4 flex-shrink-0">
          <span className="text-gray-400 mr-2">#</span>
          <span className="text-white font-semibold">
            {selectedChannel === 'all' ? 'todos-os-canais' : channels.find(c => c.id === selectedChannel)?.name || 'canal'}
          </span>
          <div className="ml-auto flex items-center space-x-4">
            <button className="text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287-.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287.947c-.379-1.561-2.6-1.561-2.978 0z" clipRule="evenodd" />
                <path d="M14.857 17.952l-2.571-1.429-2.571 1.429a1 1 0 01-1.429-1.429l.571-2.857-2.143-2.143a1 1 0 01.571-1.714l2.857-.571 1.429-2.571a1 1 0 011.714 0l1.429 2.571 2.857.571a1 1 0 01.571 1.714l-2.143 2.143.571 2.857a1 1 0 01-1.429 1.429z" />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Área de Mensagens */}
        <div className="flex-1 overflow-y-auto bg-gray-850" id="messages-container">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <div className="text-gray-400">Carregando mensagens...</div>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-red-400 mb-2">❌ Erro ao carregar mensagens</div>
                <div className="text-gray-400 text-sm">{error}</div>
              </div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-gray-400 mb-2">
                  {selectedChannel === 'all' ? 'Nenhuma mensagem encontrada' : 'Nenhuma mensagem neste canal'}
                </div>
                <div className="text-gray-500 text-sm">Seja o primeiro a conversar!</div>
              </div>
            </div>
          ) : (
            <div className="py-4">
              {Object.entries(messageGroups).map(([date, dateMessages]) => (
                <div key={date}>
                  {/* Separador de data */}
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-gray-700 px-3 py-1 rounded-full">
                      <span className="text-gray-300 text-xs font-semibold">{date}</span>
                    </div>
                  </div>
                  
                  {/* Mensagens do dia */}
                  {dateMessages.map((message) => (
                    <DiscordMessage key={message.id} message={message} />
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Indicador de usuários digitando */}
          {typingUsers.length > 0 && (
            <div className="px-4 py-2 bg-gray-850 border-t border-gray-700">
              <div className="flex items-center text-gray-400 text-sm">
                <div className="flex space-x-1 mr-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span>
                  {typingUsers.join(', ')} {typingUsers.length === 1 ? 'está digitando...' : 'estão digitando...'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Área de Input */}
        <div className="h-16 bg-gray-850 border-t border-gray-700 px-4 flex items-center">
          <div className="flex items-center bg-gray-700 rounded-full px-4 py-2 flex-1">
            <button className="text-gray-400 mr-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
              </svg>
            </button>
            <input
              type="text"
              placeholder={`Mensagem #${selectedChannel === 'all' ? 'todos-os-canais' : channels.find(c => c.id === selectedChannel)?.name || 'canal'}`}
              className="bg-transparent flex-1 text-white placeholder-gray-400 outline-none"
              disabled
            />
            <div className="flex items-center space-x-2 ml-3">
              <button className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notificações */}
      {newMessageCount > 0 && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse">
          <span className="font-semibold">{newMessageCount}</span>
          <span>novas mensagens</span>
        </div>
      )}
    </div>
  );
}
