import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { C, MONO, Section } from './shared'

function BudgetRule() {
  const [income, setIncome] = useState(60000)
  const fmtIN = n => n >= 1e5 ? (n/1e5).toFixed(1) + 'L' : n.toLocaleString('en-IN')
  const bars = [
    { label: 'NEEDS',   pct: 50, val: Math.round(income * 0.5), color: C.blue,  examples: 'Rent, groceries, EMIs, utilities, transport' },
    { label: 'WANTS',   pct: 30, val: Math.round(income * 0.3), color: C.amber, examples: 'Dining out, OTT, shopping, travel, hobbies' },
    { label: 'SAVINGS', pct: 20, val: Math.round(income * 0.2), color: C.green, examples: 'Investments, emergency fund, debt prepayment' },
  ]
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
      <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>THE 50/30/20 RULE</div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <label style={{ fontSize: 10, color: C.textSec, letterSpacing: 1 }}>MONTHLY TAKE-HOME SALARY</label>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.amber }}>₹{fmtIN(income)}</span>
        </div>
        <input type="range" min={20000} max={500000} step={5000} value={income} onChange={e => setIncome(+e.target.value)} style={{ width: '100%', accentColor: C.amber }} />
      </div>
      <div style={{ display: 'flex', height: 32, borderRadius: 3, overflow: 'hidden', marginBottom: 20 }}>
        {bars.map(b => (
          <div key={b.label} style={{ flex: b.pct, background: b.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#020c18', letterSpacing: 1 }}>{b.pct}%</span>
          </div>
        ))}
      </div>
      {bars.map(b => (
        <div key={b.label} style={{ display: 'grid', gridTemplateColumns: '80px 90px 1fr', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: b.color }} />
            <span style={{ fontSize: 10, color: b.color, fontWeight: 700 }}>{b.label}</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>₹{fmtIN(b.val)}</span>
          <span style={{ fontSize: 11, color: C.textSec }}>{b.examples}</span>
        </div>
      ))}
    </div>
  )
}

function EmergencyFund() {
  const [expenses, setExpenses] = useState(40000)
  const fmtIN = n => n >= 1e5 ? (n/1e5).toFixed(1) + ' L' : n.toLocaleString('en-IN')
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
      <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>EMERGENCY FUND CALCULATOR</div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <label style={{ fontSize: 10, color: C.textSec, letterSpacing: 1 }}>MONTHLY EXPENSES (₹)</label>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.amber }}>₹{fmtIN(expenses)}</span>
        </div>
        <input type="range" min={10000} max={300000} step={5000} value={expenses} onChange={e => setExpenses(+e.target.value)} style={{ width: '100%', accentColor: C.amber }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {[3, 6].map(months => (
          <div key={months} style={{ background: C.bg, border: `1px solid ${months === 6 ? C.amber : C.border}`, borderRadius: 3, padding: 16 }}>
            <div style={{ fontSize: 10, color: months === 6 ? C.amber : C.textSec, letterSpacing: 1, marginBottom: 6 }}>{months} MONTHS {months === 6 ? '← RECOMMENDED' : ''}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: months === 6 ? C.amber : C.text }}>₹{fmtIN(expenses * months)}</div>
            <div style={{ fontSize: 10, color: C.textSec, marginTop: 4 }}>{months === 3 ? 'Minimum' : 'Covers job loss, medical, major repairs'}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 12 }}>WHERE TO KEEP IT</div>
      {[{ label: 'Savings Account', ret: '3–4%', liquid: '✓ Instant',  note: '1 month here for immediate access' }, { label: 'Liquid Fund', ret: '6–7%', liquid: '✓ 1 day', note: 'Best for bulk of emergency fund. SEBI regulated.' }, { label: 'FD (sweep-in)', ret: '7–8%', liquid: '✓ Same day', note: 'Good return, full liquidity with sweep-in facility' }].map(w => (
        <div key={w.label} style={{ display: 'grid', gridTemplateColumns: '140px 60px 70px 1fr', gap: 12, alignItems: 'center', marginBottom: 8, padding: '10px 12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3 }}>
          <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{w.label}</span>
          <span style={{ fontSize: 11, color: C.green }}>{w.ret}</span>
          <span style={{ fontSize: 11, color: C.blue }}>{w.liquid}</span>
          <span style={{ fontSize: 11, color: C.textSec }}>{w.note}</span>
        </div>
      ))}
    </div>
  )
}

const DEBT_EXAMPLE = [
  { name: 'Credit Card',   balance: 180000, rate: 42, minPmt: 5500 },
  { name: 'Personal Loan', balance: 80000,  rate: 16, minPmt: 2000 },
  { name: 'Car Loan',      balance: 350000, rate: 10, minPmt: 8000 },
]

function DebtPayoff() {
  const [method, setMethod] = useState('avalanche')
  const fmtIN = n => n >= 1e5 ? (n/1e5).toFixed(1) + ' L' : n.toLocaleString('en-IN')
  const simulate = (debts, strategy) => {
    let d = debts.map(x => ({ ...x, bal: x.balance }))
    let totalInterest = 0, months = 0
    while (d.some(x => x.bal > 0) && months < 360) {
      months++
      d.forEach(x => { if (x.bal > 0) { const int = x.bal * x.rate / 100 / 12; totalInterest += int; x.bal = Math.max(x.bal + int - x.minPmt, 0) } })
      const target = strategy === 'avalanche' ? d.filter(x => x.bal > 0).sort((a, b) => b.rate - a.rate)[0] : d.filter(x => x.bal > 0).sort((a, b) => a.bal - b.bal)[0]
      if (target) target.bal = Math.max(target.bal - 5000, 0)
    }
    return { totalInterest: Math.round(totalInterest), months }
  }
  const avalanche = simulate(DEBT_EXAMPLE, 'avalanche')
  const snowball = simulate(DEBT_EXAMPLE, 'snowball')
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
      <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>DEBT PAYOFF STRATEGY — ₹5,000 EXTRA/MONTH</div>
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, border: `1px solid ${C.border}`, borderRadius: 3, overflow: 'hidden', width: 'fit-content' }}>
        {[['avalanche', '❄️ AVALANCHE'], ['snowball', '⛄ SNOWBALL']].map(([key, label]) => (
          <button key={key} onClick={() => setMethod(key)} style={{ padding: '8px 20px', background: method === key ? C.amber : 'transparent', color: method === key ? '#020c18' : C.textSec, border: 'none', cursor: 'pointer', fontSize: 11, fontFamily: MONO, fontWeight: method === key ? 700 : 400 }}>{label}</button>
        ))}
      </div>
      <div style={{ marginBottom: 16 }}>
        {DEBT_EXAMPLE.map((d, i) => {
          const isTarget = method === 'avalanche' ? i === 0 : i === 1
          return (
            <div key={d.name} style={{ display: 'grid', gridTemplateColumns: '130px 90px 60px 1fr', gap: 12, alignItems: 'center', padding: '10px 12px', background: isTarget ? C.amber + '0a' : C.bg, border: `1px solid ${isTarget ? C.amber : C.border}`, borderRadius: 3, marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{d.name}</span>
              <span style={{ fontSize: 11, color: C.text }}>₹{fmtIN(d.balance)}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: d.rate > 20 ? C.red : d.rate > 12 ? C.amber : C.green }}>{d.rate}%</span>
              <span style={{ fontSize: 10, color: C.amber }}>{isTarget ? (method === 'avalanche' ? '← Pay this first (highest rate)' : '← Pay this first (smallest balance)') : ''}</span>
            </div>
          )
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[{ label: 'AVALANCHE', months: avalanche.months, interest: avalanche.totalInterest, color: C.blue, note: 'Saves most money mathematically' }, { label: 'SNOWBALL', months: snowball.months, interest: snowball.totalInterest, color: C.purple, note: 'Better for motivation — quick wins' }].map(s => (
          <div key={s.label} style={{ background: C.bg, border: `1px solid ${method === s.label.toLowerCase() ? s.color : C.border}`, borderRadius: 3, padding: 16 }}>
            <div style={{ fontSize: 10, color: s.color, letterSpacing: 1, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 2 }}>{s.months} months</div>
            <div style={{ fontSize: 12, color: C.red, marginBottom: 6 }}>₹{fmtIN(s.interest)} interest paid</div>
            <div style={{ fontSize: 10, color: C.textSec }}>{s.note}</div>
          </div>
        ))}
      </div>
      {avalanche.totalInterest < snowball.totalInterest && (
        <div style={{ marginTop: 12, background: C.bg, border: `1px solid ${C.green}`, borderRadius: 3, padding: '10px 14px', fontSize: 11, color: C.green }}>
          Avalanche saves ₹{fmtIN(snowball.totalInterest - avalanche.totalInterest)} more. But the best strategy is the one you stick to.
        </div>
      )}
    </div>
  )
}

const INSURANCE_TYPES = [
  { type: 'Term Life Insurance', icon: '🛡️', color: C.green, verdict: 'BUY THIS',  desc: 'Pure protection. Your family gets the sum assured if you die. No returns if you survive — that\'s the point.', good: ['Very cheap — ₹1 crore cover for ~₹10,000/year at age 28', 'Simple, transparent', 'IRDAI regulated'], bad: ['No maturity benefit', 'Premiums lost if you outlive the term'] },
  { type: 'ULIP',                icon: '⚠️', color: C.red,   verdict: 'AVOID',     desc: 'Combines insurance with investment. High charges eat returns. Almost always worse than buying term + investing separately.', good: ['Tax benefit under 80C', 'One product for both needs'], bad: ['Mortality charges hidden in fine print', 'Fund management charges 1.35%+', 'Lock-in 5 years minimum', 'Returns rarely beat index funds'] },
  { type: 'Health Insurance',   icon: '🏥', color: C.blue,  verdict: 'MUST HAVE', desc: 'Covers hospitalisation and medical expenses. One serious illness without cover can wipe out years of savings.', good: ['Cashless treatment at network hospitals', 'Premium deductible under 80D', 'Family floater covers all members'], bad: ['Pre-existing conditions excluded for 2–4 years', 'Sub-limits on room rent in cheaper plans'] },
]

export default function PersonalFinance() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text, overflowX: 'hidden' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(24px, 4vw, 52px) clamp(12px, 3vw, 24px)' }}>
        <Link to="/how-markets-work" style={{ fontSize: 11, color: C.textSec, textDecoration: 'none', letterSpacing: 1 }}>← HOW MARKETS WORK</Link>
        <div style={{ marginTop: 24, marginBottom: 48 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 8 }}>EXPLAINER</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>Personal Finance</h1>
          <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.9, maxWidth: 640 }}>
            Budgeting, emergency funds, debt payoff, and insurance — the foundation before any investing begins.
          </p>
        </div>

        <Section id="pf-budget" subtitle="01 — BUDGETING" title="The 50/30/20 rule — a starting point">
          <BudgetRule />
          <div style={{ marginTop: 16, fontSize: 11, color: C.textSec, lineHeight: 1.8, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: 16 }}>
            The 50/30/20 rule is a guide, not a law. In expensive cities like Mumbai or Bengaluru, needs alone may consume 60–70%. The key: <span style={{ color: C.amber }}>pay yourself first</span>. Set up an auto-debit for your SIP on salary day so savings happen before spending.
          </div>
        </Section>

        <Section id="pf-emergency" subtitle="02 — EMERGENCY FUND" title="Build this before investing a single rupee">
          <EmergencyFund />
          <div style={{ marginTop: 16, fontSize: 11, color: C.textSec, lineHeight: 1.8, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: 16 }}>
            Without an emergency fund, any unexpected expense forces you to break your investments or take on debt. Build 3–6 months of expenses in liquid assets first. This is not an investment; it's insurance against life.
          </div>
        </Section>

        <Section id="pf-debt" subtitle="03 — DEBT PAYOFF" title="Avalanche vs Snowball — which should you use?">
          <DebtPayoff />
          <div style={{ marginTop: 16, fontSize: 11, color: C.textSec, lineHeight: 1.8, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: 16 }}>
            Any debt above 10% interest should be paid off before investing in equity. A 42% credit card is a guaranteed -42% return. Paying it off is the best risk-free return available anywhere.
          </div>
        </Section>

        <Section id="pf-insurance" subtitle="04 — INSURANCE" title="What to buy, what to avoid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {INSURANCE_TYPES.map(ins => (
              <div key={ins.type} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 24 }}>{ins.icon}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{ins.type}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: ins.color, border: `1px solid ${ins.color}`, padding: '2px 8px', borderRadius: 2, letterSpacing: 1 }}>{ins.verdict}</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.textSec, marginTop: 4, lineHeight: 1.7 }}>{ins.desc}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>{ins.good.map(g => <div key={g} style={{ fontSize: 11, color: C.text, marginBottom: 4 }}>✓ {g}</div>)}</div>
                  <div>{ins.bad.map(b => <div key={b} style={{ fontSize: 11, color: C.textSec, marginBottom: 4 }}>✗ {b}</div>)}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, fontSize: 11, color: C.textSec, lineHeight: 1.8, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: 16 }}>
            Rule of thumb: buy term cover of 10–15× your annual income. If you earn ₹10L/year, get a ₹1–1.5 crore term policy. This ensures your family can sustain their lifestyle from investment returns on the sum assured alone.
          </div>
        </Section>

      </div>
    </div>
  )
}
