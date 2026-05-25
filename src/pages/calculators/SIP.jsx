import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Navbar from '../../components/Navbar'

const C = {
  bg: '#020c18', panel: '#050f1e', border: '#0c1d34',
  green: '#00e676', amber: '#f5a623', text: '#c8d8f0', textSec: '#506888', textDim: '#1e3050',
}
const MONO = "'Consolas','Menlo','Monaco','Courier New',monospace"
const INR = '\u20b9'
const fmt = n => INR + Math.round(n).toLocaleString('en-IN')
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

function InputField({ label, value, onChange, min, max, step, suffix, disabled, isCurrency }) {
  return (
    <div style={{ marginBottom: 20, opacity: disabled ? 0.4 : 1 }}>
      <label style={{ fontSize: 10, color: C.textSec, letterSpacing: 1, display: 'block', marginBottom: 6 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} min={min} max={max} step={step} disabled={disabled}
          style={{ flex: 1, background: C.bg, border: '1px solid ' + C.border, color: C.text, padding: '8px 12px', fontSize: 13, fontFamily: MONO, borderRadius: 3, outline: 'none' }} />
        {suffix && <span style={{ fontSize: 13, color: C.textSec }}>{suffix}</span>}
      </div>
      {isCurrency && value > 0 && <div style={{ fontSize: 11, color: C.amber, marginTop: 4, letterSpacing: 0.5 }}>{INR}{fmtIN(value)}</div>}
      {!disabled && <input type="range" value={value} onChange={e => onChange(Number(e.target.value))} min={min} max={max} step={step} style={{ width: '100%', marginTop: isCurrency && value > 0 ? 4 : 6, accentColor: C.amber }} />}
    </div>
  )
}

function Toggle({ label, hint, enabled, onToggle }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', marginBottom: 16, borderBottom: '1px solid ' + C.border }}>
      <div>
        <div style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>{label}</div>
        {hint && <div style={{ fontSize: 10, color: C.textSec, marginTop: 2 }}>{hint}</div>}
      </div>
      <div onClick={onToggle} style={{ width: 42, height: 22, borderRadius: 11, cursor: 'pointer', background: enabled ? C.amber : C.border, position: 'relative', transition: 'background 0.2s', flexShrink: 0, marginLeft: 16 }}>
        <div style={{ width: 18, height: 18, borderRadius: 9, background: enabled ? '#020c18' : C.textSec, position: 'absolute', top: 2, left: enabled ? 22 : 2, transition: 'left 0.2s' }} />
      </div>
    </div>
  )
}

function calcSIP(monthly, annualRate, years, stepUp, stepUpEnabled, expenseRatio) {
  const r = Math.max(0, annualRate - expenseRatio) / 12 / 100
  if (!stepUpEnabled) {
    const n = years * 12
    return { futureValue: r > 0 ? monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r) : monthly * n, invested: monthly * n }
  }
  let balance = 0, invested = 0, current = monthly
  for (let y = 0; y < years; y++) {
    if (y > 0) current *= (1 + stepUp / 100)
    for (let m = 0; m < 12; m++) { balance = balance * (1 + r) + current; invested += current }
  }
  return { futureValue: balance, invested }
}

export default function SIP() {
  const [monthly,       setMonthly]       = useState(5000)
  const [rate,          setRate]          = useState(12)
  const [years,         setYears]         = useState(10)
  const [expenseRatio,  setExpenseRatio]  = useState(0.3)
  const [stepUpEnabled, setStepUpEnabled] = useState(false)
  const [stepUp,        setStepUp]        = useState(10)
  const [lumpsum,       setLumpsum]       = useState(0)

  const lumpsumFV = lumpsum > 0 ? lumpsum * Math.pow(1 + Math.max(0, rate - expenseRatio) / 100, years) : 0
  const { futureValue: sipFV, invested } = calcSIP(monthly, rate, years, stepUp, stepUpEnabled, expenseRatio)
  const futureValue = sipFV + lumpsumFV
  const totalInvested = invested + lumpsum
  const returns = futureValue - totalInvested

  const chartData = Array.from({ length: years }, (_, i) => {
    const yr     = i + 1
    const normal = calcSIP(monthly, rate, yr, stepUp, false,         expenseRatio)
    const step   = calcSIP(monthly, rate, yr, stepUp, stepUpEnabled, expenseRatio)
    const lumpsumAtYr = lumpsum > 0 ? lumpsum * Math.pow(1 + Math.max(0, rate - expenseRatio) / 100, yr) : 0
    const row    = { year: 'Yr ' + yr, invested: Math.round(step.invested + lumpsum), value: Math.round(step.futureValue + lumpsumAtYr) }
    if (stepUpEnabled) row.noStepUp = Math.round(normal.futureValue + lumpsumAtYr)
    return row
  })

  const tickFmt = v => v >= 1e7 ? INR+(v/1e7).toFixed(1)+'Cr' : v >= 1e5 ? INR+(v/1e5).toFixed(1)+'L' : INR+(v/1000).toFixed(0)+'K'

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text }}>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'clamp(16px, 4vw, 40px) clamp(12px, 3vw, 24px)' }}>
        <Link to="/calculators" style={{ fontSize: 11, color: C.textSec, textDecoration: 'none', letterSpacing: 1 }}>back to CALCULATORS</Link>
        <div style={{ marginTop: 24, marginBottom: 36 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 8 }}>CALCULATOR</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>SIP Calculator</h1>
          <p style={{ fontSize: 12, color: C.textSec }}>Calculate the future value of your Systematic Investment Plan</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 28 }}>
          <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 24 }}>
            <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>INPUTS</div>
            <InputField label={'MONTHLY INVESTMENT (' + INR + ')'} value={monthly} onChange={setMonthly} min={500}  max={200000} step={500}  isCurrency />
            <InputField label="EXPECTED ANNUAL RETURN"             value={rate}    onChange={setRate}    min={1}    max={30}     step={0.5}  suffix="%" />
            <InputField label="TIME PERIOD"                        value={years}   onChange={setYears}   min={1}    max={40}     step={1}    suffix="YRS" />
            <InputField label="EXPENSE RATIO"               value={expenseRatio}   onChange={setExpenseRatio} min={0} max={3} step={0.05} suffix="%" />
            <InputField label={'EXISTING LUMPSUM (' + INR + ') (optional)'} value={lumpsum} onChange={setLumpsum} min={0} max={10000000} step={10000} isCurrency />
            {expenseRatio > 0 && (
              <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 3, padding: 10, marginBottom: 16, fontSize: 10, color: C.textSec }}>
                EFFECTIVE RETURN: <span style={{ color: C.amber }}>{Math.max(0, rate - expenseRatio).toFixed(2)}% p.a.</span> after {expenseRatio}% expense ratio
              </div>
            )}
            <Toggle label="Step-up SIP" hint="Increase investment amount every year" enabled={stepUpEnabled} onToggle={() => setStepUpEnabled(v => !v)} />
            <InputField label="ANNUAL STEP-UP RATE" value={stepUp} onChange={setStepUp} min={1} max={50} step={1} suffix="%" disabled={!stepUpEnabled} />
          </div>

          <div>
            <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 24, marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>RESULTS</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                {[['INVESTED AMOUNT', fmt(totalInvested)], ['ESTIMATED RETURNS', fmt(returns)]].map(([l, v]) => (
                  <div key={l} style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 3, padding: '14px', flex: 1 }}>
                    <div style={{ fontSize: 11, color: C.textSec, letterSpacing: 1, marginBottom: 6 }}>{l}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: C.bg, border: '1px solid ' + C.amber, borderRadius: 3, padding: '16px', marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: C.textSec, letterSpacing: 1, marginBottom: 6 }}>TOTAL VALUE</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.amber }}>{fmt(futureValue)}</div>
              </div>
              <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 3, padding: 12 }}>
                <div style={{ fontSize: 10, color: C.textSec, marginBottom: 4 }}>WEALTH GAIN RATIO</div>
                <div style={{ fontSize: 22, color: C.green, fontWeight: 700 }}>{(futureValue / totalInvested).toFixed(2)}x</div>
                <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>
                  {fmt(monthly)}/mo{stepUpEnabled ? ' + ' + stepUp + '% step-up' : ''}{lumpsum > 0 ? ' + ' + fmt(lumpsum) + ' lumpsum' : ''} for {years}yr at {rate}%{expenseRatio > 0 ? ' (net ' + Math.max(0, rate - expenseRatio).toFixed(2) + '%)' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: C.panel, border: '1px solid ' + C.border, borderRadius: 4, padding: 24, marginTop: 24 }}>
          <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, marginBottom: 20 }}>
            GROWTH OVER TIME{stepUpEnabled ? ' — STEP-UP vs NO STEP-UP' : ''}
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="invested" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.amber} stopOpacity={0.3} /><stop offset="95%" stopColor={C.amber} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="value" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.green} stopOpacity={0.3} /><stop offset="95%" stopColor={C.green} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="noStepUp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2196f3" stopOpacity={0.15} /><stop offset="95%" stopColor="#2196f3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="year" tick={{ fill: C.textDim, fontSize: 10, fontFamily: MONO }} tickLine={false} axisLine={{ stroke: C.border }} />
              <YAxis tick={{ fill: C.textDim, fontSize: 10, fontFamily: MONO }} tickLine={false} axisLine={false} width={80} tickFormatter={tickFmt} />
              <Tooltip formatter={(v, name) => [fmt(v), name === 'invested' ? 'Amount Invested' : name === 'value' ? 'Total Value' : 'Without Step-up']}
                contentStyle={{ background: C.panel, border: '1px solid ' + C.border, fontFamily: MONO, fontSize: 11 }}
                labelStyle={{ color: C.textSec }} itemStyle={{ color: C.text }} />
              <Legend formatter={v => v === 'invested' ? 'Amount Invested' : v === 'value' ? 'Total Value' : 'Without Step-up'}
                wrapperStyle={{ fontSize: 10, color: C.textSec, fontFamily: MONO }} />
              <Area type="monotone" dataKey="invested" stroke={C.amber}   strokeWidth={1.5} fill="url(#invested)" dot={false} />
              <Area type="monotone" dataKey="value"    stroke={C.green}   strokeWidth={1.5} fill="url(#value)"    dot={false} />
              {stepUpEnabled && <Area type="monotone" dataKey="noStepUp" stroke="#2196f3" strokeWidth={1.5} strokeDasharray="4 4" fill="url(#noStepUp)" dot={false} />}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
