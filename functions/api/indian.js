// Indian stocks via Twelve Data (free tier: 800 req/day, 8 req/min)
// Symbols: RELIANCE, TCS, INFY, HDFCBANK etc. — no suffix needed, exchange=NSE

const INDIAN_STOCKS = [
  "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK",
  "HINDUNILVR", "SBIN", "BHARTIARTL", "WIPRO", "ITC"
]

const CACHE_TTL = 60

function corsHeaders(origin, allowed) {
  return {
    "Access-Control-Allow-Origin": allowed ? (origin === allowed ? origin : "null") : "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Vary": "Origin",
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

  if (!env.TWELVEDATA_KEY) {
    return new Response(JSON.stringify({ error: "Service unavailable" }), {
      status: 503, headers: { "Content-Type": "application/json", ...cors },
    })
  }

  const cache    = caches.default
  const cacheKey = new Request("https://cache.mktvision.internal/indian")
  const cached   = await cache.match(cacheKey)

  if (cached) {
    const data = await cached.json()
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${CACHE_TTL}`, "X-Cache": "HIT", ...cors },
    })
  }

  try {
    // Twelve Data supports batch requests — fetch all in one call
    const symbols = INDIAN_STOCKS.join(",")
    const r = await fetch(
      `https://api.twelvedata.com/quote?symbol=${symbols}&exchange=NSE&apikey=${env.TWELVEDATA_KEY}`
    )
    if (!r.ok) throw new Error("upstream")
    const data = await r.json()

    // Batch response: keyed by symbol when multiple, direct object when one
    const results = INDIAN_STOCKS.map(sym => {
      const q = data[sym] || data  // fallback for single-symbol response
      if (!q || q.status === "error" || !q.close) return null
      const price  = parseFloat(q.close)
      const prev   = parseFloat(q.previous_close)
      const change = price - prev
      const pct    = prev ? (change / prev) * 100 : 0
      return {
        symbol: sym,
        name: q.name || sym,
        price: +price.toFixed(2),
        change: +change.toFixed(2),
        pct: +pct.toFixed(4),
        high: parseFloat(q.high),
        low:  parseFloat(q.low),
        exchange: "NSE",
      }
    }).filter(Boolean)

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
