import { Link, useLocation } from 'react-router-dom'

const C = {
  bg: '#020c18', panel: '#050f1e', border: '#0c1d34',
  amber: '#f5a623', text: '#c8d8f0', textSec: '#506888',
}
const MONO = "'Consolas','Menlo','Monaco','Courier New',monospace"

export default function Navbar() {
  const { pathname } = useLocation()

  const link = (to, label) => (
    <Link to={to} style={{
      color: pathname === to || pathname.startsWith(to + '/') ? C.amber : C.textSec,
      fontSize: 11, textDecoration: 'none', letterSpacing: 1.5, fontWeight: 500,
      padding: '4px 0', borderBottom: `1px solid ${pathname === to || pathname.startsWith(to + '/') ? C.amber : 'transparent'}`,
      transition: 'color 0.15s',
    }}>
      {label}
    </Link>
  )

  return (
    <nav style={{
      background: C.panel, borderBottom: `1px solid ${C.border}`,
      padding: '12px 24px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', fontFamily: MONO,
    }}>
      <Link to="/" style={{ color: C.amber, fontWeight: 700, fontSize: 15, letterSpacing: 3, textDecoration: 'none' }}>
        ▐ MKTVISION
      </Link>
      <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
        {link('/dashboard', 'TERMINAL')}
        {link('/calculators', 'CALCULATORS')}
        <a href="https://github.com/evans-0/finance" target="_blank" rel="noopener noreferrer"
          style={{ color: C.textSec, fontSize: 11, textDecoration: 'none', letterSpacing: 1.5 }}>
          GITHUB ↗
        </a>
      </div>
    </nav>
  )
}
