import {
  AudioPlayerStatus,
  NoSubscriberBehavior,
  VoiceConnectionStatus,
  createAudioPlayer,
  entersState,
  getVoiceConnection,
  joinVoiceChannel,
} from '@discordjs/voice';
import { createSpeechResource } from './voicevox.js';

export class GuildSession {
  constructor(guildId, textChannelId) {
    this.guildId = guildId;
    this.textChannelId = textChannelId;
    this.player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
    this.queue = [];
    this.playing = false;
    this.player.on(AudioPlayerStatus.Idle, () => this.playNext());
    this.player.on('error', (error) => {
      console.error(`[${this.guildId}] audio player error`, error);
      this.playNext();
    });
  }

  async connect(channel) {
    this.connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      // 音声を受信しないため、不要な受信ストリームを作らない。
      selfDeaf: true,
      debug: process.env.VOICE_DEBUG === 'true',
    });
    this.connection.on('stateChange', (oldState, newState) => {
      console.log(`[${this.guildId}] voice: ${oldState.status} -> ${newState.status}`);
    });
    this.connection.on('debug', (message) => console.debug(`[${this.guildId}] voice debug: ${message}`));
    this.connection.on('error', (error) => console.error(`[${this.guildId}] voice error`, error));
    this.connection.subscribe(this.player);
    await entersState(this.connection, VoiceConnectionStatus.Ready, 20_000);
  }

  enqueue(text) {
    // 混雑時に読み上げが数分遅れないよう、待ち行列に上限を設ける。
    if (this.queue.length >= 20) return false;
    this.queue.push(text);
    if (!this.playing) this.playNext();
    return true;
  }

  async playNext() {
    const text = this.queue.shift();
    if (!text) {
      this.playing = false;
      return;
    }
    this.playing = true;
    try {
      this.player.play(await createSpeechResource(text));
    } catch (error) {
      console.error(`[${this.guildId}] speech synthesis error`, error);
      this.playNext();
    }
  }

  destroy() {
    this.queue = [];
    this.player.stop();
    getVoiceConnection(this.guildId)?.destroy();
  }
}
