import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { calcXIRR, sipSchedule } from '../../lib/calculators/xirr.js'

const C = {
  bg: '#020c18', panel: '#050f1e', border: '#0c1d34',
  amber: '#f5a623', green: '#00e676', red: '#ff3c5c', blue: '#2196f3', purple: '#a855f7',
  text: '#c8d8f0', textSec: '#506888', textDim: '#1e3050',
}
const MONO = "'Consolas','Menlo','Monaco','Courier New',monospace"

const fmtIN = n => {
  const sign = n < 0 ? '-' : ''
  const a = Math.abs(n)
  if (a >= 1e7) return sign + '₹' + (a / 1e7).toFixed(2) + ' Cr'
  if (a >= 1e5) return sign + '₹' + (a / 1e5).toFixed(1) + ' L'
  return sign + '₹' + Math.round(a).toLocaleString('en-IN')
}

const today = () => new Date().toISOString().slice(0, 10)

const monthsAgo = n => {
  const d = new Date()
  d.setMonth(d.getMonth() - n)
  return d.toISOString().slice(0, 10)
}

let _id = 1
const uid = () => _id++

const DEFAULT_ROWS = sipSchedule(5000, monthsAgo(24), 24).map(f => ({ id: uid(), type: 'invest', ...f }))

const inputStyle = {
  background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: '6px 8px',
  fontSize: 12, fontFamily: MONO, borderRadius: 3, outline: 'none', width: '100%', boxSizing: 'border-box',
}
// Cash flow rows are tighter so date, type and amount fit side by side on a phone
const rowInputStyle = { ...inputStyle, padding: '6px 4px', fontSize: 11 }

export default function XIRR() {
  const [rows, setRows]               = useState(DEFAULT_ROWS)
  const [currentValue, setCurrentValue] = useState(140000)
  const [valueDate, setValueDate]     = useState(today())
  const [sipAmount, setSipAmount]     = useState(5000)
  const [sipStart, setSipStart]       = useState(monthsAgo(24))
  const [sipMonths, setSipMonths]     = useState(24)

  const results = useMemo(() => calcXIRR([
    ...rows.map(r => ({ date: r.date, amount: r.type === 'invest' ? -r.amount : r.amount })),
    { date: valueDate, amount: currentValue },
  ]), [rows, currentValue, valueDate])

  const updateRow = (id, field, value) => setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  const removeRow = id => setRows(prev => prev.filter(r => r.id !== id))
  const addRow    = () => setRows(prev => [...prev, { id: uid(), type: 'invest', date: today(), amount: 0 }])
  const fillSIP   = () => setRows(sipSchedule(sipAmount, sipStart, sipMonths).map(f => ({ id: uid(), type: 'invest', ...f })))

  const positive = results.xirr !== null && results.xirr >= 0
  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(24px, 4vw, 52px) clamp(12px, 3vw, 24px)' }}>

        {/* Header */}
        <Link to="/calculators" style={{ fontSize: 11, color: C.textSec, textDecoration: 'none', letterSpacing: 1 }}>← CALCULATORS</Link>
        <div style={{ marginTop: 24, marginBottom: 32 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 8 }}>CALCULATOR</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>XIRR Calculator</h1>
          <p style={{ fontSize: 12, color: C.textSec, lineHeight: 1.8, maxWidth: 560 }}>
            Your real annual return when money goes in and out on different dates: SIPs, top-ups and partial withdrawals.
            CAGR only works for one investment on one date. XIRR works for all of them.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: 24 }}>

          {/* Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* SIP quick fill */}
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 20 }}>
              <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 14 }}>QUICK FILL: MONTHLY SIP</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                <label style={{ fontSize: 9, color: C.textSec, letterSpacing: 0.5 }}>AMOUNT (₹)
                  <input type="number" min={0} step={500} value={sipAmount} onChange={e => setSipAmount(Number(e.target.value))} style={{ ...inputStyle, marginTop: 4 }} />
                </label>
                <label style={{ fontSize: 9, color: C.textSec, letterSpacing: 0.5 }}>FIRST DATE
                  <input type="date" value={sipStart} onChange={e => setSipStart(e.target.value)} style={{ ...inputStyle, marginTop: 4 }} />
                </label>
                <label style={{ fontSize: 9, color: C.textSec, letterSpacing: 0.5 }}>MONTHS
                  <input type="number" min={1} max={600} step={1} value={sipMonths} onChange={e => setSipMonths(Math.min(600, Math.max(1, Number(e.target.value))))} style={{ ...inputStyle, marginTop: 4 }} />
                </label>
              </div>
              <button onClick={fillSIP} disabled={!sipStart || sipAmount <= 0} style={{
                width: '100%', background: C.amber + '22', color: C.amber, border: `1px solid ${C.amber}`,
                padding: '8px 12px', borderRadius: 3, cursor: 'pointer', fontFamily: MONO, fontSize: 11, letterSpacing: 1,
              }}>REPLACE ROWS WITH THIS SIP</button>
            </div>

            {/* Cash flows */}
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5 }}>CASH FLOWS ({rows.length})</div>
                <button onClick={addRow} style={{ background: 'transparent', color: C.amber, border: `1px solid ${C.amber}55`, padding: '4px 10px', borderRadius: 3, cursor: 'pointer', fontFamily: MONO, fontSize: 10 }}>+ ADD ROW</button>
              </div>
              <div style={{ maxHeight: 320, overflowY: 'auto', paddingRight: 4 }}>
                {rows.map(r => (
                  <div key={r.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(112px, 1.3fr) minmax(84px, 1fr) minmax(0, 1fr) 16px', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                    <input type="date" value={r.date} onChange={e => updateRow(r.id, 'date', e.target.value)} style={rowInputStyle} aria-label="Date" />
                    <select value={r.type} onChange={e => updateRow(r.id, 'type', e.target.value)} aria-label="Type"
                      style={{ ...rowInputStyle, color: r.type === 'invest' ? C.amber : C.green }}>
                      <option value="invest">Invest</option>
                      <option value="withdraw">Withdraw</option>
                    </select>
                    <input type="number" min={0} step={500} value={r.amount} onChange={e => updateRow(r.id, 'amount', Math.abs(Number(e.target.value)))} style={rowInputStyle} aria-label="Amount" />
                    <button onClick={() => removeRow(r.id)} aria-label="Remove row" style={{ background: 'transparent', color: C.textSec, border: 'none', cursor: 'pointer', fontSize: 14, padding: 0 }}>×</button>
                  </div>
                ))}
                {rows.length === 0 && <div style={{ fontSize: 11, color: C.textSec, padding: '8px 0' }}>No cash flows yet. Add a row or use quick fill.</div>}
              </div>
            </div>

            {/* Current value */}
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 20 }}>
              <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 14 }}>WHAT IT'S WORTH NOW</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <label style={{ fontSize: 9, color: C.textSec, letterSpacing: 0.5 }}>CURRENT VALUE (₹)
                  <input type="number" min={0} step={1000} value={currentValue} onChange={e => setCurrentValue(Math.abs(Number(e.target.value)))} style={{ ...inputStyle, marginTop: 4 }} />
                </label>
                <label style={{ fontSize: 9, color: C.textSec, letterSpacing: 0.5 }}>AS OF
                  <input type="date" value={valueDate} onChange={e => setValueDate(e.target.value)} style={{ ...inputStyle, marginTop: 4 }} />
                </label>
              </div>
              <div style={{ fontSize: 10, color: C.textSec, marginTop: 10, lineHeight: 1.6 }}>
                Already sold everything? Enter 0 here and add the sale as a Withdraw row.
              </div>
            </div>
          </div>

          {/* Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            <div style={{ background: C.panel, border: `2px solid ${results.error ? C.border : positive ? C.green : C.red}`, borderRadius: 4, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: results.error ? C.textSec : positive ? C.green : C.red, letterSpacing: 2, marginBottom: 8 }}>XIRR (ANNUALISED RETURN)</div>
              {results.error ? (
                <div style={{ fontSize: 13, color: C.textSec, padding: '12px 0' }}>{results.error}</div>
              ) : (
                <>
                  <div style={{ fontSize: 40, fontWeight: 700, color: positive ? C.green : C.red, marginBottom: 4 }}>
                    {(positive ? '+' : '') + results.xirr.toFixed(2)}%
                  </div>
                  <div style={{ fontSize: 12, color: C.textSec }}>per year, over {results.years.toFixed(1)} years</div>
                  {results.years < 1 && (
                    <div style={{ fontSize: 10, color: C.amber, marginTop: 10, lineHeight: 1.6 }}>
                      Under a year, so this rate assumes the same pace continues for a full year. Absolute return may be more meaningful.
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'TOTAL INVESTED',           val: fmtIN(results.totalInvested), color: C.amber },
                { label: 'WITHDRAWN + CURRENT VALUE', val: fmtIN(results.totalReceived), color: C.text  },
                { label: 'GAIN / LOSS',              val: fmtIN(results.gain),          color: results.gain >= 0 ? C.green : C.red },
                { label: 'ABSOLUTE RETURN',          val: results.totalInvested > 0 ? results.absoluteReturn.toFixed(1) + '%' : '—', color: C.blue },
              ].map(s => (
                <div key={s.label} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: '12px 14px' }}>
                  <div style={{ fontSize: 9, color: C.textSec, letterSpacing: 0.5, marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.val}</div>
                </div>
              ))}
            </div>

            {/* Explainer */}
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: 16 }}>
              <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 10 }}>WHY XIRR, NOT ABSOLUTE RETURN?</div>
              <p style={{ fontSize: 11, color: C.textSec, lineHeight: 1.8, margin: 0 }}>
                In a SIP, your first instalment has been invested for years but your last one for only a month.
                Absolute return ignores that and treats every rupee as if it was invested on day one, which makes
                long SIPs look better and short ones worse. XIRR weights each amount by how long it was actually
                invested. It's the number mutual fund statements report, and it matches Excel's XIRR function.
              </p>
            </div>

            {/* Timeline summary */}
            {!results.error && sorted.length > 0 && (
              <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: 16, fontSize: 11, color: C.textSec, lineHeight: 1.8 }}>
                <div style={{ fontSize: 10, letterSpacing: 1.5, marginBottom: 6 }}>TIMELINE</div>
                <div>First cash flow: <span style={{ color: C.text }}>{sorted[0].date}</span></div>
                <div>Last cash flow: <span style={{ color: C.text }}>{sorted[sorted.length - 1].date}</span></div>
                <div>Valued on: <span style={{ color: C.text }}>{valueDate}</span></div>
              </div>
            )}
          </div>
        </div>

        {/* Links */}
        <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/calculators/sip"     style={{ fontSize: 11, color: C.amber, textDecoration: 'none', border: `1px solid ${C.amber}33`, padding: '8px 16px', borderRadius: 2 }}>SIP Calculator →</Link>
          <Link to="/calculators/returns" style={{ fontSize: 11, color: C.textSec, textDecoration: 'none', border: `1px solid ${C.border}`, padding: '8px 16px', borderRadius: 2 }}>Stock Returns (CAGR) →</Link>
        </div>

      </div>
    </div>
  )
}
