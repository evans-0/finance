import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { C, MONO, Section } from './shared'

const FUND_FLOW = [
  { icon: '👤', label: 'YOU',          sub: 'Invest ₹5,000/mo',       color: C.amber  },
  { icon: '🏢', label: 'AMC',          sub: 'Mirae / SBI / HDFC',     color: C.blue   },
  { icon: '👔', label: 'FUND MANAGER', sub: 'Decides what to buy',    color: C.purple },
  { icon: '📊', label: 'PORTFOLIO',    sub: 'Basket of stocks/bonds', color: C.green  },
  { icon: '📈', label: 'RETURNS',      sub: 'NAV grows over time',    color: C.amber  },
]

function FundFlow() {
  const [active, setActive] = useState(-1)
  const [running, setRunning] = useState(false)
  const [mobile, setMobile] = useState(window.innerWidth < 600)
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 600)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  const run = () => {
    if (running) return
    setRunning(true); setActive(-1)
    FUND_FLOW.forEach((_, i) => {
      setTimeout(() => { setActive(i); if (i === FUND_FLOW.length - 1) setRunning(false) }, i * 700)
    })
  }
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
      <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>WHERE YOUR MONEY GOES</div>
      {!mobile ? (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          {FUND_FLOW.map((step, i) => (
            <div key={step.label} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ textAlign: 'center', padding: '12px 16px', borderRadius: 4, minWidth: 100, background: active >= i ? step.color + '22' : C.bg, border: `1px solid ${active >= i ? step.color : C.border}`, transition: 'all 0.3s' }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{step.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: active >= i ? step.color : C.textSec }}>{step.label}</div>
                <div style={{ fontSize: 9, color: C.textSec, marginTop: 2 }}>{step.sub}</div>
              </div>
              {i < FUND_FLOW.length - 1 && (
                <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, width: 32 }}>
                  <div style={{ flex: 1, height: 2, background: active > i ? C.green : C.border, transition: 'background 0.3s' }} />
                  <div style={{ fontSize: 10, color: active > i ? C.green : C.border, marginLeft: -1 }}>▶</div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 24 }}>
          {FUND_FLOW.map((step, i) => (
            <div key={step.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 12px', borderRadius: 4, background: active >= i ? step.color + '22' : C.bg, border: `1px solid ${active >= i ? step.color : C.border}`, transition: 'all 0.3s' }}>
                <span style={{ fontSize: 20 }}>{step.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: active >= i ? step.color : C.textSec }}>{step.label}</div>
                  <div style={{ fontSize: 10, color: C.textSec }}>{step.sub}</div>
                </div>
              </div>
              {i < FUND_FLOW.length - 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 28 }}>
                  <div style={{ width: 2, flex: 1, background: active > i ? C.green : C.border }} />
                  <div style={{ fontSize: 10, color: active > i ? C.green : C.border }}>▼</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <button onClick={run} disabled={running} style={{ background: running ? C.bg : C.amber, color: running ? C.textSec : '#020c18', border: `1px solid ${running ? C.border : C.amber}`, padding: '8px 20px', fontSize: 11, fontFamily: MONO, cursor: running ? 'not-allowed' : 'pointer', borderRadius: 2, fontWeight: 700, letterSpacing: 1 }}>
        {running ? 'INVESTING...' : '▶ TRACE MY MONEY'}
      </button>
    </div>
  )
}

function ActiveVsPassive() {
  const [monthly, setMonthly] = useState(5000)
  const fmtIN = n => n >= 1e7 ? (n/1e7).toFixed(2) + ' Cr' : n >= 1e5 ? (n/1e5).toFixed(1) + ' L' : n.toLocaleString('en-IN')
  const calc = (er) => { let c = 0; const r = (0.12 - er) / 12; for (let m = 0; m < 240; m++) c = c * (1 + r) + monthly; return Math.round(c) }
  const activeVal = calc(0.015); const passiveVal = calc(0.001); const diff = passiveVal - activeVal
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
      <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>EXPENSE RATIO — THE SILENT KILLER</div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <label style={{ fontSize: 10, color: C.textSec, letterSpacing: 1 }}>MONTHLY SIP</label>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.amber }}>₹{fmtIN(monthly)}</span>
        </div>
        <input type="range" min={1000} max={50000} step={1000} value={monthly} onChange={e => setMonthly(+e.target.value)} style={{ width: '100%', accentColor: C.amber }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {[{ label: 'ACTIVE FUND', er: '1.5%', val: activeVal, color: C.red }, { label: 'INDEX FUND', er: '0.1%', val: passiveVal, color: C.green }].map(f => (
          <div key={f.label} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: 16 }}>
            <div style={{ fontSize: 10, color: f.color, letterSpacing: 1, marginBottom: 6 }}>{f.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: f.color }}>₹{fmtIN(f.val)}</div>
            <div style={{ fontSize: 10, color: C.textSec, marginTop: 4 }}>{f.er} expense ratio</div>
          </div>
        ))}
      </div>
      <div style={{ background: C.bg, border: `1px solid ${C.amber}`, borderRadius: 3, padding: '12px 16px', fontSize: 12, color: C.amber }}>
        Index fund gives <strong>₹{fmtIN(diff)}</strong> more over 20 years — purely from lower fees.
      </div>
    </div>
  )
}

const SEBI_CATEGORIES = [
  { name: 'Large Cap', icon: '🏛️', color: C.blue,    risk: 'LOW–MED',  desc: 'Top 100 companies by market cap. Stable, lower upside.',        example: 'Nifty 50 Index Fund' },
  { name: 'Mid Cap',   icon: '🏗️', color: C.amber,   risk: 'MEDIUM',   desc: 'Rank 101–250. Growth companies building scale.',                 example: 'Nifty Midcap 150' },
  { name: 'Small Cap', icon: '🚀', color: C.red,     risk: 'HIGH',     desc: 'Rank 251 and below. High growth potential, high volatility.',    example: 'Nifty Smallcap 250' },
  { name: 'Flexi Cap', icon: '🔀', color: C.purple,  risk: 'VAR',      desc: 'Fund manager freely allocates across large, mid, and small cap.', example: 'Parag Parikh Flexi Cap' },
  { name: 'ELSS',      icon: '🔒', color: C.green,   risk: 'MED–HIGH', desc: '3-year lock-in. Tax deduction up to ₹1.5L under 80C (old regime).', example: 'Mirae Asset ELSS' },
  { name: 'Debt Fund', icon: '🏦', color: '#4fc3f7', risk: 'LOW',      desc: 'Bonds, T-bills, govt securities. Predictable returns.',          example: 'HDFC Short Term Debt' },
]

const FACTSHEET_METRICS = [
  { metric: 'AUM',           what: 'Assets Under Management',   look: 'Larger = more investor trust. Very large AUM can limit mid/small cap alpha.' },
  { metric: 'Expense Ratio', what: 'Annual management fee',     look: 'Lower is better. Index funds: <0.2%. Active: 1–2%. This compounds against you.' },
  { metric: 'Sharpe Ratio',  what: 'Return per unit of risk',   look: '>1 is good, >2 is excellent. Compare funds in the same category.' },
  { metric: 'Alpha',         what: 'Excess return vs benchmark',look: 'Positive = fund manager adding value. Negative = paying fees for underperformance.' },
  { metric: 'Beta',          what: 'Volatility vs market',      look: '<1 = less volatile. Not always good — low beta funds may lag in bull markets.' },
  { metric: 'Std Deviation', what: 'How much returns swing',    look: 'Lower = more consistent. Compare across same category only.' },
  { metric: 'Exit Load',     what: 'Fee for early redemption',  look: 'Most equity funds: 1% if redeemed within 1 year. Zero after that.' },
]

function RegularVsDirect() {
  const [monthly, setMonthly] = useState(10000)
  const [years, setYears] = useState(20)
  const fmtIN = n => n >= 1e7 ? (n/1e7).toFixed(2) + ' Cr' : n >= 1e5 ? (n/1e5).toFixed(1) + ' L' : n.toLocaleString('en-IN')
  const calc = (er) => { let c = 0; const r = (0.12 - er) / 12; for (let m = 0; m < years * 12; m++) c = c * (1 + r) + monthly; return Math.round(c) }
  const directVal = calc(0.001); const regularVal = calc(0.010); const diff = directVal - regularVal
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
      <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>THE DISTRIBUTOR COMMISSION YOU NEVER SEE</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {[{ label: 'MONTHLY SIP (₹)', value: monthly, setter: setMonthly, min: 1000, max: 100000, step: 1000 }, { label: 'TIME HORIZON (YRS)', value: years, setter: setYears, min: 5, max: 35, step: 1 }].map(s => (
          <div key={s.label}>
            <label style={{ fontSize: 10, color: C.textSec, display: 'block', marginBottom: 6 }}>{s.label}</label>
            <input type="range" min={s.min} max={s.max} step={s.step} value={s.value} onChange={e => s.setter(+e.target.value)} style={{ width: '100%', accentColor: C.amber }} />
            <div style={{ fontSize: 12, color: C.amber, marginTop: 4 }}>{s.label.includes('YRS') ? s.value + ' years' : '₹' + fmtIN(s.value)}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div style={{ background: C.bg, border: `1px solid ${C.green}`, borderRadius: 3, padding: 16 }}>
          <div style={{ fontSize: 10, color: C.green, letterSpacing: 1, marginBottom: 6 }}>DIRECT PLAN</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.green }}>₹{fmtIN(directVal)}</div>
          <div style={{ fontSize: 10, color: C.textSec, marginTop: 6 }}>~0.1% expense ratio</div>
          <div style={{ fontSize: 10, color: C.textSec, marginTop: 4 }}>Zerodha Coin, MF Central, AMC website</div>
        </div>
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: 16 }}>
          <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1, marginBottom: 6 }}>REGULAR PLAN</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.textSec }}>₹{fmtIN(regularVal)}</div>
          <div style={{ fontSize: 10, color: C.textSec, marginTop: 6 }}>~1.0% expense ratio</div>
          <div style={{ fontSize: 10, color: C.textSec, marginTop: 4 }}>Sold by banks, agents, some apps</div>
        </div>
      </div>
      <div style={{ background: C.bg, border: `1px solid ${C.amber}`, borderRadius: 3, padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.amber, marginBottom: 4 }}>Direct plan gives ₹{fmtIN(diff)} more over {years} years</div>
        <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.8 }}>Same fund, same manager, same portfolio — only the expense ratio differs. This money goes to the distributor.</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[{ q: 'Are the funds different?', a: 'No. Same fund house, same manager, same portfolio. Only expense ratio differs.' }, { q: 'Why do regular plans exist?', a: 'Distributors earn a trail commission. They have no incentive to recommend direct.' }, { q: 'Should I always go direct?', a: 'Almost always yes, if you\'re self-directed. Fee-only financial planners are the exception.' }, { q: 'How do I switch?', a: 'Switch within the same fund house. It triggers a redemption — check for exit load and capital gains tax first.' }].map(item => (
          <div key={item.q} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 4 }}>Q: {item.q}</div>
            <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.7 }}>A: {item.a}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MutualFundsMarket() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text, overflowX: 'hidden' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(24px, 4vw, 52px) clamp(12px, 3vw, 24px)' }}>
        <Link to="/how-markets-work" style={{ fontSize: 11, color: C.textSec, textDecoration: 'none', letterSpacing: 1 }}>← HOW MARKETS WORK</Link>
        <div style={{ marginTop: 24, marginBottom: 48 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 8 }}>EXPLAINER</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>Mutual Funds</h1>
          <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.9, maxWidth: 640 }}>
            How pooled investing works, what the expense ratio actually costs you over time, and why the direct vs regular plan distinction matters more than most people realise.
          </p>
        </div>

        <Section id="mf-how" subtitle="01 — FUND STRUCTURE" title="How does a mutual fund actually work?">
          <FundFlow />
          <div style={{ marginTop: 16, fontSize: 11, color: C.textSec, lineHeight: 1.8, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: 16 }}>
            An AMC pools money from thousands of investors. A fund manager buys a diversified basket of securities. Your ownership is in <span style={{ color: C.amber }}>units</span> — when the portfolio grows, NAV per unit rises. You don't own the stocks directly; you own units of the fund.
          </div>
        </Section>

        <Section id="mf-active-passive" subtitle="02 — ACTIVE VS PASSIVE" title="Why expense ratio destroys more wealth than you think">
          <ActiveVsPassive />
          <div style={{ marginTop: 16, fontSize: 11, color: C.textSec, lineHeight: 1.8, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: 16 }}>
            Most active fund managers in India fail to beat the Nifty 50 index over 10+ year periods — yet they charge 10–15× more in fees. A 1.4% annual difference compounded over 20 years is life-changing money left on the table.
          </div>
        </Section>

        <Section id="mf-categories" subtitle="03 — SEBI CATEGORIES" title="Which type of fund is right for you?">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {SEBI_CATEGORIES.map(f => (
              <div key={f.name} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: f.color }}>{f.name}</div>
                    <div style={{ fontSize: 9, color: f.color, letterSpacing: 1 }}>RISK: {f.risk}</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.7, marginBottom: 10 }}>{f.desc}</div>
                <div style={{ fontSize: 10, color: C.textDim, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>e.g. {f.example}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 10, color: C.textSec }}>These are fund categories, not recommendations. Compare funds on MF Central, ValueResearch, or Morningstar India.</div>
        </Section>

        <Section id="mf-factsheet" subtitle="04 — READING A FACTSHEET" title="What to actually look at before investing">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {FACTSHEET_METRICS.map(m => (
              <div key={m.metric} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,120px),1fr))', gap: 16, alignItems: 'start', background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: '14px 18px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.amber }}>{m.metric}</div>
                <div style={{ fontSize: 11, color: C.textSec }}>{m.what}</div>
                <div style={{ fontSize: 11, color: C.text, lineHeight: 1.7 }}>✓ {m.look}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="mf-regular-direct" subtitle="05 — REGULAR VS DIRECT" title="The 1% you're silently paying every year">
          <RegularVsDirect />
          <div style={{ marginTop: 16, fontSize: 11, color: C.textSec, lineHeight: 1.8, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: 16 }}>
            Most people investing through a bank or agent are in regular plans without knowing it. Check your fund name — if it says "Regular" or "Growth - Regular", you're paying a commission. The same fund with "Direct" in the name is available on Zerodha Coin, MF Central, or directly on the AMC website.
          </div>
        </Section>

      </div>
    </div>
  )
}
