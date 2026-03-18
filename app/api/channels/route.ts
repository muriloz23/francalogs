import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
    const GUILD_ID = '1443298554398511227';
    const CATEGORY_ID = '1466188857241243863';

    if (!BOT_TOKEN) {
      return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 });
    }

    // Buscar canais do servidor
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
    
    // Filtrar canais da categoria específica
    const categoryChannels = allChannels.filter((channel: any) => 
      channel.type === 0 && // Text channel
      channel.parent_id === CATEGORY_ID
    );

    // Formatar resposta
    const channels = categoryChannels.map((channel: any) => ({
      id: channel.id,
      name: channel.name,
      topic: channel.topic || '',
      nsfw: channel.nsfw || false,
      position: channel.position || 0
    }));

    return NextResponse.json({ 
      success: true, 
      channels,
      total: channels.length 
    });

  } catch (error) {
    console.error('Error fetching channels:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch channels',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
