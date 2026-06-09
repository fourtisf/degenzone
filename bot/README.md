# DegenZone Telegram bot

Bot scaffold. Deploy alongside the main app or on a separate small VPS.

## Setup

1. Get a bot token from [@BotFather](https://t.me/BotFather):
   - `/newbot`
   - Name: `DegenZone`
   - Username: `@degenzone_bot`
   - Copy the token.

2. On your server:

```bash
cd /var/www/degenzone/bot
npm install
export TELEGRAM_BOT_TOKEN="123456:ABC..."
export DEGENZONE_API="http://localhost:3000"   # or your public URL
pm2 start "npm start" --name degenzone-bot
pm2 save
```

3. Test in Telegram:
   - `/start` — welcome
   - `/heatmap solana` — top 10 movers
   - `/top solana 1h` — top movers in 1h timeframe
   - `/portfolio <wallet>` — portfolio overlay

## Production checklist

- [ ] `/watch <CA>` requires a Postgres or Redis-backed subscription store (currently scaffolded only)
- [ ] Alert worker: cron job that polls `/api/tokens` every 30s, computes pump signals, fans out to subscribed users
- [ ] Rate limiting per user (Telegram allows 30 msg/sec to different chats)
- [ ] Image rendering: use `@vercel/og` or Puppeteer to render heatmap PNGs for `/heatmap` instead of text
- [ ] Pro tier gate: check user subscription before activating `/watch` / `/whale` / alert delivery
