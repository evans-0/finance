import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Navbar from '../../components/Navbar'

const C = {
  bg: '#020c18', panel: '#050f1e', border: '#0c1d34',
  amber: '#f5a623', text: '#c8d8f0', textSec: '#506888', textDim: '#1e3050',
  green: '#00e676', red: '#ff3c5c',
}
const MONO = "'Consolas','Menlo','Monaco','Courier New',monospace"

const COLORS = ['#f5a623', '#00e676', '#2196f3', '#ff6b6b', '#a855f7', '#06b6d4', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6']

export default function Portfolio() {
  const [holdings, setHoldings] = useState([
    { id: 1, name: 'AAPL',     qty: 10,  price: 213 },
    { id: 2, name: 'MSFT',     qty: 5,   price: 448 },
    { id: 3, name: 'RELIANCE', qty: 50,  price: 2850 },
    { id: 4, name: 'BTC',      qty: 0.1, price: 76000 },
  ])
  const [nextId, setNextId] = useState(5)

  const addRow = () => {
    setHoldings([...holdings, { id: nextId, name: '', qty: 1, price: 100 }])
    setNextId(nextId + 1)
  }

  const removeRow = id => setHoldings(holdings.filter(h => h.id !== id))

  const update = (id, field, value) => setHoldings(holdings.map(h => h.id === id ? { ...h, [field]: value } : h))

  const total = holdings.reduce((sum, h) => sum + h.qty * h.price, 0)

  const pieData = holdings
    .filter(h => h.name && h.qty > 0 && h.price > 0)
    .map(h => ({ name: h.name, value: +(h.qty * h.price).toFixed(2) }))
    .sort((a, b) => b.value - a.value)

  const fmt = n => '₹' + Math.round(n).toLocaleString('en-IN')

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(16px, 4vw, 40px) clamp(12px, 3vw, 24px)' }}>
        <Link to="/calculators" style={{ fontSize: 11, color: C.textSec, textDecoration: 'none', letterSpacing: 1 }}>← CALCULATORS</Link>
        <div style={{ marginTop: 24, marginBottom: 36 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 8 }}>CALCULATOR</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Portfolio Allocator</h1>
          <p style={{ fontSize: 12, color: C.textSec }}>Visualise your portfolio allocation and identify concentration risks</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 28 }}>
          {/* Holdings table */}
          <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5 }}>HOLDINGS</span>
              <button onClick={addRow} style={{ background: C.amber, color: '#020c18', border: 'none', padding: '4px 12px', fontSize: 10, fontFamily: MONO, fontWeight: 700, cursor: 'pointer', borderRadius: 2, letterSpacing: 1 }}>
                + ADD
              </button>
            </div>

            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr auto', gap: 8, marginBottom: 8 }}>
              {['SYMBOL', 'QTY', 'PRICE', 'VALUE', ''].map(h => (
                <span key={h} style={{ fontSize: 11, color: C.textDim, letterSpacing: 0.5 }}>{h}</span>
              ))}
            </div>

            {holdings.map(h => {
              const val = h.qty * h.price
              return (
                <div key={h.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <input value={h.name} onChange={e => update(h.id, 'name', e.target.value.toUpperCase())} placeholder="SYMBOL"
                    style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: '6px 8px', fontSize: 11, fontFamily: MONO, borderRadius: 2, outline: 'none' }} />
                  <input type="number" value={h.qty} onChange={e => update(h.id, 'qty', Number(e.target.value))} min={0} step={0.01}
                    style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: '6px 8px', fontSize: 11, fontFamily: MONO, borderRadius: 2, outline: 'none' }} />
                  <input type="number" value={h.price} onChange={e => update(h.id, 'price', Number(e.target.value))} min={0} step={0.5}
                    style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: '6px 8px', fontSize: 11, fontFamily: MONO, borderRadius: 2, outline: 'none' }} />
                  <span style={{ fontSize: 11, color: C.text }}>{fmt(val)}</span>
                  <button onClick={() => removeRow(h.id)} style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: 14, padding: 0 }}>×</button>
                </div>
              )
            })}

            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: C.textSec }}>TOTAL PORTFOLIO VALUE</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.amber }}>{fmt(total)}</span>
            </div>
          </div>

          {/* Pie chart */}
          <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 24 }}>
            <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>ALLOCATION</div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={2}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => [fmt(v), 'Value']}
                  contentStyle={{ background: C.panel, border: `1px solid ${C.border}`, fontFamily: MONO, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10, fontFamily: MONO }} />
              </PieChart>
            </ResponsiveContainer>

            {/* Breakdown list */}
            <div style={{ marginTop: 12 }}>
              {pieData.map((d, i) => (
                <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length] }} />
                    <span style={{ fontSize: 11, color: C.text }}>{d.name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 11, color: C.text, marginRight: 12 }}>{fmt(d.value)}</span>
                    <span style={{ fontSize: 11, color: C.textSec }}>{(d.value / total * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
