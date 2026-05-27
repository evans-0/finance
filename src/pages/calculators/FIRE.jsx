import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Legend
} from 'recharts'
import Navbar from '../../components/Navbar'

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
  if (s.length <= 3) return s
  const last3 = s.slice(-3)
  const rest = s.slice(0, -3)
  const parts = []
  for (let i = rest.length; i > 0; i -= 2) parts.unshift(rest.slice(Math.max(0, i - 2), i))
  return parts.join(',') + ',' + last3
}
const fmtUS = n => {
  const abs = Math.abs(n)
  if (abs >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M'
  if (abs >= 1e3) return '$' + Math.round(n / 1e3) + 'K'
  return '$' + Math.round(n)
}

// FIRE variants: withdrawal rate → expense multiplier
const VARIANTS = [
  { key: 'lean',    label: 'Lean FIRE',    rate: 0.05, mult: 20,  color: C.blue,   desc: '5% withdrawal — frugal lifestyle' },
  { key: 'regular', label: 'FIRE',         rate: 0.04, mult: 25,  color: C.amber,  desc: '4% rule — Trinity Study baseline' },
  { key: 'fat',     label: 'Fat FIRE',     rate: 0.03, mult: 33,  color: C.purple, desc: '3% withdrawal — comfortable buffer' },
]

const DEFAULTS = {
  us: { currentAge: 28, retireAge: 45, currentSavings: 50000, monthlyIncome: 8000, monthlyExpenses: 4000, retireExpenses: 3000, returnRate: 8, retireReturn: 6, inflation: 3, withdrawYears: 35 },
  in: { currentAge: 28, retireAge: 45, currentSavings: 1000000, monthlyIncome: 100000, monthlyExpenses: 50000, retireExpenses: 40000, returnRate: 12, retireReturn: 8, inflation: 6, withdrawYears: 35 },
}

// ── Core calculation ──────────────────────────────────────────────────────────
function computeFIRE(p, activeVariant) {
  const annualExpensesToday = p.retireExpenses * 12
  const yearsToRetire = p.retireAge - p.currentAge
  // Inflate today's retirement expenses to what they'll cost at retirement date
  const annualExpenses = annualExpensesToday * Math.pow(1 + p.inflation / 100, yearsToRetire)
  const monthlySavings = p.monthlyIncome - p.monthlyExpenses
  const r = p.returnRate / 100
  const rMonthly = r / 12

  // FIRE numbers for each variant — all inflation-adjusted to retirement date
  const fireNumbers = VARIANTS.map(v => ({
    ...v,
    fireNumber: annualExpenses * v.mult,
  }))

  // Active variant drives all stats
  const activeV = VARIANTS.find(v => v.key === activeVariant) || VARIANTS[1]
  const mainFireNumber = annualExpenses * activeV.mult

  // Build year-by-year accumulation
  const maxAge = Math.max(p.retireAge + p.withdrawYears, p.currentAge + 60)
  let corpus = p.currentSavings
  const data = []
  let coastFireAge = null
  let fireAge = null

  for (let age = p.currentAge; age <= maxAge; age++) {
    const isAccumulating = age < p.retireAge

    if (isAccumulating) {
      // Coast FIRE: can we stop contributing now and growth alone hits the active target?
      const yearsLeft = p.retireAge - age
      const coastNumber = mainFireNumber / Math.pow(1 + r, yearsLeft)
      if (!coastFireAge && corpus >= coastNumber) coastFireAge = age

      // Grow corpus with contributions
      for (let m = 0; m < 12; m++) {
        corpus = corpus * (1 + rMonthly) + monthlySavings
      }

      if (!fireAge && corpus >= mainFireNumber) fireAge = age
    } else {
      // Withdrawal phase
      const withdrawR = p.retireReturn / 100
      const inflAdj = Math.pow(1 + p.inflation / 100, age - p.retireAge)
      const annualWithdraw = annualExpenses * inflAdj
      corpus = corpus * (1 + withdrawR) - annualWithdraw
      corpus = Math.max(corpus, 0)
    }

    const point = { age, corpus: Math.round(corpus) }
    fireNumbers.forEach(v => { point[v.key + 'Target'] = Math.round(v.fireNumber) })
    data.push(point)
  }

  const yearsToFire = fireAge ? fireAge - p.currentAge : null
  const savingsRate = monthlySavings > 0 ? (monthlySavings / p.monthlyIncome) * 100 : 0
  const progress = Math.min((p.currentSavings / mainFireNumber) * 100, 100)

  const monthsToRetire = yearsToRetire * 12
  const futureCorpusNeeded = mainFireNumber - p.currentSavings * Math.pow(1 + r, yearsToRetire)
  const alreadyFunded = futureCorpusNeeded <= 0
  const rawSavingsNeeded = alreadyFunded ? 0 : rMonthly > 0
    ? futureCorpusNeeded * rMonthly / (Math.pow(1 + rMonthly, monthsToRetire) - 1)
    : futureCorpusNeeded / monthsToRetire

  return {
    fireNumbers, mainFireNumber, data,
    yearsToFire, fireAge, coastFireAge,
    savingsRate, progress, alreadyFunded,
    monthlySavings, monthlySavingsNeeded: Math.max(rawSavingsNeeded, 0),
    retireAge: p.retireAge,
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

const CustomTooltip = ({ active, payload, label, fmt }) => {
  if (!active || !payload?.length) return null
  const corpus = payload.find(p => p.dataKey === 'corpus')
  if (!corpus) return null
  return (
    <div style={{ background: C.panel, border: '1px solid ' + C.border, padding: '10px 14px', fontSize: 11, fontFamily: MONO }}>
      <div style={{ color: C.textSec, marginBottom: 5 }}>Age {label}</div>
      <div style={{ color: C.green }}>Corpus: {fmt(corpus.value)}</div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function FIRECalculator() {
  const [mode, setMode] = useState('in')
  const [usP, setUsP] = useState(DEFAULTS.us)
  const [inP, setInP] = useState(DEFAULTS.in)
  const [activeVariant, setActiveVariant] = useState('regular')

  const setUs = key => val => setUsP(p => ({ ...p, [key]: val }))
  const setIn = key => val => setInP(p => ({ ...p, [key]: val }))

  const params = mode === 'us' ? usP : inP
  const set = mode === 'us' ? setUs : setIn
  const fmt = mode === 'us' ? fmtUS : n => '₹' + fmtIN(n)

  const result = useMemo(() => computeFIRE(params, activeVariant), [params, activeVariant])
  const {
    fireNumbers, mainFireNumber, data,
    yearsToFire, fireAge, coastFireAge,
    savingsRate, progress, alreadyFunded,
    monthlySavings, monthlySavingsNeeded,
    retireAge,
  } = result

  const onTrack = alreadyFunded || monthlySavings >= monthlySavingsNeeded
  const sectionStyle = { fontSize: 10, color: C.amber, letterSpacing: 2, marginBottom: 14, marginTop: 24 }
  const divider = <div style={{ borderTop: '1px solid ' + C.border, margin: '20px 0' }} />

  // Chart data filtered to reasonable range
  const chartData = data.filter((_, i) => i % 1 === 0)

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '52px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <Link to="/calculators" style={{ fontSize: 11, color: C.textSec, textDecoration: 'none', letterSpacing: 1 }}>← CALCULATORS</Link>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginTop: 20, marginBottom: 10 }}>CALCULATORS</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, marginBottom: 10 }}>FIRE Calculator</h1>
          <p style={{ fontSize: 12, color: C.textSec, lineHeight: 1.8, maxWidth: 620 }}>
            Financial Independence, Retire Early. Find your FIRE number, Coast FIRE point, and whether your savings rate gets you there in time.
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

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 32, alignItems: 'start' }}>

          {/* ── LEFT: Inputs ── */}
          <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 24 }}>

            <div style={sectionStyle}>YOU</div>
            <InputField label="CURRENT AGE" value={params.currentAge} onChange={set('currentAge')} min={18} max={60} />
            <InputField label="TARGET RETIREMENT AGE" value={params.retireAge} onChange={set('retireAge')} min={params.currentAge + 1} max={70} />
            <InputField label="CURRENT SAVINGS" value={params.currentSavings} onChange={set('currentSavings')} min={0} max={mode === 'in' ? 50000000 : 2000000} step={mode === 'in' ? 100000 : 10000} isCurrency mode={mode} />

            {divider}
            <div style={sectionStyle}>CASH FLOW</div>
            <InputField label={mode === 'in' ? 'MONTHLY INCOME (₹)' : 'MONTHLY INCOME ($)'} value={params.monthlyIncome} onChange={set('monthlyIncome')} min={0} max={mode === 'in' ? 1000000 : 50000} step={mode === 'in' ? 5000 : 500} isCurrency mode={mode}
              hint={`Save: ${savingsRate.toFixed(0)}%`} />
            <InputField label={mode === 'in' ? 'MONTHLY EXPENSES (₹)' : 'MONTHLY EXPENSES ($)'} value={params.monthlyExpenses} onChange={set('monthlyExpenses')} min={0} max={mode === 'in' ? 500000 : 20000} step={mode === 'in' ? 5000 : 500} isCurrency mode={mode} />
            <InputField label={mode === 'in' ? 'RETIREMENT EXPENSES/MO (₹)' : 'RETIREMENT EXPENSES/MO ($)'} value={params.retireExpenses} onChange={set('retireExpenses')} min={0} max={mode === 'in' ? 500000 : 20000} step={mode === 'in' ? 5000 : 500} isCurrency mode={mode} />

            {divider}
            <div style={sectionStyle}>ASSUMPTIONS</div>
            <InputField label="RETURN DURING ACCUMULATION (%)" value={params.returnRate} onChange={set('returnRate')} min={1} max={20} step={0.5} suffix="%" />
            <InputField label="RETURN AFTER RETIREMENT (%)" value={params.retireReturn} onChange={set('retireReturn')} min={1} max={15} step={0.5} suffix="%" />
            <InputField label="INFLATION (%/YR)" value={params.inflation} onChange={set('inflation')} min={1} max={15} step={0.5} suffix="%" />
            <InputField label="WITHDRAWAL YEARS" value={params.withdrawYears} onChange={set('withdrawYears')} min={10} max={50} step={5} suffix="yrs" />

            {mode === 'in' && (
              <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 3, padding: '10px 12px', marginTop: 16, fontSize: 11, color: C.textSec, lineHeight: 1.7 }}>
                ⚠ The 4% rule is derived from US market data. India's higher inflation (~6%) and different equity risk profile suggest a more conservative 3–3.5% withdrawal rate.
              </div>
            )}
          </div>

          {/* ── RIGHT: Results ── */}
          <div>

            {/* FIRE variant selector */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              {VARIANTS.map(v => (
                <button key={v.key} onClick={() => setActiveVariant(v.key)} style={{
                  flex: 1, padding: '12px 8px', background: activeVariant === v.key ? C.panel : 'transparent',
                  border: `1px solid ${activeVariant === v.key ? v.color : C.border}`,
                  borderRadius: 4, cursor: 'pointer', fontFamily: MONO, transition: 'all 0.15s',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: v.color, marginBottom: 4 }}>{v.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{fmt(fireNumbers.find(f => f.key === v.key)?.fireNumber || 0)}</div>
                  <div style={{ fontSize: 10, color: C.textSec, marginTop: 4 }}>{v.desc}</div>
                </button>
              ))}
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
              <StatBox
                label="YEARS TO FIRE"
                value={yearsToFire ? yearsToFire + ' yrs' : '—'}
                sub={fireAge ? `Age ${fireAge}` : 'Extend horizon'}
                color={yearsToFire ? C.green : C.red}
              />
              <StatBox
                label="COAST FIRE AGE"
                value={coastFireAge ? `Age ${coastFireAge}` : '—'}
                sub="Stop contributing"
                color={C.blue}
              />
              <StatBox
                label="SAVINGS RATE"
                value={savingsRate.toFixed(1) + '%'}
                sub={savingsRate >= 50 ? 'Excellent' : savingsRate >= 30 ? 'Good' : 'Needs work'}
                color={savingsRate >= 50 ? C.green : savingsRate >= 30 ? C.amber : C.red}
              />
              <StatBox
                label="PROGRESS"
                value={progress.toFixed(1) + '%'}
                sub={`of ${fmt(mainFireNumber)}`}
                color={C.amber}
              />
            </div>

            {/* On-track verdict */}
            <div style={{ background: C.panel, border: `1px solid ${onTrack ? C.green : C.red}`, borderRadius: 4, padding: '14px 18px', marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: onTrack ? C.green : C.red, marginBottom: 5 }}>
                {onTrack ? '▲ ON TRACK' : '▼ BEHIND TARGET'}
              </div>
              <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.8 }}>
                Saving {fmt(monthlySavings)}/mo.{' '}
                {alreadyFunded
                  ? `Your existing corpus grows to hit your FIRE number — zero additional contributions needed.`
                  : onTrack
                  ? `You need ${fmt(monthlySavingsNeeded)}/mo — you're saving ${fmt(monthlySavings - monthlySavingsNeeded)} more than required.`
                  : `You need ${fmt(monthlySavingsNeeded)}/mo to retire at ${retireAge} — shortfall of ${fmt(monthlySavingsNeeded - monthlySavings)}/mo.`
                }
                {coastFireAge && ` Coast FIRE at age ${coastFireAge} — you could stop contributing then.`}
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.textSec, marginBottom: 6 }}>
                <span>CORPUS PROGRESS</span>
                <span>{fmt(params.currentSavings)} / {fmt(mainFireNumber)}</span>
              </div>
              <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: progress + '%', background: C.amber, borderRadius: 3, transition: 'width 0.3s' }} />
              </div>
            </div>

            {/* Chart */}
            <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: '20px 16px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 2 }}>CORPUS TRAJECTORY</div>
                <div style={{ display: 'flex', gap: 16 }}>
                  {[['CORPUS', C.green], ['RETIRE', C.red]].map(([label, color]) => (
                    <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: C.textSec }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block' }} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={chartData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="age" tick={{ fontSize: 10, fill: C.textSec, fontFamily: MONO }} label={{ value: 'Age', position: 'insideBottom', offset: -2, fill: C.textSec, fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10, fill: C.textSec, fontFamily: MONO }} tickFormatter={v => fmt(v)} width={76} />
                  <Tooltip content={<CustomTooltip fmt={fmt} />} />
                  {/* FIRE target lines for each variant */}
                  {VARIANTS.map(v => (
                    <ReferenceLine key={v.key} y={fireNumbers.find(f => f.key === v.key)?.fireNumber} stroke={v.color} strokeDasharray="4 4" strokeWidth={1}
                      label={{ value: v.label, position: 'right', fill: v.color, fontSize: 9, fontFamily: MONO }} />
                  ))}
                  {/* Retirement age line */}
                  <ReferenceLine x={retireAge} stroke={C.red} strokeDasharray="4 4" strokeWidth={1}
                    label={{ value: 'Retire', position: 'top', fill: C.red, fontSize: 9, fontFamily: MONO }} />
                  {/* Coast FIRE line */}
                  {coastFireAge && (
                    <ReferenceLine x={coastFireAge} stroke={C.blue} strokeDasharray="4 4" strokeWidth={1}
                      label={{ value: 'Coast', position: 'top', fill: C.blue, fontSize: 9, fontFamily: MONO }} />
                  )}
                  <Area type="monotone" dataKey="corpus" stroke={C.green} fill="rgba(0,230,118,0.05)" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div style={{ fontSize: 11, color: C.textDim, marginTop: 12, lineHeight: 1.7 }}>
              * Corpus shown post-retirement is inflation-adjusted withdrawal phase. A depleted corpus means your FIRE number is insufficient for the selected withdrawal period — increase corpus target or reduce withdrawal years.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
