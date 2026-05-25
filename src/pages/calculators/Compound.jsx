import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Navbar from '../../components/Navbar'

const C = {
  bg: '#020c18', panel: '#050f1e', border: '#0c1d34',
  green: '#00e676', amber: '#f5a623', blue: '#2196f3',
  text: '#c8d8f0', textSec: '#506888', textDim: '#1e3050',
}
const MONO = "'Consolas','Menlo','Monaco','Courier New',monospace"
const fmt = n => '₹' + Math.round(n).toLocaleString('en-IN')

const FREQUENCIES = [
  { label: 'Annually',    n: 1  },
  { label: 'Semi-Annual', n: 2  },
  { label: 'Quarterly',   n: 4  },
  { label: 'Monthly',     n: 12 },
]

function InputField({ label, value, onChange, min, max, step, prefix, suffix }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontSize: 10, color: C.textSec, letterSpacing: 1, display: 'block', marginBottom: 6 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {prefix && <span style={{ fontSize: 13, color: C.textSec }}>{prefix}</span>}
        <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} min={min} max={max} step={step}
          style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: '8px 12px', fontSize: 13, fontFamily: MONO, borderRadius: 3, outline: 'none' }} />
        {suffix && <span style={{ fontSize: 13, color: C.textSec }}>{suffix}</span>}
      </div>
      <input type="range" value={value} onChange={e => onChange(Number(e.target.value))} min={min} max={max} step={step}
        style={{ width: '100%', marginTop: 6, accentColor: C.amber }} />
    </div>
  )
}

export default function Compound() {
  const [principal, setPrincipal] = useState(100000)
  const [rate, setRate]           = useState(10)
  const [years, setYears]         = useState(10)
  const [freq, setFreq]           = useState(4)

  const calc = (p, r, t, n) => p * Math.pow(1 + r / 100 / n, n * t)

  const finalAmount = calc(principal, rate, years, freq)
  const totalInt    = finalAmount - principal

  // Compare all frequencies
  const chartData = Array.from({ length: years }, (_, i) => {
    const t = i + 1
    const row = { year: `Yr ${t}` }
    FREQUENCIES.forEach(f => { row[f.label] = Math.round(calc(principal, rate, t, f.n)) })
    return row
  })

  const colors = [C.amber, C.green, C.blue, '#ff6b6b']

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text }}>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'clamp(16px, 4vw, 40px) clamp(12px, 3vw, 24px)' }}>
        <Link to="/calculators" style={{ fontSize: 11, color: C.textSec, textDecoration: 'none', letterSpacing: 1 }}>← CALCULATORS</Link>
        <div style={{ marginTop: 24, marginBottom: 36 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 8 }}>CALCULATOR</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Compound Interest</h1>
          <p style={{ fontSize: 12, color: C.textSec }}>See the power of compounding across different frequencies</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 28 }}>
          <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
            <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 24 }}>INPUTS</div>
            <InputField label="PRINCIPAL AMOUNT"    value={principal} onChange={setPrincipal} min={1000}  max={10000000} step={1000} prefix="₹" />
            <InputField label="ANNUAL INTEREST RATE" value={rate}     onChange={setRate}      min={1}     max={30}       step={0.5}  suffix="%" />
            <InputField label="TIME PERIOD"          value={years}    onChange={setYears}     min={1}     max={40}       step={1}    suffix="YRS" />
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, color: C.textSec, letterSpacing: 1, display: 'block', marginBottom: 8 }}>COMPOUNDING FREQUENCY</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 8 }}>
                {FREQUENCIES.map(f => (
                  <button key={f.n} onClick={() => setFreq(f.n)}
                    style={{ background: freq === f.n ? C.amber : C.bg, color: freq === f.n ? '#020c18' : C.textSec, border: `1px solid ${freq === f.n ? C.amber : C.border}`, padding: '8px', fontSize: 10, fontFamily: MONO, cursor: 'pointer', borderRadius: 3, letterSpacing: 0.5 }}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
            <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>RESULTS</div>
            <div style={{ background: C.bg, border: `1px solid ${C.amber}`, borderRadius: 3, padding: '20px', marginBottom: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: C.textSec, marginBottom: 6 }}>FINAL AMOUNT</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: C.amber }}>{fmt(finalAmount)}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 12 }}>
              {[['PRINCIPAL', fmt(principal)], ['INTEREST EARNED', fmt(totalInt)], ['GROWTH', (finalAmount / principal).toFixed(2) + 'x'], ['EFFECTIVE RATE', ((Math.pow(1 + rate / 100 / freq, freq) - 1) * 100).toFixed(2) + '%']].map(([l, v]) => (
                <div key={l} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: 12 }}>
                  <div style={{ fontSize: 11, color: C.textSec, marginBottom: 4 }}>{l}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24, marginTop: 24 }}>
          <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>FREQUENCY COMPARISON</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <XAxis dataKey="year" tick={{ fill: C.textDim, fontSize: 10, fontFamily: MONO }} tickLine={false} axisLine={{ stroke: C.border }} />
              <YAxis tick={{ fill: C.textDim, fontSize: 10, fontFamily: MONO }} tickLine={false} axisLine={false} width={80}
                tickFormatter={v => v >= 1e7 ? '₹' + (v / 1e7).toFixed(1) + 'Cr' : v >= 1e5 ? '₹' + (v / 1e5).toFixed(0) + 'L' : '₹' + (v / 1000).toFixed(0) + 'K'} />
              <Tooltip formatter={(v) => [fmt(v)]}
                contentStyle={{ background: C.panel, border: `1px solid ${C.border}`, fontFamily: MONO, fontSize: 11 }}
                labelStyle={{ color: C.textSec }} itemStyle={{ color: C.text }} />
              <Legend wrapperStyle={{ fontSize: 10, color: C.textSec, fontFamily: MONO }} />
              {FREQUENCIES.map((f, i) => (
                <Line key={f.label} type="monotone" dataKey={f.label} stroke={colors[i]} strokeWidth={1.5} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
