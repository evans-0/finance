# MktVision — Markets Terminal

A Bloomberg-style real-time markets dashboard with financial calculators. Built with React, deployed on Cloudflare Pages with serverless Workers proxying live financial data.

> **Live:** [mkt-vision.com](https://mkt-vision.com) · **Terminal:** [mkt-vision.com/dashboard](https://mkt-vision.com/dashboard)

![MktVision Dashboard](screenshot.png)

---

## Features

### Markets Terminal
- **Live US equities** — real-time quotes for AAPL, MSFT, NVDA, TSLA, GOOGL, AMZN via Finnhub
- **Live Indian NSE stocks** — top 8 NSE stocks with ₹ prices via Twelve Data
- **Live crypto** — top 8 by market cap with 30-day price charts via CoinGecko
- **Live market indices** — S&P 500, NASDAQ, DOW, VIX percentage changes via ETF proxies
- **Universal search** — search any US ticker or NSE stock in one box
- **30-day price charts** — area charts for all assets using Recharts
- **Auto-refresh** — all data refreshes every 60 seconds

> **Note:** 30-day stock charts are simulated — Finnhub historical data requires a paid plan. Current prices, % change, high/low and all other data is live.

### Financial Calculators
- **SIP Calculator** — future value of systematic investments with growth chart
- **EMI Calculator** — loan repayments with yearly amortization breakdown
- **Compound Interest** — compare annual, quarterly and monthly compounding
- **Stock Returns** — P&L, absolute return and CAGR including brokerage costs
- **Portfolio Allocator** — visualise holdings with a pie chart
- **Options P&L** — call/put payoff diagram with breakeven and key levels

---

## Architecture

```
Browser
   │
   ├── /api/stocks?symbols=AAPL,MSFT    ──▶  Cloudflare Worker  ──▶  Finnhub API
   ├── /api/indices                      ──▶  Cloudflare Worker  ──▶  Finnhub API (ETF proxies)
   ├── /api/indian?symbol=RELIANCE       ──▶  Cloudflare Worker  ──▶  Twelve Data API
   ├── /api/search?q=apple               ──▶  Cloudflare Worker  ──▶  Finnhub + Twelve Data
   ├── /api/news?symbol=AAPL             ──▶  Cloudflare Worker  ──▶  Finnhub News API
   └── CoinGecko API                     ──▶  Direct (no key needed)
```

API keys live exclusively in Cloudflare's environment variables — never shipped in the client bundle.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Recharts |
| Build | Vite |
| Hosting | Cloudflare Pages |
| API proxy | Cloudflare Pages Functions (Workers) |
| US stock data | [Finnhub](https://finnhub.io) (free tier) |
| Indian NSE data | [Twelve Data](https://twelvedata.com) (free tier) |
| Crypto data | [CoinGecko](https://coingecko.com) (public API) |

---

## Security

- **No API keys in the frontend bundle** — all keys are server-side in Cloudflare Workers
- **Origin locking** — Worker rejects requests from any domain other than `mkt-vision.com`
- **Input sanitization** — all symbol inputs sanitized and validated before reaching external APIs
- **Server-side caching** — Cloudflare Workers Cache API prevents rate limit abuse
- **Secrets** — keys stored as encrypted Secrets in Cloudflare, never visible after creation

---

## Project Structure

```
├── functions/
│   └── api/
│       ├── stocks.js      # US equity quotes → Finnhub
│       ├── indices.js     # Market indices → Finnhub (ETF proxies)
│       ├── indian.js      # NSE stock quotes → Twelve Data
│       ├── search.js      # Symbol search → Finnhub + Twelve Data
│       └── news.js        # Market news → Finnhub
├── src/
│   ├── components/
│   │   └── Navbar.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Dashboard.jsx
│   │   ├── CalculatorsHub.jsx
│   │   └── calculators/
│   │       ├── SIP.jsx
│   │       ├── EMI.jsx
│   │       ├── Compound.jsx
│   │       ├── StockReturn.jsx
│   │       ├── Portfolio.jsx
│   │       └── Options.jsx
│   ├── App.jsx
│   ├── FinanceDashboard.jsx
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

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

### Deployment

1. Push to GitHub
2. Connect repo to [Cloudflare Pages](https://pages.cloudflare.com)
3. Build command: `npm run build` · Output directory: `dist`
4. Add environment variables under **Settings → Environment Variables**:

| Variable | Type | Value |
|---|---|---|
| `FINNHUB_KEY` | Secret | Your Finnhub API key |
| `TWELVEDATA_KEY` | Secret | Your Twelve Data API key |
| `ALLOWED_ORIGIN` | Plaintext | `https://mkt-vision.com` |

5. Redeploy — Cloudflare auto-deploys on every `git push`

---

## Known Limitations

- **Stock chart data is simulated** — Finnhub historical candles require a paid plan. Charts use a seeded random walk from the live price.
- **NSE search coverage** — Twelve Data free tier covers major NSE stocks. Less liquid tickers may not be available.
- **Indian stock refresh rate** — NSE prices update every 15 minutes to stay within Twelve Data's 800 credits/day free tier limit.
- **Index absolute values** — Finnhub free tier returns zero for `^GSPC` etc. ETF proxies (SPY/QQQ/DIA) show accurate percentage change only.

---

## License

MIT
