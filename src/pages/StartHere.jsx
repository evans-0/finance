import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const C = {
  bg: '#020c18', panel: '#050f1e', border: '#0c1d34',
  amber: '#f5a623', green: '#00e676', red: '#ff3c5c',
  blue: '#4fc3f7', purple: '#a855f7',
  text: '#c8d8f0', textSec: '#506888', textDim: '#1e3050',
}
const MONO = "'Consolas','Menlo','Monaco','Courier New',monospace"

const fmtIN = n => n >= 1e7 ? (n/1e7).toFixed(2) + ' Cr' : n >= 1e5 ? (n/1e5).toFixed(1) + ' L' : n.toLocaleString('en-IN')

// ── Compounding demo ──────────────────────────────────────────────────────────
function CompoundingDemo() {
  const [amount, setAmount] = useState(10000)
  const years = 20
  const savingsR = 0.035
  const investR = 0.12
  const savings = Math.round(amount * Math.pow(1 + savingsR, years))
  const invested = Math.round(amount * Math.pow(1 + investR, years))
  const diff = invested - savings

  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: 16, marginTop: 16 }}>
      <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1, marginBottom: 12 }}>SEE IT FOR YOURSELF</div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 10, color: C.textSec, display: 'block', marginBottom: 6 }}>ONE-TIME AMOUNT (₹)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input type="range" min={5000} max={500000} step={5000} value={amount} onChange={e => setAmount(+e.target.value)} style={{ flex: 1, accentColor: C.amber }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: C.amber, minWidth: 70 }}>₹{fmtIN(amount)}</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: 14 }}>
          <div style={{ fontSize: 10, color: C.textSec, marginBottom: 4 }}>SAVINGS ACCOUNT (3.5%)</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.textSec }}>₹{fmtIN(savings)}</div>
          <div style={{ fontSize: 10, color: C.textSec, marginTop: 4 }}>in {years} years</div>
        </div>
        <div style={{ background: C.panel, border: `1px solid ${C.green}`, borderRadius: 3, padding: 14 }}>
          <div style={{ fontSize: 10, color: C.green, marginBottom: 4 }}>INDEX FUND (12%)</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.green }}>₹{fmtIN(invested)}</div>
          <div style={{ fontSize: 10, color: C.textSec, marginTop: 4 }}>in {years} years</div>
        </div>
      </div>
      <div style={{ marginTop: 10, fontSize: 12, color: C.amber, textAlign: 'center', fontWeight: 700 }}>
        Difference: ₹{fmtIN(diff)} — from the same ₹{fmtIN(amount)}, doing nothing extra
      </div>
    </div>
  )
}

// ── Emergency fund check ──────────────────────────────────────────────────────
function EmergencyCheck() {
  const [expenses, setExpenses] = useState(30000)
  const [saved, setSaved] = useState(50000)
  const target = expenses * 6
  const pct = Math.min((saved / target) * 100, 100)
  const ok = saved >= target

  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: 16, marginTop: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div>
          <label style={{ fontSize: 10, color: C.textSec, display: 'block', marginBottom: 6 }}>MONTHLY EXPENSES (₹)</label>
          <input type="range" min={10000} max={200000} step={5000} value={expenses} onChange={e => setExpenses(+e.target.value)} style={{ width: '100%', accentColor: C.amber }} />
          <div style={{ fontSize: 12, color: C.amber, marginTop: 4 }}>₹{fmtIN(expenses)}</div>
        </div>
        <div>
          <label style={{ fontSize: 10, color: C.textSec, display: 'block', marginBottom: 6 }}>LIQUID SAVINGS (₹)</label>
          <input type="range" min={0} max={500000} step={10000} value={saved} onChange={e => setSaved(+e.target.value)} style={{ width: '100%', accentColor: C.amber }} />
          <div style={{ fontSize: 12, color: C.amber, marginTop: 4 }}>₹{fmtIN(saved)}</div>
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.textSec, marginBottom: 4 }}>
          <span>PROGRESS TO 6-MONTH TARGET (₹{fmtIN(target)})</span>
          <span>{pct.toFixed(0)}%</span>
        </div>
        <div style={{ height: 6, background: C.border, borderRadius: 3 }}>
          <div style={{ height: '100%', width: pct + '%', background: ok ? C.green : C.amber, borderRadius: 3, transition: 'width 0.3s' }} />
        </div>
      </div>
      <div style={{ fontSize: 11, color: ok ? C.green : C.amber, fontWeight: 600 }}>
        {ok ? '✓ Emergency fund looks good. You can start investing.' : `Need ₹${fmtIN(target - saved)} more before investing.`}
      </div>
    </div>
  )
}

// ── SIP starter demo ──────────────────────────────────────────────────────────
function SIPStarter() {
  const [monthly, setMonthly] = useState(3000)
  const years = 15
  const r = 0.12 / 12
  let corpus = 0
  for (let m = 0; m < years * 12; m++) corpus = corpus * (1 + r) + monthly
  corpus = Math.round(corpus)
  const invested = monthly * years * 12

  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: 16, marginTop: 16 }}>
      <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1, marginBottom: 12 }}>YOUR FIRST SIP</div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 10, color: C.textSec, display: 'block', marginBottom: 6 }}>MONTHLY AMOUNT (₹)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input type="range" min={500} max={50000} step={500} value={monthly} onChange={e => setMonthly(+e.target.value)} style={{ flex: 1, accentColor: C.amber }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: C.amber, minWidth: 70 }}>₹{fmtIN(monthly)}</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[
          { label: 'YOU INVEST', val: '₹' + fmtIN(invested), color: C.text },
          { label: 'GROWTH', val: '₹' + fmtIN(corpus - invested), color: C.green },
          { label: `AFTER ${years} YRS`, val: '₹' + fmtIN(corpus), color: C.amber },
        ].map(s => (
          <div key={s.label} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: C.textSec, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Step card ─────────────────────────────────────────────────────────────────
function Step({ number, title, why, children, links, done, skippable, profile }) {
  const [open, setOpen] = useState(false)
  const relevant = !profile || profile.steps.includes(number)
  const dimmed = profile && !relevant

  return (
    <div style={{ opacity: dimmed ? 0.4 : 1, transition: 'opacity 0.2s' }}>
      <div onClick={() => setOpen(o => !o)} style={{
        background: C.panel, border: `1px solid ${done ? C.green : open ? C.amber : C.border}`,
        borderRadius: open ? '4px 4px 0 0' : 4, padding: '18px 20px', cursor: 'pointer',
        transition: 'border-color 0.2s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: 16, background: done ? C.green : open ? C.amber : C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: done || open ? '#020c18' : C.textSec }}>{done ? '✓' : number}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: done ? C.green : C.text }}>{title}</div>
            <div style={{ fontSize: 11, color: C.textSec, marginTop: 3 }}>{why}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {skippable && <span style={{ fontSize: 9, color: C.textSec, border: `1px solid ${C.border}`, padding: '2px 6px', borderRadius: 2 }}>OPTIONAL</span>}
            <span style={{ fontSize: 11, color: C.textSec }}>{open ? '▲' : '▼'}</span>
          </div>
        </div>
      </div>

      {open && (
        <div style={{ background: C.panel, border: `1px solid ${C.amber}`, borderTop: 'none', borderRadius: '0 0 4px 4px', padding: '0 20px 20px' }}>
          {children}
          {links?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
              {links.map(l => (
                <Link key={l.label} to={l.to} style={{ fontSize: 11, color: C.blue, border: `1px solid ${C.border}`, padding: '5px 12px', borderRadius: 2, textDecoration: 'none', fontFamily: MONO, letterSpacing: 0.5 }}>
                  {l.label} →
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Profiles ──────────────────────────────────────────────────────────────────
const PROFILES = {
  fresh: {
    label: 'Just got my first job',
    desc: 'Start from the beginning — in the right order.',
    steps: [1, 2, 3, 4, 5],
    priority: 1,
  },
  saving: {
    label: 'I save but don\'t invest',
    desc: 'Your money is losing value sitting idle. Time to put it to work.',
    steps: [2, 3, 4, 5, 6],
    priority: 3,
  },
  debt: {
    label: 'I have loans / credit card debt',
    desc: 'Paying off expensive debt is investing. Do this first.',
    steps: [2, 3, 5, 6],
    priority: 2,
  },
  investing: {
    label: 'I already invest',
    desc: 'Make sure the foundations are right, then optimise.',
    steps: [2, 5, 6, 7],
    priority: 4,
  },
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function StartHere() {
  const [profile, setProfile] = useState(null)

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text }}>
      <Navbar />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(24px, 4vw, 52px) clamp(12px, 3vw, 24px)' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 12 }}>FINANCIAL LITERACY</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>Start Here</h1>
          <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.9, maxWidth: 600 }}>
            Everything you need to go from "I should probably invest" to actually doing it — in the right order, with no jargon.
          </p>
        </div>

        {/* Profile picker */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 2, marginBottom: 16 }}>WHERE ARE YOU RIGHT NOW?</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10 }}>
            {Object.entries(PROFILES).map(([key, p]) => (
              <button key={key} onClick={() => setProfile(profile === key ? null : key)} style={{
                background: profile === key ? C.amber + '18' : C.panel,
                border: `1px solid ${profile === key ? C.amber : C.border}`,
                borderRadius: 4, padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
                fontFamily: MONO, transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: profile === key ? C.amber : C.text, marginBottom: 6 }}>{p.label}</div>
                <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.6 }}>{p.desc}</div>
              </button>
            ))}
          </div>
          {profile && (
            <div style={{ marginTop: 12, fontSize: 11, color: C.textSec }}>
              Showing the most relevant steps for you. All steps are still accessible.
            </div>
          )}
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

          <Step number={1} title="Understand why this matters" why="Saving ≠ investing. Inflation is silently shrinking your money."
            profile={profile ? PROFILES[profile] : null}
            links={[
              { label: 'Compounding', to: '/glossary' },
              { label: 'Inflation Calculator', to: '/calculators/inflation' },
              { label: 'How Markets Work', to: '/how-markets-work' },
            ]}>
            <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.9, marginTop: 16 }}>
              India's inflation runs at <span style={{ color: C.amber }}>5–6% per year</span>. A savings account pays 3–4%. That means your money is losing purchasing power every single year you leave it idle.
              <br /><br />
              Investing is how you outpace inflation and build real wealth. The earlier you start, the more compounding works in your favour — not because of how much you invest, but because of <span style={{ color: C.amber }}>how long</span> it stays invested.
            </div>
            <CompoundingDemo />
          </Step>

          <Step number={2} title="Build your emergency fund first" why="Without this, any shock forces you to break investments or take on debt."
            profile={profile ? PROFILES[profile] : null}
            links={[
              { label: 'Emergency Fund Guide', to: '/how-markets-work' },
            ]}>
            <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.9, marginTop: 16 }}>
              Before investing a single rupee, keep <span style={{ color: C.amber }}>3–6 months of expenses</span> in a liquid account. Job loss, medical emergency, car breakdown — life happens. Without this buffer, you'll be forced to sell your investments at the worst possible time.
              <br /><br />
              Keep it in a <strong style={{ color: C.text }}>liquid mutual fund or sweep-in FD</strong> — not a savings account (3% return) and not equity (too volatile).
            </div>
            <EmergencyCheck />
          </Step>

          <Step number={3} title="Clear expensive debt first" why="Paying 42% credit card interest while earning 12% in equity is a guaranteed loss."
            profile={profile ? PROFILES[profile] : null}
            links={[
              { label: 'Credit Card Calculator', to: '/calculators/creditcard' },
              { label: 'Debt Payoff Guide', to: '/how-markets-work' },
            ]}>
            <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.9, marginTop: 16 }}>
              Simple rule: <span style={{ color: C.amber }}>pay off any debt above 10% interest before investing in equity.</span>
              <br /><br />
              Credit cards charge 36–48% annually. Personal loans 14–24%. These are guaranteed negative returns. No market investment consistently beats them. Paying them off is the best guaranteed "return" available anywhere.
            </div>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { type: 'Credit card debt', rate: '36–48%', action: 'Pay off immediately', color: C.red },
                { type: 'Personal loan',    rate: '14–24%', action: 'Pay off before investing', color: C.amber },
                { type: 'Car loan',         rate: '8–12%',  action: 'Pay minimums, invest rest', color: C.green },
                { type: 'Home loan',        rate: '8–9%',   action: 'Continue EMI, invest in parallel', color: C.green },
              ].map(d => (
                <div key={d.type} style={{ display: 'grid', gridTemplateColumns: '150px 80px 1fr', gap: 12, alignItems: 'center', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: '10px 14px' }}>
                  <span style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>{d.type}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: d.color }}>{d.rate}</span>
                  <span style={{ fontSize: 11, color: C.textSec }}>{d.action}</span>
                </div>
              ))}
            </div>
          </Step>

          <Step number={4} title="Start a SIP in an index fund" why="The simplest, cheapest, most proven way to begin investing."
            profile={profile ? PROFILES[profile] : null}
            links={[
              { label: 'SIP Calculator', to: '/calculators/sip' },
              { label: 'How Mutual Funds Work', to: '/how-markets-work' },
              { label: 'MF NAV Lookup', to: '/mf-nav' },
            ]}>
            <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.9, marginTop: 16 }}>
              Don't spend weeks researching which fund to pick. Start with a <span style={{ color: C.amber }}>Nifty 50 index fund</span> — it owns the top 50 Indian companies, charges 0.1–0.2% in fees, and has historically returned 12–14% annually over long periods.
              <br /><br />
              Set up a monthly SIP (auto-debit on salary day). ₹500/month works. The amount matters less than the habit. You can always increase it later.
            </div>
            <SIPStarter />
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Nifty 50 Index Fund', type: 'Large Cap Passive', expense: '~0.1–0.2%' },
                { label: 'Nifty Midcap 150 Index Fund', type: 'Mid Cap Passive', expense: '~0.2–0.4%' },
                { label: 'Flexi Cap Fund (Direct)', type: 'Active — Any Cap', expense: '~0.5–1%' },
              ].map(f => (
                <div key={f.label} style={{ display: 'grid', gridTemplateColumns: '1fr 130px 70px', gap: 12, alignItems: 'center', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: '10px 14px' }}>
                  <span style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>{f.label}</span>
                  <span style={{ fontSize: 10, color: C.textSec }}>{f.type}</span>
                  <span style={{ fontSize: 11, color: C.green }}>{f.expense}/yr</span>
                </div>
              ))}
            </div>
          </Step>

          <Step number={5} title="Save on taxes — 80C and beyond" why="The government will give you ₹46,800 back every year if you ask correctly."
            profile={profile ? PROFILES[profile] : null}
            links={[
              { label: '80C — Glossary', to: '/glossary' },
              { label: 'ELSS — Glossary', to: '/glossary' },
              { label: 'SIP Calculator', to: '/calculators/sip' },
            ]}>
            <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.9, marginTop: 16 }}>
              Under the old tax regime, Section 80C lets you deduct up to <span style={{ color: C.amber }}>₹1.5 lakh from your taxable income</span>. At 30% bracket, that's ₹46,800 saved in taxes every year.
            </div>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { option: 'ELSS Mutual Fund', lock: '3 years', return: 'Market-linked (~12%)', verdict: 'Best option — shortest lock-in, equity returns', color: C.green },
                { option: 'PPF',              lock: '15 years',return: '7.1% (guaranteed)',   verdict: 'Good for conservative savers', color: C.amber },
                { option: 'EPF',              lock: 'Until retirement', return: '8.15%',       verdict: 'Already deducted from salary', color: C.blue },
                { option: 'Life Insurance',   lock: 'Varies',   return: '4–6%',               verdict: 'Avoid — buy term separately', color: C.red },
              ].map(o => (
                <div key={o.option} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{o.option}</span>
                    <span style={{ fontSize: 10, color: o.color, border: `1px solid ${o.color}`, padding: '1px 6px', borderRadius: 2 }}>{o.lock}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.textSec }}>{o.return} · {o.verdict}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, background: C.panel, border: `1px solid ${C.amber}22`, borderRadius: 3, padding: '10px 14px', fontSize: 11, color: C.textSec, lineHeight: 1.7 }}>
              Note: 80C deductions only apply under the <strong style={{ color: C.text }}>old tax regime</strong>. If you've opted for the new regime, they don't apply — check with your employer which regime you're on.
            </div>
          </Step>

          <Step number={6} title="Get the right insurance" why="One hospital bill without cover can destroy years of savings."
            profile={profile ? PROFILES[profile] : null}
            links={[
              { label: 'Insurance Guide', to: '/how-markets-work' },
              { label: 'ULIP vs Term + MF', to: '/calculators/ulipvstermmf' },
            ]}>
            <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.9, marginTop: 16 }}>
              You need exactly two types of insurance. Nothing else.
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { type: 'Term Life Insurance', verdict: 'BUY', color: C.green, desc: '₹1 crore cover for ~₹10,000/year if you\'re 28. Pure protection — no investment component. Buy online directly from insurer.', condition: 'If anyone depends on your income' },
                { type: 'Health Insurance',    verdict: 'BUY', color: C.green, desc: 'A 5-day hospital stay can cost ₹2–5 lakh. One surgery can cost ₹10–20 lakh. Your employer\'s cover usually isn\'t enough and disappears if you quit.', condition: 'Everyone. No exceptions.' },
                { type: 'ULIP / Endowment',   verdict: 'AVOID', color: C.red, desc: 'Mixes insurance with investment. Charges are brutal — mortality charges, fund management fees, premium allocation charges. You\'ll almost always do better with term + index fund.', condition: '' },
              ].map(i => (
                <div key={i.type} style={{ background: C.bg, border: `1px solid ${i.color}33`, borderRadius: 3, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{i.type}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: i.color, border: `1px solid ${i.color}`, padding: '2px 8px', borderRadius: 2 }}>{i.verdict}</span>
                    {i.condition && <span style={{ fontSize: 10, color: C.textSec, marginLeft: 'auto' }}>{i.condition}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.7 }}>{i.desc}</div>
                </div>
              ))}
            </div>
          </Step>

          <Step number={7} title="Now go deeper" why="Once the basics are solid, there's a lot more to learn." skippable
            profile={profile ? PROFILES[profile] : null}
            links={[
              { label: 'All Calculators', to: '/calculators' },
              { label: 'Financial Glossary', to: '/glossary' },
              { label: 'How Markets Work', to: '/how-markets-work' },
              { label: 'Dashboard', to: '/dashboard' },
            ]}>
            <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.9, marginTop: 16 }}>
              Once you have an emergency fund, no expensive debt, a running SIP, tax-saving sorted, and the right insurance — the foundation is solid. Now you can explore:
            </div>
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {[
                { topic: 'Mid & Small Cap funds', why: 'Higher growth, higher risk' },
                { topic: 'Direct equity',          why: 'Individual stocks — only after MF habit' },
                { topic: 'PPF / NPS',              why: 'Long-term tax-efficient debt' },
                { topic: 'Real estate',            why: 'Use the Buy vs Rent calculator first' },
                { topic: 'Gold allocation',        why: '5–10% as inflation hedge' },
                { topic: 'F&O / Derivatives',      why: 'Only for hedging, not speculation' },
              ].map(t => (
                <div key={t.topic} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 4 }}>{t.topic}</div>
                  <div style={{ fontSize: 10, color: C.textSec }}>{t.why}</div>
                </div>
              ))}
            </div>
          </Step>

        </div>

        {/* Bottom note */}
        <div style={{ marginTop: 48, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24, fontSize: 11, color: C.textSec, lineHeight: 1.9 }}>
          <strong style={{ color: C.amber }}>A note on advice:</strong> Everything on this page is general financial education, not personalised advice. Tax rules change, fund past performance doesn't guarantee future returns, and your situation is unique. Use this as a starting framework, not a prescription. When in doubt, consult a SEBI-registered financial advisor.
        </div>

      </div>
    </div>
  )
}
