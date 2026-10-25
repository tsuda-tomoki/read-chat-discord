import 'dotenv/config';
import { Client, Events, GatewayIntentBits, MessageFlags } from 'discord.js';
import { GuildSession } from './session.js';
import { formatMessageForSpeech } from './text.js';

if (!process.env.DISCORD_TOKEN) throw new Error('DISCORD_TOKEN を .env に設定してください。');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates],
});
const sessions = new Map();

client.once(Events.ClientReady, (readyClient) => console.log(`ログインしました: ${readyClient.user.tag}`));
client.on(Events.Error, (error) => console.error('Discord client error', error));

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand() || !interaction.guildId) return;

  if (interaction.commandName === 'join') {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({ content: '先にボイスチャンネルへ参加してください。', flags: MessageFlags.Ephemeral });
    }
    // Voice Gateway 接続は数秒以上かかる場合がある。先に 3 秒以内の応答を返す。
    await interaction.deferReply();
    const existing = sessions.get(interaction.guildId);
    existing?.destroy();
    const session = new GuildSession(interaction.guildId, interaction.channelId);
    try {
      await session.connect(voiceChannel);
      sessions.set(interaction.guildId, session);
      await interaction.editReply(`参加しました。${interaction.channel} のメッセージを読み上げます。`);
    } catch (error) {
      session.destroy();
      console.error('voice connection error', error);
      await interaction.editReply('ボイスチャンネルに接続できませんでした。Bot の Connect / Speak 権限と、VCのチャンネル権限を確認してください。');
    }
    return;
  }

  const session = sessions.get(interaction.guildId);
  if (interaction.commandName === 'leave') {
    if (!session) return interaction.reply({ content: '現在、読み上げていません。', flags: MessageFlags.Ephemeral });
    session.destroy();
    sessions.delete(interaction.guildId);
    return interaction.reply('読み上げを終了しました。');
  }
  if (interaction.commandName === 'status') {
    return interaction.reply(session
      ? `読み上げ中: <#${session.textChannelId}>（待機 ${session.queue.length} 件）`
      : '現在、読み上げていません。');
  }
});

client.on(Events.MessageCreate, (message) => {
  if (!message.guildId || message.author.bot) return;
  const session = sessions.get(message.guildId);
  if (!session || session.textChannelId !== message.channelId) return;
  const text = formatMessageForSpeech(message);
  if (text) session.enqueue(text);
});

client.login(process.env.DISCORD_TOKEN);
