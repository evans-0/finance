# MktVision — Markets Terminal & Financial Hub

A Bloomberg-style real-time markets terminal combined with a financial literacy hub. Built with React, deployed on Cloudflare Pages with serverless Workers proxying live financial data.

> **Live:** [mkt-vision.com](https://mkt-vision.com) · **Terminal:** [mkt-vision.com/dashboard](https://mkt-vision.com/dashboard)

[![Deployed on Cloudflare Pages](https://img.shields.io/badge/deployed-cloudflare%20pages-orange?logo=cloudflare&logoColor=white)](https://mkt-vision.com)

![MktVision Dashboard](screenshot.png)

---

## Features

### Homepage
- Live ticker — S&P 500, NASDAQ 100, BTC, ETH, Gold updating every 60 seconds
- Rotating finance quotes from Buffett, Munger, Graham and others

### Markets Terminal (`/dashboard`)
- **Live US equities** — AAPL, MSFT, NVDA, TSLA, GOOGL, AMZN via Finnhub (polling every 60s)
- **Real historical charts** — 5D (hourly), 1M, 3M, 6M, 1Y, Custom via Polygon.io. SIMULATED badge on non-real charts
- **Live Indian NSE** — INFY via Twelve Data (free tier limitation)
- **Live crypto** — top 8 by market cap with 30-day charts via CoinGecko
- **Market indices** — S&P 500, NASDAQ, DOW, VIX via ETF proxies (SPY/QQQ/DIA)
- **Universal search** — US ticker (Finnhub) + NSE (Twelve Data) in one box
- **Market news** — Bing RSS with Finnhub fallback
- **Mobile responsive** — tap stock → full detail, ← BACK to list

### Financial Calculators (`/calculators`)

| Calculator | Key Features |
|---|---|
| **SIP** | Step-up SIP, expense ratio, lumpsum, growth chart |
| **EMI** | Loan repayments, yearly amortization chart |
| **Compound Interest** | Compare 4 compounding frequencies |
| **Stock Returns** | P&L, absolute return, CAGR, brokerage |
| **Portfolio Allocator** | Holdings pie chart |
| **Options P&L** | Call/put payoff diagram, breakeven |
| **Net Worth** | Assets vs liabilities, allocation charts |
| **Credit Card** | Minimum payment trap, true cost of debt |
| **Inflation Impact** | Purchasing power decay, goal inflator |
| **FD vs Mutual Fund** | Post-tax, inflation-adjusted, breakeven CAGR |
| **ULIP vs Term + MF** | Charges breakdown, mortality cost by age |
| **Buy vs Rent** | Opportunity cost of down payment, tax benefits (US + India), net worth trajectory |
| **FIRE** | Lean/Regular/Fat FIRE numbers, inflation-adjusted corpus, Coast FIRE age, corpus trajectory |
| **Future Net Worth** | Full balance sheet projection — each asset at its own return rate, liabilities amortise via EMI |
| **SWP** | Monthly withdrawal simulation, corpus depletion chart, inflation-adjusted withdrawals, 4% rule context |
| **Loan Prepayment vs Invest** | Lump sum and monthly modes, interest saved vs corpus built, break-even return rate, crossover chart |
| **Goal-based SIP** | Inflation-adjusted goal, reverse SIP calculation, lumpsum offset, corpus vs goal chart |

### Financial Education

#### Start Here (`/start-here`)
- Guided onboarding for new investors — 7 expandable steps in the right order
- Profile picker (first job / saves but doesn't invest / has debt / already investing) personalises which steps to prioritise
- Interactive demos: compounding visualiser, emergency fund checker, SIP starter
- Links to relevant calculators and glossary terms at each step

#### Glossary (`/glossary`)
- 62 terms across 8 categories, searchable and filterable
- **AI-powered deep dives** — clicking any term generates a full explainer via Cloudflare AI (Llama 3.3 70B): plain English explanation, worked rupee example, common mistakes, related term chips, calculator link
- Responses edge-cached 24 hours — no repeat AI calls for the same term

#### How Markets Work (`/how-markets-work`)
Six standalone pages under `\how-markets-work` with a hub landing page:
- **Equity Market** — order flow animation, live order book, supply/demand slider, order types, market participants, trading hours
- **Bond Market** — yield vs price interactive demo, bond types in India, RBI's role
- **Derivatives** — futures vs options, interactive payoff builder, margins, SEBI retail loss data
- **Mutual Funds** — fund structure animation, active vs passive expense ratio drag, SEBI categories, factsheet metrics guide, regular vs direct plan comparison
- **Personal Finance** — 50/30/20 budget rule, emergency fund calculator, avalanche vs snowball debt payoff simulator, insurance guide
- **How IPOs Work** — IPO timeline, retail/HNI/QIB categories, oversubscription lottery demo, ASBA flow, GMP explainer, listing day strategy, common misconceptions

### Mutual Fund NAV (`/mf-nav`)
- Search any Indian mutual fund by name
- NAV data from AMFI — covers all registered fund houses
- Updated daily after market close, cached 24 hours

---

## Architecture

```
Browser
   │
   ├── /api/stocks?symbols=AAPL,MSFT    ──▶  Cloudflare Worker  ──▶  Finnhub REST
   ├── /api/indices                      ──▶  Cloudflare Worker  ──▶  Finnhub (ETF proxies)
   ├── /api/indian                       ──▶  Cloudflare Worker  ──▶  Twelve Data
   ├── /api/search?q=apple               ──▶  Cloudflare Worker  ──▶  Finnhub + Twelve Data
   ├── /api/chart?symbol=AAPL&range=1Y   ──▶  Cloudflare Worker  ──▶  Polygon.io
   ├── /api/news?symbol=AAPL             ──▶  Cloudflare Worker  ──▶  Bing RSS / Finnhub
   ├── /api/mfnav?q=mirae                ──▶  Cloudflare Worker  ──▶  AMFI portal
   ├── /api/explain?term=CAGR            ──▶  Cloudflare Worker  ──▶  Cloudflare AI (Llama 3.3 70B)
   └── CoinGecko                         ──▶  Direct (no key)
```

All API keys live exclusively in Cloudflare encrypted Secrets — never in the client bundle. The AI binding uses Cloudflare's `env.AI` — no external API key required.

---

## Security

- **No API keys in the frontend bundle** — all keys server-side in Cloudflare Workers
- **No WebSocket key exposure** — removed Finnhub WebSocket; US stocks now polled via `/api/stocks` every 60s
- **Origin locking** — Workers reject non-`mkt-vision.com` requests
- **Input sanitization** on all Worker symbol params
- **Server-side caching** prevents rate limit abuse
- **GPG-signed commits**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6 (lazy-loaded), Recharts |
| Build | Vite (code-split, main bundle ~197KB) |
| Hosting | Cloudflare Pages |
| API proxy | Cloudflare Pages Functions (Workers) |
| AI (glossary) | Cloudflare AI — `@cf/meta/llama-3.3-70b-instruct-fp8-fast` (env.AI binding) |
| US stocks | [Finnhub](https://finnhub.io) (free tier) |
| Historical charts | [Polygon.io](https://polygon.io) (free tier) |
| Indian NSE | [Twelve Data](https://twelvedata.com) (free tier) |
| Crypto | [CoinGecko](https://coingecko.com) (public) |
| MF NAV | [AMFI](https://www.amfiindia.com) (public) |
| News | Bing News RSS |

---

## Project Structure

```
├── functions/api/
│   ├── stocks.js       # US equities → Finnhub
│   ├── indices.js      # Indices → Finnhub ETF proxies
│   ├── indian.js       # NSE → Twelve Data
│   ├── search.js       # Symbol search → Finnhub + Twelve Data
│   ├── chart.js        # OHLC → Polygon.io
│   ├── news.js         # News → Bing RSS / Finnhub
│   ├── mfnav.js        # MF NAV → AMFI portal
│   └── explain.js      # Glossary deep dives → Cloudflare AI
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Mobile sidebar + desktop links
│   │   ├── ScrollToTop.jsx
│   │   └── ErrorBoundary.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Dashboard.jsx
│   │   ├── CalculatorsHub.jsx
│   │   ├── Glossary.jsx        # 62 terms + AI deep dives
│   │   ├── HowMarketsWork.jsx  # Hub page — links to all explainers
│   │   ├── markets/
│   │   │   ├── shared.jsx          # C, MONO, Counter, Section
│   │   │   ├── EquityMarket.jsx
│   │   │   ├── BondMarket.jsx
│   │   │   ├── DerivativesMarket.jsx
│   │   │   ├── MutualFundsMarket.jsx
│   │   │   ├── PersonalFinance.jsx
│   │   │   └── IPOMarket.jsx
│   │   ├── MFNav.jsx
│   │   ├── StartHere.jsx       # Guided onboarding for beginners
│   │   └── calculators/
│   │       ├── SIP.jsx
│   │       ├── EMI.jsx
│   │       ├── Compound.jsx
│   │       ├── StockReturn.jsx
│   │       ├── Portfolio.jsx
│   │       ├── Options.jsx
│   │       ├── NetWorth.jsx
│   │       ├── CreditCard.jsx
│   │       ├── Inflation.jsx
│   │       ├── FDvsMF.jsx
│   │       ├── ULIPvsTermMF.jsx
│   │       ├── BuyVsRent.jsx
│   │       ├── FIRE.jsx
│   |       ├── SWP.jsx
|	|		├── LoanVsInvest.jsx
│   │       └── FutureNetWorth.jsx
│   ├── App.jsx                 # Lazy-loaded routes
│   ├── FinanceDashboard.jsx
│   └── main.jsx
├── public/favicon.ico
└── index.html
```

---

## Getting Started

```bash
git clone https://github.com/evans-0/finance
cd finance
npm install
npm run dev
```

### Deployment

1. Push to GitHub → Cloudflare auto-deploys
2. Add environment variables under **Settings → Environment Variables**:

| Variable | Type | Value |
|---|---|---|
| `FINNHUB_KEY` | Secret | Finnhub API key |
| `TWELVEDATA_KEY` | Secret | Twelve Data API key |
| `POLYGON_KEY` | Secret | Polygon.io API key |
| `ALLOWED_ORIGIN` | Plaintext | `https://mkt-vision.com` |

3. Add AI binding under **Settings → Functions → Bindings**:
   - Type: `Workers AI`, Variable name: `AI`

---

## Known Limitations

- **NSE stocks** — only INFY works reliably on Twelve Data free tier
- **NSE historical charts** — simulated (paid plan required)
- **Index absolute values** — ETF proxies show % change only
- **Polygon rate limit** — 5 calls/min free tier; requests debounced + cached
- **SGB** — primary issuance stopped Feb 2024; secondary market (NSE/BSE) only
- **Cloudflare AI** — free tier allows ~10,000 neurons/day; glossary deep dives are edge-cached 24h to minimise usage

---

## License

MIT
