const MAX_SPOKEN_LENGTH = 180;

/** Discord の装飾を、聞き取りやすい短い日本語に整える。 */
export function formatMessageForSpeech(message) {
  let text = message.content
    .replace(/<@!?(\d+)>/g, (_, id) => message.mentions.users.get(id)?.displayName ?? 'メンション')
    .replace(/<@&(\d+)>/g, (_, id) => message.mentions.roles.get(id)?.name ?? 'ロール')
    .replace(/<#(\d+)>/g, (_, id) => message.mentions.channels.get(id)?.name ?? 'チャンネル')
    .replace(/https?:\/\/\S+/g, ' URL')
    .replace(/```[\s\S]*?```/g, ' コード')
    .replace(/`[^`]*`/g, ' コード')
    .replace(/[*_~>#|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text && message.attachments.size) text = '添付ファイル';
  if (!text) return null;
  if (text.length > MAX_SPOKEN_LENGTH) text = `${text.slice(0, MAX_SPOKEN_LENGTH)}、以下省略`;
  return `${text}`;
}
