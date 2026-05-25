import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const C = {
  bg: '#020c18', panel: '#050f1e', border: '#0c1d34',
  green: '#00e676', red: '#ff3c5c', amber: '#f5a623', blue: '#2196f3',
  text: '#c8d8f0', textSec: '#506888', textDim: '#1e3050',
}
const MONO = "'Consolas','Menlo','Monaco','Courier New',monospace"
const INR  = '\u20b9'

const fmtNAV = n => INR + parseFloat(n).toFixed(4)
const fmtDate = d => d ? d.trim() : ''

// Clean up fund name for display
const cleanName = name => name
  .replace(/\s+/g, ' ')
  .replace(/ - /g, ' · ')
  .trim()

// Detect fund type
const getFundType = name => {
  const n = name.toUpperCase()
  if (n.includes('DIRECT')) return { label: 'DIRECT', color: C.green }
  if (n.includes('REGULAR')) return { label: 'REGULAR', color: C.amber }
  return { label: 'FUND', color: C.textSec }
}

const getPlanType = name => {
  const n = name.toUpperCase()
  if (n.includes('GROWTH')) return 'GROWTH'
  if (n.includes('IDCW') || n.includes('DIVIDEND')) return 'IDCW'
  return ''
}

export default function MFNav() {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [navDate, setNavDate] = useState('')
  const [searched, setSearched] = useState(false)
  const debounce = useRef(null)

  const search = useCallback(async (q) => {
    if (!q || q.length < 3) { setResults([]); setSearched(false); return }
    setLoading(true)
    setError('')
    try {
      const r = await fetch(`/api/mfnav?q=${encodeURIComponent(q)}&limit=30`)
      const d = await r.json()
      if (d.error) throw new Error(d.error)
      setResults(d.funds || [])
      setNavDate(d.date || '')
      setSearched(true)
    } catch (e) {
      setError(e.message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const onInput = (e) => {
    const val = e.target.value
    setQuery(val)
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => search(val), 400)
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: MONO, color: C.text }}>
      <Navbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(24px, 4vw, 52px) clamp(12px, 3vw, 24px)' }}>
        <Link to="/" style={{ fontSize: 11, color: C.textSec, textDecoration: 'none', letterSpacing: 1 }}>back to HOME</Link>

        <div style={{ marginTop: 24, marginBottom: 36 }}>
          <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 8 }}>INDIA</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Mutual Fund NAV Lookup</h1>
          <p style={{ fontSize: 12, color: C.textSec, lineHeight: 1.8 }}>
            Search any Indian mutual fund. NAV data from AMFI — updated daily after market close.
            {navDate && <span style={{ color: C.textDim }}> Last updated: {fmtDate(navDate)}</span>}
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <input
            type="text"
            value={query}
            onChange={onInput}
            placeholder="Search by fund name e.g. Mirae Asset Large Cap Direct Growth..." aria-label="Search mutual funds by name"
            autoFocus
            style={{
              width: '100%', background: C.panel, border: `1px solid ${query.length >= 3 ? C.amber : C.border}`,
              color: C.text, padding: '12px 44px 12px 16px', fontSize: 13, fontFamily: MONO,
              borderRadius: 3, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
            }}
          />
          <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: loading ? C.amber : C.textSec, fontSize: 14 }}>
            {loading ? '⟳' : '🔍'}
          </span>
        </div>
        <div style={{ fontSize: 10, color: C.textDim, marginBottom: 24 }}>Type at least 3 characters to search</div>

        {error && (
          <div style={{ background: '#1a0505', border: `1px solid ${C.red}`, borderRadius: 3, padding: 12, fontSize: 11, color: C.red, marginBottom: 16 }}>
            {error}. AMFI data may be temporarily unavailable.
          </div>
        )}

        {searched && results.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', fontSize: 12, color: C.textSec }}>
            No funds found for "{query}". Try a different name or abbreviation.
          </div>
        )}

        {results.length > 0 && (
          <div>
            <div style={{ fontSize: 10, color: C.textSec, letterSpacing: 1, marginBottom: 12 }}>
              {results.length} FUND{results.length !== 1 ? 'S' : ''} FOUND
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {results.map(fund => {
                const type    = getFundType(fund.name)
                const plan    = getPlanType(fund.name)
                return (
                  <div key={fund.code} style={{
                    background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3,
                    padding: '14px 16px', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', gap: 12, transition: 'border-color 0.15s', cursor: 'default',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = C.amber}
                    onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: type.color, border: `1px solid ${type.color}44`, padding: '1px 6px', borderRadius: 2, letterSpacing: 0.5 }}>{type.label}</span>
                        {plan && <span style={{ fontSize: 11, color: C.textSec, border: `1px solid ${C.border}`, padding: '1px 6px', borderRadius: 2, letterSpacing: 0.5 }}>{plan}</span>}
                        <span style={{ fontSize: 11, color: C.textDim }}>#{fund.code}</span>
                      </div>
                      <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{cleanName(fund.name)}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: C.amber }}>{fmtNAV(fund.nav)}</div>
                      <div style={{ fontSize: 10, color: C.textSec, marginTop: 2 }}>{fmtDate(fund.date)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Info */}
        {!searched && (
          <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 12 }}>
            {[
              { icon: '🏦', title: 'All fund houses', desc: 'Covers every AMFI-registered AMC including Zerodha, Mirae, HDFC, SBI, ICICI, Axis and more' },
              { icon: '📅', title: 'Daily updates', desc: 'NAV data updated daily after 11 PM IST — same day AMFI publishes' },
              { icon: '🔒', title: 'Official source', desc: 'Data sourced directly from AMFI — the official body regulating mutual funds in India' },
            ].map(item => (
              <div key={item.title} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 3, padding: 16 }}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.amber, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 10, color: C.textSec, lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
