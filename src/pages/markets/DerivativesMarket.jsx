import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { C, MONO, Section } from './shared'

function PayoffBuilder() {
  const [type, setType] = useState('call')
  const [strike, setStrike] = useState(22000)
  const [premium, setPremium] = useState(150)
  const [spot, setSpot] = useState(22200)
  const pnl = type === 'call' ? Math.max(0, spot - strike) - premium : Math.max(0, strike - spot) - premium
  const breakeven = type === 'call' ? strike + premium : strike - premium
  const isProfit = pnl >= 0
  const chartPoints = Array.from({ length: 41 }, (_, i) => {
    const price = Math.round(strike * 0.9 + (i * strike * 0.2 / 40))
    const p = type === 'call' ? Math.max(0, price - strike) - premium : Math.max(0, strike - price) - premium
    return { price, pnl: Math.round(p) }
  })
  const minP = Math.min(...chartPoints.map(d => d.pnl))
  const maxP = Math.max(...chartPoints.map(d => d.pnl))
  const range = maxP - minP || 1
  const W = 500, H = 180, PAD = 40
  const toY = v => PAD + ((maxP - v) / range) * (H - PAD * 2)
  const toX = i => PAD + (i / (chartPoints.length - 1)) * (W - PAD * 2)
  const zeroY = toY(0)
  const pathD = chartPoints.map((d, i) => (i === 0 ? 'M' : 'L') + toX(i).toFixed(1) + ',' + toY(d.pnl).toFixed(1)).join(' ')
  const beIdx = chartPoints.findIndex(p => p.price >= breakeven)
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
      <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>INTERACTIVE PAYOFF BUILDER</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 24 }}>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
            {['call', 'put'].map(t => (
              <button key={t} onClick={() => setType(t)} style={{ background: type === t ? (t === 'call' ? C.green : C.red) + '22' : C.bg, color: type === t ? (t === 'call' ? C.green : C.red) : C.textSec, border: `1px solid ${type === t ? (t === 'call' ? C.green : C.red) : C.border}`, padding: '10px', fontSize: 12, fontFamily: MONO, cursor: 'pointer', borderRadius: 3, fontWeight: 700 }}>
                {t === 'call' ? '📈 CALL' : '📉 PUT'}
              </button>
            ))}
          </div>
          {[['STRIKE PRICE', strike, setStrike, 18000, 26000, 100], ['PREMIUM PAID', premium, setPremium, 10, 500, 10], ['CURRENT PRICE', spot, setSpot, 18000, 26000, 100]].map(([label, val, setter, min, max, step]) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <label style={{ fontSize: 9, color: C.textSec, letterSpacing: 1 }}>{label}</label>
                <span style={{ fontSize: 11, color: C.amber }}>₹{val.toLocaleString('en-IN')}</span>
              </div>
              <input type="range" min={min} max={max} step={step} value={val} onChange={e => setter(Number(e.target.value))} style={{ width: '100%', accentColor: C.amber }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ background: C.bg, border: `2px solid ${isProfit ? C.green : C.red}`, borderRadius: 3, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: C.textSec, marginBottom: 4 }}>P&L AT ₹{spot.toLocaleString('en-IN')}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: isProfit ? C.green : C.red }}>{isProfit ? '+' : ''}₹{Math.abs(pnl).toLocaleString('en-IN')}</div>
          </div>
          {[['BREAKEVEN', '₹' + breakeven.toLocaleString('en-IN'), null], ['MAX LOSS', '₹' + premium.toLocaleString('en-IN') + ' (premium)', C.red], ['MAX PROFIT', type === 'call' ? 'Unlimited' : '₹' + (strike - premium).toLocaleString('en-IN'), C.green], ['IN THE MONEY', type === 'call' ? (spot > strike ? 'YES' : 'NO') : (spot < strike ? 'YES' : 'NO'), type === 'call' ? (spot > strike ? C.green : C.red) : (spot < strike ? C.green : C.red)]].map(([l, v, col]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 2 }}>
              <span style={{ fontSize: 10, color: C.textSec }}>{l}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: col || C.text }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 9, color: C.textSec, letterSpacing: 1, marginBottom: 8 }}>PAYOFF AT EXPIRY</div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
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

export default function DerivativesMarket() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text, overflowX: 'hidden' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(24px, 4vw, 52px) clamp(12px, 3vw, 24px)' }}>
        <Link to="/how-markets-work" style={{ fontSize: 11, color: C.textSec, textDecoration: 'none', letterSpacing: 1 }}>← HOW MARKETS WORK</Link>
        <div style={{ marginTop: 24, marginBottom: 48 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 8 }}>EXPLAINER</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>Derivatives</h1>
          <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.9, maxWidth: 640 }}>
            Futures and options — contracts that derive their value from an underlying asset. Designed for hedging. Frequently misused for speculation.
          </p>
        </div>

        <Section subtitle="01 — WHAT IS A DERIVATIVE" title="Contracts whose value comes from something else">
          <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
            <p style={{ fontSize: 11, color: C.textSec, lineHeight: 1.9, marginBottom: 20 }}>
              A derivative is a financial contract whose value is <span style={{ color: C.amber }}>derived from an underlying asset</span> — a stock, index, commodity, or currency. You are not buying the asset itself.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 12 }}>
              {[{ name: 'Futures', icon: '📋', color: C.blue, desc: 'A legal obligation to buy or sell at a set price on a future date. Both buyer and seller MUST fulfil the contract.', example: 'You agree to buy 1 lot of Nifty at 22,000 on expiry regardless of where Nifty actually trades.' }, { name: 'Options', icon: '⚖️', color: C.purple, desc: 'The right (not obligation) to buy or sell at a set price before expiry. Buyer pays a premium. Seller collects it.', example: 'You buy the right to purchase Nifty at 22,000. If Nifty hits 23,000, you profit 1,000 minus premium.' }].map(d => (
                <div key={d.name} style={{ background: C.bg, border: `1px solid ${d.color}33`, borderRadius: 3, padding: 16 }}>
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
          <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: MONO, fontSize: 11 }}>
                <thead>
                  <tr>{['', 'Futures', 'Options'].map((h, i) => <th key={i} style={{ padding: '8px 12px', borderBottom: `1px solid ${C.border}`, textAlign: 'left', fontSize: 10, fontWeight: 700, color: i === 0 ? C.textDim : i === 1 ? C.blue : C.purple, letterSpacing: 1 }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {[['Obligation', 'Must buy/sell', 'Right, not obligation'], ['Premium', 'No — pay margin', 'Yes — pay upfront'], ['Max loss (buyer)', 'Unlimited', 'Limited to premium'], ['Max profit (buyer)', 'Unlimited', 'Unlimited (calls)'], ['Leverage', 'Very high', 'High via premium'], ['Best used for', 'Hedging large positions', 'Defined risk bets']].map(([label, fut, opt], ri) => (
                    <tr key={label} style={{ background: ri % 2 === 0 ? C.bg : 'transparent' }}>
                      <td style={{ padding: '10px 12px', borderBottom: `1px solid ${C.border}`, color: C.textSec, fontWeight: 600 }}>{label}</td>
                      <td style={{ padding: '10px 12px', borderBottom: `1px solid ${C.border}`, color: C.text }}>{fut}</td>
                      <td style={{ padding: '10px 12px', borderBottom: `1px solid ${C.border}`, color: C.text }}>{opt}</td>
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
            {[{ title: 'What is margin?', color: C.amber, content: 'In F&O you do not pay the full contract value. You pay a fraction called margin — typically 10-20%. Nifty lot = 25 units × 22,000 = ₹5.5L contract. Margin needed: ~₹1.1L (20%). A 1% Nifty move = ₹5,500 gain/loss — a 5% move on your margin in one day.', warn: false }, { title: 'Margin call', color: C.red, content: 'If your position moves against you and balance falls below maintenance margin, your broker demands you top up immediately — or they square off your position at a loss. Margin calls can wipe out your entire capital in a single volatile session.', warn: true }].map(item => (
              <div key={item.title} style={{ background: C.panel, border: `1px solid ${item.color}44`, borderRadius: 4, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: item.color, marginBottom: 12 }}>{item.title}</div>
                <p style={{ fontSize: 11, color: C.textSec, lineHeight: 1.8 }}>{item.content}</p>
                {item.warn && <div style={{ background: '#1a0a0a', border: `1px solid ${C.red}`, borderRadius: 3, padding: 10, marginTop: 12, fontSize: 11, color: '#ffaaaa' }}>This is not hypothetical — it happens regularly in volatile markets.</div>}
              </div>
            ))}
          </div>
        </Section>

        <Section subtitle="05 — THE RISK REALITY" title="Why 90% of retail F&O traders lose money">
          <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: 12, marginBottom: 20 }}>
              {[['89%', 'Retail F&O traders lose money', C.red, 'SEBI Study 2023'], ['93%', 'Loss-making in options', C.red, 'SEBI Study 2024'], ['7.1M', 'Unique retail F&O traders', C.amber, 'NSE Data'], ['₹1.81L Cr', 'Retail losses FY2022-24', C.red, 'SEBI Study 2024']].map(([stat, label, color, source]) => (
                <div key={stat} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color }}>{stat}</div>
                  <div style={{ fontSize: 10, color: C.textSec, marginTop: 4, lineHeight: 1.5 }}>{label}</div>
                  <div style={{ fontSize: 9, color: C.textDim, marginTop: 6 }}>{source}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: C.textSec, lineHeight: 1.9 }}>
              <strong style={{ color: C.amber }}>Why do most retail traders lose?</strong>{' '}Options sellers are institutions and prop desks with massive capital, algorithms, and risk systems. Retail buyers pay premium to sophisticated sellers who do this professionally. Derivatives were designed for hedging — using them for speculation without deep knowledge is closer to gambling.
            </p>
          </div>
        </Section>

        <Section subtitle="06 — LEGITIMATE USE CASES" title="When derivatives actually make sense">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[{ icon: '🛡️', title: 'Hedging a portfolio', color: C.green, desc: 'You hold ₹10L of Nifty stocks. Before budget day you buy Nifty put options. If the market crashes, your puts profit and offset losses. This is what derivatives were designed for.' }, { icon: '💱', title: 'Currency hedging', color: C.blue, desc: 'An IT company earns in USD but pays salaries in INR. They use USD/INR futures to lock in the exchange rate and eliminate currency risk. Every large exporter does this.' }, { icon: '🌾', title: 'Commodity hedging', color: C.amber, desc: 'A flour mill buys wheat futures to lock in input costs 3 months ahead. An airline buys crude oil futures to stabilise fuel costs.' }, { icon: '⚠️', title: 'Speculation — high risk', color: C.red, desc: 'Betting on short-term market direction with leverage. SEBI data shows 89% of retail traders lose. If you do this, use only money you can afford to lose entirely.' }].map(item => (
              <div key={item.title} style={{ background: C.panel, border: `1px solid ${item.color}33`, borderRadius: 3, padding: 16, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: item.color, marginBottom: 6 }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.7 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </div>
  )
}
