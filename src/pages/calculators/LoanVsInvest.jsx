import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts'
import Navbar from '../../components/Navbar'

const C = {
  bg: '#020c18', panel: '#050f1e', border: '#0c1d34',
  amber: '#f5a623', green: '#00e676', red: '#ff3c5c', blue: '#2196f3', purple: '#a855f7',
  text: '#c8d8f0', textSec: '#506888', textDim: '#1e3050',
}
const MONO = "'Consolas','Menlo','Monaco','Courier New',monospace"

const fmtIN = n => {
  if (!n || n <= 0) return '₹0'
  if (n >= 1e7) return '₹' + (n / 1e7).toFixed(2) + ' Cr'
  if (n >= 1e5) return '₹' + (n / 1e5).toFixed(1) + ' L'
  return '₹' + Math.round(n).toLocaleString('en-IN')
}

const LOAN_PRESETS = [
  { label: 'Home Loan',     rate: 8.5  },
  { label: 'Car Loan',      rate: 10.0 },
  { label: 'Personal Loan', rate: 14.0 },
  { label: 'Credit Card',   rate: 42.0 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, padding: '10px 14px', fontFamily: MONO, fontSize: 11 }}>
      <div style={{ color: C.textSec, marginBottom: 6 }}>Month {label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: {fmtIN(p.value)}
        </div>
      ))}
    </div>
  )
}

export default function LoanVsInvest() {
  const [mode, setMode] = useState('lump')           // 'lump' | 'monthly'
  const [balance, setBalance] = useState(3000000)    // ₹30L outstanding
  const [loanRate, setLoanRate] = useState(8.5)
  const [tenure, setTenure] = useState(240)          // months remaining
  const [extra, setExtra] = useState(500000)         // ₹5L lump or ₹10K/mo
  const [investReturn, setInvestReturn] = useState(12)

  // ── Core simulation ───────────────────────────────────────────────────────
  const results = useMemo(() => {
    const r = loanRate / 100 / 12
    const inv = investReturn / 100 / 12

    // Original EMI
    const emi = r > 0
      ? balance * r * Math.pow(1 + r, tenure) / (Math.pow(1 + r, tenure) - 1)
      : balance / tenure

    // ── BASELINE: no extra payment ──────────────────────────────────────────
    let baseBal = balance
    let baseTotalInterest = 0
    for (let m = 0; m < tenure; m++) {
      const int = baseBal * r
      baseTotalInterest += int
      baseBal = Math.max(baseBal + int - emi, 0)
    }

    // ── PREPAYMENT PATH ─────────────────────────────────────────────────────
    let prepayBal = balance
    let prepayInterest = 0
    let prepayMonths = 0
    let prepayCorpus = 0  // money freed up after loan ends, invested

    if (mode === 'lump') {
      // Apply lump sum to principal immediately
      prepayBal = Math.max(balance - extra, 0)
    }

    const prepayChart = []
    for (let m = 0; m < tenure + 1; m++) {
      if (mode === 'monthly' && m > 0) {
        // Extra goes to principal each month
        prepayBal = Math.max(prepayBal - extra, 0)
      }
      prepayChart.push({ month: m, loanBal: Math.round(prepayBal) })

      if (prepayBal <= 0) {
        prepayMonths = m
        // After prepayment clears loan, invest EMI + extra for remaining months
        const remaining = tenure - m
        for (let k = 0; k < remaining; k++) {
          const monthlyFree = mode === 'monthly' ? emi + extra : emi
          prepayCorpus = prepayCorpus * (1 + inv) + monthlyFree
        }
        break
      }

      const int = prepayBal * r
      prepayInterest += int
      prepayBal = Math.max(prepayBal + int - emi, 0)

      if (m === tenure) prepayMonths = tenure
    }

    const interestSaved = baseTotalInterest - prepayInterest
    const monthsSaved = tenure - prepayMonths

    // ── INVESTMENT PATH ─────────────────────────────────────────────────────
    let investBal = balance
    let investCorpus = mode === 'lump' ? extra : 0
    let investInterest = 0

    const investChart = []
    for (let m = 0; m <= tenure; m++) {
      investChart.push({
        month: m,
        corpus: Math.round(investCorpus),
        loanBal: Math.round(investBal),
      })

      if (m === tenure) break

      // Loan continues normally
      const int = investBal * r
      investInterest += int
      investBal = Math.max(investBal + int - emi, 0)

      // Corpus grows
      investCorpus = investCorpus * (1 + inv)
      if (mode === 'monthly') investCorpus += extra
    }

    const extraInterestPaid = investInterest - prepayInterest

    // Net comparison at end of original tenure
    // Prepay: loan paid off early, then free cash invested → prepayCorpus
    // Invest: loan runs full tenure, corpus at end → investCorpus
    const prepayNetBenefit = prepayCorpus + interestSaved
    const investNetBenefit = investCorpus - extraInterestPaid

    const investWins = investCorpus > prepayCorpus + interestSaved
    const difference = Math.abs(investCorpus - (prepayCorpus + interestSaved))

    // Break-even return rate (≈ loan rate for monthly compounding)
    const breakevenRate = loanRate

    // Crossover point: when corpus > loan balance (invest path)
    let crossoverMonth = null
    for (const pt of investChart) {
      if (pt.corpus >= pt.loanBal && pt.loanBal > 0) {
        crossoverMonth = pt.month
        break
      }
    }

    // Merge chart data
    const chartData = investChart.map((pt, i) => ({
      month: pt.month,
      'Loan Balance': pt.loanBal,
      'Investment Corpus': pt.corpus,
    }))

    return {
      emi, baseTotalInterest, interestSaved, monthsSaved, prepayMonths,
      investCorpus, prepayCorpus, investWins, difference,
      breakevenRate, crossoverMonth, chartData,
      prepayNetBenefit, investNetBenefit,
    }
  }, [mode, balance, loanRate, tenure, extra, investReturn])

  const sliders = [
    { label: 'OUTSTANDING BALANCE', value: balance, setter: setBalance, min: 100000, max: 10000000, step: 100000, fmt: fmtIN },
    { label: 'LOAN INTEREST RATE', value: loanRate, setter: setLoanRate, min: 4, max: 45, step: 0.5, fmt: v => v + '%' },
    { label: 'REMAINING TENURE', value: tenure, setter: setTenure, min: 12, max: 360, step: 12, fmt: v => Math.round(v / 12) + ' yrs' },
    { label: mode === 'lump' ? 'LUMP SUM AMOUNT' : 'EXTRA PER MONTH', value: extra, setter: setExtra, min: mode === 'lump' ? 50000 : 1000, max: mode === 'lump' ? 5000000 : 100000, step: mode === 'lump' ? 50000 : 1000, fmt: fmtIN },
    { label: 'EXPECTED INVESTMENT RETURN', value: investReturn, setter: setInvestReturn, min: 4, max: 20, step: 0.5, fmt: v => v + '%' },
  ]

  const winner = results.investWins ? 'INVEST' : 'PREPAY'
  const winnerColor = results.investWins ? C.green : C.amber

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(24px, 4vw, 52px) clamp(12px, 3vw, 24px)' }}>

        {/* Header */}
        <Link to="/calculators" style={{ fontSize: 11, color: C.textSec, textDecoration: 'none', letterSpacing: 1 }}>← CALCULATORS</Link>
        <div style={{ marginTop: 24, marginBottom: 40 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 8 }}>CALCULATOR</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Loan Prepayment vs Invest</h1>
          <p style={{ fontSize: 12, color: C.textSec, lineHeight: 1.8, maxWidth: 580 }}>
            Should you use extra money to prepay your loan or invest it? The answer depends entirely on whether your loan rate is higher or lower than your expected returns.
          </p>
        </div>

        {/* Loan presets */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {LOAN_PRESETS.map(p => (
            <button key={p.label} onClick={() => setLoanRate(p.rate)} style={{
              background: loanRate === p.rate ? C.amber + '22' : C.panel,
              color: loanRate === p.rate ? C.amber : C.textSec,
              border: `1px solid ${loanRate === p.rate ? C.amber : C.border}`,
              padding: '6px 14px', fontSize: 11, fontFamily: MONO, cursor: 'pointer', borderRadius: 2,
            }}>
              {p.label} {p.rate}%
            </button>
          ))}
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 28, border: `1px solid ${C.border}`, borderRadius: 3, width: 'fit-content', overflow: 'hidden' }}>
          {[['lump', '💰 Lump Sum'], ['monthly', '📅 Monthly Extra']].map(([key, label]) => (
            <button key={key} onClick={() => { setMode(key); setExtra(key === 'lump' ? 500000 : 10000) }} style={{
              padding: '9px 22px', background: mode === key ? C.amber : 'transparent',
              color: mode === key ? '#020c18' : C.textSec, border: 'none', cursor: 'pointer',
              fontSize: 11, fontFamily: MONO, fontWeight: mode === key ? 700 : 400, letterSpacing: 0.5,
            }}>{label}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: 24 }}>

          {/* Inputs */}
          <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
            <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>PARAMETERS</div>
            {sliders.map(s => (
              <div key={s.label} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 10, color: C.textSec, letterSpacing: 1 }}>{s.label}</label>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.amber }}>{s.fmt(s.value)}</span>
                </div>
                <input type="range" min={s.min} max={s.max} step={s.step} value={s.value}
                  onChange={e => s.setter(Number(e.target.value))}
                  style={{ width: '100%', accentColor: C.amber }} />
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, marginTop: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span style={{ color: C.textSec }}>Monthly EMI</span>
                <span style={{ color: C.text, fontWeight: 700 }}>{fmtIN(results.emi)}</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Verdict */}
            <div style={{ background: C.panel, border: `2px solid ${winnerColor}`, borderRadius: 4, padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: winnerColor, letterSpacing: 2, marginBottom: 6 }}>VERDICT</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: winnerColor, marginBottom: 6 }}>{winner}</div>
              <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.7 }}>
                {results.investWins
                  ? `Investing ${fmtIN(extra)} at ${investReturn}% beats prepaying your ${loanRate}% loan by ${fmtIN(results.difference)}.`
                  : `Prepaying your ${loanRate}% loan beats investing at ${investReturn}% by ${fmtIN(results.difference)}.`
                }
              </div>
            </div>

            {/* Side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: C.bg, border: `1px solid ${!results.investWins ? C.amber : C.border}`, borderRadius: 3, padding: 16 }}>
                <div style={{ fontSize: 10, color: C.amber, letterSpacing: 1, marginBottom: 10 }}>PREPAY</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.amber, marginBottom: 8 }}>{fmtIN(results.interestSaved)}</div>
                <div style={{ fontSize: 10, color: C.textSec, marginBottom: 6 }}>interest saved</div>
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 4 }}>
                  <div style={{ fontSize: 11, color: C.textSec }}>Loan ends {results.monthsSaved > 0 ? Math.round(results.monthsSaved / 12) + ' yrs earlier' : 'on schedule'}</div>
                  {results.prepayCorpus > 0 && <div style={{ fontSize: 11, color: C.textSec, marginTop: 4 }}>Then invest freed EMI → {fmtIN(results.prepayCorpus)}</div>}
                </div>
              </div>
              <div style={{ background: C.bg, border: `1px solid ${results.investWins ? C.green : C.border}`, borderRadius: 3, padding: 16 }}>
                <div style={{ fontSize: 10, color: C.green, letterSpacing: 1, marginBottom: 10 }}>INVEST</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.green, marginBottom: 8 }}>{fmtIN(results.investCorpus)}</div>
                <div style={{ fontSize: 10, color: C.textSec, marginBottom: 6 }}>corpus after {Math.round(tenure / 12)} yrs</div>
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 4 }}>
                  <div style={{ fontSize: 11, color: C.textSec }}>At {investReturn}% return</div>
                  {results.crossoverMonth && <div style={{ fontSize: 11, color: C.textSec, marginTop: 4 }}>Corpus &gt; loan at month {results.crossoverMonth}</div>}
                </div>
              </div>
            </div>

            {/* Break-even */}
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1, marginBottom: 4 }}>BREAK-EVEN RETURN RATE</div>
                  <div style={{ fontSize: 11, color: C.textSec }}>Invest only if you expect returns above this</div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.purple }}>{results.breakevenRate}%</div>
              </div>
              <div style={{ marginTop: 12, height: 6, background: C.border, borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.min((loanRate / 20) * 100, 100)}%`, background: C.purple, borderRadius: 3 }} />
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${Math.min((investReturn / 20) * 100, 100)}%`, width: 2, background: C.green }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: C.textDim, marginTop: 4 }}>
                <span>Break-even: {loanRate}%</span>
                <span style={{ color: C.green }}>Your return: {investReturn}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ marginTop: 24, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
          <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>LOAN BALANCE vs INVESTMENT CORPUS OVER TIME</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={results.chartData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
              <XAxis dataKey="month" tick={{ fill: C.textSec, fontSize: 10, fontFamily: MONO }} tickLine={false} axisLine={false}
                tickFormatter={v => v === 0 ? 'Now' : Math.round(v / 12) + 'yr'} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: MONO, color: C.textSec }} />
              {results.crossoverMonth && (
                <ReferenceLine x={results.crossoverMonth} stroke={C.border} strokeDasharray="4 4"
                  label={{ value: 'Crossover', position: 'top', fill: C.textSec, fontSize: 9, fontFamily: MONO }} />
              )}
              <Line type="monotone" dataKey="Loan Balance"        stroke={C.red}   strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Investment Corpus"   stroke={C.green} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Rule of thumb */}
        <div style={{ marginTop: 16, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 20 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 1.5, marginBottom: 14 }}>THE SIMPLE RULE</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {[
              { icon: '🏠', title: 'Home loan (8–9%)', verdict: 'Usually invest', color: C.green, desc: 'Index funds at 12%+ CAGR historically beat your loan rate. Keep paying EMI and invest the extra.' },
              { icon: '🚗', title: 'Car loan (10–12%)', verdict: 'Borderline', color: C.amber, desc: 'Depends on your return expectation. Markets aren\'t guaranteed. Prepaying gives a risk-free 10–12% return.' },
              { icon: '👤', title: 'Personal loan (14–18%)', verdict: 'Prepay first', color: C.red, desc: 'Hard to beat 14–18% guaranteed return through investing. Clear this before investing anything extra.' },
              { icon: '💳', title: 'Credit card (36–42%)', verdict: 'Prepay immediately', color: C.red, desc: 'No investment in history has returned 42% consistently. This is a financial emergency. Pay it off.' },
            ].map(item => (
              <div key={item.title} style={{ background: C.bg, border: `1px solid ${item.color}33`, borderRadius: 3, padding: 14 }}>
                <div style={{ fontSize: 18, marginBottom: 6 }}>{item.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 2 }}>{item.title}</div>
                <div style={{ fontSize: 10, color: item.color, fontWeight: 700, marginBottom: 6, letterSpacing: 0.5 }}>{item.verdict}</div>
                <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.7 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Links */}
        <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/calculators/emi"  style={{ fontSize: 11, color: C.amber, textDecoration: 'none', border: `1px solid ${C.amber}33`, padding: '8px 16px', borderRadius: 2 }}>EMI Calculator →</Link>
          <Link to="/calculators/sip"  style={{ fontSize: 11, color: C.textSec, textDecoration: 'none', border: `1px solid ${C.border}`, padding: '8px 16px', borderRadius: 2 }}>SIP Calculator →</Link>
        </div>

      </div>
    </div>
  )
}
