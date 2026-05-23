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

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HowMarketsWork() {
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
