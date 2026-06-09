import TelegramBot from 'node-telegram-bot-api';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_BASE = process.env.DEGENZONE_API ?? 'https://degenzone.app';

if (!TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN env var required');
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

type ChainId = 'solana' | 'base' | 'bsc' | 'eth';

const CHAIN_ALIASES: Record<string, ChainId> = {
  solana: 'solana', sol: 'solana',
  base: 'base',
  bsc: 'bsc', bnb: 'bsc',
  eth: 'eth', ethereum: 'eth',
};

bot.onText(/\/start/, async (msg) => {
  await bot.sendMessage(
    msg.chat.id,
    `Welcome to *DegenZone* 🔥

Commands:
\`/heatmap solana\` — top movers snapshot
\`/top solana 1h\` — top 10 movers in a timeframe
\`/watch <contract>\` — alert when pump signal fires
\`/whale <contract>\` — alert on whale trades >$50K
\`/portfolio <wallet>\` — your live holdings overlay
\`/help\` — this message

Pro features (Telegram alerts, custom watchlists, audio) require a subscription at ${API_BASE}/#pricing`,
    { parse_mode: 'Markdown' }
  );
});

bot.onText(/^\/help/, async (msg) => {
  bot.emit('text', { ...msg, text: '/start' } as any);
});

bot.onText(/^\/heatmap(?:\s+(\w+))?/, async (msg, match) => {
  const chainKey = (match?.[1] ?? 'solana').toLowerCase();
  const chain = CHAIN_ALIASES[chainKey];
  if (!chain) {
    await bot.sendMessage(msg.chat.id, `Unknown chain: ${chainKey}. Try: solana, base, bsc, eth`);
    return;
  }

  await bot.sendChatAction(msg.chat.id, 'typing');
  try {
    const r = await fetch(`${API_BASE}/api/tokens?chain=${chain}&timeframe=h24`);
    const data = await r.json();
    const tokens = (data.tokens ?? []).slice(0, 10);
    const lines = [`🔥 *${chain.toUpperCase()} top 10 · 24h*\n`];
    for (const t of tokens) {
      const ch = t.priceChangePct.h24;
      const arrow = ch >= 0 ? '🟢' : '🔴';
      const sign = ch >= 0 ? '+' : '';
      lines.push(`${arrow} *${t.symbol}*  ${sign}${ch.toFixed(2)}%  ·  $${fmtCompact(t.volumeUsd.h24)}`);
    }
    lines.push(`\n${API_BASE}/app?chain=${chain}`);
    await bot.sendMessage(msg.chat.id, lines.join('\n'), { parse_mode: 'Markdown' });
  } catch (e: any) {
    await bot.sendMessage(msg.chat.id, `Error: ${e?.message ?? 'unknown'}`);
  }
});

bot.onText(/^\/top(?:\s+(\w+))?(?:\s+(\w+))?/, async (msg, match) => {
  const chainKey = (match?.[1] ?? 'solana').toLowerCase();
  const tf = (match?.[2] ?? 'h24').toLowerCase();
  const chain = CHAIN_ALIASES[chainKey];
  const tfMap: Record<string, string> = { '5m': 'm5', '1h': 'h1', '6h': 'h6', '24h': 'h24' };
  const timeframe = tfMap[tf] ?? 'h24';
  if (!chain) return bot.sendMessage(msg.chat.id, `Unknown chain: ${chainKey}`);

  await bot.sendChatAction(msg.chat.id, 'typing');
  try {
    const r = await fetch(`${API_BASE}/api/tokens?chain=${chain}&timeframe=${timeframe}`);
    const data = await r.json();
    const tokens = (data.tokens ?? [])
      .slice()
      .sort((a: any, b: any) => Math.abs(b.priceChangePct[timeframe]) - Math.abs(a.priceChangePct[timeframe]))
      .slice(0, 10);
    const lines = [`📈 *Top 10 movers · ${chain.toUpperCase()} · ${tf}*\n`];
    for (const t of tokens) {
      const ch = t.priceChangePct[timeframe];
      const arrow = ch >= 0 ? '🟢' : '🔴';
      const sign = ch >= 0 ? '+' : '';
      lines.push(`${arrow} *${t.symbol}*  ${sign}${ch.toFixed(2)}%`);
    }
    await bot.sendMessage(msg.chat.id, lines.join('\n'), { parse_mode: 'Markdown' });
  } catch (e: any) {
    await bot.sendMessage(msg.chat.id, `Error: ${e?.message ?? 'unknown'}`);
  }
});

// /watch and /whale would require a database to persist subscriptions per user.
// Scaffold endpoint shown — wire to Postgres / Redis when productionizing.
bot.onText(/^\/(watch|whale)\s+(\S+)/, async (msg, match) => {
  const kind = match?.[1];
  const contract = match?.[2];
  await bot.sendMessage(
    msg.chat.id,
    `⏳ *${kind} alert subscription* for \`${contract}\` requires a Pro account.\n\nSubscribe at ${API_BASE}/#pricing and connect this Telegram in Settings.`,
    { parse_mode: 'Markdown' }
  );
});

bot.onText(/^\/portfolio\s+(\S+)/, async (msg, match) => {
  const wallet = match?.[1];
  if (!wallet) return;
  await bot.sendChatAction(msg.chat.id, 'typing');
  try {
    const r = await fetch(`${API_BASE}/api/portfolio?wallet=${wallet}`);
    const d = await r.json();
    if (d.error) return bot.sendMessage(msg.chat.id, `Error: ${d.error}`);
    const sign = d.totalPnlUsd >= 0 ? '+' : '';
    const lines = [
      `💼 *Portfolio* \`${wallet.slice(0, 6)}…${wallet.slice(-4)}\``,
      `Value: *$${fmtCompact(d.totalUsd)}*`,
      `P&L: ${sign}$${fmtCompact(d.totalPnlUsd)} (${sign}${d.totalPnlPct.toFixed(2)}%)`,
      `Holdings: ${d.holdings.length}`,
    ];
    await bot.sendMessage(msg.chat.id, lines.join('\n'), { parse_mode: 'Markdown' });
  } catch (e: any) {
    await bot.sendMessage(msg.chat.id, `Error: ${e?.message ?? 'unknown'}`);
  }
});

function fmtCompact(n: number): string {
  if (!Number.isFinite(n)) return '—';
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (a >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (a >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toFixed(2);
}

console.log('DegenZone Telegram bot running. Commands: /start /heatmap /top /watch /whale /portfolio');
