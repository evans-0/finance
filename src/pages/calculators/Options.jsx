import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import Navbar from '../../components/Navbar'

const C = {
  bg: '#020c18', panel: '#050f1e', border: '#0c1d34',
  green: '#00e676', red: '#ff3c5c', amber: '#f5a623',
  text: '#c8d8f0', textSec: '#506888', textDim: '#1e3050',
}
const MONO = "'Consolas','Menlo','Monaco','Courier New',monospace"

function InputField({ label, value, onChange, min, step, prefix, suffix }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 10, color: C.textSec, letterSpacing: 1, display: 'block', marginBottom: 6 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {prefix && <span style={{ fontSize: 13, color: C.textSec }}>{prefix}</span>}
        <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} min={min} step={step}
          style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: '8px 12px', fontSize: 13, fontFamily: MONO, borderRadius: 3, outline: 'none' }} />
        {suffix && <span style={{ fontSize: 13, color: C.textSec }}>{suffix}</span>}
      </div>
    </div>
  )
}

export default function Options() {
  const [optType,   setOptType]  = useState('call')
  const [strike,    setStrike]   = useState(18000)
  const [premium,   setPremium]  = useState(150)
  const [current,   setCurrent]  = useState(18200)
  const [qty,       setQty]      = useState(50) // lot size

  // P&L at current price
  const pnlNow = optType === 'call'
    ? (Math.max(0, current - strike) - premium) * qty
    : (Math.max(0, strike - current) - premium) * qty

  const breakeven = optType === 'call' ? strike + premium : strike - premium
  const maxLoss   = premium * qty
  const maxProfit = optType === 'call' ? '∞' : (strike - premium) * qty

  // Chart data: P&L across price range
  const low   = Math.round(strike * 0.85)
  const high  = Math.round(strike * 1.15)
  const step  = Math.round((high - low) / 30)
  const chartData = []
  for (let p = low; p <= high; p += step) {
    const pnl = optType === 'call'
      ? (Math.max(0, p - strike) - premium) * qty
      : (Math.max(0, strike - p) - premium) * qty
    chartData.push({ price: p, pnl: Math.round(pnl) })
  }

  const fmtCurr = n => (n < 0 ? '-₹' : '₹') + Math.abs(Math.round(n)).toLocaleString('en-IN')

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text }}>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'clamp(16px, 4vw, 40px) clamp(12px, 3vw, 24px)' }}>
        <Link to="/calculators" style={{ fontSize: 11, color: C.textSec, textDecoration: 'none', letterSpacing: 1 }}>← CALCULATORS</Link>
        <div style={{ marginTop: 24, marginBottom: 36 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 8 }}>CALCULATOR</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Options P&L</h1>
          <p style={{ fontSize: 12, color: C.textSec }}>Calculate options payoff at expiry, breakeven and max profit/loss</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 28 }}>
          <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
            <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>INPUTS</div>

            {/* Option type toggle */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, color: C.textSec, letterSpacing: 1, display: 'block', marginBottom: 8 }}>OPTION TYPE</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 8 }}>
                {['call', 'put'].map(t => (
                  <button key={t} onClick={() => setOptType(t)} style={{
                    background: optType === t ? C.amber : C.bg, color: optType === t ? '#020c18' : C.textSec,
                    border: `1px solid ${optType === t ? C.amber : C.border}`, padding: '10px', fontSize: 12, fontFamily: MONO,
                    cursor: 'pointer', borderRadius: 3, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase',
                  }}>
                    {t === 'call' ? '📈 CALL' : '📉 PUT'}
                  </button>
                ))}
              </div>
            </div>

            <InputField label="STRIKE PRICE"   value={strike}  onChange={setStrike}  min={1}    step={50}  prefix="₹" />
            <InputField label="PREMIUM PAID"   value={premium} onChange={setPremium} min={0.5}  step={0.5} prefix="₹" />
            <InputField label="CURRENT PRICE"  value={current} onChange={setCurrent} min={1}    step={50}  prefix="₹" />
            <InputField label="LOT SIZE / QTY" value={qty}     onChange={setQty}     min={1}    step={1}              />
          </div>

          <div>
            {/* Current P&L */}
            <div style={{ background: C.panel, border: `2px solid ${pnlNow >= 0 ? C.green : C.red}`, borderRadius: 4, padding: 24, textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: C.textSec, marginBottom: 6 }}>P&L AT CURRENT PRICE</div>
              <div style={{ fontSize: 36, fontWeight: 700, color: pnlNow >= 0 ? C.green : C.red }}>{fmtCurr(pnlNow)}</div>
              <div style={{ fontSize: 11, color: C.textSec, marginTop: 4 }}>@ ₹{current.toLocaleString('en-IN')}</div>
            </div>

            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
              <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 16 }}>KEY LEVELS</div>
              {[
                ['BREAKEVEN',   '₹' + breakeven.toLocaleString('en-IN'),         null],
                ['MAX LOSS',    fmtCurr(-maxLoss),                                C.red],
                ['MAX PROFIT',  typeof maxProfit === 'string' ? maxProfit : fmtCurr(maxProfit), C.green],
                ['PREMIUM PAID', fmtCurr(-premium * qty),                         C.red],
                ['IN THE MONEY', optType === 'call' ? current > strike ? 'YES ✓' : 'NO ✗' : current < strike ? 'YES ✓' : 'NO ✗',
                  optType === 'call' ? current > strike ? C.green : C.red : current < strike ? C.green : C.red],
              ].map(([l, v, color]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 11, color: C.textSec }}>{l}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: color || C.text }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payoff chart */}
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24, marginTop: 24 }}>
          <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>PAYOFF DIAGRAM AT EXPIRY</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <XAxis dataKey="price" tick={{ fill: C.textDim, fontSize: 10, fontFamily: MONO }} tickLine={false} axisLine={{ stroke: C.border }}
                tickFormatter={v => '₹' + (v / 1000).toFixed(0) + 'K'} />
              <YAxis tick={{ fill: C.textDim, fontSize: 10, fontFamily: MONO }} tickLine={false} axisLine={false} width={80}
                tickFormatter={v => (v < 0 ? '-₹' : '₹') + Math.abs(v / 1000).toFixed(0) + 'K'} />
              <Tooltip formatter={v => [fmtCurr(v), 'P&L']}
                labelFormatter={v => 'Price: ₹' + Number(v).toLocaleString('en-IN')}
                contentStyle={{ background: C.panel, border: `1px solid ${C.border}`, fontFamily: MONO, fontSize: 11 }}
                labelStyle={{ color: C.textSec }} itemStyle={{ color: C.text }} />
              <ReferenceLine y={0}        stroke={C.border}        strokeDasharray="4 4" />
              <ReferenceLine x={breakeven} stroke={C.amber}        strokeDasharray="4 4" label={{ value: 'BEP', fill: C.amber, fontSize: 10 }} />
              <ReferenceLine x={current}   stroke={C.text}         strokeDasharray="4 4" label={{ value: 'NOW', fill: C.textSec, fontSize: 10 }} />
              <Line type="monotone" dataKey="pnl" stroke={C.green} strokeWidth={2} dot={false}
                activeDot={{ r: 4, fill: C.green }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
