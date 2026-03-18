"use client";
import React from 'react';

interface DiscordMessageProps {
  message: {
    id: string;
    content: string;
    author: {
      username: string;
      discriminator?: string;
      avatar?: string;
    };
    timestamp: string;
    embeds?: any[];
    attachments?: any[];
  };
}

export function DiscordMessage({ message }: DiscordMessageProps) {
  const messageDate = new Date(message.timestamp);
  const timeString = messageDate.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const dateString = messageDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  // Formatar conteúdo do Discord (markdown completo)
  const formatContent = (content: string) => {
    if (!content) return null;
    
    let formatted = content;
    
    // **negrito**
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
    
    // *itálico*
    formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    
    // __sublinhado__
    formatted = formatted.replace(/__(.*?)__/g, '<u class="underline">$1</u>');
    
    // ~~tachado~~
    formatted = formatted.replace(/~~(.*?)~~/g, '<s class="line-through">$1</s>');
    
    // `código inline`
    formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-gray-700 px-1 py-0.5 rounded text-xs font-mono text-gray-200">$1</code>');
    
    // ```código bloco``` - melhorado
    formatted = formatted.replace(/```([\s\S]*?)```/g, (match, code) => {
      // Detectar linguagem na primeira linha
      const lines = code.trim().split('\n');
      const firstLine = lines[0];
      const hasLanguage = firstLine && firstLine.length < 20 && !firstLine.includes(' ');
      
      let language = '';
      let codeContent = code;
      
      if (hasLanguage && lines.length > 1) {
        language = firstLine;
        codeContent = lines.slice(1).join('\n');
      }
      
      const langClass = language ? `language-${language}` : '';
      return `<pre class="bg-gray-900 border border-gray-700 rounded p-3 overflow-x-auto my-2"><code class="${langClass} text-sm text-gray-100 font-mono">${codeContent}</code></pre>`;
    });
    
    // @menções
    formatted = formatted.replace(/@(\w+)/g, '<span class="text-blue-400 font-medium">@$1</span>');
    
    // #canais
    formatted = formatted.replace(/#(\w+)/g, '<span class="text-blue-400 font-medium">#$1</span>');
    
    // Links automáticos
    formatted = formatted.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-blue-400 hover:underline" rel="noopener noreferrer">$1</a>');
    
    // Emojis básicos
    const emojiMap: { [key: string]: string } = {
      ':smile:': '😄',
      ':laughing:': '😆',
      ':heart:': '❤️',
      ':thumbsup:': '👍',
      ':thumbsdown:': '👎',
      ':fire:': '🔥',
      ':warning:': '⚠️',
      ':info:': 'ℹ️',
      ':check:': '✅',
      ':x:': '❌',
      ':star:': '⭐',
      ':rocket:': '🚀',
      ':gear:': '⚙️',
      ':shield:': '🛡️',
      ':hammer:': '🔨',
      ':key:': '🔑',
      ':lock:': '🔒',
      ':unlock:': '🔓',
    };
    
    Object.keys(emojiMap).forEach(emoji => {
      formatted = formatted.replace(new RegExp(emoji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), emojiMap[emoji]);
    });
    
    // Quebras de linha
    formatted = formatted.replace(/\n/g, '<br />');
    
    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  // Renderizar embeds com estilo Discord original
  const renderEmbeds = () => {
    if (!message.embeds || message.embeds.length === 0) return null;
    
    return message.embeds.map((embed, index) => (
      <div key={index} className="bg-gray-770 border-l-4 border-blue-500 p-3 rounded mb-3">
        {/* Título do embed */}
        {embed.title && (
          <div className="font-bold text-white mb-2 text-lg">
            {formatContent(embed.title)}
          </div>
        )}
        
        {/* Descrição */}
        {embed.description && (
          <div className="text-gray-300 mb-3 text-sm leading-relaxed">
            {formatContent(embed.description)}
          </div>
        )}
        
        {/* Fields */}
        {embed.fields && embed.fields.length > 0 && (
          <div className="space-y-2">
            {embed.fields.map((field: any, fieldIndex: number) => (
              <div key={fieldIndex} className="bg-gray-800 p-2 rounded">
                <div className="font-semibold text-blue-400 text-sm mb-1">
                  {formatContent(field.name)}
                </div>
                <div className="text-gray-300 text-sm">
                  {formatContent(field.value)}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Footer */}
        {embed.footer && (
          <div className="text-gray-400 text-xs mt-3 pt-2 border-t border-gray-700 flex items-center">
            {embed.footer_icon_url && (
              <img 
                src={embed.footer_icon_url} 
                alt="Footer Icon" 
                className="w-4 h-4 mr-2 rounded-full"
              />
            )}
            {embed.footer}
          </div>
        )}
        
        {/* Timestamp */}
        {embed.timestamp && (
          <div className="text-gray-400 text-xs mt-1">
            {new Date(embed.timestamp).toLocaleString('pt-BR')}
          </div>
        )}
      </div>
    ));
  };

  // Renderizar anexos
  const renderAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) return null;
    
    return message.attachments.map((attachment: any, index: number) => (
      <div key={index} className="bg-gray-770 p-2 rounded mb-2 flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-blue-400 text-sm hover:underline cursor-pointer">
            {attachment.filename || 'Anexo'}
          </div>
          {attachment.size && (
            <div className="text-gray-400 text-xs">
              {(attachment.size / 1024).toFixed(1)} KB
            </div>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="hover:bg-gray-750 px-4 py-2 transition-colors group">
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          {message.author.avatar ? (
            <img 
              src={message.author.avatar} 
              alt={message.author.username}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <span className="text-white font-semibold text-sm">
              {message.author.username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        
        {/* Conteúdo da mensagem */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-baseline space-x-2 mb-1">
            <span className="font-semibold text-white hover:underline cursor-pointer">
              {message.author.username}
            </span>
            {message.author.discriminator && message.author.discriminator !== '0' && (
              <span className="text-gray-400 text-xs">
                #{message.author.discriminator}
              </span>
            )}
            <span className="text-gray-400 text-xs">
              {timeString}
            </span>
            {(message as any).edited_timestamp && (
              <span className="text-gray-400 text-xs italic">(editado)</span>
            )}
            <span className="text-gray-500 text-xs hover:underline cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
              Hoje às {timeString}
            </span>
          </div>
          
          {/* Conteúdo formatado */}
          {message.content && (
            <div className="text-gray-100 break-words mb-2">
              {formatContent(message.content)}
            </div>
          )}
          
          {/* Embeds */}
          {renderEmbeds()}
          
          {/* Anexos */}
          {renderAttachments()}
        </div>
      </div>
    </div>
  );
}
