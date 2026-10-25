import test from 'node:test';
import assert from 'node:assert/strict';
import { formatMessageForSpeech } from '../src/text.js';

function message(content, options = {}) {
  return {
    content,
    author: { displayName: '太郎' },
    attachments: new Map(options.attachments ? [['file', {}]] : []),
    mentions: { users: new Map(), roles: new Map(), channels: new Map() },
  };
}

test('URL と Markdown を読み上げ向けに整形する', () => {
  assert.equal(formatMessageForSpeech(message('**こんにちは** https://example.com `code`')), '太郎 さん。こんにちは URL コード');
});

test('本文のない添付を読み上げる', () => {
  assert.equal(formatMessageForSpeech(message('', { attachments: true })), '太郎 さん。添付ファイル');
});
