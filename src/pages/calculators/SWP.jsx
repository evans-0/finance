import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import Navbar from '../../components/Navbar'

const C = {
  bg: '#020c18', panel: '#050f1e', border: '#0c1d34',
  amber: '#f5a623', green: '#00e676', red: '#ff3c5c', blue: '#2196f3', purple: '#a855f7',
  text: '#c8d8f0', textSec: '#506888', textDim: '#1e3050',
}
const MONO = "'Consolas','Menlo','Monaco','Courier New',monospace"

const fmtIN = n => {
  if (n >= 1e7) return '₹' + (n / 1e7).toFixed(2) + ' Cr'
  if (n >= 1e5) return '₹' + (n / 1e5).toFixed(1) + ' L'
  if (n >= 1e3) return '₹' + (n / 1e3).toFixed(1) + 'K'
  return '₹' + Math.round(n).toLocaleString('en-IN')
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const val = payload[0]?.value
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, padding: '10px 14px', fontFamily: MONO, fontSize: 11 }}>
      <div style={{ color: C.textSec, marginBottom: 4 }}>Year {label}</div>
      <div style={{ color: val > 0 ? C.green : C.red, fontWeight: 700 }}>
        {val > 0 ? fmtIN(val) : 'Depleted'}
      </div>
    </div>
  )
}

export default function SWP() {
  const [corpus,     setCorpus]     = useState(10000000)  // ₹1 Cr
  const [monthly,    setMonthly]    = useState(50000)
  const [returnRate, setReturnRate] = useState(10)
  const [inflation,  setInflation]  = useState(6)
  const [inflAdj,    setInflAdj]    = useState(true)

  const results = useMemo(() => {
    const monthlyRate = returnRate / 100 / 12
    const inflMonthly = inflation / 100 / 12
    let bal = corpus
    let withdrawal = monthly
    let totalWithdrawn = 0
    let depletionYear = null
    const data = [{ year: 0, corpus: bal }]

    for (let month = 1; month <= 600; month++) {
      // grow corpus
      bal = bal * (1 + monthlyRate)
      // withdraw
      bal -= withdrawal
      totalWithdrawn += withdrawal
      // increase withdrawal for inflation if enabled
      if (inflAdj) withdrawal *= (1 + inflMonthly)

      if (bal <= 0 && depletionYear === null) {
        depletionYear = Math.ceil(month / 12)
        bal = 0
      }

      if (month % 12 === 0) {
        const year = month / 12
        data.push({ year, corpus: Math.max(0, Math.round(bal)) })
        if (depletionYear && year >= depletionYear) break
        if (year >= 50) break
      }
    }

    // Sustainable monthly withdrawal (corpus never depletes)
    const sustainableMonthly = Math.round(corpus * monthlyRate)

    // Annual withdrawal rate
    const annualWithdrawalRate = ((monthly * 12) / corpus * 100).toFixed(1)

    // Corpus at 10, 20, 30 years
    const at10 = data.find(d => d.year === 10)?.corpus ?? 0
    const at20 = data.find(d => d.year === 20)?.corpus ?? 0
    const at30 = data.find(d => d.year === 30)?.corpus ?? 0

    return {
      data,
      depletionYear,
      totalWithdrawn,
      sustainableMonthly,
      annualWithdrawalRate,
      at10, at20, at30,
      lasts: !depletionYear,
    }
  }, [corpus, monthly, returnRate, inflation, inflAdj])

  const sliders = [
    { label: 'STARTING CORPUS', value: corpus, setter: setCorpus, min: 1000000, max: 100000000, step: 500000, fmt: fmtIN },
    { label: 'MONTHLY WITHDRAWAL', value: monthly, setter: setMonthly, min: 5000, max: 500000, step: 5000, fmt: fmtIN },
    { label: 'EXPECTED RETURN (%)', value: returnRate, setter: setReturnRate, min: 4, max: 18, step: 0.5, fmt: v => v + '%' },
    { label: 'INFLATION RATE (%)', value: inflation, setter: setInflation, min: 2, max: 12, step: 0.5, fmt: v => v + '%', disabled: !inflAdj },
  ]

  const status = results.lasts ? 'sustainable' : results.depletionYear <= 10 ? 'critical' : results.depletionYear <= 20 ? 'warning' : 'moderate'
  const statusColor = { sustainable: C.green, critical: C.red, warning: C.amber, moderate: C.blue }[status]
  const statusLabel = { sustainable: 'CORPUS NEVER DEPLETES', critical: 'DEPLETES FAST', warning: 'DEPLETES IN MEDIUM TERM', moderate: 'DEPLETES IN LONG TERM' }[status]

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(24px, 4vw, 52px) clamp(12px, 3vw, 24px)' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 8 }}>CALCULATOR</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>SWP Calculator</h1>
          <p style={{ fontSize: 12, color: C.textSec, lineHeight: 1.8, maxWidth: 580 }}>
            Systematic Withdrawal Plan — model how long your corpus lasts when you withdraw a fixed amount every month. The withdrawal-phase complement to SIP.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 24 }}>

          {/* Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
              <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>PARAMETERS</div>

              {sliders.map(s => (
                <div key={s.label} style={{ marginBottom: 20, opacity: s.disabled ? 0.4 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: 10, color: C.textSec, letterSpacing: 1 }}>{s.label}</label>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.amber }}>{s.fmt(s.value)}</span>
                  </div>
                  <input type="range" min={s.min} max={s.max} step={s.step} value={s.value}
                    disabled={s.disabled}
                    onChange={e => s.setter(Number(e.target.value))}
                    style={{ width: '100%', accentColor: C.amber }} />
                </div>
              ))}

              {/* Inflation toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3 }}>
                <div>
                  <div style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>Inflation-adjusted withdrawals</div>
                  <div style={{ fontSize: 10, color: C.textSec, marginTop: 2 }}>Increase withdrawal by inflation % each year</div>
                </div>
                <button onClick={() => setInflAdj(v => !v)} style={{
                  width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: inflAdj ? C.amber : C.border, position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                }}>
                  <span style={{ position: 'absolute', top: 3, left: inflAdj ? 23 : 3, width: 18, height: 18, borderRadius: 9, background: inflAdj ? '#020c18' : C.textSec, transition: 'left 0.2s' }} />
                </button>
              </div>
            </div>

            {/* Annual withdrawal rate context */}
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 20 }}>
              <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 14 }}>WITHDRAWAL RATE CONTEXT</div>
              {[
                { label: 'Your withdrawal rate', value: results.annualWithdrawalRate + '%/yr', color: parseFloat(results.annualWithdrawalRate) <= 4 ? C.green : parseFloat(results.annualWithdrawalRate) <= 6 ? C.amber : C.red },
                { label: 'Safe (4% rule)', value: fmtIN(corpus * 0.04 / 12) + '/mo', color: C.green },
                { label: 'Sustainable at ' + returnRate + '%', value: fmtIN(results.sustainableMonthly) + '/mo', color: C.blue },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 11, color: C.textSec }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: r.color }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Status card */}
            <div style={{ background: C.panel, border: `2px solid ${statusColor}`, borderRadius: 4, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: statusColor, letterSpacing: 2, marginBottom: 8 }}>{statusLabel}</div>
              {results.lasts ? (
                <>
                  <div style={{ fontSize: 36, fontWeight: 700, color: C.green, marginBottom: 4 }}>∞</div>
                  <div style={{ fontSize: 12, color: C.textSec }}>
                    Corpus grows faster than you withdraw.<br />
                    Returns exceed withdrawals by {fmtIN(results.sustainableMonthly - monthly)}/mo.
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 36, fontWeight: 700, color: statusColor, marginBottom: 4 }}>
                    {results.depletionYear} yrs
                  </div>
                  <div style={{ fontSize: 12, color: C.textSec }}>
                    Corpus depletes after {results.depletionYear} years.<br />
                    Total withdrawn: {fmtIN(results.totalWithdrawn)}
                  </div>
                </>
              )}
            </div>

            {/* Snapshots */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                { label: 'After 10 yrs', val: results.at10 },
                { label: 'After 20 yrs', val: results.at20 },
                { label: 'After 30 yrs', val: results.at30 },
              ].map(s => (
                <div key={s.label} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: '12px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: C.textSec, letterSpacing: 0.5, marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: s.val > 0 ? C.text : C.red }}>
                    {s.val > 0 ? fmtIN(s.val) : 'DEPLETED'}
                  </div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 20 }}>
              <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 16 }}>CORPUS OVER TIME</div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={results.data} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                  <XAxis dataKey="year" tick={{ fill: C.textSec, fontSize: 10, fontFamily: MONO }} tickLine={false} axisLine={false} label={{ value: 'Years', position: 'insideBottom', offset: -2, fill: C.textDim, fontSize: 9, fontFamily: MONO }} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={0} stroke={C.border} strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="corpus" stroke={results.lasts ? C.green : C.amber} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Insight box */}
        <div style={{ marginTop: 24, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 20 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 1.5, marginBottom: 12 }}>HOW SWP WORKS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { icon: '📉', title: 'Corpus depletes when withdrawals > growth', desc: 'If your corpus earns 10% annually but you withdraw 12%, the shortfall compounds and the corpus shrinks every year.' },
              { icon: '⚖️', title: 'The 4% rule', desc: 'Withdrawing 4% of corpus per year has historically lasted 30+ years. For a ₹1 Cr corpus: ₹4L/year = ₹33K/month.' },
              { icon: '📈', title: 'Inflation erodes purchasing power', desc: 'A fixed ₹50K/month withdrawal buys less each year. Inflation-adjusted withdrawals protect your lifestyle but deplete corpus faster.' },
            ].map(i => (
              <div key={i.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{i.icon}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 4 }}>{i.title}</div>
                  <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.7 }}>{i.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Link to FIRE */}
        <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/calculators/fire" style={{ fontSize: 11, color: C.amber, textDecoration: 'none', border: `1px solid ${C.amber}33`, padding: '8px 16px', borderRadius: 2 }}>
            ← Calculate your FIRE corpus first
          </Link>
          <Link to="/calculators/sip" style={{ fontSize: 11, color: C.textSec, textDecoration: 'none', border: `1px solid ${C.border}`, padding: '8px 16px', borderRadius: 2 }}>
            SIP Calculator →
          </Link>
        </div>

      </div>
    </div>
  )
}
