import { useState, useEffect, useCallback, useRef } from "react"
import { Link } from "react-router-dom"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const C = {
  bg: "#020c18", panel: "#050f1e", panelSel: "#0a1a30",
  border: "#0c1d34", borderBright: "#162840",
  green: "#00e676", red: "#ff3c5c", amber: "#f5a623",
  text: "#c8d8f0", textSec: "#506888", textDim: "#1e3050",
}

const STOCK_META = [
  { id: "s_aapl",  symbol: "AAPL",  name: "Apple Inc.",      cap: "$3.28T", type: "stock" },
  { id: "s_msft",  symbol: "MSFT",  name: "Microsoft Corp.", cap: "$3.32T", type: "stock" },
  { id: "s_nvda",  symbol: "NVDA",  name: "NVIDIA Corp.",    cap: "$2.67T", type: "stock" },
  { id: "s_tsla",  symbol: "TSLA",  name: "Tesla Inc.",      cap: "$558B",  type: "stock" },
  { id: "s_googl", symbol: "GOOGL", name: "Alphabet Inc.",   cap: "$2.19T", type: "stock" },
  { id: "s_amzn",  symbol: "AMZN",  name: "Amazon.com",      cap: "$2.02T", type: "stock" },
]

const MONO = "'Consolas','Menlo','Monaco','Courier New',monospace"

function fp(n, currency = "$") {
  if (n == null) return "—"
  if (n < 0.01)  return currency + n.toFixed(6)
  if (n < 1)     return currency + n.toFixed(4)
  if (n >= 1000) return currency + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return currency + n.toFixed(2)
}

function fIdx(n) {
  if (!n) return "—"
  if (n >= 1000) return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return n.toFixed(2)
}

function fL(n) {
  if (!n) return "—"
  if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T"
  if (n >= 1e9)  return "$" + (n / 1e9).toFixed(2) + "B"
  if (n >= 1e6)  return "$" + (n / 1e6).toFixed(2) + "M"
  return "$" + n.toLocaleString()
}

function mkMockChart(base, days = 30) {
  let p = base * (0.93 + Math.random() * 0.06)
  const pts = []
  for (let i = days; i >= 0; i--) {
    p *= 1 + (Math.random() - 0.49) * 0.025
    pts.push({
      t: new Date(Date.now() - i * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      p: +p.toFixed(4),
    })
  }
  pts[pts.length - 1].p = base
  return pts
}

function ChartTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: "#0a1828", border: `1px solid ${C.border}`, padding: "6px 10px", borderRadius: 3, fontSize: 11, fontFamily: MONO }}>
      <div style={{ color: C.textSec, marginBottom: 2 }}>{label}</div>
      <div style={{ color: C.text, fontWeight: 600 }}>{fp(payload[0].value, currency)}</div>
    </div>
  )
}

function WatchRow({ asset, selected, onSelect }) {
  const isIndian = asset.type === "indian"
  const price = isIndian ? asset.price : asset.type === "stock" ? asset.price : asset.current_price || 0
  const pct   = isIndian ? asset.pct   : asset.type === "stock" ? asset.pct   : asset.price_change_percentage_24h || 0
  const up    = pct >= 0
  const curr  = isIndian ? "₹" : "$"
  const [hov, setHov] = useState(false)
  return (
    <div onClick={() => onSelect(asset)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: "7px 12px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
        background: selected ? C.panelSel : hov ? "#080f1e" : "transparent",
        borderLeft: `2px solid ${selected ? C.amber : "transparent"}`,
        borderBottom: `1px solid ${C.border}`, transition: "background 0.1s",
      }}
    >
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: selected ? C.amber : C.text }}>{asset.symbol?.toUpperCase()}</div>
        <div style={{ fontSize: 10, color: C.textSec, marginTop: 1 }}>{(asset.name || "").slice(0, 14)}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        {asset.stockLoading
          ? <div style={{ fontSize: 11, color: C.textDim }}>...</div>
          : <>
              <div style={{ fontSize: 11, color: C.text }}>{fp(price, curr)}</div>
              <div style={{ fontSize: 10, color: up ? C.green : C.red }}>{up ? "▲" : "▼"} {Math.abs(pct || 0).toFixed(2)}%</div>
            </>
        }
      </div>
    </div>
  )
}

function Stat({ label, value, loading }) {
  return (
    <div style={{ minWidth: 80 }}>
      <div style={{ fontSize: 9, color: C.textSec, marginBottom: 3, letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 12, color: loading ? C.textDim : C.text, fontWeight: 500 }}>{loading ? "..." : value}</div>
    </div>
  )
}

function SectionHeader({ label, status, error, wsStatus }) {
  const color = wsStatus === 'connected' ? C.green : error ? C.red : wsStatus === 'connecting' ? C.amber : C.amber
  const text  = wsStatus === 'connected' ? 'WS LIVE' : error ? 'ERROR' : wsStatus === 'connecting' ? 'LOADING' : status
  return (
    <div style={{ padding: "6px 12px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5 }}>{label}</span>
      <span style={{ fontSize: 9, color: color }}>● {text}</span>
    </div>
  )
}

export default function FinanceDashboard() {
  const [stocks, setStocks]               = useState(STOCK_META.map(s => ({ ...s, price: null, pct: null, high: null, low: null, stockLoading: true })))
  const [indianStocks, setIndianStocks]   = useState([])
  const [cryptos, setCryptos]             = useState([])
  const [indices, setIndices]             = useState([])
  const [selected, setSelected]           = useState(null)
  const [chart, setChart]                 = useState([])
  const [stocksError, setStocksError]     = useState(false)
  const [indianError, setIndianError]     = useState(false)
  const [indianLoading, setIndianLoading] = useState(true)
  const [cryptoLoading, setCryptoLoading] = useState(true)
  const [cryptoError, setCryptoError]     = useState(false)
  const [chartLoading,   setChartLoading]  = useState(false)
  const [isSimulated,   setIsSimulated]   = useState(false)
  const [chartRange,   setChartRange]     = useState('1M')
  const [customFrom,   setCustomFrom]     = useState('')
  const [customTo,     setCustomTo]       = useState('')
  const [news, setNews]                   = useState([])
  const [newsLoading, setNewsLoading]     = useState(false)
  const [time, setTime]                   = useState(new Date())
  const [lastUpdated, setLastUpdated]     = useState(null)
  const [wsStatus,     setWsStatus]       = useState('connecting')

  const [searchQuery, setSearchQuery]     = useState("")
  const wsRef     = useRef(null)
  const chartTimer = useRef(null)
  const [isMobile,   setIsMobile]   = useState(window.innerWidth < 768)
  const [showDetail, setShowDetail] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchOpen, setSearchOpen]       = useState(false)
  const searchRef                         = useRef(null)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const handler = e => { if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    if (searchQuery.length < 1) { setSearchResults([]); setSearchOpen(false); return }
    const t = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        const data = await r.json()
        setSearchResults(data.results || [])
        setSearchOpen(true)
      } catch {
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 350)
    return () => clearTimeout(t)
  }, [searchQuery])

  const handleSearchSelect = useCallback(async result => {
    setSearchQuery(""); setSearchResults([]); setSearchOpen(false)
    const isIndian = /\.(NS|BO)$/i.test(result.symbol)
    try {
      if (isIndian) {
        const r = await fetch(`/api/indian?symbol=${encodeURIComponent(result.symbol)}`)
        const data = await r.json()
        const q = data?.[0]
        setSelected({
          id: `search_${result.symbol}`, symbol: q?.symbol || result.symbol,
          name: q?.name || result.name, type: "indian",
          price: q?.price ?? null, pct: q?.pct ?? null,
          high: q?.high ?? null, low: q?.low ?? null,
          exchange: "NSE", stockLoading: false,
        })
      } else {
        const r = await fetch(`/api/stocks?symbols=${result.symbol}`)
        const data = await r.json()
        const q = data?.[0]
        setSelected({
          id: `search_${result.symbol}`, symbol: result.symbol, name: result.name,
          type: "stock", price: q?.price ?? null, pct: q?.pct ?? null,
          high: q?.high ?? null, low: q?.low ?? null, cap: "—", stockLoading: false,
        })
      }
    } catch {}
  }, [])

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // WebSocket for real-time US stock prices
  useEffect(() => {
    let ws = null
    let retryTimer = null

    const connect = async () => {
      try {
        setWsStatus('connecting')
        const r = await fetch('/api/wstoken')
        if (!r.ok) throw new Error('token fetch failed')
        const { token } = await r.json()
        if (!token) throw new Error('no token')

        ws = new WebSocket('wss://ws.finnhub.io?token=' + token)
        wsRef.current = ws

        ws.onopen = () => {
          setWsStatus('connected')
          STOCK_META.forEach(s => {
            ws.send(JSON.stringify({ type: 'subscribe', symbol: s.symbol }))
          })
        }

        ws.onmessage = (event) => {
          const msg = JSON.parse(event.data)
          if (msg.type !== 'trade' || !msg.data) return
          setStocks(prev => {
            let changed = false
            const next = prev.map(stock => {
              const trade = msg.data.find(t => t.s === stock.symbol)
              if (!trade || stock.price === null) return stock
              const newPrice = +trade.p.toFixed(2)
              if (newPrice === stock.price) return stock
              changed = true
              const flash = newPrice > stock.price ? 'up' : 'down'
              return { ...stock, price: newPrice, flash }
            })
            if (changed) {
              setTimeout(() => {
                setStocks(s => s.map(x => x.flash ? { ...x, flash: null } : x))
              }, 700)
            }
            return changed ? next : prev
          })
          // Also update the main window if the selected stock changed
          setSelected(prev => {
            if (!prev || prev.type !== 'stock') return prev
            const trade = msg.data.find(t => t.s === prev.symbol)
            if (!trade) return prev
            const newPrice = +trade.p.toFixed(2)
            if (newPrice === prev.price) return prev
            return { ...prev, price: newPrice }
          })
        }

        ws.onclose = () => {
          setWsStatus('disconnected')
          retryTimer = setTimeout(connect, 5000)
        }

        ws.onerror = () => ws.close()

      } catch {
        setWsStatus('disconnected')
        retryTimer = setTimeout(connect, 8000)
      }
    }

    connect()

    return () => {
      clearTimeout(retryTimer)
      try {
        if (wsRef.current) {
          STOCK_META.forEach(s => {
            try {
              if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN)
                wsRef.current.send(JSON.stringify({ type: 'unsubscribe', symbol: s.symbol }))
            } catch (_) {}
          })
          wsRef.current.close()
          wsRef.current = null
        }
      } catch (_) {}
    }
  }, [])

  const fetchIndices = useCallback(async () => {
    try {
      const r = await fetch("/api/indices")
      if (!r.ok) throw new Error()
      const data = await r.json()
      if (!data.error) setIndices(data)
    } catch {}
  }, [])

  const fetchStocks = useCallback(async () => {
    setStocksError(false)
    try {
      const r = await fetch(`/api/stocks?symbols=${STOCK_META.map(s => s.symbol).join(",")}`)
      if (!r.ok) throw new Error()
      const data = await r.json()
      if (data.error) throw new Error()
      setStocks(STOCK_META.map(meta => {
        const live = data.find(d => d.symbol === meta.symbol)
        return { ...meta, price: live?.price ?? null, pct: live?.pct ?? null, high: live?.high ?? null, low: live?.low ?? null, stockLoading: false }
      }))
      setLastUpdated(new Date())
    } catch {
      setStocksError(true)
      setStocks(prev => prev.map(s => ({ ...s, stockLoading: false })))
    }
  }, [])

  const fetchIndian = useCallback(async () => {
    setIndianError(false)
    try {
      const r = await fetch("/api/indian")
      if (!r.ok) throw new Error()
      const data = await r.json()
      if (data.error) throw new Error()
      setIndianStocks(data.map(s => ({ ...s, id: `in_${s.symbol}`, type: "indian" })))
    } catch {
      setIndianError(true)
    } finally {
      setIndianLoading(false)
    }
  }, [])

  const fetchCrypto = useCallback(async () => {
    setCryptoError(false)
    try {
      const r = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=8&page=1&sparkline=false")
      if (!r.ok) throw new Error()
      const d = await r.json()
      setCryptos(d.map(c => ({ ...c, type: "crypto", symbol: c.symbol?.toUpperCase() })))
    } catch {
      setCryptoError(true)
    } finally {
      setCryptoLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchIndices(); fetchStocks(); fetchIndian(); fetchCrypto()
    const t = setInterval(() => { fetchIndices(); fetchStocks(); fetchIndian(); fetchCrypto() }, 60000)
    return () => clearInterval(t)
  }, [fetchIndices, fetchStocks, fetchIndian, fetchCrypto])

  useEffect(() => {
    if (!selected && stocks.length) setSelected(stocks[0])
  }, [stocks, selected])

  useEffect(() => {
    if (!selected) return
    clearTimeout(chartTimer.current)
    const ctrl = new AbortController()

    chartTimer.current = setTimeout(() => {
    setChartLoading(true)
    setChart([])

    if (selected.type === "stock") {
      // Real historical data via Polygon.io
      const rangeParam = chartRange === 'CUSTOM' && customFrom && customTo
        ? `range=CUSTOM&from=${customFrom}&to=${customTo}`
        : `range=${chartRange}`
      fetch(`/api/chart?symbol=${selected.symbol}&${rangeParam}`, { signal: ctrl.signal })
        .then(r => r.json())
        .then(d => {
          if (d.candles && d.candles.length > 0) {
            const isHourly = d.timespan === 'hour'
            setChart(d.candles.map(c => ({
              t: isHourly
                ? new Date(c.t).toLocaleTimeString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
                : new Date(c.t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              p: c.c, o: c.o, h: c.h, l: c.l
            })))
            setIsSimulated(false)
          } else {
            setChart(mkMockChart(selected.price || 150))
            setIsSimulated(true)
          }
        })
        .catch(() => { setChart(mkMockChart(selected.price || 150)); setIsSimulated(true) })
        .finally(() => setChartLoading(false))
      return () => ctrl.abort()
    }

    if (selected.type === "indian") {
      // NSE historical not available on free tier — use mock
      const base = selected.price || 150
      const timer = setTimeout(() => { setChart(mkMockChart(base)); setIsSimulated(true); setChartLoading(false) }, 200)
      return () => clearTimeout(timer)
    }

    // Crypto: CoinGecko
    fetch(`https://api.coingecko.com/api/v3/coins/${selected.id}/market_chart?vs_currency=usd&days=30&interval=daily`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(d => { setChart(d.prices.map(([ts, p]) => ({ t: new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }), p: +p.toFixed(6) }))); setIsSimulated(false) })
      .catch(() => { setChart(mkMockChart(selected.current_price || 1)); setIsSimulated(true) })
      .finally(() => setChartLoading(false))
    }, 400) // debounce — wait 400ms before firing Polygon request

    return () => { clearTimeout(chartTimer.current); ctrl.abort() }
  }, [selected?.id, chartRange, customFrom, customTo])

  // Fetch news when selection changes
  useEffect(() => {
    if (!selected) return
    setNewsLoading(true)
    setNews([])
    const type   = selected.type === "crypto" ? "crypto" : selected.type === "indian" ? "indian" : "stock"
    const symbol = selected.symbol || selected.id || ""
    const name   = encodeURIComponent(selected.name || selected.symbol || "")
    fetch(`/api/news?symbol=${symbol}&type=${type}&name=${name}`)
      .then(r => r.json())
      .then(d => setNews(d.articles || []))
      .catch(e => { if (e?.name !== 'AbortError') setNews([]) })
      .finally(() => setNewsLoading(false))
  }, [selected?.id])

  const isIndian       = selected?.type === "indian"
  const currency       = isIndian ? "₹" : "$"
  const price          = isIndian ? selected.price : selected?.type === "stock" ? selected.price : selected?.current_price || 0
  const pct            = isIndian ? selected.pct   : selected?.type === "stock" ? selected.pct   : selected?.price_change_percentage_24h || 0
  const up             = pct >= 0
  const cmin           = chart.length ? Math.min(...chart.map(d => d.p)) * 0.997 : 0
  const cmax           = chart.length ? Math.max(...chart.map(d => d.p)) * 1.003 : 1
  const isStockLoading = (selected?.type === "stock" || isIndian) && selected?.stockLoading

  const statHigh = isIndian ? fp(selected?.high, "₹") : selected?.type === "stock" ? fp(selected?.high) : fp(selected?.high_24h || 0)
  const statLow  = isIndian ? fp(selected?.low,  "₹") : selected?.type === "stock" ? fp(selected?.low)  : fp(selected?.low_24h  || 0)

  return (
    <div style={{ background: C.bg, fontFamily: MONO, color: C.text, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ background: C.panel, borderBottom: `1px solid ${C.border}`, padding: isMobile ? "8px 12px" : "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link to="/" style={{ color: C.amber, fontWeight: 700, fontSize: 15, letterSpacing: 3, textDecoration: "none" }}>▐ MKTVISION</Link>
          <span style={{ color: C.borderBright, fontSize: 20 }}>|</span>
          <span style={{ fontSize: 10, color: C.textSec, letterSpacing: 2 }}>MARKETS TERMINAL</span>
          <Link to="/calculators" style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, textDecoration: "none" }}>CALCULATORS</Link>
          <Link to="/glossary" style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5, textDecoration: "none" }}>GLOSSARY</Link>
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {(indices.length ? indices : [
            { name: "S&P 500", pct: 0 }, { name: "NASDAQ", pct: 0 },
            { name: "DOW", pct: 0 },     { name: "VIX", pct: 0 },
          ]).map(idx => (
            <span key={idx.name} style={{ fontSize: 11 }}>
              <span style={{ color: C.textSec }}>{idx.name}&nbsp;</span>
              {idx.val
                ? <span style={{ color: idx.pct >= 0 ? C.green : C.red }}>{idx.pct >= 0 ? "+" : ""}{idx.pct.toFixed(2)}%</span>
                : <span style={{ color: C.textDim }}>—</span>
              }
            </span>
          ))}
        </div>
        <div style={{ fontSize: 12, color: C.amber, fontWeight: 600 }}>
          {time.toLocaleTimeString("en-US", { hour12: false, timeZone: "America/New_York" })} EST
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1 }}>

        {/* Sidebar */}
        <div style={{ width: isMobile ? '100%' : 210, minWidth: isMobile ? '100%' : 210, borderRight: isMobile ? 'none' : `1px solid ${C.border}`, background: C.panel, display: isMobile && showDetail ? 'none' : "flex", flexDirection: "column", overflowY: "auto" }}>

          {/* Search */}
          <div ref={searchRef} style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}`, position: "relative" }}>
            <input
              type="text"
              placeholder="⌕  Search any ticker..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length && setSearchOpen(true)}
              style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: "5px 8px", fontSize: 11, fontFamily: MONO, borderRadius: 3, outline: "none", boxSizing: "border-box" }}
            />
            {searchLoading && <div style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: C.textDim }}>...</div>}
            {searchOpen && searchResults.length > 0 && (
              <div style={{ position: "absolute", top: "calc(100% - 2px)", left: 10, right: 10, background: C.panel, border: `1px solid ${C.borderBright}`, borderRadius: "0 0 3px 3px", zIndex: 200, maxHeight: 220, overflowY: "auto" }}>
                {searchResults.map(r => (
                  <div key={r.symbol} onClick={() => handleSearchSelect(r)}
                    style={{ padding: "7px 10px", cursor: "pointer", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 8, alignItems: "baseline" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#0a1828"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.amber, minWidth: 48 }}>{r.symbol}</span>
                    <span style={{ fontSize: 10, color: C.textSec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <SectionHeader label="EQUITIES" status="LIVE" error={stocksError} wsStatus={wsStatus} />
          {stocks.map(s => <WatchRow key={s.id} asset={s} selected={selected?.id === s.id} onSelect={a => { setSelected(a); if (isMobile) setShowDetail(true) }} />)}

          <SectionHeader label="INDIA · NSE" status="LIVE" error={indianError} />
          {indianLoading
            ? <div style={{ padding: "16px 12px", fontSize: 11, color: C.textDim, textAlign: "center" }}>fetching...</div>
            : indianStocks.map(s => <WatchRow key={s.id} asset={s} selected={selected?.id === s.id} onSelect={a => { setSelected(a); if (isMobile) setShowDetail(true) }} />)
          }

          <SectionHeader label="CRYPTO" status="LIVE" error={cryptoError} />
          {cryptoLoading
            ? <div style={{ padding: "16px 12px", fontSize: 11, color: C.textDim, textAlign: "center" }}>fetching...</div>
            : cryptos.map(c => <WatchRow key={c.id} asset={c} selected={selected?.id === c.id} onSelect={a => { setSelected(a); if (isMobile) setShowDetail(true) }} />)
          }
        </div>

        {/* Main */}
        <div style={{ flex: 1, display: isMobile && !showDetail ? "none" : "flex", flexDirection: "column", minWidth: 0 }}>

          {/* Asset info */}
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "flex-end", gap: 32, flexWrap: "wrap" }}>
            <div>
              {isMobile && (
                <button onClick={() => setShowDetail(false)} style={{ background: 'none', border: `1px solid ${C.border}`, color: C.amber, padding: '4px 10px', fontSize: 10, fontFamily: MONO, cursor: 'pointer', borderRadius: 2, marginBottom: 10, letterSpacing: 1 }}>
                  ← BACK
                </button>
              )}
              <div style={{ fontSize: 10, color: C.textSec, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 600, color: C.text }}>{selected?.name || "—"}</span>
                {isIndian && <span style={{ fontSize: 9, color: C.amber }}>NSE</span>}
                <span style={{ fontSize: 9, color: C.green }}>● LIVE</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                {isStockLoading
                  ? <span style={{ fontSize: 28, color: C.textDim }}>loading...</span>
                  : <>
                      <span style={{ fontSize: 32, fontWeight: 700, color: C.text, letterSpacing: -0.5 }}>{fp(price, currency)}</span>
                      <span style={{ fontSize: 16, color: up ? C.green : C.red, fontWeight: 600 }}>{up ? "▲" : "▼"} {Math.abs(pct || 0).toFixed(2)}%</span>
                    </>
                }
              </div>
            </div>
            <div style={{ display: "flex", gap: 28, flexWrap: "wrap", paddingBottom: 4 }}>
              <Stat label="MKT CAP"  value={isIndian ? "—" : selected?.type === "stock" ? selected.cap : fL(selected?.market_cap || 0)} loading={isStockLoading} />
              <Stat label="24H VOL"  value={isIndian ? "—" : selected?.type === "stock" ? "—" : fL(selected?.total_volume || 0)}         loading={isStockLoading} />
              <Stat label="24H HIGH" value={statHigh} loading={isStockLoading} />
              <Stat label="24H LOW"  value={statLow}  loading={isStockLoading} />
            </div>
          </div>

          {/* Chart */}
          <div style={{ flex: 1, padding: "16px 16px 8px", minHeight: 280 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5 }}>
                {selected?.type === 'stock'
                  ? ({ '5D': '5-DAY', '1M': '1-MONTH', '3M': '3-MONTH', '6M': '6-MONTH', '1Y': '1-YEAR', 'CUSTOM': 'CUSTOM' }[chartRange] || '30-DAY') + ' PRICE CHART'
                  : '30-DAY PRICE CHART'}
              </span>
              {isSimulated && <span style={{ fontSize: 9, color: C.amber, background: '#1a1200', border: '1px solid #3a2800', padding: '2px 6px', borderRadius: 2, letterSpacing: 1 }}>SIMULATED</span>}
              {lastUpdated && !isSimulated && <span style={{ fontSize: 9, color: C.textDim }}>UPDATED {lastUpdated.toLocaleTimeString("en-US", { hour12: false })}</span>}
            </div>
            {selected?.type === "stock" && (
              <div style={{ display: "flex", gap: 6, marginBottom: 12, alignItems: "center", overflowX: "auto", paddingBottom: 4 }}>
                {['5D','1M','3M','6M','1Y','CUSTOM'].map(r => (
                  <button key={r} onClick={() => setChartRange(r)} style={{
                    background: chartRange === r ? C.amber : C.bg,
                    color: chartRange === r ? '#020c18' : C.textSec,
                    border: `1px solid ${chartRange === r ? C.amber : C.border}`,
                    padding: '3px 10px', fontSize: 10, fontFamily: 'monospace',
                    cursor: 'pointer', borderRadius: 2, fontWeight: chartRange === r ? 700 : 400,
                  }}>{r}</button>
                ))}
                {chartRange === 'CUSTOM' && (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                      style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: '3px 8px', fontSize: 10, fontFamily: 'monospace', borderRadius: 2, outline: 'none' }} />
                    <span style={{ fontSize: 10, color: C.textSec }}>to</span>
                    <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                      style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: '3px 8px', fontSize: 10, fontFamily: 'monospace', borderRadius: 2, outline: 'none' }} />
                  </div>
                )}
              </div>
            )}
            {chartLoading
              ? <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", color: C.textDim, fontSize: 12 }}>loading chart...</div>
              : (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={chart} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={up ? C.green : C.red} stopOpacity={0.22} />
                        <stop offset="95%" stopColor={up ? C.green : C.red} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="t" tick={{ fill: C.textSec, fontSize: 10, fontFamily: MONO }} tickLine={false} axisLine={{ stroke: C.border }} interval="preserveStartEnd" />
                    <YAxis domain={[cmin, cmax]} tick={{ fill: C.textSec, fontSize: 10, fontFamily: MONO }} tickLine={false} axisLine={false} width={76}
                      tickFormatter={v => {
                        const pfx = isIndian ? "₹" : "$"
                        return v >= 10000 ? pfx+(v/1000).toFixed(0)+"k" : v >= 1000 ? pfx+(v/1000).toFixed(1)+"k" : v < 1 ? pfx+v.toFixed(3) : pfx+v.toFixed(0)
                      }}
                    />
                    <Tooltip content={<ChartTooltip currency={currency} />} />
                    <Area type="monotone" dataKey="p" stroke={up ? C.green : C.red} strokeWidth={1.5} fill="url(#areaGrad)" dot={false} activeDot={{ r: 3, fill: up ? C.green : C.red, stroke: "none" }} />
                  </AreaChart>
                </ResponsiveContainer>
              )
            }
          </div>

          {/* News */}
          <div style={{ borderTop: `1px solid ${C.border}`, padding: "12px 16px" }}>
            <div style={{ fontSize: 10, color: C.textSec, marginBottom: 10, letterSpacing: 1.5 }}>
              LATEST NEWS
            </div>
            {newsLoading
              ? <div style={{ fontSize: 11, color: C.textDim }}>loading news...</div>
              : news.length === 0
              ? <div style={{ fontSize: 11, color: C.textDim }}>no news available</div>
              : news.map((a, i) => (
                <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: "block", textDecoration: "none", padding: "7px 0", borderBottom: `1px solid ${C.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = "#0a1828"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                    <div style={{ fontSize: 12, color: C.text, lineHeight: 1.4, flex: 1 }}>
                      {a.headline.length > 80 ? a.headline.slice(0, 80) + "..." : a.headline}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
                      <span style={{ fontSize: 10, color: C.amber }}>{a.source}</span>
                      <span style={{ fontSize: 10, color: C.textDim }}>
                        {(() => {
                          const diff = Math.floor((Date.now() - a.datetime * 1000) / 60000)
                          if (diff < 60) return diff + "m ago"
                          if (diff < 1440) return Math.floor(diff / 60) + "h ago"
                          return Math.floor(diff / 1440) + "d ago"
                        })()}
                      </span>
                    </div>
                  </div>
                </a>
              ))
            }
          </div>

          {/* Movers strip */}
          <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 16px" }}>
            <div style={{ fontSize: 10, color: C.textSec, marginBottom: 8, letterSpacing: 1.5 }}>MARKET MOVERS</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[...stocks, ...indianStocks.slice(0, 3), ...cryptos.slice(0, 3)].map(a => {
                const p2 = a.type === "indian" ? a.pct : a.type === "stock" ? a.pct : a.price_change_percentage_24h || 0
                const u2 = p2 >= 0
                return (
                  <div key={a.id || a.symbol} onClick={() => setSelected(a)}
                    style={{ padding: "6px 10px", border: `1px solid ${selected?.id === a.id ? C.amber : C.border}`, borderRadius: 3, cursor: "pointer", background: selected?.id === a.id ? "#0f1e34" : "transparent", minWidth: 72, opacity: a.stockLoading ? 0.4 : 1 }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 600, color: selected?.id === a.id ? C.amber : C.text }}>{(a.symbol || "").toUpperCase()}</div>
                    <div style={{ fontSize: 10, color: u2 ? C.green : C.red, marginTop: 2 }}>
                      {a.stockLoading ? "..." : `${u2 ? "▲" : "▼"} ${Math.abs(p2 || 0).toFixed(2)}%`}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "5px 16px", background: C.panel, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
        <span style={{ fontSize: 10, color: C.textDim }}>US: FINNHUB · INDIA NSE: TWELVE DATA · CRYPTO: COINGECKO · REFRESH: 60S</span>
        <span style={{ fontSize: 10, color: C.textDim }}>MKTVISION · REACT + RECHARTS</span>
      </div>
    </div>
  )
}
