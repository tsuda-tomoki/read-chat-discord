# Discord チャット読み上げ Bot

Discord のテキストチャットを、参加中のボイスチャンネルへ日本語で読み上げる Bot です。

`/join` を実行した**テキストチャンネルだけ**を読み上げます。各サーバーにつき 1 セッションで、メッセージは最大 180 文字・待機列は 20 件までです。

## 必要なもの

- Node.js 24.17 以上
- Discord Bot のトークンと Application ID
- [VOICEVOX Engine](https://github.com/VOICEVOX/voicevox_engine)（ローカルで起動）

## セットアップ

```bash
npm install
cp .env.example .env
```

`.env` に Discord Developer Portal の `DISCORD_TOKEN`、`DISCORD_CLIENT_ID`、開発用サーバーの `DISCORD_GUILD_ID` を設定してください。VOICEVOX Engine は既定で `http://127.0.0.1:50021` を使います。Docker で起動する例は次のとおりです。

```bash
docker run --rm -p 127.0.0.1:50021:50021 voicevox/voicevox_engine:cpu-ubuntu20.04-latest
```

次にコマンドを登録して Bot を起動します。

```bash
npm run register
npm start
```

## Discord 側の設定

Developer Portal の **Bot** ページで **Message Content Intent** を有効にしてください。招待 URL を作る際は Scopes に `bot` と `applications.commands` を選び、Bot Permissions に少なくとも以下を与えます。

- View Channels
- Send Messages
- Connect
- Speak

Bot を招待後、読み上げたい人がボイスチャンネルに参加して、対象のテキストチャンネルで `/join` を実行します。`/leave` で終了、`/status` で状態確認ができます。

## 動作確認

```bash
npm test
```

VOICEVOX が起動していない場合、Bot は接続できますが音声合成時にエラーをログへ出します。

## VC に接続できない場合

依存関係の状態は次で確認できます。

```bash
npm run diagnose
```

さらに `.env` の `VOICE_DEBUG=true` を指定して Bot を再起動すると、Discord の音声接続の詳細をターミナルに出力します。VCの個別権限で Bot に `View Channel`、`Connect`、`Speak` が許可されていることも確認してください。
