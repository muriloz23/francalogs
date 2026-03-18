import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Verificar se é uma mensagem do Discord
    if (body.type === 0) { // MESSAGE_CREATE
      const message = {
        id: body.id,
        content: body.content,
        author: {
          id: body.author?.id,
          username: body.author?.username,
          discriminator: body.author?.discriminator,
          avatar: body.author?.avatar,
        },
        channel_id: body.channel_id,
        guild_id: body.guild_id,
        timestamp: body.timestamp,
        edited_timestamp: body.edited_timestamp,
        attachments: body.attachments || [],
        embeds: body.embeds || [],
        mentions: body.mentions || [],
      }

      // Salvar no Supabase
      const { error } = await supabase
        .from('discord_messages')
        .insert([message])

      if (error) {
        console.error('Erro ao salvar mensagem no Supabase:', error)
        return NextResponse.json({ error: 'Erro ao salvar mensagem' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erro no webhook:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
