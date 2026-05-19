# MktVision — Markets Terminal

A Bloomberg-style real-time markets dashboard built with React, deployed on Cloudflare Pages with serverless Workers proxying live financial data.

> **Live demo:** [mktvision.pages.dev](https://mktvision.pages.dev)

![MktVision Dashboard](screenshot.png)

---

## Features

- **Live US equities** — real-time quotes for AAPL, MSFT, NVDA, TSLA, GOOGL, AMZN via Finnhub
- **Live Indian NSE stocks** — top 8 NSE stocks via Twelve Data
- **Live crypto** — top 8 by market cap with 30-day price charts via CoinGecko (no key required)
- **Live market indices** — S&P 500, NASDAQ, DOW, VIX via ETF proxies (SPY/QQQ/DIA/UVXY)
- **Universal search** — search any US ticker or NSE stock, routes to the right data source automatically
- **30-day price charts** — area charts for all assets using Recharts
- **Real-time clock** — live EST clock in the header
- **Auto-refresh** — all data refreshes every 60 seconds

---

## Architecture

```
Browser
   │
   ├── /api/stocks?symbols=AAPL,MSFT    ──▶  Cloudflare Worker  ──▶  Finnhub API
   ├── /api/indices                      ──▶  Cloudflare Worker  ──▶  Finnhub API (ETF proxies)
   ├── /api/indian?symbol=RELIANCE       ──▶  Cloudflare Worker  ──▶  Twelve Data API
   ├── /api/search?q=apple               ──▶  Cloudflare Worker  ──▶  Finnhub + Twelve Data
   └── CoinGecko API                     ──▶  Direct (no key needed)
```

API keys live exclusively in Cloudflare's environment variables — never shipped in the client bundle.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Recharts |
| Build | Vite |
| Hosting | Cloudflare Pages |
| API proxy | Cloudflare Pages Functions (Workers) |
| US stock data | [Finnhub](https://finnhub.io) (free tier) |
| Indian NSE data | [Twelve Data](https://twelvedata.com) (free tier) |
| Crypto data | [CoinGecko](https://coingecko.com) (public API) |

---

## Security

- **No API keys in the frontend bundle** — all keys are server-side in Cloudflare Workers
- **Origin locking** — Worker rejects requests from any domain other than the Pages URL
- **Input sanitization** — all symbol inputs are sanitized and validated before reaching external APIs
- **Server-side caching** — Cloudflare Workers Cache API prevents rate limit abuse
- **Secrets** — keys stored as encrypted Secrets in Cloudflare, never visible after creation

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- A [Cloudflare](https://cloudflare.com) account (free)
- A [Finnhub](https://finnhub.io) API key (free)
- A [Twelve Data](https://twelvedata.com) API key (free)

### Local development

```bash
git clone https://github.com/evans-0/finance
cd finance
npm install
npm run dev
```

> Indian stock data and indices won't load locally without running `wrangler pages dev`. US stocks and crypto work out of the box.

### Deployment

1. Push to GitHub
2. Connect the repo to [Cloudflare Pages](https://pages.cloudflare.com)
3. Set build command: `npm run build`, output directory: `dist`
4. Add environment variables under **Settings → Environment Variables**:

| Variable | Type | Value |
|---|---|---|
| `FINNHUB_KEY` | Secret | Your Finnhub API key |
| `TWELVEDATA_KEY` | Secret | Your Twelve Data API key |
| `ALLOWED_ORIGIN` | Plaintext | `https://your-project.pages.dev` |

5. Redeploy — Cloudflare auto-deploys on every `git push` after setup

---

## Project Structure

```
├── functions/
│   └── api/
│       ├── stocks.js      # US equity quotes → Finnhub
│       ├── indices.js     # Market indices → Finnhub (ETF proxies)
│       ├── indian.js      # NSE stock quotes → Twelve Data
│       └── search.js      # Symbol search → Finnhub + Twelve Data
├── src/
│   ├── FinanceDashboard.jsx   # Main dashboard component
│   └── main.jsx               # React entry point
├── index.html
├── package.json
└── vite.config.js
```

---

## Known Limitations

- **Stock chart data is simulated** — Finnhub historical candles require a paid plan. Charts use a random walk seeded from the live price, so the shape is illustrative rather than accurate.
- **NSE search coverage** — Twelve Data free tier covers NIFTY 50 and major indices. Less liquid NSE stocks may not be available.
- **Indian stock refresh rate** — NSE prices update every 15 minutes (vs 60 seconds for US stocks) to stay within Twelve Data's 800 credits/day free tier limit.
- **Index absolute values not shown** — Finnhub free tier doesn't expose `^GSPC` etc. ETF proxies (SPY/QQQ/DIA) provide accurate percentage change but not the raw index level.

---

## License

MIT
