import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { C, MONO, Section } from './shared'

const BOND_TYPES = [
  { name: 'G-Secs',         full: 'Government Securities',  icon: '🏛️', color: '#2196f3', issuer: 'Central Govt', risk: 'Zero',     return: '6.5–7.5%',         tenure: '1–40 years',      how: 'RBI Retail Direct, Zerodha, DHAN' },
  { name: 'T-Bills',        full: 'Treasury Bills',         icon: '⏱️', color: '#06b6d4', issuer: 'Central Govt', risk: 'Zero',     return: '6.5–7%',           tenure: '91/182/364 days', how: 'RBI Retail Direct' },
  { name: 'SDL',            full: 'State Development Loans',icon: '🗺️', color: '#a855f7', issuer: 'State Govts',  risk: 'Near Zero',return: '7–7.5%',           tenure: '5–25 years',      how: 'RBI Retail Direct, NSE' },
  { name: 'Corporate Bonds',full: 'Corporate Bonds',        icon: '🏢', color: C.amber,   issuer: 'Companies',    risk: 'Moderate', return: '8–12%',            tenure: '1–10 years',      how: 'NSE, BSE, Bond platforms' },
  { name: 'SGB',            full: 'Sovereign Gold Bonds',   icon: '🥇', color: '#f59e0b', issuer: 'RBI (Govt)',   risk: 'Low',      return: '2.5% + gold price', tenure: '8 years',         how: 'Secondary market only (NSE/BSE) — RBI stopped new issuances after Feb 2024' },
]

function YieldPriceDemo() {
  const [rate, setRate] = useState(7)
  const baseRate  = 7
  const faceValue = 1000
  const coupon    = faceValue * baseRate / 100
  const bondPrice = Math.round(coupon / (rate / 100))
  const priceUp   = bondPrice > faceValue
  const priceDown = bondPrice < faceValue
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
      <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>THE MOST IMPORTANT BOND CONCEPT — DRAG THE SLIDER</div>
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: 16, marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {[
          { label: 'FACE VALUE',    val: '₹1,000',                     sub: 'Fixed',                color: C.text    },
          { label: 'COUPON (FIXED)', val: `₹${coupon}/yr`,             sub: 'Never changes',        color: C.text    },
          { label: 'MARKET RATE',   val: `${rate}%`,                   sub: 'Set by RBI/market',    color: C.amber   },
          { label: 'BOND PRICE NOW', val: `₹${bondPrice.toLocaleString('en-IN')}`, sub: priceDown ? '▼ Below face value' : priceUp ? '▲ Above face value' : '= At face value', color: priceDown ? C.red : priceUp ? C.green : C.text },
        ].map(item => (
          <div key={item.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: C.textSec, marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: item.color }}>{item.val}</div>
            <div style={{ fontSize: 10, color: item.color === C.text ? C.textSec : item.color }}>{item.sub}</div>
          </div>
        ))}
      </div>
      <input type="range" min={4} max={12} step={0.5} value={rate} onChange={e => setRate(Number(e.target.value))} style={{ width: '100%', accentColor: C.amber }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: C.textDim, marginTop: 4 }}>
        <span>4% → Bond price RISES</span><span>12% → Bond price FALLS</span>
      </div>
      <div style={{ marginTop: 16, fontSize: 11, color: C.textSec, lineHeight: 1.8, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: 12 }}>
        <strong style={{ color: C.amber }}>The golden rule:</strong> When interest rates go UP, bond prices go DOWN. When rates go DOWN, prices go UP.{' '}
        {rate > baseRate
          ? `Rates rose from 7% to ${rate}%. New bonds pay ₹${Math.round(1000 * rate / 100)}/year. Your old bond only pays ₹${coupon}/year — buyers will only pay ₹${bondPrice.toLocaleString('en-IN')} for it.`
          : rate < baseRate
          ? `Rates fell from 7% to ${rate}%. New bonds only pay ₹${Math.round(1000 * rate / 100)}/year. Your old bond pays ₹${coupon}/year — buyers pay a premium of ₹${bondPrice.toLocaleString('en-IN')}.`
          : `At 7%, your bond pays ₹${coupon}/year on ₹1,000 face value — exactly matching market rate. Trades at face value.`}
      </div>
    </div>
  )
}

export default function BondMarket() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text, overflowX: 'hidden' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(24px, 4vw, 52px) clamp(12px, 3vw, 24px)' }}>
        <Link to="/how-markets-work" style={{ fontSize: 11, color: C.textSec, textDecoration: 'none', letterSpacing: 1 }}>← HOW MARKETS WORK</Link>
        <div style={{ marginTop: 24, marginBottom: 48 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 8 }}>EXPLAINER</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>Bond Market</h1>
          <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.9, maxWidth: 640 }}>
            When governments and companies need money, they borrow it from investors. That's a bond — a loan with a fixed interest payment and a repayment date.
          </p>
        </div>

        <Section subtitle="01 — WHAT IS A BOND" title="Bonds — when you lend money to governments and companies">
          <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 20 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.amber, marginBottom: 12 }}>Equity vs Bond</div>
                {[['Equity', 'You own a piece of a company. Returns depend on profit. High risk, high reward.', C.green], ['Bond', 'You lend money. Borrower pays fixed interest. Lower risk, predictable return.', C.blue]].map(([t, d, col]) => (
                  <div key={t} style={{ background: C.bg, border: `1px solid ${col}33`, borderRadius: 3, padding: 12, marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: col, marginBottom: 4 }}>{t}</div>
                    <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.7 }}>{d}</div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.amber, marginBottom: 12 }}>Bond basics</div>
                {[['Face Value', 'The principal — typically ₹1,000 per bond. Returned at maturity.'], ['Coupon', 'Fixed interest paid periodically. 7% on ₹1,000 = ₹70/year.'], ['Maturity', 'When the issuer repays the face value. 91 days to 40 years.'], ['Yield', 'Actual return based on current price. Yield = Coupon / Price.'], ['Credit Rating', 'AAA = safest. D = default. Higher risk = higher yield demanded.']].map(([t, d]) => (
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
                  {[['RISK', b.risk, ['Zero','Near Zero','Low'].includes(b.risk) ? C.green : C.amber], ['RETURN', b.return, C.amber], ['TENURE', b.tenure, C.text]].map(([l, v, col]) => (
                    <div key={l} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 2, padding: '6px 8px' }}>
                      <div style={{ fontSize: 8, color: C.textSec }}>{l}</div>
                      <div style={{ fontSize: 10, color: col, fontWeight: 600, marginTop: 2 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: 10 }}>
                  <div style={{ fontSize: 9, color: C.textSec, marginBottom: 4 }}>HOW TO BUY</div>
                  <div style={{ fontSize: 11, color: C.text }}>{b.how}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section subtitle="04 — RBI'S ROLE" title="How RBI controls the bond market">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 16 }}>
            {[
              { icon: '📉', title: 'Rate Cut → Bonds Up',    desc: 'When RBI cuts the repo rate, existing bonds with higher coupons become more valuable. Bond prices rise.' },
              { icon: '📈', title: 'Rate Hike → Bonds Down', desc: 'When RBI hikes rates, new bonds offer better returns. Old bonds become less attractive. Bond prices fall.' },
              { icon: '🖨️', title: 'Open Market Operations', desc: 'RBI buys or sells G-Secs to control liquidity. Buying injects money; selling removes it.' },
              { icon: '📊', title: '10-Year G-Sec Yield',    desc: 'India\'s benchmark interest rate indicator. When this rises, home loan and corporate borrowing rates follow.' },
            ].map(item => (
              <div key={item.title} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: 16 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.amber, marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.7 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </div>
  )
}
