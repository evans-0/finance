import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const C = {
  bg: '#020c18', panel: '#050f1e', border: '#0c1d34', borderBright: '#1a3050',
  amber: '#f5a623', green: '#00e676', red: '#ff3c5c', blue: '#2196f3', purple: '#a855f7',
  text: '#c8d8f0', textSec: '#506888', textDim: '#1e3050',
}
const MONO = "'Consolas','Menlo','Monaco','Courier New',monospace"

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ to, duration = 1200, prefix = '', suffix = '' }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      obs.disconnect()
      const start = performance.now()
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1)
        setVal(Math.round(p * to))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to, duration])
  return <span ref={ref}>{prefix}{val.toLocaleString('en-IN')}{suffix}</span>
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, subtitle, children, id }) {
  return (
    <section id={id} style={{ marginBottom: 80, maxWidth: '100%' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 8 }}>{subtitle}</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>{title}</h2>
      </div>
      {children}
    </section>
  )
}

// ── Order flow animation ──────────────────────────────────────────────────────
const FLOW_STEPS = [
  { id: 'you',      label: 'YOU',           sub: 'Place buy order',      color: C.amber,  icon: '👤' },
  { id: 'broker',   label: 'BROKER',        sub: 'Zerodha / Groww',      color: C.blue,   icon: '🏢' },
  { id: 'exchange', label: 'NSE / BSE',     sub: 'Order matching engine', color: C.purple, icon: '⚖️' },
  { id: 'seller',   label: 'SELLER',        sub: 'Matched counterparty',  color: C.green,  icon: '👤' },
  { id: 'settle',   label: 'SETTLEMENT',    sub: 'T+1 day delivery',      color: C.amber,  icon: '✅' },
]

function OrderFlow() {
  const [active,  setActive]  = useState(-1)
  const [running, setRunning] = useState(false)
  const [mobile,  setMobile]  = useState(window.innerWidth < 600)

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 600)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const run = () => {
    if (running) return
    setRunning(true)
    setActive(-1)
    FLOW_STEPS.forEach((_, i) => {
      setTimeout(() => {
        setActive(i)
        if (i === FLOW_STEPS.length - 1) setRunning(false)
      }, i * 700)
    })
  }

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
      <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>WHAT HAPPENS WHEN YOU CLICK "BUY"</div>
      {/* Desktop: horizontal row */}
      {!mobile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24 }}>
          {FLOW_STEPS.map((step, i) => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ textAlign: 'center', padding: '12px 16px', borderRadius: 4, minWidth: 100, background: active >= i ? step.color + '22' : C.bg, border: `1px solid ${active >= i ? step.color : C.border}`, transition: 'all 0.3s' }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{step.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: active >= i ? step.color : C.textSec }}>{step.label}</div>
                <div style={{ fontSize: 9, color: C.textSec, marginTop: 2 }}>{step.sub}</div>
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, width: 32 }}>
                  <div style={{ flex: 1, height: 2, background: active > i ? C.green : C.border, transition: 'background 0.3s' }} />
                  <div style={{ fontSize: 10, color: active > i ? C.green : C.border, lineHeight: 1, transition: 'color 0.3s', marginLeft: -1 }}>▶</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Mobile: vertical column */}
      {mobile && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0, marginBottom: 24 }}>
          {FLOW_STEPS.map((step, i) => (
            <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 12px', borderRadius: 4, background: active >= i ? step.color + '22' : C.bg, border: `1px solid ${active >= i ? step.color : C.border}`, transition: 'all 0.3s' }}>
                <span style={{ fontSize: 20 }}>{step.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: active >= i ? step.color : C.textSec }}>{step.label}</div>
                  <div style={{ fontSize: 10, color: C.textSec }}>{step.sub}</div>
                </div>
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 28 }}>
                  <div style={{ width: 2, flex: 1, background: active > i ? C.green : C.border, transition: 'background 0.3s' }} />
                  <div style={{ fontSize: 10, color: active > i ? C.green : C.border, lineHeight: 1, transition: 'color 0.3s' }}>▼</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <button onClick={run} disabled={running} style={{
        background: running ? C.bg : C.amber, color: running ? C.textSec : '#020c18',
        border: `1px solid ${running ? C.border : C.amber}`, padding: '8px 20px',
        fontSize: 11, fontFamily: MONO, cursor: running ? 'not-allowed' : 'pointer',
        borderRadius: 2, fontWeight: 700, letterSpacing: 1, transition: 'all 0.2s',
      }}>
        {running ? 'PROCESSING...' : '▶ SIMULATE TRADE'}
      </button>
    </div>
  )
}

// ── Order book visual ──────────────────────────────────────────────────────────
function OrderBook() {
  const asks = [
    { price: 302.50, qty: 450 }, { price: 302.25, qty: 230 }, { price: 302.00, qty: 890 },
  ]
  const bids = [
    { price: 301.75, qty: 1200 }, { price: 301.50, qty: 670 }, { price: 301.25, qty: 340 },
  ]
  const spread = (asks[asks.length - 1].price - bids[0].price).toFixed(2)
  const maxQty = Math.max(...[...asks, ...bids].map(o => o.qty))

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
      <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>LIVE ORDER BOOK (AAPL — SIMULATED)</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div style={{ fontSize: 9, color: C.red, letterSpacing: 1, marginBottom: 8 }}>ASKS (SELLERS WANT)</div>
          {asks.map(a => (
            <div key={a.price} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, position: 'relative' }}>
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, background: C.red + '15', width: `${(a.qty / maxQty) * 100}%`, borderRadius: 2 }} />
              <span style={{ fontSize: 11, color: C.red, fontWeight: 600, flex: 1, position: 'relative' }}>${a.price.toFixed(2)}</span>
              <span style={{ fontSize: 11, color: C.textSec, position: 'relative' }}>{a.qty.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 9, color: C.green, letterSpacing: 1, marginBottom: 8 }}>BIDS (BUYERS WANT)</div>
          {bids.map(b => (
            <div key={b.price} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, background: C.green + '15', width: `${(b.qty / maxQty) * 100}%`, borderRadius: 2 }} />
              <span style={{ fontSize: 11, color: C.green, fontWeight: 600, flex: 1, position: 'relative' }}>${b.price.toFixed(2)}</span>
              <span style={{ fontSize: 11, color: C.textSec, position: 'relative' }}>{b.qty.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 16, paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
        <span style={{ color: C.textSec }}>BID-ASK SPREAD</span>
        <span style={{ color: C.amber, fontWeight: 700 }}>${spread}</span>
      </div>
    </div>
  )
}

// ── Supply/Demand visual ───────────────────────────────────────────────────────
function SupplyDemand() {
  const [buyers, setBuyers] = useState(60)

  const sellers = 100 - buyers
  const priceDir = buyers > 55 ? 'up' : buyers < 45 ? 'down' : 'stable'
  const priceColor = priceDir === 'up' ? C.green : priceDir === 'down' ? C.red : C.amber
  const priceLabel = priceDir === 'up' ? '▲ PRICE RISING' : priceDir === 'down' ? '▼ PRICE FALLING' : '— PRICE STABLE'

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
      <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>HOW PRICES MOVE — DRAG THE SLIDER</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
        <div style={{ background: C.bg, border: `1px solid ${C.green}22`, borderRadius: 3, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: C.green }}>{buyers}%</div>
          <div style={{ fontSize: 10, color: C.textSec, marginTop: 4 }}>BUYERS</div>
          <div style={{ height: 4, background: C.border, borderRadius: 2, marginTop: 8 }}>
            <div style={{ height: '100%', width: `${buyers}%`, background: C.green, borderRadius: 2, transition: 'width 0.2s' }} />
          </div>
        </div>
        <div style={{ background: C.bg, border: `1px solid ${C.red}22`, borderRadius: 3, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: C.red }}>{sellers}%</div>
          <div style={{ fontSize: 10, color: C.textSec, marginTop: 4 }}>SELLERS</div>
          <div style={{ height: 4, background: C.border, borderRadius: 2, marginTop: 8 }}>
            <div style={{ height: '100%', width: `${sellers}%`, background: C.red, borderRadius: 2, transition: 'width 0.2s' }} />
          </div>
        </div>
        <div style={{ background: C.bg, border: `1px solid ${priceColor}44`, borderRadius: 3, padding: 16, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: priceColor, transition: 'color 0.3s' }}>{priceLabel}</div>
        </div>
      </div>
      <div>
        <label style={{ fontSize: 10, color: C.textSec, letterSpacing: 1, display: 'block', marginBottom: 8 }}>BUYER PRESSURE: {buyers}%</label>
        <input type="range" min={10} max={90} value={buyers} onChange={e => setBuyers(Number(e.target.value))}
          style={{ width: '100%', accentColor: C.amber }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: C.textDim, marginTop: 4 }}>
          <span>MORE SELLERS → PRICE FALLS</span>
          <span>MORE BUYERS → PRICE RISES</span>
        </div>
      </div>
    </div>
  )
}

// ── Order types ───────────────────────────────────────────────────────────────
const ORDER_TYPES = [
  {
    type: 'Market Order',
    icon: '⚡',
    color: C.amber,
    desc: 'Buy or sell immediately at the best available price.',
    pros: ['Guaranteed execution', 'Instant fill'],
    cons: ['Price not guaranteed', 'Bad in volatile markets'],
    example: '"Buy 10 shares of AAPL right now at whatever price it\'s at."',
  },
  {
    type: 'Limit Order',
    icon: '🎯',
    color: C.blue,
    desc: 'Buy or sell only at a specific price or better.',
    pros: ['Price guaranteed', 'No surprises'],
    cons: ['May not execute', 'Can miss the trade'],
    example: '"Buy 10 shares of AAPL only if the price drops to $290."',
  },
  {
    type: 'Stop Loss',
    icon: '🛡️',
    color: C.red,
    desc: 'Automatically sell if the price falls to a set level.',
    pros: ['Limits downside', 'Hands-off protection'],
    cons: ['Can trigger on temporary dips', 'Guaranteed exit, not price'],
    example: '"Sell my AAPL if it drops to $285 to limit my loss."',
  },
]

// ── Market participants ───────────────────────────────────────────────────────
const PARTICIPANTS = [
  { name: 'Retail Investors', icon: '👤', pct: 45, color: C.amber, desc: 'Individual investors like you. Buy and hold or trade for their own account. High in number but smaller in total capital.' },
  { name: 'FIIs', icon: '🌍', pct: 25, color: C.blue, desc: 'Foreign Institutional Investors — overseas funds investing in Indian markets. Their buying/selling heavily influences Nifty direction.' },
  { name: 'DIIs', icon: '🏛️', pct: 20, color: C.green, desc: 'Domestic Institutional Investors — Indian mutual funds, insurance companies, pension funds. Counter-balance FII movements.' },
  { name: 'HNIs / Prop Desks', icon: '💼', pct: 10, color: C.purple, desc: 'High Net Worth Individuals and proprietary trading desks. Often algorithmic, trade large volumes quickly.' },
]

// ── Trading hours ─────────────────────────────────────────────────────────────
const HOURS = [
  { time: '9:00', label: 'Pre-Open', sub: 'Orders collected, opening price discovered', color: C.textSec, active: false },
  { time: '9:15', label: 'Market Opens', sub: 'Regular trading begins', color: C.green, active: true },
  { time: '3:30', label: 'Market Closes', sub: 'No new orders accepted', color: C.red, active: false },
  { time: '3:40', label: 'Post-Close', sub: 'Closing price calculated', color: C.textSec, active: false },
  { time: 'T+1', label: 'Settlement', sub: 'Shares delivered, money transferred', color: C.amber, active: false },
]


// ── Bond Market ───────────────────────────────────────────────────────────────
const BOND_TYPES = [
  { name: 'G-Secs', full: 'Government Securities', icon: '🏛️', color: '#2196f3', issuer: 'Central Govt', risk: 'Zero', return: '6.5–7.5%', tenure: '1–40 years', how: 'RBI Retail Direct, Zerodha, DHAN' },
  { name: 'T-Bills', full: 'Treasury Bills', icon: '⏱️', color: '#06b6d4', issuer: 'Central Govt', risk: 'Zero', return: '6.5–7%', tenure: '91/182/364 days', how: 'RBI Retail Direct' },
  { name: 'SDL', full: 'State Development Loans', icon: '🗺️', color: '#a855f7', issuer: 'State Govts', risk: 'Near Zero', return: '7–7.5%', tenure: '5–25 years', how: 'RBI Retail Direct, NSE' },
  { name: 'Corporate Bonds', full: 'Corporate Bonds', icon: '🏢', color: C.amber, issuer: 'Companies', risk: 'Moderate', return: '8–12%', tenure: '1–10 years', how: 'NSE, BSE, Bond platforms' },
  { name: 'SGB', full: 'Sovereign Gold Bonds', icon: '🥇', color: '#f59e0b', issuer: 'RBI (Govt)', risk: 'Low', return: '2.5% + gold price', tenure: '8 years', how: 'Secondary market only (NSE/BSE) — RBI stopped new issuances after Feb 2024' },
]

function YieldPriceDemo() {
  const [rate, setRate] = useState(7)
  const baseRate   = 7
  const faceValue  = 1000
  const coupon     = faceValue * baseRate / 100  // fixed ₹70/year
  const bondPrice  = Math.round(coupon / (rate / 100))
  const priceUp    = bondPrice > faceValue
  const priceDown  = bondPrice < faceValue

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
      <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>THE MOST IMPORTANT BOND CONCEPT — DRAG THE SLIDER</div>
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: 16, marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: C.textSec, marginBottom: 4 }}>FACE VALUE</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>₹1,000</div>
          <div style={{ fontSize: 10, color: C.textSec }}>Fixed</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: C.textSec, marginBottom: 4 }}>COUPON (FIXED)</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>₹{coupon}/yr</div>
          <div style={{ fontSize: 10, color: C.textSec }}>Never changes</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: C.textSec, marginBottom: 4 }}>MARKET RATE</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.amber }}>{rate}%</div>
          <div style={{ fontSize: 10, color: C.textSec }}>Set by RBI/market</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: C.textSec, marginBottom: 4 }}>BOND PRICE NOW</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: priceDown ? C.red : priceUp ? C.green : C.text }}>
            ₹{bondPrice.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 10, color: priceDown ? C.red : priceUp ? C.green : C.textSec }}>
            {priceDown ? '▼ Below face value' : priceUp ? '▲ Above face value' : '= At face value'}
          </div>
        </div>
      </div>
      <div>
        <label style={{ fontSize: 10, color: C.textSec, letterSpacing: 1, display: 'block', marginBottom: 8 }}>MARKET INTEREST RATE: {rate}%</label>
        <input type="range" min={4} max={12} step={0.5} value={rate} onChange={e => setRate(Number(e.target.value))}
          style={{ width: '100%', accentColor: C.amber }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: C.textDim, marginTop: 4 }}>
          <span>4% → Bond price RISES</span>
          <span>12% → Bond price FALLS</span>
        </div>
      </div>
      <div style={{ marginTop: 16, fontSize: 11, color: C.textSec, lineHeight: 1.8, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: 12 }}>
        <strong style={{ color: C.amber }}>The golden rule:</strong> When interest rates go UP, bond prices go DOWN. When rates go DOWN, prices go UP.{' '}
        {rate > baseRate
          ? `Rates rose from 7% to ${rate}%. New bonds now pay ₹${Math.round(1000 * rate / 100)}/year. Your old bond only pays ₹${coupon}/year — so buyers will only pay ₹${bondPrice.toLocaleString('en-IN')} for it, making its effective yield also ${rate}%.`
          : rate < baseRate
          ? `Rates fell from 7% to ${rate}%. New bonds only pay ₹${Math.round(1000 * rate / 100)}/year. Your old bond still pays ₹${coupon}/year — so buyers will pay a premium of ₹${bondPrice.toLocaleString('en-IN')} for it, making its effective yield also ${rate}%.`
          : `At 7%, your bond pays ₹${coupon}/year on a ₹1,000 face value — exactly matching the market rate. Bond trades at face value.`
        }
      </div>
    </div>
  )
}

function BondMarket() {
  return (
    <>
      <Section subtitle="01 — WHAT IS A BOND" title="Bonds — when you lend money to governments and companies">
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 20 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.amber, marginBottom: 12 }}>Equity vs Bond</div>
              {[
                ['Equity', 'You own a piece of a company. Returns depend on profit. High risk, high reward.', C.green],
                ['Bond', 'You lend money. Borrower pays fixed interest. Lower risk, predictable return.', C.blue],
              ].map(([t, d, col]) => (
                <div key={t} style={{ background: C.bg, border: `1px solid ${col}33`, borderRadius: 3, padding: 12, marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: col, marginBottom: 4 }}>{t}</div>
                  <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.7 }}>{d}</div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.amber, marginBottom: 12 }}>Bond basics</div>
              {[
                ['Face Value', 'The principal amount — typically ₹1,000 per bond. Returned at maturity.'],
                ['Coupon', 'The fixed interest paid periodically. A 7% bond on ₹1,000 = ₹70/year.'],
                ['Maturity', 'When the issuer repays the face value. Can range from 91 days to 40 years.'],
                ['Yield', 'Actual return based on current price. Yield = Coupon / Current Price.'],
                ['Credit Rating', 'AAA = safest. D = default. Higher risk = higher yield demanded by investors.'],
              ].map(([t, d]) => (
                <div key={t} style={{ display: 'flex', gap: 8, marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 11, color: C.amber, fontWeight: 700, minWidth: 90, flexShrink: 0 }}>{t}</span>
                  <span style={{ fontSize: 11, color: C.textSec, lineHeight: 1.6 }}>{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section subtitle="02 — YIELD VS PRICE" title="Why bond prices and interest rates move in opposite directions">
        <YieldPriceDemo />
      </Section>

      <Section subtitle="03 — TYPES OF BONDS" title="What bonds can you actually buy in India?">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {BOND_TYPES.map(b => (
            <div key={b.name} style={{ background: C.panel, border: `1px solid ${b.color}33`, borderRadius: 4, padding: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 16, alignItems: 'start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>{b.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: b.color }}>{b.name}</div>
                    <div style={{ fontSize: 10, color: C.textSec }}>{b.full}</div>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: C.textSec }}>Issuer: <span style={{ color: C.text }}>{b.issuer}</span></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[['RISK', b.risk, b.risk === 'Zero' ? C.green : b.risk === 'Low' ? C.green : b.risk === 'Near Zero' ? C.green : C.amber],
                  ['RETURN', b.return, C.amber],
                  ['TENURE', b.tenure, C.text],
                ].map(([l, v, col]) => (
                  <div key={l} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 2, padding: '6px 8px' }}>
                    <div style={{ fontSize: 8, color: C.textSec, letterSpacing: 0.5 }}>{l}</div>
                    <div style={{ fontSize: 10, color: col, fontWeight: 600, marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: 10 }}>
                <div style={{ fontSize: 9, color: C.textSec, letterSpacing: 0.5, marginBottom: 4 }}>HOW TO BUY</div>
                <div style={{ fontSize: 11, color: C.text }}>{b.how}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section subtitle="04 — RBI'S ROLE" title="How RBI controls the bond market">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 16 }}>
          {[
            { icon: '📉', title: 'Rate Cut → Bonds Up', desc: 'When RBI cuts the repo rate, existing bonds with higher coupons become more valuable. Bond prices rise. Good for existing bond holders.' },
            { icon: '📈', title: 'Rate Hike → Bonds Down', desc: 'When RBI hikes rates, new bonds offer better returns. Old bonds become less attractive. Bond prices fall.' },
            { icon: '🖨️', title: 'Open Market Operations', desc: 'RBI buys or sells G-Secs to control liquidity. Buying injects money into the economy; selling removes it.' },
            { icon: '📊', title: '10-Year G-Sec Yield', desc: 'India\'s benchmark interest rate indicator. When this yield rises, home loan and corporate borrowing rates follow. Watch it like a market barometer.' },
          ].map(item => (
            <div key={item.title} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: 16 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.amber, marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.7 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}


// ── Derivatives Market ────────────────────────────────────────────────────────

function PayoffBuilder() {
  const [type,    setType]    = useState('call')
  const [strike,  setStrike]  = useState(22000)
  const [premium, setPremium] = useState(150)
  const [spot,    setSpot]    = useState(22200)

  const pnl = type === 'call'
    ? (Math.max(0, spot - strike) - premium)
    : (Math.max(0, strike - spot) - premium)

  const breakeven = type === 'call' ? strike + premium : strike - premium
  const isProfit  = pnl >= 0

  const chartPoints = Array.from({ length: 41 }, (_, i) => {
    const price = Math.round(strike * 0.9 + (i * strike * 0.2 / 40))
    const p = type === 'call'
      ? Math.max(0, price - strike) - premium
      : Math.max(0, strike - price) - premium
    return { price, pnl: Math.round(p) }
  })

  const minP  = Math.min(...chartPoints.map(d => d.pnl))
  const maxP  = Math.max(...chartPoints.map(d => d.pnl))
  const range = maxP - minP || 1
  const W = 500, H = 180, PAD = 40
  const toY   = v  => PAD + ((maxP - v) / range) * (H - PAD * 2)
  const toX   = i  => PAD + (i / (chartPoints.length - 1)) * (W - PAD * 2)
  const zeroY = toY(0)
  const pathD = chartPoints.map((d, i) => (i === 0 ? 'M' : 'L') + toX(i).toFixed(1) + ',' + toY(d.pnl).toFixed(1)).join(' ')
  const beIdx = chartPoints.findIndex(p => p.price >= breakeven)

  return (
    <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 24 }}>
      <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>INTERACTIVE PAYOFF BUILDER</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 24 }}>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
            {['call', 'put'].map(t => (
              <button key={t} onClick={() => setType(t)} style={{
                background: type === t ? (t === 'call' ? C.green : C.red) + '22' : C.bg,
                color: type === t ? (t === 'call' ? C.green : C.red) : C.textSec,
                border: '1px solid ' + (type === t ? (t === 'call' ? C.green : C.red) : C.border),
                padding: '10px', fontSize: 12, fontFamily: MONO, cursor: 'pointer', borderRadius: 3, fontWeight: 700,
              }}>{t === 'call' ? String.fromCodePoint(0x1F4C8) + ' CALL' : String.fromCodePoint(0x1F4C9) + ' PUT'}</button>
            ))}
          </div>
          {[['STRIKE PRICE', strike, setStrike, 18000, 26000, 100],
            ['PREMIUM PAID', premium, setPremium, 10, 500, 10],
            ['CURRENT PRICE', spot, setSpot, 18000, 26000, 100],
          ].map(([label, val, setter, min, max, step]) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <label style={{ fontSize: 9, color: C.textSec, letterSpacing: 1 }}>{label}</label>
                <span style={{ fontSize: 11, color: C.amber }}>{String.fromCharCode(0x20B9)}{val.toLocaleString('en-IN')}</span>
              </div>
              <input type="range" min={min} max={max} step={step} value={val} onChange={e => setter(Number(e.target.value))}
                style={{ width: '100%', accentColor: C.amber }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ background: C.bg, border: '2px solid ' + (isProfit ? C.green : C.red), borderRadius: 3, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: C.textSec, marginBottom: 4 }}>P&L AT {String.fromCharCode(0x20B9)}{spot.toLocaleString('en-IN')}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: isProfit ? C.green : C.red }}>
              {isProfit ? '+' : ''}{String.fromCharCode(0x20B9)}{Math.abs(pnl).toLocaleString('en-IN')}
            </div>
          </div>
          {[['BREAKEVEN', String.fromCharCode(0x20B9) + breakeven.toLocaleString('en-IN'), null],
            ['MAX LOSS', String.fromCharCode(0x20B9) + premium.toLocaleString('en-IN') + ' (premium)', C.red],
            ['MAX PROFIT', type === 'call' ? 'Unlimited' : String.fromCharCode(0x20B9) + (strike - premium).toLocaleString('en-IN'), C.green],
            ['IN THE MONEY', type === 'call' ? (spot > strike ? 'YES' : 'NO') : (spot < strike ? 'YES' : 'NO'),
              type === 'call' ? (spot > strike ? C.green : C.red) : (spot < strike ? C.green : C.red)],
          ].map(([l, v, col]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: C.bg, border: '1px solid ' + C.border, borderRadius: 2 }}>
              <span style={{ fontSize: 10, color: C.textSec }}>{l}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: col || C.text }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 9, color: C.textSec, letterSpacing: 1, marginBottom: 8 }}>PAYOFF AT EXPIRY</div>
        <svg viewBox={'0 0 ' + W + ' ' + H} style={{ width: '100%', height: 'auto' }}>
          <line x1={PAD} y1={zeroY} x2={W - PAD} y2={zeroY} stroke={C.border} strokeDasharray="4 4" />
          <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke={C.border} />
          <path d={pathD} fill="none" stroke={type === 'call' ? C.green : C.red} strokeWidth="2" />
          {beIdx >= 0 && <line x1={toX(beIdx)} y1={PAD} x2={toX(beIdx)} y2={H - PAD} stroke={C.amber} strokeDasharray="3 3" strokeWidth="1" />}
          <text x={PAD + 4} y={zeroY - 4} fill={C.textSec} fontSize="9">0</text>
          <text x={W - PAD - 30} y={H - PAD + 12} fill={C.textSec} fontSize="9">Price</text>
        </svg>
      </div>
    </div>
  )
}

function DerivativesMarket() {
  return (
    <>
      <Section subtitle="01 — WHAT IS A DERIVATIVE" title="Contracts whose value comes from something else">
        <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 24 }}>
          <p style={{ fontSize: 11, color: C.textSec, lineHeight: 1.9, marginBottom: 20 }}>
            A derivative is a financial contract whose value is <span style={{ color: C.amber }}>derived from an underlying asset</span> — a stock, index, commodity, or currency. You are not buying the asset itself. You are buying a contract about its future price.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 12 }}>
            {[{ name: 'Futures', icon: String.fromCodePoint(0x1F4CB), color: C.blue, desc: 'A legal obligation to buy or sell at a set price on a future date. Both buyer and seller MUST fulfil the contract.', example: 'You agree to buy 1 lot of Nifty at 22,000 on expiry regardless of where Nifty actually trades.' },
              { name: 'Options', icon: String.fromCodePoint(0x2696) + String.fromCodePoint(0xFE0F), color: C.purple, desc: 'The right (not obligation) to buy or sell at a set price before expiry. Buyer pays a premium. Seller collects it.', example: 'You buy the right to purchase Nifty at 22,000. If Nifty hits 23,000, you profit 1,000 minus premium.' },
            ].map(d => (
              <div key={d.name} style={{ background: C.bg, border: '1px solid ' + d.color + '33', borderRadius: 3, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 20 }}>{d.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: d.color }}>{d.name}</span>
                </div>
                <p style={{ fontSize: 11, color: C.textSec, lineHeight: 1.7, marginBottom: 10 }}>{d.desc}</p>
                <div style={{ background: C.panel, borderRadius: 2, padding: 10 }}>
                  <div style={{ fontSize: 9, color: d.color, letterSpacing: 1, marginBottom: 4 }}>EXAMPLE</div>
                  <div style={{ fontSize: 10, color: C.textSec, lineHeight: 1.6, fontStyle: 'italic' }}>{d.example}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section subtitle="02 — FUTURES vs OPTIONS" title="Key differences at a glance">
        <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 24 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: MONO, fontSize: 11 }}>
              <thead>
                <tr>
                  {['', 'Futures', 'Options'].map((h, i) => (
                    <th key={i} style={{ padding: '8px 12px', borderBottom: '1px solid ' + C.border, textAlign: 'left', fontSize: 10, fontWeight: 700, color: i === 0 ? C.textDim : i === 1 ? C.blue : C.purple, letterSpacing: 1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[['Obligation', 'Must buy/sell', 'Right, not obligation'],
                  ['Premium', 'No — pay margin', 'Yes — pay upfront'],
                  ['Max loss (buyer)', 'Unlimited', 'Limited to premium'],
                  ['Max profit (buyer)', 'Unlimited', 'Unlimited (calls)'],
                  ['Leverage', 'Very high', 'High via premium'],
                  ['Best used for', 'Hedging large positions', 'Defined risk bets'],
                ].map(([label, fut, opt], ri) => (
                  <tr key={label} style={{ background: ri % 2 === 0 ? C.bg : 'transparent' }}>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid ' + C.border, color: C.textSec, fontWeight: 600 }}>{label}</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid ' + C.border, color: C.text }}>{fut}</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid ' + C.border, color: C.text }}>{opt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <Section subtitle="03 — PAYOFF BUILDER" title="See exactly how much you make or lose">
        <PayoffBuilder />
      </Section>

      <Section subtitle="04 — HOW MARGINS WORK" title="Leverage — the double-edged sword">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 16 }}>
          {[{ title: 'What is margin?', color: C.amber, content: 'In F&O you do not pay the full contract value. You pay a fraction called margin — typically 10-20%. This creates leverage. Nifty lot = 25 units x 22,000 = 5.5 lakh contract. Margin needed: ~1.1 lakh (20%). A 1% Nifty move = 5,500 gain/loss. That is a 5% move on your margin in one day.', warn: false },
            { title: 'Margin call', color: C.red, content: 'If your position moves against you and balance falls below maintenance margin, your broker demands you top up immediately — or they square off your position at a loss. Margin calls can wipe out your entire capital in a single volatile session.', warn: true },
          ].map(item => (
            <div key={item.title} style={{ background: C.panel, border: '1px solid ' + item.color + '44', borderRadius: 4, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: item.color, marginBottom: 12 }}>{item.title}</div>
              <p style={{ fontSize: 11, color: C.textSec, lineHeight: 1.8 }}>{item.content}</p>
              {item.warn && <div style={{ background: '#1a0a0a', border: '1px solid ' + C.red, borderRadius: 3, padding: 10, marginTop: 12, fontSize: 11, color: '#ffaaaa' }}>This is not hypothetical — it happens regularly in volatile markets.</div>}
            </div>
          ))}
        </div>
      </Section>

      <Section subtitle="05 — THE RISK REALITY" title="Why 90% of retail F&O traders lose money">
        <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: 12, marginBottom: 20 }}>
            {[['89%', 'Retail F&O traders lose money', C.red, 'SEBI Study 2023'],
              ['93%', 'Loss-making in options', C.red, 'SEBI Study 2024'],
              ['7.1M', 'Unique retail F&O traders', C.amber, 'NSE Data'],
              [String.fromCharCode(0x20B9) + '1.81L Cr', 'Retail losses FY2022-24', C.red, 'SEBI Study 2024'],
            ].map(([stat, label, color, source]) => (
              <div key={stat} style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 3, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color }}>{stat}</div>
                <div style={{ fontSize: 10, color: C.textSec, marginTop: 4, lineHeight: 1.5 }}>{label}</div>
                <div style={{ fontSize: 9, color: C.textDim, marginTop: 6 }}>{source}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: C.textSec, lineHeight: 1.9 }}>
            <strong style={{ color: C.amber }}>Why do most retail traders lose?</strong>{' '}
            Options sellers are institutions and prop desks with massive capital, algorithms, and risk systems. Retail buyers are paying premium to sophisticated sellers who do this professionally. The odds are structurally against you. Derivatives were designed for hedging — using them for speculation without deep knowledge is closer to gambling.
          </p>
        </div>
      </Section>

      <Section subtitle="06 — LEGITIMATE USE CASES" title="When derivatives actually make sense">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[{ icon: String.fromCodePoint(0x1F6E1), title: 'Hedging a portfolio', color: C.green, desc: 'You hold 10 lakh of Nifty stocks. Before budget day you buy Nifty put options. If the market crashes, your puts profit and offset losses. This is what derivatives were designed for.' },
            { icon: String.fromCodePoint(0x1F4B1), title: 'Currency hedging', color: C.blue, desc: 'An IT company earns in USD but pays salaries in INR. They use USD/INR futures to lock in the exchange rate and eliminate currency risk. Every large exporter does this.' },
            { icon: String.fromCodePoint(0x1F33E), title: 'Commodity hedging', color: C.amber, desc: 'A flour mill buys wheat futures to lock in input costs 3 months ahead. An airline buys crude oil futures to stabilise fuel costs. These are the real business needs derivatives were built for.' },
            { icon: String.fromCodePoint(0x26A0), title: 'Speculation — high risk', color: C.red, desc: 'Betting on short-term market direction with leverage. SEBI data shows 89% of retail traders lose. If you do this, use only money you can afford to lose entirely.' },
          ].map(item => (
            <div key={item.title} style={{ background: C.panel, border: '1px solid ' + item.color + '33', borderRadius: 3, padding: 16, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: item.color, marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.7 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HowMarketsWork() {
  const [market, setMarket] = useState('equity')

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text, overflowX: 'hidden' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(24px, 4vw, 52px) clamp(12px, 3vw, 24px)' }}>

        {/* Hero */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 12 }}>EXPLAINER</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>How Markets Work</h1>
          <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.9, maxWidth: 640 }}>
            Every second, millions of trades happen across NSE and BSE. Here's what actually happens when you click "Buy" — from your phone to the exchange and back.
          </p>
          {/* Scale stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginTop: 32 }}>
            {[
              { label: 'Daily NSE turnover', value: 1200000, prefix: '₹', suffix: ' Cr' },
              { label: 'Orders per second', value: 15000, suffix: '+' },
              { label: 'Listed companies', value: 2200, suffix: '+' },
              { label: 'Settlement', value: 1, prefix: 'T+', suffix: ' day' },
            ].map(s => (
              <div key={s.label} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: 16 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.amber }}>
                  <Counter to={s.value} prefix={s.prefix || ''} suffix={s.suffix || ''} duration={1500} />
                </div>
                <div style={{ fontSize: 10, color: C.textSec, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Market tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 48, borderBottom: `1px solid ${C.border}` }}>
          {[['equity', 'Equity Market'], ['bond', 'Bond Market'], ['derivatives', 'Derivatives']].map(([key, label]) => (
            <button key={key} onClick={() => setMarket(key)} style={{
              background: 'none', border: 'none', borderBottom: `2px solid ${market === key ? C.amber : 'transparent'}`,
              color: market === key ? C.amber : C.textSec, padding: '10px 24px', fontSize: 12,
              fontFamily: MONO, cursor: 'pointer', letterSpacing: 1.5, fontWeight: market === key ? 700 : 400,
              marginBottom: -1, transition: 'all 0.2s',
            }}>{label.toUpperCase()}</button>
          ))}
        </div>

        {market === 'equity' && <>
        {/* 1. Order flow */}
        <Section id="order-flow" subtitle="01 — TRADE LIFECYCLE" title="What happens when you click Buy?">
          <OrderFlow />
          <div style={{ marginTop: 16, fontSize: 11, color: C.textSec, lineHeight: 1.8, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: 16 }}>
            Your order travels from your app → broker's system → NSE's matching engine in milliseconds. The engine finds a seller willing to sell at your price. Both sides are confirmed, and on T+1 (next trading day) the shares land in your demat account and money leaves your account.
          </div>
        </Section>

        {/* 2. Order book */}
        <Section id="order-book" subtitle="02 — BID & ASK" title="The Order Book — where buyers meet sellers">
          <OrderBook />
          <div style={{ marginTop: 16, fontSize: 11, color: C.textSec, lineHeight: 1.8, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: 16 }}>
            The order book shows all pending buy (bid) and sell (ask) orders. The difference between the lowest ask and highest bid is the <span style={{ color: C.amber }}>spread</span>. Liquid stocks like RELIANCE have spreads of ₹0.05. Illiquid small-caps can have spreads of ₹5–10, meaning you lose money the moment you buy.
          </div>
        </Section>

        {/* 3. Supply demand */}
        <Section id="price-movement" subtitle="03 — PRICE DISCOVERY" title="How prices actually move">
          <SupplyDemand />
          <div style={{ marginTop: 16, fontSize: 11, color: C.textSec, lineHeight: 1.8, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: 16 }}>
            Prices move purely from supply and demand imbalance. More people wanting to buy than sell = price goes up. A large sell order can temporarily push the price down. News, earnings, and macro events all shift the buyer/seller balance instantly.
          </div>
        </Section>

        {/* 4. Order types */}
        <Section id="order-types" subtitle="04 — ORDER TYPES" title="Market order vs Limit order vs Stop Loss">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ORDER_TYPES.map(o => (
              <div key={o.type} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 20 }}>{o.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: o.color }}>{o.type}</span>
                  </div>
                  <p style={{ fontSize: 11, color: C.textSec, lineHeight: 1.7, margin: 0 }}>{o.desc}</p>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: C.green, letterSpacing: 1, marginBottom: 6 }}>PROS</div>
                  {o.pros.map(p => <div key={p} style={{ fontSize: 11, color: C.text, marginBottom: 4 }}>✓ {p}</div>)}
                  <div style={{ fontSize: 9, color: C.red, letterSpacing: 1, marginBottom: 6, marginTop: 10 }}>CONS</div>
                  {o.cons.map(c => <div key={c} style={{ fontSize: 11, color: C.text, marginBottom: 4 }}>✗ {c}</div>)}
                </div>
                <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: 12 }}>
                  <div style={{ fontSize: 9, color: C.amber, letterSpacing: 1, marginBottom: 6 }}>EXAMPLE</div>
                  <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.7, fontStyle: 'italic' }}>{o.example}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 5. Participants */}
        <Section id="participants" subtitle="05 — WHO'S TRADING" title="Market participants and their role">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PARTICIPANTS.map(p => (
              <div key={p.name} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: 16, display: 'grid', gridTemplateColumns: 'auto 1fr minmax(60px, auto)', gap: 16, alignItems: 'center' }}>
                <span style={{ fontSize: 24 }}>{p.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: p.color, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.7 }}>{p.desc}</div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 60 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: p.color }}>{p.pct}%</div>
                  <div style={{ fontSize: 9, color: C.textSec }}>OF VOLUME</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 6. Trading hours */}
        <Section id="trading-hours" subtitle="06 — MARKET HOURS" title="NSE trading hours (IST)">
          <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 'clamp(12px, 3vw, 24px)', maxWidth: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {HOURS.map((h, i) => (
                <div key={h.time} style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
                  {/* Left column: dot + line */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40, flexShrink: 0 }}>
                    <div style={{ width: 16, height: 16, borderRadius: 8, background: h.active ? C.green : C.bg, border: `2px solid ${h.color}`, flexShrink: 0, marginTop: 4 }} />
                    {i < HOURS.length - 1 && (
                      <div style={{ width: 1, flex: 1, background: C.border, minHeight: 20, margin: '4px 0' }} />
                    )}
                  </div>
                  {/* Right column: time + content */}
                  <div style={{ paddingBottom: i < HOURS.length - 1 ? 20 : 0, paddingTop: 2 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: h.color, marginBottom: 3 }}>{h.time}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 2 }}>{h.label}</div>
                    <div style={{ fontSize: 11, color: C.textSec }}>{h.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        </>}

        {market === 'bond' && <BondMarket />}
        {market === 'derivatives' && <DerivativesMarket />}

        {/* CTA */}
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>Ready to go deeper?</div>
          <div style={{ fontSize: 12, color: C.textSec, marginBottom: 20 }}>Use our financial calculators to plan your investments, or check the glossary for more terms.</div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/calculators" style={{ background: C.amber, color: '#020c18', padding: '10px 24px', textDecoration: 'none', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, borderRadius: 3 }}>CALCULATORS →</Link>
            <Link to="/glossary" style={{ background: 'transparent', color: C.amber, padding: '10px 24px', textDecoration: 'none', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, borderRadius: 3, border: `1px solid ${C.amber}` }}>GLOSSARY →</Link>
          </div>
        </div>

      </div>
    </div>
  )
}
