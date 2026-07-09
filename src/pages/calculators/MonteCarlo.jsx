import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import Navbar from '../../components/Navbar'

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: '#020c18', panel: '#050f1e', border: '#0c1d34',
  amber: '#f5a623', green: '#00e676', blue: '#4fc3f7',
  red: '#ff3c5c', purple: '#ce93d8',
  text: '#c8d8f0', textSec: '#506888', textDim: '#1e3050',
}
const MONO = "'Consolas','Menlo','Monaco','Courier New',monospace"

// ── Formatters ────────────────────────────────────────────────────────────────
const fmtIN = n => {
  if (!n || n === 0) return '0'
  const abs = Math.abs(Math.round(n))
  if (abs >= 1e7) return (n / 1e7).toFixed(2) + ' Cr'
  if (abs >= 1e5) return (n / 1e5).toFixed(1) + ' L'
  const s = abs.toString()
  if (s.length <= 3) return (n < 0 ? '-' : '') + s
  const last3 = s.slice(-3)
  const rest = s.slice(0, -3)
  const parts = []
  for (let i = rest.length; i > 0; i -= 2) parts.unshift(rest.slice(Math.max(0, i - 2), i))
  return (n < 0 ? '-' : '') + parts.join(',') + ',' + last3
}
const fmtUS = n => {
  const abs = Math.abs(n)
  if (abs >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M'
  if (abs >= 1e3) return '$' + Math.round(n / 1e3) + 'K'
  return '$' + Math.round(n)
}

// ── Seeded PRNG (Mulberry32) — deterministic results across re-renders ───────
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0
    let t = Math.imul(a ^ a >>> 15, 1 | a)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

// Generate standard-normal Z-scores via Box-Muller transform
function generateZScores(numSims, years) {
  const rng = mulberry32(42)
  const z = []
  for (let s = 0; s < numSims; s++) {
    const row = []
    for (let y = 0; y < years; y++) {
      let u1 = 0, u2 = 0
      while (u1 === 0) u1 = rng()
      while (u2 === 0) u2 = rng()
      row.push(Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2))
    }
    z.push(row)
  }
  return z
}

// ── Constants ─────────────────────────────────────────────────────────────────
const NUM_SIMS = 1000
const STRESS_RATES = [3, 3.5, 4, 4.5, 5, 5.5, 6]

const DEFAULTS = {
  us: { corpus: 1000000, monthlyW: 3333, expectedReturn: 7, volatility: 12, inflation: 3, inflAdj: true, years: 30 },
  in: { corpus: 30000000, monthlyW: 100000, expectedReturn: 10, volatility: 14, inflation: 6, inflAdj: true, years: 30 },
}

// ── Core Monte Carlo engine ───────────────────────────────────────────────────
function runMonteCarlo(p) {
  const { corpus, monthlyW, expectedReturn, volatility, inflation, inflAdj, years } = p
  if (corpus <= 0 || years <= 0) return {
    survivalRate: 0, medianFinal: 0, p10Final: 0, p90Final: 0,
    sustainableMonthly: 0, sustainableRate: null,
    chartData: [], sensitivity: [], currentRate: 0,
  }

  const annualW = monthlyW * 12
  const zScores = generateZScores(NUM_SIMS, years)

  // ─ Main simulation: 1,000 trajectories ─
  const trajectories = []
  let survived = 0

  for (let s = 0; s < NUM_SIMS; s++) {
    let bal = corpus
    let w = annualW
    const traj = [bal]

    for (let y = 0; y < years; y++) {
      const r = Math.max(-0.9, expectedReturn / 100 + (volatility / 100) * zScores[s][y])
      bal = bal * (1 + r) - w
      if (inflAdj) w *= (1 + inflation / 100)
      if (bal <= 0) {
        traj.push(0)
        for (let k = y + 1; k < years; k++) traj.push(0)
        bal = 0
        break
      }
      traj.push(Math.round(bal))
    }

    if (bal > 0) survived++
    trajectories.push(traj)
  }

  // ─ Percentiles at each year (for fan chart) ─
  const chartData = []
  for (let y = 0; y <= years; y++) {
    const vals = trajectories.map(t => t[y]).sort((a, b) => a - b)
    const pct = q => vals[Math.min(Math.floor(q * vals.length), vals.length - 1)]
    const p10 = pct(0.10), p25 = pct(0.25), p50 = pct(0.50), p75 = pct(0.75), p90 = pct(0.90)

    // Stacked band data: base + band1 + band2 + band3 + band4 = P90
    chartData.push({
      year: y,
      base: Math.max(0, p10),
      band1: Math.max(0, p25 - p10),
      band2: Math.max(0, p50 - p25),
      band3: Math.max(0, p75 - p50),
      band4: Math.max(0, p90 - p75),
      p10, p25, p50, p75, p90,
    })
  }

  // ─ Final corpus distribution ─
  const finals = trajectories.map(t => t[years]).sort((a, b) => a - b)
  const medianFinal = finals[Math.floor(0.5 * finals.length)]
  const p10Final = finals[Math.floor(0.1 * finals.length)]
  const p90Final = finals[Math.floor(0.9 * finals.length)]

  // ─ Stress test: survival at different withdrawal rates ─
  const sensitivity = STRESS_RATES.map(rate => {
    const testW = corpus * rate / 100
    let surv = 0
    for (let s = 0; s < NUM_SIMS; s++) {
      let bal = corpus, w = testW, dead = false
      for (let y = 0; y < years; y++) {
        if (dead) break
        const r = Math.max(-0.9, expectedReturn / 100 + (volatility / 100) * zScores[s][y])
        bal = bal * (1 + r) - w
        if (inflAdj) w *= (1 + inflation / 100)
        if (bal <= 0) dead = true
      }
      if (!dead) surv++
    }
    return { rate, monthlyW: Math.round(corpus * rate / 100 / 12), survival: (surv / NUM_SIMS) * 100 }
  })

  // ─ Sustainable rate: highest stress rate with ≥ 95% survival ─
  let sustainableRate = null
  for (const s of sensitivity) {
    if (s.survival >= 95) sustainableRate = s.rate
  }
  const sustainableMonthly = sustainableRate
    ? Math.round(corpus * sustainableRate / 100 / 12)
    : Math.round(corpus * Math.max(0, (expectedReturn - inflation) / 100) / 12)

  const currentRate = corpus > 0 ? (annualW / corpus) * 100 : 0

  return {
    survivalRate: (survived / NUM_SIMS) * 100,
    medianFinal, p10Final, p90Final,
    sustainableMonthly, sustainableRate,
    chartData, sensitivity, currentRate,
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────
function InputField({ label, value, onChange, min, max, step = 1, suffix, isCurrency, mode, hint }) {
  const fmt = mode === 'in' ? v => '₹' + fmtIN(v) : v => fmtUS(v)
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 10, color: C.textSec, letterSpacing: 1 }}>{label}</label>
        {hint && <span style={{ fontSize: 10, color: C.amber }}>{hint}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="number" value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          min={min} max={max} step={step}
          style={{ flex: 1, background: C.bg, border: '1px solid ' + C.border, color: C.text, padding: '8px 12px', fontSize: 13, fontFamily: MONO, borderRadius: 3, outline: 'none' }} />
        {suffix && <span style={{ fontSize: 13, color: C.textSec }}>{suffix}</span>}
      </div>
      {isCurrency && value > 0 && <div style={{ fontSize: 11, color: C.amber, marginTop: 3 }}>{fmt(value)}</div>}
      <input type="range" value={value} onChange={e => onChange(parseFloat(e.target.value))}
        min={min} max={max} step={step}
        style={{ width: '100%', marginTop: 6, accentColor: C.amber }} />
    </div>
  )
}

function StatBox({ label, value, sub, color }) {
  return (
    <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: '14px 16px' }}>
      <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: color || C.amber }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.textSec, marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

function Toggle({ label, hint, enabled, onToggle }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', marginBottom: 16, borderBottom: '1px solid ' + C.border }}>
      <div>
        <div style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>{label}</div>
        {hint && <div style={{ fontSize: 10, color: C.textSec, marginTop: 2 }}>{hint}</div>}
      </div>
      <div onClick={onToggle} style={{ width: 42, height: 22, borderRadius: 11, cursor: 'pointer',
        background: enabled ? C.amber : C.border, position: 'relative', transition: 'background 0.2s' }}>
        <div style={{ width: 18, height: 18, borderRadius: 9,
          background: enabled ? '#020c18' : C.textSec,
          position: 'absolute', top: 2, left: enabled ? 22 : 2, transition: 'left 0.2s' }} />
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label, fmt }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, padding: '10px 14px', fontSize: 11, fontFamily: MONO }}>
      <div style={{ color: C.textSec, marginBottom: 6 }}>Year {label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div><span style={{ color: C.textSec }}>P90 (Best):{' '}</span><span style={{ color: C.green }}>{fmt(d.p90)}</span></div>
        <div><span style={{ color: C.textSec }}>P50 (Median):{' '}</span><span style={{ color: C.amber }}>{fmt(d.p50)}</span></div>
        <div><span style={{ color: C.textSec }}>P10 (Worst):{' '}</span><span style={{ color: C.red }}>{fmt(d.p10)}</span></div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MonteCarlo() {
  const [mode, setMode] = useState('in')
  const [usP, setUsP] = useState(DEFAULTS.us)
  const [inP, setInP] = useState(DEFAULTS.in)

  const setUs = key => val => setUsP(p => ({ ...p, [key]: val }))
  const setIn = key => val => setInP(p => ({ ...p, [key]: val }))

  const params = mode === 'us' ? usP : inP
  const set = mode === 'us' ? setUs : setIn
  const fmt = mode === 'us' ? fmtUS : n => '₹' + fmtIN(n)

  const toggleInflAdj = () => {
    if (mode === 'us') setUsP(p => ({ ...p, inflAdj: !p.inflAdj }))
    else setInP(p => ({ ...p, inflAdj: !p.inflAdj }))
  }

  const result = useMemo(() => runMonteCarlo(params), [params])
  const {
    survivalRate, medianFinal, p10Final, p90Final,
    sustainableMonthly, sustainableRate,
    chartData, sensitivity, currentRate,
  } = result

  const sectionStyle = { fontSize: 10, color: C.amber, letterSpacing: 2, marginBottom: 14, marginTop: 24 }
  const divider = <div style={{ borderTop: '1px solid ' + C.border, margin: '20px 0' }} />
  const survColor = survivalRate >= 90 ? C.green : survivalRate >= 70 ? C.amber : C.red

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '52px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <Link to="/calculators" style={{ fontSize: 11, color: C.textSec, textDecoration: 'none', letterSpacing: 1 }}>← CALCULATORS</Link>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginTop: 20, marginBottom: 10 }}>CALCULATORS</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, marginBottom: 10 }}>Retirement Monte Carlo</h1>
          <p style={{ fontSize: 12, color: C.textSec, lineHeight: 1.8, maxWidth: 620 }}>
            Will your retirement corpus last? Instead of assuming a fixed return every year, this simulator
            runs {NUM_SIMS.toLocaleString()} randomised scenarios to show the probability your money survives.
          </p>
        </div>

        {/* Country toggle */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 32, border: '1px solid ' + C.border, borderRadius: 3, width: 'fit-content', overflow: 'hidden' }}>
          {[['us', '🇺🇸  United States'], ['in', '🇮🇳  India']].map(([key, label]) => (
            <button key={key} onClick={() => setMode(key)} style={{
              padding: '9px 24px', background: mode === key ? C.amber : 'transparent',
              color: mode === key ? C.bg : C.textSec, border: 'none', cursor: 'pointer',
              fontSize: 12, fontFamily: MONO, fontWeight: mode === key ? 700 : 400, letterSpacing: 1,
            }}>{label}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 32, alignItems: 'start' }}>

          {/* ── LEFT: Inputs ── */}
          <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 24 }}>

            <div style={sectionStyle}>CORPUS & WITHDRAWALS</div>
            <InputField label={mode === 'in' ? 'RETIREMENT CORPUS (₹)' : 'RETIREMENT CORPUS ($)'}
              value={params.corpus} onChange={set('corpus')}
              min={mode === 'in' ? 1000000 : 100000} max={mode === 'in' ? 500000000 : 10000000}
              step={mode === 'in' ? 1000000 : 50000} isCurrency mode={mode}
              hint={`${currentRate.toFixed(1)}% withdrawal`} />
            <InputField label={mode === 'in' ? 'MONTHLY WITHDRAWAL (₹)' : 'MONTHLY WITHDRAWAL ($)'}
              value={params.monthlyW} onChange={set('monthlyW')}
              min={mode === 'in' ? 10000 : 500} max={mode === 'in' ? 1000000 : 50000}
              step={mode === 'in' ? 5000 : 500} isCurrency mode={mode} />

            <Toggle label="Inflation-adjust withdrawals"
              hint="Increase withdrawals yearly with inflation"
              enabled={params.inflAdj} onToggle={toggleInflAdj} />

            {divider}
            <div style={sectionStyle}>MARKET ASSUMPTIONS</div>
            <InputField label="EXPECTED ANNUAL RETURN (%)"
              value={params.expectedReturn} onChange={set('expectedReturn')}
              min={2} max={18} step={0.5} suffix="%" />
            <InputField label="ANNUAL VOLATILITY / STD DEV (%)"
              value={params.volatility} onChange={set('volatility')}
              min={2} max={30} step={1} suffix="%"
              hint={params.volatility <= 8 ? 'Bond-heavy' : params.volatility <= 15 ? 'Balanced' : 'Equity-heavy'} />
            <InputField label="INFLATION (%/YR)"
              value={params.inflation} onChange={set('inflation')}
              min={1} max={12} step={0.5} suffix="%" />

            {divider}
            <div style={sectionStyle}>SIMULATION</div>
            <InputField label="YEARS IN RETIREMENT"
              value={params.years} onChange={set('years')}
              min={10} max={50} step={5} suffix="yrs" />

            <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 3, padding: '10px 12px', marginTop: 16, fontSize: 11, color: C.textSec, lineHeight: 1.7 }}>
              💡 Volatility (std dev) controls how wildly returns swing each year. A balanced 60/40 portfolio
              typically has ~{mode === 'in' ? '12–14' : '10–12'}% annual volatility. Higher volatility = more realistic
              for equity-heavy portfolios, but lower survival probability.
            </div>
          </div>

          {/* ── RIGHT: Results ── */}
          <div>

            {/* Survival badge */}
            <div style={{
              background: C.panel, border: `2px solid ${survColor}`,
              borderRadius: 4, padding: '28px 24px', textAlign: 'center', marginBottom: 20,
            }}>
              <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 2, marginBottom: 10 }}>SURVIVAL PROBABILITY</div>
              <div style={{ fontSize: 52, fontWeight: 700, color: survColor, lineHeight: 1 }}>
                {survivalRate.toFixed(1)}%
              </div>
              <div style={{ fontSize: 11, color: C.textSec, marginTop: 12, lineHeight: 1.7 }}>
                {survivalRate >= 95
                  ? `Excellent — your corpus survives ${params.years} years in ${survivalRate.toFixed(0)}% of scenarios`
                  : survivalRate >= 80
                  ? `Good — but ${(100 - survivalRate).toFixed(0)}% chance of depletion. Consider a small buffer.`
                  : survivalRate >= 60
                  ? `Moderate risk — ${(100 - survivalRate).toFixed(0)}% of scenarios deplete before year ${params.years}`
                  : `High risk of depletion — reduce withdrawal rate or increase corpus`}
              </div>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: 10, marginBottom: 20 }}>
              <StatBox label="MEDIAN FINAL" value={fmt(medianFinal)} sub="P50 outcome" color={medianFinal > 0 ? C.green : C.red} />
              <StatBox label="WORST 10%" value={fmt(p10Final)} sub="P10 outcome" color={p10Final > 0 ? C.amber : C.red} />
              <StatBox label="BEST 10%" value={fmt(p90Final)} sub="P90 outcome" color={C.green} />
              <StatBox label="SAFE WITHDRAWAL" value={sustainableRate ? sustainableRate + '%' : '< 3%'}
                sub={fmt(sustainableMonthly) + '/mo'} color={C.blue} />
            </div>

            {/* Fan chart */}
            <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: '20px 16px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 2 }}>CORPUS PROJECTION — {NUM_SIMS.toLocaleString()} SIMULATIONS</div>
                <div style={{ display: 'flex', gap: 14 }}>
                  {[['MEDIAN', C.green], ['P25–P75', 'rgba(0,230,118,0.3)'], ['P10–P90', 'rgba(0,230,118,0.15)']].map(([label, color]) => (
                    <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: C.textSec }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block' }} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: C.textSec, fontFamily: MONO }}
                    label={{ value: 'Year', position: 'insideBottom', offset: -2, fill: C.textSec, fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10, fill: C.textSec, fontFamily: MONO }}
                    tickFormatter={v => fmt(v)} width={76} />
                  <Tooltip content={<CustomTooltip fmt={fmt} />} />
                  {/* Fan bands — stacked to form P10→P90 envelope */}
                  <Area stackId="fan" type="monotone" dataKey="base" fill="rgba(0,230,118,0.04)" stroke="none" activeDot={false} />
                  <Area stackId="fan" type="monotone" dataKey="band1" fill="rgba(0,230,118,0.08)" stroke="none" activeDot={false} />
                  <Area stackId="fan" type="monotone" dataKey="band2" fill="rgba(0,230,118,0.14)" stroke="none" activeDot={false} />
                  <Area stackId="fan" type="monotone" dataKey="band3" fill="rgba(0,230,118,0.14)" stroke="none" activeDot={false} />
                  <Area stackId="fan" type="monotone" dataKey="band4" fill="rgba(0,230,118,0.08)" stroke="none" activeDot={false} />
                  {/* Median line */}
                  <Line type="monotone" dataKey="p50" stroke={C.green} strokeWidth={2} dot={false} name="Median" />
                  {/* Initial corpus reference */}
                  <ReferenceLine y={params.corpus} stroke={C.amber} strokeDasharray="4 4" strokeWidth={1}
                    label={{ value: 'Initial', position: 'right', fill: C.amber, fontSize: 9, fontFamily: MONO }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Withdrawal rate stress test table */}
            <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 20, marginTop: 20 }}>
              <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 2, marginBottom: 16 }}>WITHDRAWAL RATE STRESS TEST</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: MONO }}>
                  <thead>
                    <tr>
                      {['RATE', 'MONTHLY', 'ANNUAL', 'SURVIVAL'].map(h => (
                        <th key={h} style={{
                          textAlign: h === 'RATE' ? 'left' : 'right', padding: '8px 12px',
                          color: C.textSec, fontSize: 10, letterSpacing: 1,
                          borderBottom: '1px solid ' + C.border,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sensitivity.map(s => {
                      const isActive = Math.abs(s.rate - currentRate) < 0.3
                      const sc = s.survival >= 95 ? C.green : s.survival >= 80 ? C.amber : C.red
                      return (
                        <tr key={s.rate} style={{ background: isActive ? C.bg : 'transparent' }}>
                          <td style={{ padding: '8px 12px', color: isActive ? C.amber : C.text,
                            fontWeight: isActive ? 700 : 400, borderBottom: '1px solid ' + C.border }}>
                            {s.rate}%{isActive ? ' ◄' : ''}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', color: C.textSec,
                            borderBottom: '1px solid ' + C.border }}>{fmt(s.monthlyW)}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', color: C.textSec,
                            borderBottom: '1px solid ' + C.border }}>{fmt(s.monthlyW * 12)}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', color: sc, fontWeight: 700,
                            borderBottom: '1px solid ' + C.border }}>
                            {s.survival.toFixed(1)}%{s.survival >= 95 ? ' ✓' : ''}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ fontSize: 10, color: C.textDim, marginTop: 10 }}>
                ◄ marks your current withdrawal rate. Green (≥95%) is considered safe by most retirement researchers.
              </div>
            </div>

            {/* Educational note */}
            <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 3, padding: '14px 16px', marginTop: 20, fontSize: 11, color: C.textSec, lineHeight: 1.8 }}>
              <div style={{ color: C.amber, fontWeight: 700, marginBottom: 6 }}>Why Monte Carlo?</div>
              Traditional calculators assume a fixed return every year — say {params.expectedReturn}%.
              In reality, you might earn +{(params.expectedReturn + params.volatility).toFixed(0)}% one year
              and −{Math.abs(params.expectedReturn - params.volatility).toFixed(0)}% the next.
              The <strong style={{ color: C.text }}>sequence of returns</strong> matters enormously:
              a crash early in retirement is far more damaging than one later. Monte Carlo
              runs {NUM_SIMS.toLocaleString()} scenarios with randomised annual
              returns (mean {params.expectedReturn}%, volatility ±{params.volatility}%) to
              quantify this <strong style={{ color: C.text }}>sequence-of-returns risk</strong>.
            </div>

            {/* Cross-links */}
            <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
              <Link to="/calculators/fire" style={{ fontSize: 11, color: C.amber, textDecoration: 'none', border: `1px solid ${C.amber}33`, padding: '8px 16px', borderRadius: 2 }}>
                ← FIRE Calculator
              </Link>
              <Link to="/calculators/swp" style={{ fontSize: 11, color: C.amber, textDecoration: 'none', border: `1px solid ${C.amber}33`, padding: '8px 16px', borderRadius: 2 }}>
                SWP Calculator →
              </Link>
            </div>

            <div style={{ fontSize: 11, color: C.textDim, marginTop: 16, lineHeight: 1.7 }}>
              * Results are based on {NUM_SIMS.toLocaleString()} simulations with normally distributed annual returns.
              Actual market returns have fat tails (more extreme events than a normal distribution predicts).
              Use this as a planning tool, not a guarantee.
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
