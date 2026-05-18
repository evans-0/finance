import { useState, useEffect, useCallback } from "react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const C = {
  bg: "#020c18",
  panel: "#050f1e",
  panelSel: "#0a1a30",
  border: "#0c1d34",
  borderBright: "#162840",
  green: "#00e676",
  red: "#ff3c5c",
  amber: "#f5a623",
  text: "#c8d8f0",
  textSec: "#506888",
  textDim: "#1e3050",
}

const STOCK_META = [
  { id: "s_aapl",  symbol: "AAPL",  name: "Apple Inc.",      cap: "$3.28T", type: "stock" },
  { id: "s_msft",  symbol: "MSFT",  name: "Microsoft Corp.", cap: "$3.32T", type: "stock" },
  { id: "s_nvda",  symbol: "NVDA",  name: "NVIDIA Corp.",    cap: "$2.67T", type: "stock" },
  { id: "s_tsla",  symbol: "TSLA",  name: "Tesla Inc.",      cap: "$558B",  type: "stock" },
  { id: "s_googl", symbol: "GOOGL", name: "Alphabet Inc.",   cap: "$2.19T", type: "stock" },
  { id: "s_amzn",  symbol: "AMZN",  name: "Amazon.com",      cap: "$2.02T", type: "stock" },
]

const INDICES = [
  { name: "S&P 500", val: "5,308.15",  pct: "+0.24%", up: true  },
  { name: "NASDAQ",  val: "16,780.24", pct: "-0.14%", up: false },
  { name: "DOW",     val: "39,431.21", pct: "+0.14%", up: true  },
  { name: "VIX",     val: "14.23",     pct: "+3.27%", up: false },
]

const MONO = "'Consolas','Menlo','Monaco','Courier New',monospace"

function fp(n) {
  if (n == null) return "—"
  if (n < 0.01)  return "$" + n.toFixed(6)
  if (n < 1)     return "$" + n.toFixed(4)
  if (n >= 1000) return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return "$" + n.toFixed(2)
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

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: "#0a1828", border: `1px solid ${C.border}`, padding: "6px 10px", borderRadius: 3, fontSize: 11, fontFamily: MONO }}>
      <div style={{ color: C.textSec, marginBottom: 2 }}>{label}</div>
      <div style={{ color: C.text, fontWeight: 600 }}>{fp(payload[0].value)}</div>
    </div>
  )
}

function WatchRow({ asset, selected, onSelect }) {
  const price = asset.type === "stock" ? asset.price : asset.current_price || 0
  const pct   = asset.type === "stock" ? asset.pct   : asset.price_change_percentage_24h || 0
  const up    = pct >= 0
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={() => onSelect(asset)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "7px 12px", cursor: "pointer", display: "flex",
        justifyContent: "space-between", alignItems: "center",
        background: selected ? C.panelSel : hovered ? "#080f1e" : "transparent",
        borderLeft: `2px solid ${selected ? C.amber : "transparent"}`,
        borderBottom: `1px solid ${C.border}`,
        transition: "background 0.1s",
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
              <div style={{ fontSize: 11, color: C.text }}>{fp(price)}</div>
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

export default function FinanceDashboard() {
  const [stocks, setStocks]             = useState(STOCK_META.map(s => ({ ...s, price: null, pct: null, high: null, low: null, stockLoading: true })))
  const [cryptos, setCryptos]           = useState([])
  const [selected, setSelected]         = useState(null)
  const [chart, setChart]               = useState([])
  const [stocksError, setStocksError]   = useState(false)
  const [cryptoLoading, setCryptoLoading] = useState(true)
  const [cryptoError, setCryptoError]   = useState(false)
  const [chartLoading, setChartLoading] = useState(false)
  const [time, setTime]                 = useState(new Date())
  const [lastUpdated, setLastUpdated]   = useState(null)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Live stock quotes — routed through Cloudflare Worker, key stays server-side
  const fetchStocks = useCallback(async () => {
    setStocksError(false)
    const symbols = STOCK_META.map(s => s.symbol).join(",")
    try {
      const r = await fetch(`/api/stocks?symbols=${symbols}`)
      if (!r.ok) throw new Error()
      const data = await r.json()
      if (data.error) throw new Error(data.error)
      setStocks(
        STOCK_META.map(meta => {
          const live = data.find(d => d.symbol === meta.symbol)
          return { ...meta, price: live?.price ?? null, pct: live?.pct ?? null, high: live?.high ?? null, low: live?.low ?? null, stockLoading: false }
        })
      )
      setLastUpdated(new Date())
    } catch {
      setStocksError(true)
      setStocks(prev => prev.map(s => ({ ...s, stockLoading: false })))
    }
  }, [])

  // Live crypto via CoinGecko (no key needed)
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
    fetchStocks()
    fetchCrypto()
    const t = setInterval(() => { fetchStocks(); fetchCrypto() }, 60000)
    return () => clearInterval(t)
  }, [fetchStocks, fetchCrypto])

  useEffect(() => {
    if (!selected && stocks.length) setSelected(stocks[0])
  }, [stocks, selected])

  // Chart data — CoinGecko for crypto, mock for stocks (Finnhub historical requires paid tier)
  useEffect(() => {
    if (!selected) return
    setChartLoading(true)
    if (selected.type === "stock") {
      const base = selected.price || 150
      const timer = setTimeout(() => { setChart(mkMockChart(base)); setChartLoading(false) }, 200)
      return () => clearTimeout(timer)
    }
    const ctrl = new AbortController()
    fetch(`https://api.coingecko.com/api/v3/coins/${selected.id}/market_chart?vs_currency=usd&days=30&interval=daily`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(d => setChart(d.prices.map(([ts, p]) => ({ t: new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }), p: +p.toFixed(6) }))))
      .catch(() => setChart(mkMockChart(selected.current_price || 1)))
      .finally(() => setChartLoading(false))
    return () => ctrl.abort()
  }, [selected])

  const price        = selected?.type === "stock" ? selected.price : selected?.current_price || 0
  const pct          = selected?.type === "stock" ? selected.pct   : selected?.price_change_percentage_24h || 0
  const up           = pct >= 0
  const cmin         = chart.length ? Math.min(...chart.map(d => d.p)) * 0.997 : 0
  const cmax         = chart.length ? Math.max(...chart.map(d => d.p)) * 1.003 : 1
  const isStockLoading = selected?.type === "stock" && selected?.stockLoading

  return (
    <div style={{ background: C.bg, fontFamily: MONO, color: C.text, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ background: C.panel, borderBottom: `1px solid ${C.border}`, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: C.amber, fontWeight: 700, fontSize: 15, letterSpacing: 3 }}>▐ MKTVISION</span>
          <span style={{ color: C.borderBright, fontSize: 20 }}>|</span>
          <span style={{ fontSize: 10, color: C.textSec, letterSpacing: 2 }}>MARKETS TERMINAL</span>
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {INDICES.map(idx => (
            <span key={idx.name} style={{ fontSize: 11 }}>
              <span style={{ color: C.textSec }}>{idx.name}&nbsp;</span>
              <span style={{ color: C.text }}>{idx.val}&nbsp;</span>
              <span style={{ color: idx.up ? C.green : C.red }}>{idx.pct}</span>
            </span>
          ))}
        </div>
        <div style={{ fontSize: 12, color: C.amber, fontWeight: 600 }}>
          {time.toLocaleTimeString("en-US", { hour12: false })} EST
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1 }}>

        {/* Watchlist */}
        <div style={{ width: 210, minWidth: 210, borderRight: `1px solid ${C.border}`, background: C.panel, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "6px 12px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5 }}>EQUITIES</span>
            <span style={{ fontSize: 9, color: stocksError ? C.red : C.green }}>● {stocksError ? "ERROR" : "LIVE"}</span>
          </div>
          {stocks.map(s => <WatchRow key={s.id} asset={s} selected={selected?.id === s.id} onSelect={setSelected} />)}

          <div style={{ padding: "6px 12px", borderBottom: `1px solid ${C.border}`, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5 }}>CRYPTO</span>
            <span style={{ fontSize: 9, color: cryptoError ? C.red : C.green }}>● {cryptoError ? "ERROR" : "LIVE"}</span>
          </div>
          {cryptoLoading
            ? <div style={{ padding: "16px 12px", fontSize: 11, color: C.textDim, textAlign: "center" }}>fetching...</div>
            : cryptos.map(c => <WatchRow key={c.id} asset={c} selected={selected?.id === c.id} onSelect={setSelected} />)
          }
        </div>

        {/* Chart area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

          {/* Asset info */}
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "flex-end", gap: 32, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 10, color: C.textSec, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 600, color: C.text }}>{selected?.name || "—"}</span>
                <span style={{ fontSize: 9, color: C.green }}>● LIVE</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                {isStockLoading
                  ? <span style={{ fontSize: 28, color: C.textDim }}>loading...</span>
                  : <>
                      <span style={{ fontSize: 32, fontWeight: 700, color: C.text, letterSpacing: -0.5 }}>{fp(price)}</span>
                      <span style={{ fontSize: 16, color: up ? C.green : C.red, fontWeight: 600 }}>{up ? "▲" : "▼"} {Math.abs(pct || 0).toFixed(2)}%</span>
                    </>
                }
              </div>
            </div>
            <div style={{ display: "flex", gap: 28, flexWrap: "wrap", paddingBottom: 4 }}>
              <Stat label="MKT CAP"  value={selected?.type === "stock" ? selected.cap                      : fL(selected?.market_cap || 0)}  loading={isStockLoading} />
              <Stat label="24H VOL"  value={selected?.type === "stock" ? "—"                               : fL(selected?.total_volume || 0)} loading={isStockLoading} />
              <Stat label="24H HIGH" value={selected?.type === "stock" ? fp(selected?.high)                : fp(selected?.high_24h || 0)}     loading={isStockLoading} />
              <Stat label="24H LOW"  value={selected?.type === "stock" ? fp(selected?.low)                 : fp(selected?.low_24h || 0)}      loading={isStockLoading} />
            </div>
          </div>

          {/* Chart */}
          <div style={{ flex: 1, padding: "16px 16px 8px", minHeight: 280 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 10, color: C.textSec, letterSpacing: 1.5 }}>30-DAY PRICE CHART</span>
              {lastUpdated && <span style={{ fontSize: 9, color: C.textDim }}>UPDATED {lastUpdated.toLocaleTimeString("en-US", { hour12: false })}</span>}
            </div>
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
                    <XAxis dataKey="t" tick={{ fill: C.textDim, fontSize: 10, fontFamily: MONO }} tickLine={false} axisLine={{ stroke: C.border }} interval="preserveStartEnd" />
                    <YAxis domain={[cmin, cmax]} tick={{ fill: C.textDim, fontSize: 10, fontFamily: MONO }} tickLine={false} axisLine={false} width={76}
                      tickFormatter={v => v >= 10000 ? "$"+(v/1000).toFixed(0)+"k" : v >= 1000 ? "$"+(v/1000).toFixed(1)+"k" : v < 1 ? "$"+v.toFixed(3) : "$"+v.toFixed(0)}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="p" stroke={up ? C.green : C.red} strokeWidth={1.5} fill="url(#areaGrad)" dot={false} activeDot={{ r: 3, fill: up ? C.green : C.red, stroke: "none" }} />
                  </AreaChart>
                </ResponsiveContainer>
              )
            }
          </div>

          {/* Movers strip */}
          <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 16px" }}>
            <div style={{ fontSize: 10, color: C.textSec, marginBottom: 8, letterSpacing: 1.5 }}>MARKET MOVERS</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[...stocks, ...cryptos.slice(0, 4)].map(a => {
                const p2 = a.type === "stock" ? a.pct : a.price_change_percentage_24h || 0
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
        <span style={{ fontSize: 10, color: C.textDim }}>STOCKS: FINNHUB VIA CF WORKER · CRYPTO: COINGECKO · REFRESH: 60S</span>
        <span style={{ fontSize: 10, color: C.textDim }}>MKTVISION · REACT + RECHARTS</span>
      </div>
    </div>
  )
}
