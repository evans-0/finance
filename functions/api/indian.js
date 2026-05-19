// Watchlist: Twelve Data (authenticated, reliable for top 10)
// Search / single lookup: Yahoo Finance (covers ALL NSE stocks, no key needed)

const WATCHLIST = [
  "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK",
  "HINDUNILVR", "SBIN", "BHARTIARTL", "WIPRO", "ITC",
]

const CACHE_TTL = 60

function corsHeaders(origin, allowed) {
  return {
    "Access-Control-Allow-Origin": allowed ? (origin === allowed ? origin : "null") : "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Vary": "Origin",
  }
}

function parseTwelveQuote(symbol, q) {
  if (!q || q.status === "error" || q.code) return null
  const price = parseFloat(q.close) || parseFloat(q.previous_close) || 0
  if (!price) return null
  const prev = parseFloat(q.previous_close) || price
  const pct  = q.percent_change ? parseFloat(q.percent_change) : prev ? ((price - prev) / prev) * 100 : 0
  return {
    symbol, name: q.name || symbol,
    price: +price.toFixed(2), change: +(price - prev).toFixed(2),
    pct: +pct.toFixed(4), high: parseFloat(q.high) || null, low: parseFloat(q.low) || null,
    exchange: "NSE",
  }
}

async function fetchYahooQuote(symbol) {
  // Yahoo Finance uses SYMBOL.NS format for NSE stocks
  const yahooSym = symbol.endsWith(".NS") ? symbol : `${symbol}.NS`
  const r = await fetch(
    `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(yahooSym)}`,
    { headers: { "User-Agent": "Mozilla/5.0" } }
  )
  if (!r.ok) return null
  const data = await r.json()
  const q    = data?.quoteResponse?.result?.[0]
  if (!q || !q.regularMarketPrice) return null

  const baseSymbol = symbol.replace(/\.NS$/i, "")
  return {
    symbol:   baseSymbol,
    name:     q.shortName || q.longName || baseSymbol,
    price:    +q.regularMarketPrice.toFixed(2),
    change:   +(q.regularMarketChange || 0).toFixed(2),
    pct:      +(q.regularMarketChangePercent || 0).toFixed(4),
    high:     q.regularMarketDayHigh   || null,
    low:      q.regularMarketDayLow    || null,
    exchange: "NSE",
  }
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

  const { searchParams } = new URL(request.url)
  const rawSymbol = searchParams.get("symbol")

  // ── Single symbol lookup (search) — Yahoo Finance, covers ALL NSE stocks ─────
  if (rawSymbol) {
    const symbol = rawSymbol.trim().toUpperCase().replace(/[^A-Z0-9.]/g, "").slice(0, 25)
    if (!symbol) {
      return new Response(JSON.stringify({ error: "Invalid symbol" }), {
        status: 400, headers: { "Content-Type": "application/json", ...cors },
      })
    }

    const cacheKey = new Request(`https://cache.mktvision.internal/yahoo-${symbol}`)
    const cached   = await caches.default.match(cacheKey)
    if (cached) {
      const data = await cached.json()
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${CACHE_TTL}`, "X-Cache": "HIT", ...cors },
      })
    }

    const result = await fetchYahooQuote(symbol)
    if (!result) {
      return new Response(JSON.stringify({ error: "Symbol not found" }), {
        status: 404, headers: { "Content-Type": "application/json", ...cors },
      })
    }

    const body     = JSON.stringify([result])
    const response = new Response(body, {
      headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${CACHE_TTL}`, "X-Cache": "MISS", ...cors },
    })
    waitUntil(caches.default.put(cacheKey, response.clone()))
    return response
  }

  // ── Watchlist — Twelve Data batch (authenticated, reliable) ──────────────────
  if (!env.TWELVEDATA_KEY) {
    return new Response(JSON.stringify({ error: "Service unavailable" }), {
      status: 503, headers: { "Content-Type": "application/json", ...cors },
    })
  }

  const cache    = caches.default
  const cacheKey = new Request("https://cache.mktvision.internal/indian-v5")
  const cached   = await cache.match(cacheKey)
  if (cached) {
    const data = await cached.json()
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${CACHE_TTL}`, "X-Cache": "HIT", ...cors },
    })
  }

  try {
    const r = await fetch(
      `https://api.twelvedata.com/quote?symbol=${WATCHLIST.join(",")}&exchange=NSE&apikey=${env.TWELVEDATA_KEY}`
    )
    if (!r.ok) throw new Error("upstream")
    const data    = await r.json()
    const results = WATCHLIST
      .map(sym => parseTwelveQuote(sym, data[sym] || (data.symbol === sym ? data : null)))
      .filter(Boolean)

    // Fall back to Yahoo Finance for any that Twelve Data missed
    const missing = WATCHLIST.filter(sym => !results.find(r => r.symbol === sym))
    if (missing.length) {
      const fallbacks = await Promise.all(missing.map(fetchYahooQuote))
      results.push(...fallbacks.filter(Boolean))
    }

    if (!results.length) throw new Error("no data")

    const body     = JSON.stringify(results)
    const response = new Response(body, {
      headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${CACHE_TTL}`, "X-Cache": "MISS", ...cors },
    })
    waitUntil(cache.put(cacheKey, response.clone()))
    return response
  } catch {
    return new Response(JSON.stringify({ error: "Service unavailable" }), {
      status: 502, headers: { "Content-Type": "application/json", ...cors },
    })
  }
}
