import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Navbar from '../../components/Navbar'

const C = {
  bg: '#020c18', panel: '#050f1e', border: '#0c1d34',
  green: '#00e676', red: '#ff3c5c', amber: '#f5a623',
  text: '#c8d8f0', textSec: '#506888', textDim: '#1e3050',
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

export default function EMI() {
  const [principal, setPrincipal] = useState(1000000)
  const [rate, setRate]           = useState(8.5)
  const [years, setYears]         = useState(20)

  const r          = rate / 12 / 100
  const n          = years * 12
  const emi        = r > 0 ? principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : principal / n
  const totalPay   = emi * n
  const totalInt   = totalPay - principal

  // Year-by-year breakdown
  const chartData = []
  let balance = principal
  for (let y = 1; y <= Math.min(years, 30); y++) {
    let yearInt = 0, yearPrin = 0
    for (let m = 0; m < 12; m++) {
      const intPay  = balance * r
      const prinPay = emi - intPay
      yearInt  += intPay
      yearPrin += prinPay
      balance  -= prinPay
      if (balance < 0) balance = 0
    }
    chartData.push({ year: `Y${y}`, principal: Math.round(yearPrin), interest: Math.round(yearInt) })
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text }}>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'clamp(16px, 4vw, 40px) clamp(12px, 3vw, 24px)' }}>
        <Link to="/calculators" style={{ fontSize: 11, color: C.textSec, textDecoration: 'none', letterSpacing: 1 }}>← CALCULATORS</Link>
        <div style={{ marginTop: 24, marginBottom: 36 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 8 }}>CALCULATOR</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>EMI Calculator</h1>
          <p style={{ fontSize: 12, color: C.textSec }}>Calculate your monthly loan repayments and total interest payable</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 28 }}>
          <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
            <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 24 }}>INPUTS</div>
            <InputField label="LOAN AMOUNT"        value={principal} onChange={setPrincipal} min={50000} max={10000000} step={50000} prefix="₹" />
            <InputField label="ANNUAL INTEREST RATE" value={rate}   onChange={setRate}      min={1}     max={24}       step={0.1}  suffix="%" />
            <InputField label="LOAN TENURE"        value={years}     onChange={setYears}     min={1}     max={30}       step={1}    suffix="YRS" />
          </div>

          <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
            <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>RESULTS</div>
            <div style={{ background: C.bg, border: `1px solid ${C.amber}`, borderRadius: 3, padding: '20px', marginBottom: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: C.textSec, marginBottom: 6 }}>MONTHLY EMI</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: C.amber }}>{fmt(emi)}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 12 }}>
              {[['PRINCIPAL', fmt(principal), false], ['TOTAL INTEREST', fmt(totalInt), true], ['TOTAL PAYMENT', fmt(totalPay), false], ['INTEREST RATIO', (totalInt / totalPay * 100).toFixed(1) + '%', true]].map(([l, v, warn]) => (
                <div key={l} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: 12 }}>
                  <div style={{ fontSize: 11, color: C.textSec, marginBottom: 4 }}>{l}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: warn ? C.red : C.text }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Amortization chart */}
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24, marginTop: 24 }}>
          <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>YEARLY AMORTIZATION</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <XAxis dataKey="year" tick={{ fill: C.textDim, fontSize: 10, fontFamily: MONO }} tickLine={false} axisLine={{ stroke: C.border }} />
              <YAxis tick={{ fill: C.textDim, fontSize: 10, fontFamily: MONO }} tickLine={false} axisLine={false} width={80}
                tickFormatter={v => v >= 1e5 ? '₹' + (v / 1e5).toFixed(0) + 'L' : '₹' + (v / 1000).toFixed(0) + 'K'} />
              <Tooltip formatter={(v, name) => [fmt(v), name === 'principal' ? 'Principal' : 'Interest']}
                contentStyle={{ background: C.panel, border: `1px solid ${C.border}`, fontFamily: MONO, fontSize: 11 }}
                labelStyle={{ color: C.textSec }} itemStyle={{ color: C.text }} />
              <Legend formatter={v => v === 'principal' ? 'Principal' : 'Interest'}
                wrapperStyle={{ fontSize: 10, color: C.textSec, fontFamily: MONO }} />
              <Bar dataKey="principal" stackId="a" fill={C.green} radius={[0, 0, 0, 0]} />
              <Bar dataKey="interest"  stackId="a" fill={C.red}   radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
