import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const C = {
  bg: '#020c18', panel: '#050f1e', border: '#0c1d34', borderBright: '#162840',
  green: '#00e676', red: '#ff3c5c', amber: '#f5a623',
  text: '#c8d8f0', textSec: '#506888', textDim: '#1e3050',
}
const MONO = "'Consolas','Menlo','Monaco','Courier New',monospace"

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

export default function Home() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text }}>
      <Navbar />

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

      {/* Live ticker strip */}
      <div style={{ background: C.panel, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '10px 24px', display: 'flex', gap: 32, overflowX: 'auto', justifyContent: 'center', flexWrap: 'wrap' }}>
        {[['AAPL', '+0.80%', true], ['BTC', '-0.18%', false], ['NIFTY 50', '+0.42%', true], ['ETH', '+0.54%', true], ['MSFT', '+0.38%', true], ['RELIANCE', '+1.2%', true]].map(([sym, pct, up]) => (
          <span key={sym} style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
            <span style={{ color: C.textSec }}>{sym}&nbsp;</span>
            <span style={{ color: up ? C.green : C.red }}>{pct}</span>
          </span>
        ))}
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
