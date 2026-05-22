import { useState } from 'react'
import { Link } from 'react-router-dom'
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

function Row({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 11, color: C.textSec }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: color || C.text }}>{value}</span>
    </div>
  )
}

export default function StockReturn() {
  const [buyPrice,    setBuyPrice]    = useState(1000)
  const [sellPrice,   setSellPrice]   = useState(1250)
  const [qty,         setQty]         = useState(100)
  const [brokerage,   setBrokerage]   = useState(0.1)
  const [buyDate,     setBuyDate]     = useState('2023-01-01')
  const [sellDate,    setSellDate]    = useState('2024-01-01')

  const investment   = buyPrice  * qty * (1 + brokerage / 100)
  const proceeds     = sellPrice * qty * (1 - brokerage / 100)
  const pnl          = proceeds - investment
  const returnPct    = (pnl / investment) * 100
  const isProfit     = pnl >= 0

  // CAGR
  const buyD  = new Date(buyDate)
  const sellD = new Date(sellDate)
  const days  = Math.max((sellD - buyD) / (1000 * 86400), 1)
  const years = days / 365
  const cagr  = years > 0 ? (Math.pow(proceeds / investment, 1 / years) - 1) * 100 : 0

  const fmtCurr = n => (n < 0 ? '-₹' : '₹') + Math.abs(Math.round(n)).toLocaleString('en-IN')
  const fmtPct  = n => (n >= 0 ? '+' : '') + n.toFixed(2) + '%'

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(16px, 4vw, 40px) clamp(12px, 3vw, 24px)' }}>
        <Link to="/calculators" style={{ fontSize: 11, color: C.textSec, textDecoration: 'none', letterSpacing: 1 }}>← CALCULATORS</Link>
        <div style={{ marginTop: 24, marginBottom: 36 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 8 }}>CALCULATOR</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Stock Returns</h1>
          <p style={{ fontSize: 12, color: C.textSec }}>Analyse trade performance including brokerage costs and CAGR</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 28 }}>
          <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
            <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>TRADE DETAILS</div>
            <InputField label="BUY PRICE"    value={buyPrice}  onChange={setBuyPrice}  min={0.01} step={0.5}  prefix="₹" />
            <InputField label="SELL PRICE"   value={sellPrice} onChange={setSellPrice} min={0.01} step={0.5}  prefix="₹" />
            <InputField label="QUANTITY"     value={qty}       onChange={setQty}       min={1}    step={1}              />
            <InputField label="BROKERAGE"    value={brokerage} onChange={setBrokerage} min={0}    step={0.01} suffix="%" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 12 }}>
              <div>
                <label style={{ fontSize: 10, color: C.textSec, letterSpacing: 1, display: 'block', marginBottom: 6 }}>BUY DATE</label>
                <input type="date" value={buyDate} onChange={e => setBuyDate(e.target.value)}
                  style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: '8px 10px', fontSize: 12, fontFamily: MONO, borderRadius: 3, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 10, color: C.textSec, letterSpacing: 1, display: 'block', marginBottom: 6 }}>SELL DATE</label>
                <input type="date" value={sellDate} onChange={e => setSellDate(e.target.value)}
                  style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: '8px 10px', fontSize: 12, fontFamily: MONO, borderRadius: 3, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>

          <div>
            {/* P&L Banner */}
            <div style={{ background: C.panel, border: `2px solid ${isProfit ? C.green : C.red}`, borderRadius: 4, padding: 24, textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: C.textSec, marginBottom: 6 }}>TOTAL P&L</div>
              <div style={{ fontSize: 36, fontWeight: 700, color: isProfit ? C.green : C.red }}>{fmtCurr(pnl)}</div>
              <div style={{ fontSize: 16, color: isProfit ? C.green : C.red, marginTop: 4 }}>{fmtPct(returnPct)}</div>
            </div>

            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
              <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 4 }}>BREAKDOWN</div>
              <Row label="Total Investment"   value={fmtCurr(investment)} />
              <Row label="Total Proceeds"     value={fmtCurr(proceeds)} />
              <Row label="Brokerage Paid"     value={fmtCurr(buyPrice * qty * brokerage / 100 + sellPrice * qty * brokerage / 100)} color={C.red} />
              <Row label="Net Profit / Loss"  value={fmtCurr(pnl)}       color={isProfit ? C.green : C.red} />
              <Row label="Absolute Return"    value={fmtPct(returnPct)}   color={isProfit ? C.green : C.red} />
              <Row label="Holding Period"     value={Math.round(days) + ' days'} />
              <Row label="CAGR"               value={isFinite(cagr) ? fmtPct(cagr) : '—'} color={cagr >= 0 ? C.green : C.red} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
