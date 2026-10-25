import { SlashCommandBuilder } from 'discord.js';

export const commands = [
  new SlashCommandBuilder().setName('join').setDescription('参加中のボイスチャンネルで、このチャンネルを読み上げます'),
  new SlashCommandBuilder().setName('leave').setDescription('読み上げを終了してボイスチャンネルから退出します'),
  new SlashCommandBuilder().setName('status').setDescription('読み上げの状態を表示します'),
].map((command) => command.toJSON());
