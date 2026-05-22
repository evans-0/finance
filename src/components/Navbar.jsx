import { Link, useLocation } from 'react-router-dom'

const C = {
  bg: '#020c18', panel: '#050f1e', border: '#0c1d34',
  amber: '#f5a623', text: '#c8d8f0', textSec: '#506888',
}
const MONO = "'Consolas','Menlo','Monaco','Courier New',monospace"
const GH_PATH = "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"

export default function Navbar() {
  const { pathname } = useLocation()
  const isActive = (to) => pathname === to || pathname.startsWith(to + '/')

  return (
    <nav style={{ background: C.panel, borderBottom: `1px solid ${C.border}`, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: MONO }}>
      <Link to="/" style={{ color: C.amber, fontWeight: 700, fontSize: 14, letterSpacing: 2, textDecoration: 'none', flexShrink: 0 }}>
        &#9616; MKTVISION
      </Link>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <Link to="/dashboard" style={{ color: isActive('/dashboard') ? C.amber : C.textSec, fontSize: 10, textDecoration: 'none', letterSpacing: 1.5, fontWeight: 500, borderBottom: `1px solid ${isActive('/dashboard') ? C.amber : 'transparent'}` }}>TERMINAL</Link>
        <Link to="/calculators" style={{ color: isActive('/calculators') ? C.amber : C.textSec, fontSize: 10, textDecoration: 'none', letterSpacing: 1.5, fontWeight: 500, borderBottom: `1px solid ${isActive('/calculators') ? C.amber : 'transparent'}` }}>CALC</Link>
        <Link to="/glossary" style={{ color: isActive('/glossary') ? C.amber : C.textSec, fontSize: 10, textDecoration: 'none', letterSpacing: 1.5, fontWeight: 500, borderBottom: `1px solid ${isActive('/glossary') ? C.amber : 'transparent'}` }}>GLOSSARY</Link>
        <a href="https://github.com/evans-0/finance" target="_blank" rel="noopener noreferrer" style={{ color: C.textSec, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <svg height="18" width="18" viewBox="0 0 16 16" fill="currentColor">
            <path d={GH_PATH} />
          </svg>
        </a>
      </div>
    </nav>
  )
}
