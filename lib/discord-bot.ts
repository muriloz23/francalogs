import { Client, GatewayIntentBits, ChannelType } from 'discord.js';
import { supabase } from './supabase';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const GUILD_ID = '1443298554398511227';
const CATEGORY_ID = '1466188857241243863';

client.once('ready', () => {
  console.log(`Bot logged in as ${client.user?.tag}!`);
  
  // Find the guild
  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) {
    console.error('Guild not found!');
    return;
  }

  // Get all channels in the specified category
  const channels = guild.channels.cache.filter(
    channel => channel.parentId === CATEGORY_ID && channel.type === ChannelType.GuildText
  );

  console.log(`Found ${channels.size} channels in category ${CATEGORY_ID}`);

  // Listen for messages in those channels
  client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;
    
    // Check if message is in the target category
    if (message.channel.parentId !== CATEGORY_ID) return;
    
    // Check if message is in the target guild
    if (message.guildId !== GUILD_ID) return;

    try {
      const messageData = {
        id: message.id,
        content: message.content,
        author: {
          id: message.author.id,
          username: message.author.username,
          discriminator: message.author.discriminator,
          avatar: message.author.avatar,
        },
        channel_id: message.channelId,
        guild_id: message.guildId,
        timestamp: message.createdAt.toISOString(),
        edited_timestamp: message.editedAt?.toISOString() || null,
        attachments: message.attachments.map(attachment => ({
          id: attachment.id,
          url: attachment.url,
          filename: attachment.name,
          size: attachment.size,
        })),
        embeds: message.embeds.map(embed => ({
          title: embed.title,
          description: embed.description,
          url: embed.url,
        })),
        mentions: message.mentions.users.map(user => ({
          id: user.id,
          username: user.username,
          discriminator: user.discriminator,
        })),
      };

      // Save to Supabase
      const { error } = await supabase
        .from('discord_messages')
        .insert([messageData]);

      if (error) {
        console.error('Error saving message to Supabase:', error);
      } else {
        console.log(`Saved message from ${message.author.username} in ${message.channel.name}`);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  // Fetch existing messages from channels
  channels.forEach(async (channel) => {
    if (channel.type !== ChannelType.GuildText) return;
    
    try {
      const messages = await channel.messages.fetch({ limit: 100 });
      console.log(`Fetched ${messages.size} existing messages from ${channel.name}`);
      
      // Save existing messages
      for (const message of messages.values()) {
        if (message.author.bot) continue;
        
        const messageData = {
          id: message.id,
          content: message.content,
          author: {
            id: message.author.id,
            username: message.author.username,
            discriminator: message.author.discriminator,
            avatar: message.author.avatar,
          },
          channel_id: message.channelId,
          guild_id: message.guildId,
          timestamp: message.createdAt.toISOString(),
          edited_timestamp: message.editedAt?.toISOString() || null,
          attachments: message.attachments.map(attachment => ({
            id: attachment.id,
            url: attachment.url,
            filename: attachment.name,
            size: attachment.size,
          })),
          embeds: message.embeds.map(embed => ({
            title: embed.title,
            description: embed.description,
            url: embed.url,
          })),
          mentions: message.mentions.users.map(user => ({
            id: user.id,
            username: user.username,
            discriminator: user.discriminator,
          })),
        };

        await supabase
          .from('discord_messages')
          .upsert(messageData, { onConflict: 'id' });
      }
    } catch (error) {
      console.error(`Error fetching messages from ${channel.name}:`, error);
    }
  });
});

export function startDiscordBot(token: string) {
  client.login(token);
  return client;
}

export { client };
