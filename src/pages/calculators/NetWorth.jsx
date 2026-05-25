import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Navbar from '../../components/Navbar'

const C = {
  bg: '#020c18', panel: '#050f1e', border: '#0c1d34',
  green: '#00e676', red: '#ff3c5c', amber: '#f5a623',
  text: '#c8d8f0', textSec: '#506888', textDim: '#1e3050',
}
const MONO = "'Consolas','Menlo','Monaco','Courier New',monospace"
const INR  = '\u20b9'

const fmtIN = n => {
  if (!n || n === 0) return '0'
  const s = Math.round(Math.abs(n)).toString()
  if (s.length <= 3) return s
  const last3 = s.slice(-3)
  const rest  = s.slice(0, -3)
  const parts = []
  for (let i = rest.length; i > 0; i -= 2) parts.unshift(rest.slice(Math.max(0, i - 2), i))
  return parts.join(',') + ',' + last3
}
const fmt = n => INR + fmtIN(n)

const ASSET_COLORS     = ['#f5a623','#00e676','#2196f3','#a855f7','#06b6d4','#f59e0b','#10b981']
const LIABILITY_COLORS = ['#ff3c5c','#ff6b6b','#ff8c8c','#ffb3b3','#ffd0d0']

const ASSET_CATEGORIES = [
  { key: 'cash',        label: 'Cash & Savings',      icon: '\ud83d\udcb5' },
  { key: 'stocks',      label: 'Stocks & Equity',      icon: '\ud83d\udcc8' },
  { key: 'mf',          label: 'Mutual Funds',         icon: '\ud83d\udcc2' },
  { key: 'realestate',  label: 'Real Estate',          icon: '\ud83c\udfe0' },
  { key: 'gold',        label: 'Gold & Jewellery',     icon: '\ud83e\uddb6' },
  { key: 'pf',          label: 'PF / EPF / PPF',       icon: '\ud83d\udee1\ufe0f' },
  { key: 'other',       label: 'Other Assets',         icon: '\ud83d\udcbc' },
]

const LIABILITY_CATEGORIES = [
  { key: 'homeloan',    label: 'Home Loan',            icon: '\ud83c\udfe0' },
  { key: 'carloan',     label: 'Car Loan',             icon: '\ud83d\ude97' },
  { key: 'personalloan',label: 'Personal Loan',        icon: '\ud83d\udcb3' },
  { key: 'creditcard',  label: 'Credit Card Debt',     icon: '\ud83d\udcb3' },
  { key: 'otherloan',   label: 'Other Liabilities',    icon: '\ud83d\udcdd' },
]

function AmountRow({ icon, label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid ' + C.border }}>
      <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{icon}</span>
      <span style={{ fontSize: 11, color: C.textSec, flex: 1 }}>{label}</span>
      <div style={{ textAlign: 'right' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, color: C.textSec }}>{INR}</span>
          <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} min={0} step={10000}
            style={{ background: C.bg, border: '1px solid ' + C.border, color: C.text, padding: '5px 8px', fontSize: 12, fontFamily: MONO, borderRadius: 3, outline: 'none', width: 130, textAlign: 'right' }} />
        </div>
        {value > 0 && <div style={{ fontSize: 10, color: C.amber, marginTop: 2 }}>{fmt(value)}</div>}
      </div>
    </div>
  )
}

export default function NetWorth() {
  const [assets,      setAssets]      = useState(Object.fromEntries(ASSET_CATEGORIES.map(c => [c.key, 0])))
  const [liabilities, setLiabilities] = useState(Object.fromEntries(LIABILITY_CATEGORIES.map(c => [c.key, 0])))

  const setAsset      = (key, val) => setAssets(prev => ({ ...prev, [key]: val }))
  const setLiability  = (key, val) => setLiabilities(prev => ({ ...prev, [key]: val }))

  const totalAssets      = Object.values(assets).reduce((s, v) => s + v, 0)
  const totalLiabilities = Object.values(liabilities).reduce((s, v) => s + v, 0)
  const netWorth         = totalAssets - totalLiabilities
  const isPositive       = netWorth >= 0

  const assetPieData = ASSET_CATEGORIES
    .filter(c => assets[c.key] > 0)
    .map(c => ({ name: c.label, value: assets[c.key] }))

  const liabilityPieData = LIABILITY_CATEGORIES
    .filter(c => liabilities[c.key] > 0)
    .map(c => ({ name: c.label, value: liabilities[c.key] }))

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(16px, 4vw, 40px) clamp(12px, 3vw, 24px)' }}>
        <Link to="/calculators" style={{ fontSize: 11, color: C.textSec, textDecoration: 'none', letterSpacing: 1 }}>back to CALCULATORS</Link>
        <div style={{ marginTop: 24, marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 8 }}>CALCULATOR</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Net Worth Calculator</h1>
          <p style={{ fontSize: 12, color: C.textSec }}>Enter your assets and liabilities to calculate your net worth</p>
        </div>
        <div style={{ fontSize: 10, color: C.textDim, marginBottom: 32, padding: '8px 12px', border: '1px solid ' + C.border, borderRadius: 3, display: 'inline-block' }}>
          \ud83d\udd12 All data stays in your browser — nothing is stored or sent anywhere
        </div>

        {/* Net Worth Banner */}
        <div style={{ background: C.panel, border: '2px solid ' + (isPositive ? C.green : C.red), borderRadius: 4, padding: '24px', textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 2, marginBottom: 8 }}>YOUR NET WORTH</div>
          <div style={{ fontSize: 40, fontWeight: 700, color: isPositive ? C.green : C.red }}>
            {isPositive ? '' : '-'}{fmt(Math.abs(netWorth))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: C.textSec, marginBottom: 4 }}>TOTAL ASSETS</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.green }}>{fmt(totalAssets)}</div>
            </div>
            <div style={{ width: 1, background: C.border }} />
            <div>
              <div style={{ fontSize: 11, color: C.textSec, marginBottom: 4 }}>TOTAL LIABILITIES</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.red }}>{fmt(totalLiabilities)}</div>
            </div>
            {totalAssets > 0 && (
              <>
                <div style={{ width: 1, background: C.border }} />
                <div>
                  <div style={{ fontSize: 11, color: C.textSec, marginBottom: 4 }}>DEBT TO ASSET RATIO</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: totalLiabilities / totalAssets > 0.5 ? C.red : C.amber }}>
                    {(totalLiabilities / totalAssets * 100).toFixed(1)}%
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 24 }}>
          {/* Assets */}
          <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: C.green, letterSpacing: 1.5, fontWeight: 600 }}>ASSETS</div>
              <div style={{ fontSize: 12, color: C.green, fontWeight: 700 }}>{fmt(totalAssets)}</div>
            </div>
            {ASSET_CATEGORIES.map(c => (
              <AmountRow key={c.key} icon={c.icon} label={c.label} value={assets[c.key]} onChange={v => setAsset(c.key, v)} />
            ))}
          </div>

          {/* Liabilities */}
          <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: C.red, letterSpacing: 1.5, fontWeight: 600 }}>LIABILITIES</div>
              <div style={{ fontSize: 12, color: C.red, fontWeight: 700 }}>{fmt(totalLiabilities)}</div>
            </div>
            {LIABILITY_CATEGORIES.map(c => (
              <AmountRow key={c.key} icon={c.icon} label={c.label} value={liabilities[c.key]} onChange={v => setLiability(c.key, v)} />
            ))}
          </div>
        </div>

        {/* Charts */}
        {(assetPieData.length > 0 || liabilityPieData.length > 0) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 24, marginTop: 24 }}>
            {assetPieData.length > 0 && (
              <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 24 }}>
                <div style={{ fontSize: 10, color: C.green, letterSpacing: 1.5, marginBottom: 16 }}>ASSET ALLOCATION</div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={assetPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                      {assetPieData.map((_, i) => <Cell key={i} fill={ASSET_COLORS[i % ASSET_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v, name) => [fmt(v), name]} contentStyle={{ background: '#0a1828', border: '1px solid ' + C.border, fontFamily: MONO, fontSize: 11 }} labelStyle={{ color: '#c8d8f0' }} itemStyle={{ color: '#c8d8f0' }} />
                    <Legend wrapperStyle={{ fontSize: 10, fontFamily: MONO }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {liabilityPieData.length > 0 && (
              <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 24 }}>
                <div style={{ fontSize: 10, color: C.red, letterSpacing: 1.5, marginBottom: 16 }}>LIABILITY BREAKDOWN</div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={liabilityPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                      {liabilityPieData.map((_, i) => <Cell key={i} fill={LIABILITY_COLORS[i % LIABILITY_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v, name) => [fmt(v), name]} contentStyle={{ background: '#0a1828', border: '1px solid ' + C.border, fontFamily: MONO, fontSize: 11 }} labelStyle={{ color: '#c8d8f0' }} itemStyle={{ color: '#c8d8f0' }} />
                    <Legend wrapperStyle={{ fontSize: 10, fontFamily: MONO }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
