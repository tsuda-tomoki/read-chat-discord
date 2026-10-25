import { spawn } from 'node:child_process';
import { StreamType, createAudioResource } from '@discordjs/voice';
import ffmpegPath from 'ffmpeg-static';

const baseUrl = (process.env.VOICEVOX_BASE_URL ?? 'http://127.0.0.1:50021').replace(/\/$/, '');
const speaker = Number(process.env.VOICEVOX_SPEAKER ?? 3);

export async function createSpeechResource(text) {
  const queryResponse = await fetch(`${baseUrl}/audio_query?text=${encodeURIComponent(text)}&speaker=${speaker}`, {
    method: 'POST',
  });
  if (!queryResponse.ok) throw new Error(`VOICEVOX audio_query failed: ${queryResponse.status}`);

  const synthesisResponse = await fetch(`${baseUrl}/synthesis?speaker=${speaker}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: await queryResponse.text(),
  });
  if (!synthesisResponse.ok) throw new Error(`VOICEVOX synthesis failed: ${synthesisResponse.status}`);

  if (!ffmpegPath) throw new Error('ffmpeg-static の実行ファイルが見つかりません。');

  // VOICEVOX の WAV を Discord が要求する 48kHz / stereo PCM に変換する。
  const ffmpeg = spawn(ffmpegPath, [
    '-loglevel', 'error', '-i', 'pipe:0', '-f', 's16le', '-ar', '48000', '-ac', '2', 'pipe:1',
  ], { stdio: ['pipe', 'pipe', 'pipe'] });
  ffmpeg.stderr.on('data', (chunk) => console.error(`ffmpeg: ${chunk}`));
  ffmpeg.stdin.end(Buffer.from(await synthesisResponse.arrayBuffer()));

  return createAudioResource(ffmpeg.stdout, { inputType: StreamType.Raw });
}
