import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

const C = {
  bg: '#020c18', panel: '#050f1e', border: '#0c1d34',
  amber: '#f5a623', text: '#c8d8f0', textSec: '#506888',
}
const MONO = "'Consolas','Menlo','Monaco','Courier New',monospace"
const GH_PATH = "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"

const NAV_LINKS = [
  { to: '/dashboard',        label: 'TERMINAL' },
  { to: '/calculators',      label: 'CALCULATORS' },
  { to: '/glossary',         label: 'GLOSSARY' },
  { to: '/how-markets-work', label: 'HOW MARKETS WORK' },
  { to: '/mf-nav',           label: 'MF NAV' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const isActive = (to) => pathname === to || pathname.startsWith(to + '/')

  // Close sidebar on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <nav style={{ background: C.panel, borderBottom: `1px solid ${C.border}`, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: MONO, position: 'relative', zIndex: 100 }}>
        {/* Brand */}
        <Link to="/" style={{ color: C.amber, fontWeight: 700, fontSize: 14, letterSpacing: 2, textDecoration: 'none', flexShrink: 0 }}>
          &#9616; MKTVISION
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', '@media(max-width:768px)': { display: 'none' } }} className="desktop-nav">
          {NAV_LINKS.map(l => (
            <Link key={l.to} to={l.to} style={{ color: isActive(l.to) ? C.amber : C.textSec, fontSize: 10, textDecoration: 'none', letterSpacing: 1.5, fontWeight: 500, borderBottom: `1px solid ${isActive(l.to) ? C.amber : 'transparent'}` }}>
              {l.label}
            </Link>
          ))}
          <a href="https://github.com/evans-0/finance" target="_blank" rel="noopener noreferrer" aria-label="View source on GitHub" style={{ color: C.textSec, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <svg height="18" width="18" viewBox="0 0 16 16" fill="currentColor"><path d={GH_PATH} /></svg>
          </a>
        </div>

        {/* Hamburger — mobile only */}
        <button onClick={() => setOpen(v => !v)} aria-label={open ? 'Close menu' : 'Open menu'}
          style={{ display: 'none', background: 'none', border: `1px solid ${C.border}`, color: C.textSec, padding: '6px 10px', cursor: 'pointer', borderRadius: 3, fontFamily: MONO, fontSize: 14, lineHeight: 1 }}
          className="hamburger">
          {open ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile sidebar overlay */}
      {open && (
        <div onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200 }} />
      )}

      {/* Mobile sidebar */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 240,
        background: C.panel, borderLeft: `1px solid ${C.border}`,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.25s ease', zIndex: 300,
        display: 'flex', flexDirection: 'column', padding: '24px 20px',
        fontFamily: MONO,
      }} className="sidebar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <span style={{ color: C.amber, fontWeight: 700, fontSize: 13, letterSpacing: 2 }}>&#9616; MKTVISION</span>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: C.textSec, fontSize: 18, cursor: 'pointer', padding: 4 }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_LINKS.map(l => (
            <Link key={l.to} to={l.to}
              style={{ color: isActive(l.to) ? C.amber : C.textSec, fontSize: 11, textDecoration: 'none', letterSpacing: 1.5, fontWeight: isActive(l.to) ? 700 : 400, padding: '12px 0', borderBottom: `1px solid ${C.border}` }}>
              {isActive(l.to) ? '▶ ' : '   '}{l.label}
            </Link>
          ))}
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 24 }}>
          <a href="https://github.com/evans-0/finance" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.textSec, textDecoration: 'none', fontSize: 11, letterSpacing: 1.5 }}>
            <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor"><path d={GH_PATH} /></svg>
            GITHUB
          </a>
        </div>
      </div>

      {/* CSS for responsive show/hide */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: block !important; }
        }
        @media (min-width: 769px) {
          .sidebar { display: none !important; }
        }
      `}</style>
    </>
  )
}
