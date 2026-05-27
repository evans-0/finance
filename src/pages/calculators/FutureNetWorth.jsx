import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer
} from 'recharts'
import Navbar from '../../components/Navbar'

const C = {
  bg: '#020c18', panel: '#050f1e', border: '#0c1d34',
  amber: '#f5a623', green: '#00e676', blue: '#4fc3f7',
  red: '#ff3c5c', purple: '#ce93d8',
  text: '#c8d8f0', textSec: '#506888', textDim: '#1e3050',
}
const MONO = "'Consolas','Menlo','Monaco','Courier New',monospace"

function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return width
}

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

// ── Defaults ──────────────────────────────────────────────────────────────────
let _id = 1
const uid = () => _id++

const DEFAULT_ASSETS = {
  in: [
    { id: uid(), name: 'Equity & Stocks',  value: 300000,  returnRate: 12   },
    { id: uid(), name: 'Mutual Funds',      value: 500000,  returnRate: 12   },
    { id: uid(), name: 'Fixed Deposits',    value: 200000,  returnRate: 7    },
    { id: uid(), name: 'PPF',               value: 150000,  returnRate: 7.1  },
    { id: uid(), name: 'EPF',               value: 300000,  returnRate: 8.15 },
    { id: uid(), name: 'Real Estate',       value: 5000000, returnRate: 7    },
    { id: uid(), name: 'Gold',              value: 200000,  returnRate: 8    },
  ],
  us: [
    { id: uid(), name: 'Stocks / ETFs',     value: 50000,   returnRate: 10   },
    { id: uid(), name: '401(k) / IRA',      value: 30000,   returnRate: 8    },
    { id: uid(), name: 'Real Estate Equity',value: 100000,  returnRate: 4    },
    { id: uid(), name: 'Bonds / CDs',       value: 20000,   returnRate: 4.5  },
    { id: uid(), name: 'Cash / Savings',    value: 10000,   returnRate: 4.5  },
    { id: uid(), name: 'Gold',              value: 5000,    returnRate: 6    },
  ],
}

const DEFAULT_LIABILITIES = {
  in: [
    { id: uid(), name: 'Home Loan',     balance: 3000000, emi: 25000, rate: 8.5 },
    { id: uid(), name: 'Car Loan',      balance: 500000,  emi: 12000, rate: 9   },
  ],
  us: [
    { id: uid(), name: 'Mortgage',      balance: 200000,  emi: 1500,  rate: 6.8 },
    { id: uid(), name: 'Car Loan',      balance: 15000,   emi: 400,   rate: 6   },
  ],
}

const DEFAULT_GLOBAL = {
  in: { monthlySavings: 20000, savingsReturn: 12, years: 20 },
  us: { monthlySavings: 2000,  savingsReturn: 8,  years: 20 },
}

// ── Computation ───────────────────────────────────────────────────────────────
function compute(assets, liabilities, global, mode) {
  const { monthlySavings, savingsReturn, years } = global
  const rSavings = savingsReturn / 100 / 12

  // Snapshot liability state (mutable per year)
  let liabState = liabilities.map(l => ({ ...l, bal: l.balance }))

  // Future investments bucket starts at 0, grows with monthly contributions
  let futureInvest = 0

  const currentAssets = assets.reduce((s, a) => s + a.value, 0)
  const currentLiab = liabilities.reduce((s, l) => s + l.balance, 0)
  const currentNW = currentAssets - currentLiab

  const chartData = [{ year: 0, assets: Math.round(currentAssets), liabilities: Math.round(currentLiab), netWorth: Math.round(currentNW) }]

  for (let yr = 1; yr <= years; yr++) {
    // Grow each asset
    const totalAssets = assets.reduce((sum, a) => {
      return sum + a.value * Math.pow(1 + a.returnRate / 100, yr)
    }, 0)

    // Grow future investments bucket (monthly contributions)
    for (let m = 0; m < 12; m++) {
      futureInvest = futureInvest * (1 + rSavings) + monthlySavings
    }

    // Reduce each liability via amortisation
    for (const l of liabState) {
      if (l.bal <= 0) continue
      const rMo = l.rate / 100 / 12
      for (let m = 0; m < 12; m++) {
        if (l.bal <= 0) break
        const interest = l.bal * rMo
        const principal = Math.max(l.emi - interest, 0)
        l.bal = Math.max(l.bal - principal, 0)
      }
    }

    const totalLiab = liabState.reduce((s, l) => s + l.bal, 0)
    const totalA = totalAssets + futureInvest
    const nw = totalA - totalLiab

    chartData.push({
      year: yr,
      assets: Math.round(totalA),
      liabilities: Math.round(totalLiab),
      netWorth: Math.round(nw),
    })
  }

  const last = chartData[chartData.length - 1]
  const growth = last.netWorth - currentNW
  const cagr = currentNW > 0
    ? (Math.pow(last.netWorth / currentNW, 1 / years) - 1) * 100
    : 0

  // Largest asset at end
  const assetBreakdown = assets.map(a => ({
    name: a.name,
    value: Math.round(a.value * Math.pow(1 + a.returnRate / 100, years)),
  })).sort((a, b) => b.value - a.value)

  return { chartData, currentNW, futureNW: last.netWorth, growth, cagr, assetBreakdown, currentAssets, currentLiab }
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return <div style={{ fontSize: 10, color: C.amber, letterSpacing: 2, marginBottom: 12, marginTop: 24 }}>{children}</div>
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

// FormattedInput: shows Indian/US format when blurred, raw number when focused
function FormattedInput({ value, onChange, color, mode, style = {} }) {
  const [focused, setFocused] = useState(false)
  const fmt = v => {
    if (mode === 'us') return v === 0 ? '' : String(Math.round(v))
    if (!v || v === 0) return ''
    const abs = Math.round(v)
    const s = abs.toString()
    if (s.length <= 3) return s
    const last3 = s.slice(-3)
    const rest = s.slice(0, -3)
    const parts = []
    for (let i = rest.length; i > 0; i -= 2) parts.unshift(rest.slice(Math.max(0, i - 2), i))
    return parts.join(',') + ',' + last3
  }
  return (
    <input
      type="text"
      value={focused ? (value === 0 ? '' : value) : fmt(value)}
      onFocus={() => setFocused(true)}
      onBlur={e => { setFocused(false); onChange(parseFloat(e.target.value.replace(/,/g, '')) || 0) }}
      onChange={e => { if (focused) onChange(parseFloat(e.target.value.replace(/,/g, '')) || 0) }}
      style={{ ...style, color: color || C.text }}
    />
  )
}

function AssetRow({ asset, onChange, onRemove, mode, isMobile }) {
  const inputStyle = { width: '100%', background: C.bg, border: '1px solid ' + C.border, padding: '7px 10px', fontSize: 12, fontFamily: MONO, borderRadius: 3, outline: 'none' }
  const grid = isMobile
    ? { display: 'grid', gridTemplateColumns: '1fr 110px 80px 28px', gap: 6, marginBottom: 8, alignItems: 'center' }
    : { display: 'grid', gridTemplateColumns: '1fr 130px 90px 28px', gap: 8, marginBottom: 8, alignItems: 'center' }
  return (
    <div style={grid}>
      <input value={asset.name} onChange={e => onChange('name', e.target.value)}
        placeholder="Asset name"
        style={{ ...inputStyle, color: C.text }} />
      <FormattedInput value={asset.value} onChange={v => onChange('value', v)} mode={mode}
        style={inputStyle} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <input type="number" value={asset.returnRate} onChange={e => onChange('returnRate', parseFloat(e.target.value) || 0)}
          step={0.1} min={0} max={50}
          style={{ ...inputStyle, color: C.amber, padding: '7px 8px' }} />
        <span style={{ fontSize: 11, color: C.textSec }}>%</span>
      </div>
      <button onClick={onRemove} style={{ background: 'transparent', border: '1px solid ' + C.border, color: C.red, borderRadius: 3, cursor: 'pointer', fontSize: 14, padding: '4px 6px', lineHeight: 1 }}>×</button>
    </div>
  )
}

function LiabilityRow({ liability, onChange, onRemove, mode, isMobile }) {
  const inputStyle = { width: '100%', background: C.bg, border: '1px solid ' + C.border, padding: '7px 10px', fontSize: 12, fontFamily: MONO, borderRadius: 3, outline: 'none' }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 110px 90px 70px 28px', gap: isMobile ? '6px 8px' : 8, marginBottom: isMobile ? 16 : 8, alignItems: 'center' }}>
      <input value={liability.name} onChange={e => onChange('name', e.target.value)}
        placeholder="Liability name"
        style={{ ...inputStyle, color: C.text }} />
      <FormattedInput value={liability.balance} onChange={v => onChange('balance', v)} mode={mode}
        style={inputStyle} />
      <FormattedInput value={liability.emi} onChange={v => onChange('emi', v)} mode={mode}
        style={inputStyle} color={C.red} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, gridColumn: isMobile ? '1' : 'auto' }}>
        <input type="number" value={liability.rate} onChange={e => onChange('rate', parseFloat(e.target.value) || 0)}
          step={0.1} min={0} max={30}
          style={{ ...inputStyle, color: C.textSec, padding: '7px 6px' }} />
        <span style={{ fontSize: 11, color: C.textSec }}>%</span>
      </div>
      <button onClick={onRemove} style={{ background: 'transparent', border: '1px solid ' + C.border, color: C.red, borderRadius: 3, cursor: 'pointer', fontSize: 14, padding: '4px 6px', lineHeight: 1, gridColumn: isMobile ? '2' : 'auto', justifySelf: isMobile ? 'end' : 'auto' }}>×</button>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label, fmt }) => {
  if (!active || !payload?.length) return null
  const get = key => payload.find(p => p.dataKey === key)?.value || 0
  return (
    <div style={{ background: C.panel, border: '1px solid ' + C.border, padding: '10px 14px', fontSize: 11, fontFamily: MONO, minWidth: 160 }}>
      <div style={{ color: C.textSec, marginBottom: 6 }}>Year {label}</div>
      <div style={{ color: C.green,  marginBottom: 2 }}>Assets: {fmt(get('assets'))}</div>
      <div style={{ color: C.red,    marginBottom: 2 }}>Liabilities: {fmt(get('liabilities'))}</div>
      <div style={{ color: C.amber,  fontWeight: 700 }}>Net Worth: {fmt(get('netWorth'))}</div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function FutureNetWorth() {
  const [mode, setMode] = useState('in')
  const isMobile = useWindowWidth() < 700
  const [assets, setAssets] = useState({ in: DEFAULT_ASSETS.in, us: DEFAULT_ASSETS.us })
  const [liabilities, setLiabilities] = useState({ in: DEFAULT_LIABILITIES.in, us: DEFAULT_LIABILITIES.us })
  const [global, setGlobal] = useState(DEFAULT_GLOBAL)

  const fmt = mode === 'us' ? fmtUS : n => '₹' + fmtIN(n)
  const curr = mode === 'us' ? '$' : '₹'

  const a = assets[mode]
  const l = liabilities[mode]
  const g = global[mode]

  const setA = fn => setAssets(prev => ({ ...prev, [mode]: fn(prev[mode]) }))
  const setL = fn => setLiabilities(prev => ({ ...prev, [mode]: fn(prev[mode]) }))
  const setG = (key, val) => setGlobal(prev => ({ ...prev, [mode]: { ...prev[mode], [key]: val } }))

  const updateAsset = (id, field, val) => setA(prev => prev.map(a => a.id === id ? { ...a, [field]: val } : a))
  const removeAsset = id => setA(prev => prev.filter(a => a.id !== id))
  const addAsset = () => setA(prev => [...prev, { id: uid(), name: '', value: 0, returnRate: mode === 'in' ? 12 : 8 }])

  const updateLiability = (id, field, val) => setL(prev => prev.map(l => l.id === id ? { ...l, [field]: val } : l))
  const removeLiability = id => setL(prev => prev.filter(l => l.id !== id))
  const addLiability = () => setL(prev => [...prev, { id: uid(), name: '', balance: 0, emi: 0, rate: mode === 'in' ? 9 : 6 }])

  const result = useMemo(() => compute(a, l, g, mode), [a, l, g, mode])
  const { chartData, currentNW, futureNW, growth, cagr, assetBreakdown, currentAssets, currentLiab } = result

  const colHeader = { fontSize: 10, color: C.textSec, letterSpacing: 1 }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '24px 16px' : '52px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <Link to="/calculators" style={{ fontSize: 11, color: C.textSec, textDecoration: 'none', letterSpacing: 1 }}>← CALCULATORS</Link>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginTop: 20, marginBottom: 10 }}>CALCULATORS</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, marginBottom: 10 }}>Future Net Worth</h1>
          <p style={{ fontSize: 12, color: C.textSec, lineHeight: 1.8, maxWidth: 620 }}>
            Full balance sheet projection. Each asset grows at its own rate, each liability amortises via EMI. See your net worth trajectory over time.
          </p>
        </div>

        {/* Toggle */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 32, border: '1px solid ' + C.border, borderRadius: 3, width: 'fit-content', overflow: 'hidden' }}>
          {[['us', '🇺🇸  United States'], ['in', '🇮🇳  India']].map(([key, label]) => (
            <button key={key} onClick={() => setMode(key)} style={{
              padding: '9px 24px', background: mode === key ? C.amber : 'transparent',
              color: mode === key ? C.bg : C.textSec, border: 'none', cursor: 'pointer',
              fontSize: 12, fontFamily: MONO, fontWeight: mode === key ? 700 : 400, letterSpacing: 1,
            }}>{label}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '420px 1fr', gap: isMobile ? 20 : 32, alignItems: 'start' }}>

          {/* ── LEFT: Balance sheet inputs ── */}
          <div>
            <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 24, marginBottom: 16 }}>
              <SectionLabel>ASSETS</SectionLabel>
              {/* Column headers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 90px 28px', gap: 8, marginBottom: 6 }}>
                <span style={colHeader}>NAME</span>
                <span style={colHeader}>VALUE ({curr})</span>
                <span style={colHeader}>RETURN</span>
                <span />
              </div>
              {a.map(asset => (
                <AssetRow key={asset.id} asset={asset} mode={mode} isMobile={isMobile}
                  onChange={(f, v) => updateAsset(asset.id, f, v)}
                  onRemove={() => removeAsset(asset.id)} />
              ))}
              <button onClick={addAsset} style={{ marginTop: 8, background: 'transparent', border: '1px dashed ' + C.border, color: C.textSec, padding: '7px 14px', fontSize: 11, fontFamily: MONO, borderRadius: 3, cursor: 'pointer', width: '100%', letterSpacing: 1 }}>
                + ADD ASSET
              </button>

              <div style={{ borderTop: '1px solid ' + C.border, margin: '20px 0' }} />

              <SectionLabel>LIABILITIES</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 90px 70px 28px', gap: 8, marginBottom: 6 }}>
                <span style={colHeader}>NAME</span>
                <span style={colHeader}>BALANCE</span>
                <span style={colHeader}>EMI/MO</span>
                <span style={colHeader}>RATE</span>
                <span />
              </div>
              {l.map(liab => (
                <LiabilityRow key={liab.id} mode={mode} isMobile={isMobile} liability={liab}
                  onChange={(f, v) => updateLiability(liab.id, f, v)}
                  onRemove={() => removeLiability(liab.id)} />
              ))}
              <button onClick={addLiability} style={{ marginTop: 8, background: 'transparent', border: '1px dashed ' + C.border, color: C.textSec, padding: '7px 14px', fontSize: 11, fontFamily: MONO, borderRadius: 3, cursor: 'pointer', width: '100%', letterSpacing: 1 }}>
                + ADD LIABILITY
              </button>
            </div>

            {/* Global settings */}
            <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 24 }}>
              <SectionLabel>MONTHLY SAVINGS</SectionLabel>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 10, color: C.textSec, letterSpacing: 1, display: 'block', marginBottom: 6 }}>
                  AMOUNT ({curr}/MO)
                </label>
                <FormattedInput value={g.monthlySavings} onChange={v => setG('monthlySavings', v)} mode={mode}
                  style={{ width: '100%', background: C.bg, border: '1px solid ' + C.border, padding: '8px 12px', fontSize: 13, fontFamily: MONO, borderRadius: 3, outline: 'none', marginBottom: 4 }} />
                <div style={{ fontSize: 11, color: C.amber }}>{fmt(g.monthlySavings)}/mo</div>
                <input type="range" value={g.monthlySavings} onChange={e => setG('monthlySavings', parseFloat(e.target.value))}
                  min={0} max={mode === 'in' ? 200000 : 20000} step={mode === 'in' ? 1000 : 100}
                  style={{ width: '100%', marginTop: 6, accentColor: C.amber }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 10, color: C.textSec, letterSpacing: 1, display: 'block', marginBottom: 6 }}>INVESTED AT (%)</label>
                  <input type="number" value={g.savingsReturn} onChange={e => setG('savingsReturn', parseFloat(e.target.value) || 0)}
                    step={0.5} min={1} max={20}
                    style={{ width: '100%', background: C.bg, border: '1px solid ' + C.border, color: C.amber, padding: '8px 12px', fontSize: 13, fontFamily: MONO, borderRadius: 3, outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: C.textSec, letterSpacing: 1, display: 'block', marginBottom: 6 }}>TIME HORIZON (YRS)</label>
                  <input type="number" value={g.years} onChange={e => setG('years', Math.min(Math.max(parseInt(e.target.value) || 1, 1), 40))}
                    min={1} max={40}
                    style={{ width: '100%', background: C.bg, border: '1px solid ' + C.border, color: C.text, padding: '8px 12px', fontSize: 13, fontFamily: MONO, borderRadius: 3, outline: 'none' }} />
                </div>
              </div>
              <input type="range" value={g.years} onChange={e => setG('years', parseInt(e.target.value))}
                min={1} max={40} step={1}
                style={{ width: '100%', marginTop: 10, accentColor: C.amber }} />
            </div>
          </div>

          {/* ── RIGHT: Results ── */}
          <div>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
              <StatBox label="CURRENT NET WORTH" value={fmt(currentNW)} sub={`Assets: ${fmt(currentAssets)}`} color={currentNW >= 0 ? C.green : C.red} />
              <StatBox label={`NET WORTH · YR ${g.years}`} value={fmt(futureNW)} sub={`Liab: ${fmt(chartData[chartData.length-1]?.liabilities || 0)}`} color={C.amber} />
              <StatBox label="TOTAL GROWTH" value={fmt(growth)} sub="in absolute terms" color={growth >= 0 ? C.green : C.red} />
              <StatBox label="CAGR" value={cagr > 0 ? cagr.toFixed(1) + '%' : '—'} sub="net worth CAGR" color={C.blue} />
            </div>

            {/* Chart */}
            <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: '20px 16px 12px', marginBottom: 20 }}>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 8 : 0, marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 2 }}>BALANCE SHEET PROJECTION</div>
                <div style={{ display: 'flex', gap: 16 }}>
                  {[['ASSETS', C.green], ['LIABILITIES', C.red], ['NET WORTH', C.amber]].map(([label, color]) => (
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
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: C.textSec, fontFamily: MONO }}
                    label={{ value: 'Years', position: 'insideBottom', offset: -2, fill: C.textSec, fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10, fill: C.textSec, fontFamily: MONO }} tickFormatter={v => fmt(v)} width={80} />
                  <Tooltip content={<CustomTooltip fmt={fmt} />} />
                  <ReferenceLine y={0} stroke={C.border} strokeWidth={1} />
                  <Area type="monotone" dataKey="assets" stroke={C.green} fill="rgba(0,230,118,0.05)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="liabilities" stroke={C.red} strokeWidth={2} strokeDasharray="4 4" dot={false} />
                  <Line type="monotone" dataKey="netWorth" stroke={C.amber} strokeWidth={2.5} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Asset breakdown at end */}
            <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: '18px 20px' }}>
              <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 2, marginBottom: 14 }}>ASSET BREAKDOWN · YR {g.years}</div>
              {assetBreakdown.filter(a => a.value > 0).map((a, i) => {
                const total = assetBreakdown.reduce((s, x) => s + x.value, 0)
                const pct = total > 0 ? (a.value / total) * 100 : 0
                return (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                      <span style={{ color: C.textSec }}>{a.name}</span>
                      <span style={{ color: C.text }}>{fmt(a.value)} <span style={{ color: C.textSec }}>({pct.toFixed(1)}%)</span></span>
                    </div>
                    <div style={{ height: 3, background: C.border, borderRadius: 2 }}>
                      <div style={{ height: '100%', width: pct + '%', background: C.amber, borderRadius: 2, opacity: 0.6 + (i === 0 ? 0.4 : 0) }} />
                    </div>
                  </div>
                )
              })}
              {g.monthlySavings > 0 && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid ' + C.border, fontSize: 11, color: C.textSec }}>
                  + Future investments ({fmt(g.monthlySavings)}/mo @ {g.savingsReturn}%): {fmt(chartData[chartData.length - 1]?.assets - assetBreakdown.reduce((s, a) => s + a.value, 0))} compounded over {g.years} yrs
                </div>
              )}
            </div>

            <div style={{ fontSize: 11, color: C.textDim, marginTop: 12, lineHeight: 1.7 }}>
              * Each asset grows at its stated annual return. Liabilities amortise via monthly EMI with interest. Monthly savings are invested separately at the stated return rate and added to total assets.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
