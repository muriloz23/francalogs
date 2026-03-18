import { NextRequest, NextResponse } from 'next/server';
import { startDiscordBot } from '@/lib/discord-bot-simple';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ error: 'Bot token is required' }, { status: 400 });
    }

    // Start the Discord bot
    const client = await startDiscordBot(token);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Discord bot started successfully',
      botId: client?.user?.id || 'bot-simple' 
    });
  } catch (error) {
    console.error('Error starting Discord bot:', error);
    return NextResponse.json({ 
      error: 'Failed to start Discord bot',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
