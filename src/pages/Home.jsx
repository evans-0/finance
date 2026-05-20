import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'

const C = {
  bg: '#020c18', panel: '#050f1e', border: '#0c1d34', borderBright: '#162840',
  green: '#00e676', red: '#ff3c5c', amber: '#f5a623',
  text: '#c8d8f0', textSec: '#506888', textDim: '#1e3050',
}
const MONO = "'Consolas','Menlo','Monaco','Courier New',monospace"

const TICKER_LABELS = { SPY: 'S&P 500', QQQ: 'NASDAQ 100', GLD: 'GOLD', BTC: 'BTC', ETH: 'ETH', RELIANCE: 'RELIANCE', HDFCBANK: 'HDFC BANK' }
const TICKER_ORDER = ['SPY', 'QQQ', 'BTC', 'ETH', 'RELIANCE', 'HDFCBANK', 'GLD']

function TickerStrip() {
  const [tickers, setTickers] = useState(TICKER_ORDER.map(sym => ({ sym, pct: null })))
  const timer = useRef(null)

  const fetchTickers = async () => {
    try {
      const [etfs, crypto, indianRaw] = await Promise.all([
        fetch('/api/stocks?symbols=SPY,QQQ,GLD').then(r => r.json()).catch(() => []),
        fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum&order=market_cap_desc').then(r => r.json()).catch(() => []),
        fetch('/api/indian').then(r => r.ok ? r.json() : []).catch(() => []),
      ])
      const indian = Array.isArray(indianRaw) ? indianRaw : []

      const map = {}

      // ETF proxies — Worker returns array not object
      if (Array.isArray(etfs)) {
        for (const s of etfs) {
          if (s?.symbol && s?.pct != null) map[s.symbol] = +s.pct.toFixed(2)
        }
      }

      // Crypto
      if (Array.isArray(crypto)) {
        const btc = crypto.find(c => c.id === 'bitcoin')
        const eth = crypto.find(c => c.id === 'ethereum')
        if (btc?.price_change_percentage_24h != null) map['BTC'] = +btc.price_change_percentage_24h.toFixed(2)
        if (eth?.price_change_percentage_24h != null) map['ETH'] = +eth.price_change_percentage_24h.toFixed(2)
      }

      // Indian stocks from batch endpoint
      if (Array.isArray(indian)) {
        for (const s of indian) {
          if (s?.symbol && s?.pct != null) map[s.symbol] = +s.pct.toFixed(2)
        }
      }

      setTickers(TICKER_ORDER.map(sym => ({ sym, pct: map[sym] ?? null })))
    } catch {}
  }

  useEffect(() => {
    fetchTickers()
    timer.current = setInterval(fetchTickers, 60000)
    return () => clearInterval(timer.current)
  }, [])

  return (
    <div style={{ background: C.panel, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '10px 24px', display: 'flex', gap: 28, overflowX: 'auto', justifyContent: 'center', flexWrap: 'wrap' }}>
      {tickers.map(({ sym, pct }) => (
        <span key={sym} style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
          <span style={{ color: C.textSec }}>{TICKER_LABELS[sym]}&nbsp;</span>
          <span style={{ color: pct == null ? C.textSec : pct >= 0 ? C.green : C.red }}>
            {pct == null ? '...' : (pct >= 0 ? '+' : '') + pct + '%'}
          </span>
        </span>
      ))}
    </div>
  )
}

const FEATURES = [
  { icon: '📈', title: 'Live US Equities', desc: 'Real-time quotes for AAPL, MSFT, NVDA, TSLA and more via Finnhub. Prices refresh every 60 seconds.' },
  { icon: '🇮🇳', title: 'Indian NSE Stocks', desc: 'Top NSE stocks with live prices in ₹ via Twelve Data. Search any NSE ticker directly.' },
  { icon: '₿', title: 'Crypto Markets', desc: 'Top 8 cryptocurrencies by market cap with 30-day price charts via CoinGecko.' },
  { icon: '📊', title: 'Market Indices', desc: 'Live S&P 500, NASDAQ, DOW and VIX percentage changes updating in real time.' },
  { icon: '🔒', title: 'Secure by Design', desc: 'All API keys live server-side in Cloudflare Workers. Zero secrets reach your browser.' },
  { icon: '🧮', title: 'Finance Calculators', desc: 'SIP, EMI, compound interest, stock returns, portfolio allocation and options P&L.' },
]

const CALCS = [
  { to: '/calculators/sip',       icon: '📅', name: 'SIP Calculator',      desc: 'Plan your monthly investments' },
  { to: '/calculators/emi',       icon: '🏦', name: 'EMI Calculator',      desc: 'Calculate loan repayments' },
  { to: '/calculators/compound',  icon: '📈', name: 'Compound Interest',   desc: 'Watch your wealth grow' },
  { to: '/calculators/returns',   icon: '💹', name: 'Stock Returns',       desc: 'Analyse trade performance' },
  { to: '/calculators/portfolio', icon: '🥧', name: 'Portfolio Allocator', desc: 'Visualise your holdings' },
  { to: '/calculators/options',   icon: '⚖️', name: 'Options P&L',        desc: 'Options payoff analysis' },
]

const QUOTES = [
  { text: "The stock market is a device for transferring money from the impatient to the patient.", author: "Warren Buffett" },
  { text: "Do not save what is left after spending, but spend what is left after saving.", author: "Warren Buffett" },
  { text: "Price is what you pay. Value is what you get.", author: "Warren Buffett" },
  { text: "Compound interest is the eighth wonder of the world. He who understands it, earns it. He who doesn't, pays it.", author: "Albert Einstein" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "In investing, what is comfortable is rarely profitable.", author: "Robert Arnott" },
  { text: "The market is a pendulum that forever swings between unsustainable optimism and unjustified pessimism.", author: "Benjamin Graham" },
  { text: "Time in the market beats timing the market.", author: "Unknown" },
  { text: "Risk comes from not knowing what you are doing.", author: "Warren Buffett" },
  { text: "Bulls make money. Bears make money. Pigs get slaughtered.", author: "Wall Street Proverb" },
]

export default function Home() {
  const [quoteIdx, setQuoteIdx] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const t = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setQuoteIdx(i => (i + 1) % QUOTES.length)
        setFade(true)
      }, 400)
    }, 5000)
    return () => clearInterval(t)
  }, [])

  const q = QUOTES[quoteIdx]

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text }}>
      <Navbar />

      <TickerStrip />

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '80px 24px 60px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ fontSize: 11, color: C.amber, letterSpacing: 3, marginBottom: 20 }}>MARKETS TERMINAL</div>
        <h1 style={{ fontSize: 42, fontWeight: 700, color: C.text, lineHeight: 1.2, marginBottom: 20, letterSpacing: -1 }}>
          Bloomberg-style markets.<br />
          <span style={{ color: C.amber }}>For everyone.</span>
        </h1>
        <p style={{ fontSize: 14, color: C.textSec, lineHeight: 1.8, marginBottom: 40, maxWidth: 560, margin: '0 auto 40px' }}>
          Live US stocks, Indian NSE, crypto and market indices — all in one terminal.
          Built with React and Cloudflare Workers. API keys never leave the server.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/dashboard" style={{
            background: C.amber, color: '#020c18', padding: '12px 28px',
            textDecoration: 'none', fontSize: 12, fontWeight: 700, letterSpacing: 1.5,
            borderRadius: 3, transition: 'opacity 0.15s',
          }}>
            OPEN TERMINAL →
          </Link>
          <Link to="/calculators" style={{
            background: 'transparent', color: C.amber, padding: '12px 28px',
            textDecoration: 'none', fontSize: 12, fontWeight: 700, letterSpacing: 1.5,
            border: `1px solid ${C.amber}`, borderRadius: 3,
          }}>
            CALCULATORS →
          </Link>
        </div>
      </div>


      {/* Features grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '70px 24px' }}>
        <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, textAlign: 'center', marginBottom: 12 }}>FEATURES</div>
        <h2 style={{ fontSize: 26, fontWeight: 600, textAlign: 'center', marginBottom: 48, color: C.text }}>Everything in one terminal</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: '24px 20px' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Calculators section */}
      <div style={{ background: C.panel, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '70px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, textAlign: 'center', marginBottom: 12 }}>CALCULATORS</div>
          <h2 style={{ fontSize: 26, fontWeight: 600, textAlign: 'center', marginBottom: 12, color: C.text }}>Make smarter financial decisions</h2>
          <p style={{ fontSize: 12, color: C.textSec, textAlign: 'center', marginBottom: 48 }}>Six calculators built for investors and traders</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {CALCS.map(c => (
              <Link key={c.to} to={c.to} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: '20px',
                  cursor: 'pointer', transition: 'border-color 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.amber}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                >
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{c.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.amber, marginBottom: 6 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: C.textSec }}>{c.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>


      {/* Quote section */}
      <div style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: 24, color: C.textDim, marginBottom: 20, opacity: 0.4 }}>"</div>
          <div style={{
            fontSize: 16, color: C.text, lineHeight: 1.8, marginBottom: 20,
            transition: 'opacity 0.4s',
            opacity: fade ? 1 : 0,
            fontStyle: 'italic',
          }}>
            {q.text}
          </div>
          <div style={{ fontSize: 11, color: C.amber, letterSpacing: 1.5, opacity: fade ? 1 : 0, transition: 'opacity 0.4s' }}>
            — {q.author}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
            {QUOTES.map((_, i) => (
              <div key={i} onClick={() => { setQuoteIdx(i); setFade(true) }}
                style={{ width: i === quoteIdx ? 20 : 6, height: 6, borderRadius: 3, background: i === quoteIdx ? C.amber : C.textDim, cursor: 'pointer', transition: 'all 0.3s' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: C.textDim, marginBottom: 8 }}>
          STOCKS: FINNHUB · INDIA NSE: TWELVE DATA · CRYPTO: COINGECKO
        </div>
        <div style={{ fontSize: 11, color: C.textDim }}>
          Built with React + Cloudflare Workers ·{' '}
          <a href="https://github.com/evans-0/finance" target="_blank" rel="noopener noreferrer" style={{ color: C.textSec, textDecoration: 'none' }}>
            github.com/evans-0/finance ↗
          </a>
        </div>
      </div>
    </div>
  )
}
