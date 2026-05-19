import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Navbar from '../../components/Navbar'

const C = {
  bg: '#020c18', panel: '#050f1e', border: '#0c1d34',
  green: '#00e676', amber: '#f5a623', text: '#c8d8f0', textSec: '#506888', textDim: '#1e3050',
}
const MONO = "'Consolas','Menlo','Monaco','Courier New',monospace"
const fmt = n => '₹' + Math.round(n).toLocaleString('en-IN')

function InputField({ label, value, onChange, min, max, step, prefix, suffix }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontSize: 10, color: C.textSec, letterSpacing: 1, display: 'block', marginBottom: 6 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {prefix && <span style={{ fontSize: 13, color: C.textSec }}>{prefix}</span>}
        <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} min={min} max={max} step={step}
          style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: '8px 12px', fontSize: 13, fontFamily: MONO, borderRadius: 3, outline: 'none', width: '100%' }} />
        {suffix && <span style={{ fontSize: 13, color: C.textSec }}>{suffix}</span>}
      </div>
      <input type="range" value={value} onChange={e => onChange(Number(e.target.value))} min={min} max={max} step={step}
        style={{ width: '100%', marginTop: 6, accentColor: C.amber }} />
    </div>
  )
}

function ResultCard({ label, value, highlight }) {
  return (
    <div style={{ background: C.bg, border: `1px solid ${highlight ? C.amber : C.border}`, borderRadius: 3, padding: '16px', flex: 1, minWidth: 140 }}>
      <div style={{ fontSize: 9, color: C.textSec, letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: highlight ? C.amber : C.text }}>{value}</div>
    </div>
  )
}

export default function SIP() {
  const [monthly, setMonthly]   = useState(5000)
  const [rate, setRate]         = useState(12)
  const [years, setYears]       = useState(10)

  const months      = years * 12
  const r           = rate / 12 / 100
  const futureValue = r > 0 ? monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r) : monthly * months
  const invested    = monthly * months
  const returns     = futureValue - invested

  const chartData = Array.from({ length: years }, (_, i) => {
    const n  = (i + 1) * 12
    const fv = r > 0 ? monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r) : monthly * n
    const inv = monthly * n
    return { year: `Yr ${i + 1}`, invested: Math.round(inv), value: Math.round(fv) }
  })

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text }}>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
        <Link to="/calculators" style={{ fontSize: 11, color: C.textSec, textDecoration: 'none', letterSpacing: 1 }}>← CALCULATORS</Link>
        <div style={{ marginTop: 24, marginBottom: 36 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 8 }}>CALCULATOR</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>SIP Calculator</h1>
          <p style={{ fontSize: 12, color: C.textSec }}>Calculate the future value of your Systematic Investment Plan</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          {/* Inputs */}
          <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
            <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 24 }}>INPUTS</div>
            <InputField label="MONTHLY INVESTMENT" value={monthly} onChange={setMonthly} min={500} max={200000} step={500} prefix="₹" />
            <InputField label="EXPECTED ANNUAL RETURN" value={rate} onChange={setRate} min={1} max={30} step={0.5} suffix="%" />
            <InputField label="TIME PERIOD" value={years} onChange={setYears} min={1} max={40} step={1} suffix="YRS" />
          </div>

          {/* Results */}
          <div>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24, marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>RESULTS</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                <ResultCard label="INVESTED AMOUNT"    value={fmt(invested)}    />
                <ResultCard label="ESTIMATED RETURNS"  value={fmt(returns)}     />
                <ResultCard label="TOTAL VALUE"        value={fmt(futureValue)} highlight />
              </div>
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: 12 }}>
                <div style={{ fontSize: 10, color: C.textSec, marginBottom: 4 }}>WEALTH GAIN RATIO</div>
                <div style={{ fontSize: 20, color: C.green, fontWeight: 700 }}>
                  {(futureValue / invested).toFixed(2)}x
                </div>
                <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>
                  ₹{Math.round(monthly).toLocaleString('en-IN')}/mo for {years}yr at {rate}% p.a.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24, marginTop: 24 }}>
          <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>GROWTH OVER TIME</div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="invested" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.amber} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.amber} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="value" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.green} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="year" tick={{ fill: C.textDim, fontSize: 10, fontFamily: MONO }} tickLine={false} axisLine={{ stroke: C.border }} />
              <YAxis tick={{ fill: C.textDim, fontSize: 10, fontFamily: MONO }} tickLine={false} axisLine={false} width={80}
                tickFormatter={v => v >= 1e7 ? '₹' + (v / 1e7).toFixed(1) + 'Cr' : v >= 1e5 ? '₹' + (v / 1e5).toFixed(1) + 'L' : '₹' + (v / 1000).toFixed(0) + 'K'} />
              <Tooltip formatter={(v, name) => [fmt(v), name === 'invested' ? 'Invested' : 'Total Value']}
                contentStyle={{ background: C.panel, border: `1px solid ${C.border}`, fontFamily: MONO, fontSize: 11 }}
                labelStyle={{ color: C.textSec }} itemStyle={{ color: C.text }} />
              <Legend formatter={v => v === 'invested' ? 'Amount Invested' : 'Total Value'}
                wrapperStyle={{ fontSize: 10, color: C.textSec, fontFamily: MONO }} />
              <Area type="monotone" dataKey="invested" stroke={C.amber} strokeWidth={1.5} fill="url(#invested)" dot={false} />
              <Area type="monotone" dataKey="value"    stroke={C.green} strokeWidth={1.5} fill="url(#value)"    dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
