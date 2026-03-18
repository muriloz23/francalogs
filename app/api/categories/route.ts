import { NextRequest, NextResponse } from 'next/server';

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = '1443298554398511227';

export async function GET() {
  if (!BOT_TOKEN) {
    return NextResponse.json({ error: 'Token do bot não encontrado' }, { status: 500 });
  }

  try {
    // Buscar todos os canais do servidor
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${GUILD_ID}/channels`,
      {
        headers: {
          'Authorization': `Bot ${BOT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const allChannels = await response.json();
    
    // Organizar canais por categoria real do Discord
    const categories = new Map();
    const textChannels = [];
    
    // Primeiro, identificar todas as categorias
    allChannels.forEach((channel: any) => {
      if (channel.type === 4) { // Category
        categories.set(channel.id, {
          id: channel.id,
          name: channel.name,
          type: 'category',
          channels: []
        });
      }
    });
    
    // Depois, organizar canais de texto por categoria
    allChannels.forEach((channel: any) => {
      if (channel.type === 0) { // Text channel
        const channelData = {
          id: channel.id,
          name: channel.name,
          type: 'text',
          topic: channel.topic || '',
          nsfw: channel.nsfw || false,
          position: channel.position || 0,
          parent_id: channel.parent_id
        };
        
        textChannels.push(channelData);
        
        // Associar canal à sua categoria
        if (channel.parent_id && categories.has(channel.parent_id)) {
          categories.get(channel.parent_id).channels.push(channelData);
        } else {
          // Canal sem categoria - criar categoria "Sem Categoria"
          if (!categories.has('no-category')) {
            categories.set('no-category', {
              id: 'no-category',
              name: 'Sem Categoria',
              type: 'category',
              channels: []
            });
          }
          categories.get('no-category').channels.push(channelData);
        }
      }
    });
    
    // Converter para array e ordenar
    const categoriesArray = Array.from(categories.values())
      .sort((a: any, b: any) => {
        // "Sem Categoria" sempre por último
        if (a.id === 'no-category') return 1;
        if (b.id === 'no-category') return -1;
        return 0;
      })
      .map((category: any) => ({
        ...category,
        channels: category.channels.sort((a: any, b: any) => a.position - b.position)
      }));

    return NextResponse.json({
      categories: categoriesArray,
      totalChannels: textChannels.length,
      totalCategories: categoriesArray.length
    });

  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json({ error: 'Erro ao buscar categorias do Discord' }, { status: 500 });
  }
}
