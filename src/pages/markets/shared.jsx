import { useState, useEffect, useRef } from 'react'

export const C = {
  bg: '#020c18', panel: '#050f1e', border: '#0c1d34', borderBright: '#1a3050',
  amber: '#f5a623', green: '#00e676', red: '#ff3c5c', blue: '#2196f3', purple: '#a855f7',
  text: '#c8d8f0', textSec: '#506888', textDim: '#1e3050',
}
export const MONO = "'Consolas','Menlo','Monaco','Courier New',monospace"

export function Counter({ to, duration = 1200, prefix = '', suffix = '' }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      obs.disconnect()
      const start = performance.now()
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1)
        setVal(Math.round(p * to))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to, duration])
  return <span ref={ref}>{prefix}{val.toLocaleString('en-IN')}{suffix}</span>
}

export function Section({ title, subtitle, children, id }) {
  return (
    <section id={id} style={{ marginBottom: 80, maxWidth: '100%' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 10, color: C.amber, letterSpacing: 3, marginBottom: 8 }}>{subtitle}</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>{title}</h2>
      </div>
      {children}
    </section>
  )
}
