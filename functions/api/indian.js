// Twelve Data free tier: 800 credits/day, 8 req/min
// 8 stocks × 15-min cache = ~384 credits/day — stays well within limits
// Individual requests only (batch format is unreliable on free tier)

const WATCHLIST = [
  "RELIANCE", "TCS", "INFY", "HDFCBANK",
  "ICICIBANK", "SBIN", "BHARTIARTL", "ITC",
]

const WATCHLIST_CACHE_TTL = 900  // 15 minutes — conservative to protect daily limit
const SEARCH_CACHE_TTL    = 120  // 2 minutes for individual searches

function corsHeaders(origin, allowed) {
  return {
    "Access-Control-Allow-Origin": allowed ? (origin === allowed ? origin : "null") : "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Vary": "Origin",
  }
}

async function fetchQuote(symbol, apiKey) {
  const r = await fetch(
    `https://api.twelvedata.com/quote?symbol=${symbol}&exchange=NSE&apikey=${apiKey}`
  )
  if (!r.ok) return null
  const q = await r.json()
  if (!q || q.status === "error" || q.code) return null

  const price = parseFloat(q.close) || parseFloat(q.previous_close) || 0
  if (!price) return null
  const prev = parseFloat(q.previous_close) || price
  const pct  = q.percent_change ? parseFloat(q.percent_change)
    : prev ? ((price - prev) / prev) * 100 : 0

  return {
    symbol, name: q.name || symbol,
    price: +price.toFixed(2), change: +(price - prev).toFixed(2),
    pct: +pct.toFixed(4), high: parseFloat(q.high) || null, low: parseFloat(q.low) || null,
    exchange: "NSE",
  }
}

async function fetchYahooQuote(symbol) {
  try {
    const yahooSym = symbol.endsWith(".NS") ? symbol : `${symbol}.NS`
    const r = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(yahooSym)}`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    )
    if (!r.ok) return null
    const data = await r.json()
    const q    = data?.quoteResponse?.result?.[0]
    if (!q || !q.regularMarketPrice) return null
    const base = symbol.replace(/\.NS$/i, "")
    return {
      symbol: base, name: q.shortName || q.longName || base,
      price: +q.regularMarketPrice.toFixed(2),
      change: +(q.regularMarketChange || 0).toFixed(2),
      pct: +(q.regularMarketChangePercent || 0).toFixed(4),
      high: q.regularMarketDayHigh || null, low: q.regularMarketDayLow || null,
      exchange: "NSE",
    }
  } catch { return null }
}

export async function onRequest({ request, env, waitUntil }) {
  const origin  = request.headers.get("Origin") || ""
  const allowed = env.ALLOWED_ORIGIN || ""
  const cors    = corsHeaders(origin, allowed)

  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors })
  if (allowed && origin && origin !== allowed) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403, headers: { "Content-Type": "application/json", ...cors },
    })
  }
  if (!env.TWELVEDATA_KEY) {
    return new Response(JSON.stringify({ error: "Service unavailable" }), {
      status: 503, headers: { "Content-Type": "application/json", ...cors },
    })
  }

  const { searchParams } = new URL(request.url)
  const rawSymbol = searchParams.get("symbol")

  // ── Single symbol lookup (search) ────────────────────────────────────────────
  if (rawSymbol) {
    const symbol = rawSymbol.trim().toUpperCase().replace(/[^A-Z0-9.]/g, "").slice(0, 25)
    if (!symbol) return new Response(JSON.stringify({ error: "Invalid symbol" }), {
      status: 400, headers: { "Content-Type": "application/json", ...cors },
    })

    const cacheKey = new Request(`https://cache.mktvision.internal/yahoo-${symbol}`)
    const cached   = await caches.default.match(cacheKey)
    if (cached) {
      const data = await cached.json()
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${SEARCH_CACHE_TTL}`, "X-Cache": "HIT", ...cors },
      })
    }

    const result = await fetchYahooQuote(symbol)
    if (!result) return new Response(JSON.stringify({ error: "Symbol not found" }), {
      status: 404, headers: { "Content-Type": "application/json", ...cors },
    })

    const body     = JSON.stringify([result])
    const response = new Response(body, {
      headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${SEARCH_CACHE_TTL}`, "X-Cache": "MISS", ...cors },
    })
    waitUntil(caches.default.put(cacheKey, response.clone()))
    return response
  }

  // ── Watchlist — 8 individual requests, staggered to stay under rate limit ─────
  const cache    = caches.default
  const cacheKey = new Request("https://cache.mktvision.internal/indian-v7")
  const cached   = await cache.match(cacheKey)
  if (cached) {
    const data = await cached.json()
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${WATCHLIST_CACHE_TTL}`, "X-Cache": "HIT", ...cors },
    })
  }

  // Fire 4 + 4 with a gap — stays within 8/min rate limit
  const half    = Math.ceil(WATCHLIST.length / 2)
  const batchA  = await Promise.all(WATCHLIST.slice(0, half).map(s => fetchQuote(s, env.TWELVEDATA_KEY)))
  await new Promise(r => setTimeout(r, 500))
  const batchB  = await Promise.all(WATCHLIST.slice(half).map(s => fetchQuote(s, env.TWELVEDATA_KEY)))
  const results = [...batchA, ...batchB].filter(Boolean)

  if (!results.length) return new Response(JSON.stringify({ error: "Service unavailable" }), {
    status: 502, headers: { "Content-Type": "application/json", ...cors },
  })

  const body     = JSON.stringify(results)
  const response = new Response(body, {
    headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${WATCHLIST_CACHE_TTL}`, "X-Cache": "MISS", ...cors },
  })
  waitUntil(cache.put(cacheKey, response.clone()))
  return response
}
