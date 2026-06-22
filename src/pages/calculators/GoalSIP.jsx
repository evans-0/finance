import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
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

const GOAL_PRESETS = [
  { icon: '🏠', label: 'House Down Payment', amount: 2000000,  years: 7  },
  { icon: '🚗', label: 'Car',                amount: 1000000,  years: 3  },
  { icon: '🎓', label: 'Child\'s Education', amount: 2500000,  years: 15 },
  { icon: '💍', label: 'Wedding',            amount: 1500000,  years: 5  },
  { icon: '✈️', label: 'Travel / Sabbatical',amount: 500000,   years: 2  },
  { icon: '🏥', label: 'Medical Fund',       amount: 500000,   years: 3  },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, padding: '10px 14px', fontFamily: MONO, fontSize: 11 }}>
      <div style={{ color: C.textSec, marginBottom: 6 }}>Year {label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, marginBottom: 2 }}>{p.name}: {fmtIN(p.value)}</div>
      ))}
    </div>
  )
}

export default function GoalSIP() {
  const [goalToday, setGoalToday]   = useState(2000000)
  const [years, setYears]           = useState(7)
  const [returnRate, setReturnRate] = useState(12)
  const [inflation, setInflation]   = useState(6)
  const [lumpsum, setLumpsum]       = useState(0)
  const [activePreset, setActivePreset] = useState(0)

  const results = useMemo(() => {
    const inflatedGoal = goalToday * Math.pow(1 + inflation / 100, years)
    const r = returnRate / 100 / 12
    const n = years * 12

    // Lumpsum grows to
    const lumpsumFV = lumpsum > 0 ? lumpsum * Math.pow(1 + returnRate / 100, years) : 0

    // SIP needed for remaining goal
    const remainingGoal = Math.max(inflatedGoal - lumpsumFV, 0)
    const sipNeeded = r > 0
      ? remainingGoal * r / ((Math.pow(1 + r, n) - 1) * (1 + r))
      : remainingGoal / n

    // Total invested
    const totalInvested = sipNeeded * n + lumpsum
    const totalReturns = inflatedGoal - totalInvested

    // Year-by-year chart
    const chartData = Array.from({ length: years }, (_, i) => {
      const yr = i + 1
      const nMo = yr * 12
      const sipCorpus = r > 0
        ? sipNeeded * ((Math.pow(1 + r, nMo) - 1) / r) * (1 + r)
        : sipNeeded * nMo
      const lumpsumCorpus = lumpsum > 0 ? lumpsum * Math.pow(1 + returnRate / 100, yr) : 0
      const goalAtYr = goalToday * Math.pow(1 + inflation / 100, yr)
      return {
        year: yr,
        corpus: Math.round(sipCorpus + lumpsumCorpus),
        invested: Math.round(sipNeeded * nMo + lumpsum),
        goal: Math.round(goalAtYr),
      }
    })

    // Affordability: SIP as % of typical salary brackets
    const brackets = [
      { label: '₹30K/mo take-home', salary: 30000 },
      { label: '₹60K/mo take-home', salary: 60000 },
      { label: '₹1L/mo take-home',  salary: 100000 },
    ].map(b => ({ ...b, pct: (sipNeeded / b.salary * 100).toFixed(1) }))

    return {
      inflatedGoal, sipNeeded, lumpsumFV,
      totalInvested, totalReturns,
      chartData, brackets,
      alreadyCovered: lumpsumFV >= inflatedGoal,
    }
  }, [goalToday, years, returnRate, inflation, lumpsum])

  const handlePreset = (preset, i) => {
    setGoalToday(preset.amount)
    setYears(preset.years)
    setActivePreset(i)
  }

  const sliders = [
    { label: "GOAL AMOUNT (TODAY'S VALUE)", value: goalToday, setter: setGoalToday, min: 100000, max: 50000000, step: 100000, fmt: fmtIN },
    { label: 'TIME HORIZON',               value: years,     setter: setYears,     min: 1,      max: 30,       step: 1,      fmt: v => v + ' yrs' },
    { label: 'EXPECTED RETURN',            value: returnRate, setter: setReturnRate, min: 4,     max: 20,       step: 0.5,    fmt: v => v + '%' },
    { label: 'INFLATION RATE',             value: inflation,  setter: setInflation,  min: 2,     max: 12,       step: 0.5,    fmt: v => v + '%' },
    { label: 'EXISTING SAVINGS (OPTIONAL)',value: lumpsum,   setter: setLumpsum,   min: 0,      max: 10000000, step: 50000,  fmt: fmtIN },
  ]

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(24px, 4vw, 52px) clamp(12px, 3vw, 24px)' }}>

        {/* Header */}
        <Link to="/calculators" style={{ fontSize: 11, color: C.textSec, textDecoration: 'none', letterSpacing: 1 }}>← CALCULATORS</Link>
        <div style={{ marginTop: 24, marginBottom: 32 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 8 }}>CALCULATOR</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Goal-based SIP</h1>
          <p style={{ fontSize: 12, color: C.textSec, lineHeight: 1.8, maxWidth: 560 }}>
            Enter what something costs today. We inflate it to its future cost and tell you exactly how much to SIP every month to get there.
          </p>
        </div>

        {/* Goal presets */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8, marginBottom: 28 }}>
          {GOAL_PRESETS.map((p, i) => (
            <button key={p.label} onClick={() => handlePreset(p, i)} style={{
              background: activePreset === i ? C.amber + '22' : C.panel,
              color: activePreset === i ? C.amber : C.textSec,
              border: `1px solid ${activePreset === i ? C.amber : C.border}`,
              padding: '10px 8px', borderRadius: 3, cursor: 'pointer',
              fontFamily: MONO, fontSize: 10, letterSpacing: 0.5, textAlign: 'center',
              transition: 'all 0.15s',
            }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{p.icon}</div>
              <div>{p.label}</div>
            </button>
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

            {/* Inflation breakdown */}
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: 14, marginTop: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: C.textSec }}>Goal in today's value</span>
                <span style={{ fontSize: 11, color: C.text, fontWeight: 700 }}>{fmtIN(goalToday)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: C.textSec }}>Inflation over {years} yrs</span>
                <span style={{ fontSize: 11, color: C.red }}>+{fmtIN(results.inflatedGoal - goalToday)}</span>
              </div>
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: C.text, fontWeight: 700 }}>Actual goal in {years} yrs</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.amber }}>{fmtIN(results.inflatedGoal)}</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Main answer */}
            <div style={{ background: C.panel, border: `2px solid ${C.green}`, borderRadius: 4, padding: 24, textAlign: 'center' }}>
              {results.alreadyCovered ? (
                <>
                  <div style={{ fontSize: 10, color: C.green, letterSpacing: 2, marginBottom: 8 }}>ALREADY FUNDED</div>
                  <div style={{ fontSize: 36, fontWeight: 700, color: C.green, marginBottom: 4 }}>₹0</div>
                  <div style={{ fontSize: 12, color: C.textSec }}>
                    Your existing {fmtIN(lumpsum)} grows to {fmtIN(results.lumpsumFV)} — covers the full goal.
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 10, color: C.green, letterSpacing: 2, marginBottom: 8 }}>MONTHLY SIP NEEDED</div>
                  <div style={{ fontSize: 36, fontWeight: 700, color: C.green, marginBottom: 4 }}>{fmtIN(results.sipNeeded)}</div>
                  <div style={{ fontSize: 12, color: C.textSec }}>per month for {years} years at {returnRate}% return</div>
                </>
              )}
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'INFLATION-ADJUSTED GOAL', val: fmtIN(results.inflatedGoal), color: C.amber },
                { label: 'TOTAL YOU INVEST',        val: fmtIN(results.totalInvested), color: C.text  },
                { label: 'RETURNS DO THE REST',     val: fmtIN(results.totalReturns),  color: C.green },
                { label: 'LUMPSUM GROWS TO',        val: lumpsum > 0 ? fmtIN(results.lumpsumFV) : '—', color: C.blue },
              ].map(s => (
                <div key={s.label} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: '12px 14px' }}>
                  <div style={{ fontSize: 9, color: C.textSec, letterSpacing: 0.5, marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.val}</div>
                </div>
              ))}
            </div>

            {/* Affordability check */}
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: 16 }}>
              <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 12 }}>AFFORDABILITY CHECK</div>
              {results.brackets.map(b => {
                const pct = parseFloat(b.pct)
                const color = pct <= 20 ? C.green : pct <= 35 ? C.amber : C.red
                return (
                  <div key={b.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, color: C.textSec }}>{b.label}</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color }}>{b.pct}% of income</span>
                      <span style={{ fontSize: 10, color: C.textSec, marginLeft: 8 }}>
                        {pct <= 20 ? '✓ Comfortable' : pct <= 35 ? '~ Stretched' : '✗ Too high'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ marginTop: 24, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
          <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>CORPUS vs GOAL GROWTH OVER TIME</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={results.chartData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
              <defs>
                <linearGradient id="corpus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.green} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="invested" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.amber} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={C.amber} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="year" tick={{ fill: C.textSec, fontSize: 10, fontFamily: MONO }} tickLine={false} axisLine={false}
                tickFormatter={v => 'Yr ' + v} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="invested" name="Amount Invested" stroke={C.amber}  fill="url(#invested)" strokeWidth={1.5} dot={false} />
              <Area type="monotone" dataKey="corpus"   name="Total Corpus"    stroke={C.green}  fill="url(#corpus)"   strokeWidth={2}   dot={false} />
              <Area type="monotone" dataKey="goal"     name="Inflation Goal"  stroke={C.red}    fill="none"           strokeWidth={1.5}  strokeDasharray="4 4" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 20, marginTop: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[{ color: C.green, label: 'Total Corpus' }, { color: C.amber, label: 'Amount Invested' }, { color: C.red, label: 'Inflation-adjusted Goal', dashed: true }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: C.textSec }}>
                <div style={{ width: 20, height: 2, background: l.color, borderTop: l.dashed ? `2px dashed ${l.color}` : 'none' }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Links */}
        <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/calculators/sip"  style={{ fontSize: 11, color: C.amber, textDecoration: 'none', border: `1px solid ${C.amber}33`, padding: '8px 16px', borderRadius: 2 }}>SIP Calculator →</Link>
          <Link to="/calculators/fire" style={{ fontSize: 11, color: C.textSec, textDecoration: 'none', border: `1px solid ${C.border}`, padding: '8px 16px', borderRadius: 2 }}>FIRE Calculator →</Link>
        </div>

      </div>
    </div>
  )
}
