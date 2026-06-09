# DegenZone

Real-time DEX market intelligence — see what's pumping, what's rotating, and what
smart money is buying across Solana, Base, BSC, and Ethereum.

```
┌─────────────────────────────────────────────────────────┐
│  Solana · Base · BSC · ETH      live · 5s ago          │
│  $2.4B 24h · ↑58 ↓22 · 🧠7 smart · ⚡3 pump · 💎5 whale │
├─────────────────────────────────────────────────────────┤
│         WIF +18%        PEPE +12%       POPCAT +22%     │
│         (cyan border)                   (pump pulse)    │
│         BONK +8%        JTO -3%                         │
│         TRUMP +5%       ORCA -1%        JUP +4%         │
└─────────────────────────────────────────────────────────┘
```

## Routes

| URL | What |
|---|---|
| `/`              | Marketing landing page |
| `/app`           | The real-time heatmap |
| `/api/tokens`    | Top-100 tokens with narrative + smart-money enrichment |
| `/api/portfolio` | Real Solana wallet holdings via RPC |
| `/api/snapshot`  | Time Machine — compare to N minutes ago |
| `/api/ohlcv`     | Per-pool 48h OHLCV for sparklines |
| `/api/poller`    | Smart-money poller stats (GET) and manual trigger (POST) |
| `/api/health`    | Provider status, uptime, snapshot counts |

## Requirements

- **Node 20 LTS** recommended (Node 18.18+ works but is past EOL)
- Build tools for `better-sqlite3` native module (`build-essential` on Debian/Ubuntu)

## Deploy on a VPS

```bash
# One-time
git clone https://github.com/fourtisf/degenzone.git /var/www/degenzone
cd /var/www/degenzone

# Pin to the recommended Node version (creates fresh node_modules with correct ABI)
nvm install 20 && nvm use 20

npm install
npm run build

# Start with pm2 — instrumentation hook boots the smart-money poller automatically
pm2 start npm --name degenzone -- start
pm2 save
pm2 startup   # follow printed instructions once

# Nginx reverse proxy
sudo tee /etc/nginx/sites-available/degenzone > /dev/null <<'EOF'
server {
    listen 80 default_server;
    server_name _;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
EOF
sudo ln -sf /etc/nginx/sites-available/degenzone /etc/nginx/sites-enabled/degenzone
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

## Setting up the domain (degenzone.com)

### 1. Buy the domain (5 min)

Cheapest option for `.com`:
- **Cloudflare Registrar** (~$10/yr, wholesale price, free DNS, free DDoS proxy)
- Namecheap (~$10–13/yr)
- Porkbun (~$10/yr, cheapest for non-com TLDs too)

If `degenzone.com` is taken, fallbacks that fit the brand:
- `degenzone.app` (~$15/yr) — modern, premium feel
- `degenzone.io` (~$30/yr) — crypto-native
- `degenzone.xyz` (~$2/yr) — cheap

### 2. Point DNS to your VPS (2 min)

In your registrar's DNS panel, add:

```
Type   Name   Value             TTL    Proxy (Cloudflare only)
A      @      187.77.117.226    Auto   DNS only (orange off)
A      www    187.77.117.226    Auto   DNS only (orange off)
```

(Turn Cloudflare proxy off initially so certbot can verify — re-enable after SSL.)

Wait 1–10 minutes for propagation. Verify:

```bash
dig +short degenzone.com    # should return 187.77.117.226
```

### 3. Update nginx + SSL (5 min)

```bash
# Update nginx server_name
sudo sed -i 's/server_name _;/server_name degenzone.com www.degenzone.com;/' \
  /etc/nginx/sites-available/degenzone

sudo nginx -t && sudo systemctl reload nginx

# Install certbot if needed
sudo apt update && sudo apt install -y certbot python3-certbot-nginx

# Issue cert + auto-update nginx
sudo certbot --nginx -d degenzone.com -d www.degenzone.com \
  --agree-tos --email you@example.com --redirect --non-interactive

# Verify auto-renew is scheduled
sudo systemctl list-timers | grep certbot
```

### 4. Tell the app about its public URL

```bash
pm2 restart degenzone --update-env \
  NEXT_PUBLIC_SITE_URL=https://degenzone.com
```

This propagates to:
- `<link rel="canonical">` in HTML head
- Open Graph `url` and image
- `sitemap.xml` URLs
- `robots.txt` `Host` directive

### 5. Verify everything works

```bash
curl -I https://degenzone.com                 # 200 OK
curl https://degenzone.com/robots.txt          # should reference degenzone.com
curl https://degenzone.com/sitemap.xml         # absolute URLs
curl -I https://degenzone.com/og               # image/png, ~50KB
curl -I https://degenzone.com/icon.svg         # image/svg+xml
```

Then drop the URL in https://cards-dev.twitter.com/validator or share it
in a Telegram/Discord — should preview the OG card.

### 6. (Optional) Cloudflare proxy

After certbot succeeds, you can enable Cloudflare's orange-cloud proxy on
the A records for free DDoS protection + edge caching. Make sure SSL/TLS
mode is set to **Full (strict)** in Cloudflare so it validates the
certbot cert.

## Update flow

```bash
cd /var/www/degenzone
git pull
npm install            # if dependencies changed
npm run build
pm2 restart degenzone
pm2 logs degenzone --lines 20 --nostream
```

## Environment variables

| Var | Default | Notes |
|---|---|---|
| `SOLANA_RPC_URL`      | (uses public RPCs) | Set to your Helius/QuickNode/Triton endpoint for higher rate limits |
| `SMART_WALLETS_JSON`  | (built-in list)    | JSON array `[{"alias","address","weight"}]` to override the whale list |
| `DZ_DB_DIR`           | `/tmp/degenzone-db` | Where SQLite stores `app.db` |
| `DZ_SNAPSHOT_DIR`     | `/tmp/degenzone-snapshots` | Time Machine snapshot files |
| `PORT`                | `3000`             | Next.js port |

For pm2:

```bash
pm2 restart degenzone --update-env \
  -e SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY \
  -e SMART_WALLETS_JSON='[{"alias":"Cented","address":"REAL_ADDR","weight":1.0}]'
```

## Architecture

```
┌────────────────────────────────────────────────────┐
│ instrumentation.ts → boots smart-money-poller     │
│           ↓ every 90s                              │
│ ┌──────────────────────────────────────────────┐  │
│ │ smart-money-poller                            │  │
│ │   getSignaturesForAddress(whale, until=cur)   │  │
│ │   getParsedTransaction(sig)                   │  │
│ │   diff pre/post token balances                │  │
│ │   recordBuy(...)  →  SQLite                   │  │
│ └──────────────────────────────────────────────┘  │
│                                                    │
│ ┌──────────────────────────────────────────────┐  │
│ │ /api/tokens  (every 15s, polled by client)   │  │
│ │   GeckoTerminal /pools (×12 pages)            │  │
│ │   ↓ filter (mcap, age, %change, txns)         │  │
│ │   ↓ dedup by symbol (anti-imitation)          │  │
│ │   ↓ enrich (narrative + smart-money DB)       │  │
│ │   ↓ recordSnapshot → file                     │  │
│ │   → top-100 tokens                            │  │
│ └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

## Telegram bot

See `bot/README.md`. Requires `TELEGRAM_BOT_TOKEN` from @BotFather. Run as a
separate pm2 process.

## Verifying the backend is alive

```bash
# Smart-money poller heartbeat
curl http://localhost:3000/api/poller

# Real wallet portfolio (paste any active Solana address)
curl "http://localhost:3000/api/portfolio?wallet=GDfnEsia2WLAW5t8yx2X5j2mkfA74i5kwGdDuZHt7XmG"

# Token list (should include narrativeId and smartScore per token)
curl http://localhost:3000/api/tokens?chain=solana | head -c 400

# Inspect captured smart-money events
sqlite3 /tmp/degenzone-db/app.db \
  "SELECT wallet_alias, mint, side, ROUND(amount,2), datetime(block_time,'unixepoch')
   FROM smart_buys ORDER BY block_time DESC LIMIT 20;"
```

## Known limitations

- Smart-money score covers Solana only (EVM chains will follow).
- Default whale list is a placeholder. Replace via `SMART_WALLETS_JSON`.
- Public Solana RPCs are rate-limited; production should use a dedicated RPC.
- No user accounts / billing / API keys yet — everything is open for now.
