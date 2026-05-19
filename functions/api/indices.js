// Finnhub free tier doesn't support ^GSPC etc. — use ETF proxies instead.
// SPY tracks S&P 500, QQQ tracks NASDAQ, DIA tracks DOW.
// We only display % change (not absolute value) since ETF price ≠ index value.
const INDICES = [
  { name: "S&P 500", symbol: "SPY"  },
  { name: "NASDAQ",  symbol: "QQQ"  },
  { name: "DOW",     symbol: "DIA"  },
  { name: "VIX",     symbol: "UVXY" }, // volatility ETF proxy
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
  if (!env.FINNHUB_KEY) {
    return new Response(JSON.stringify({ error: "Service unavailable" }), {
      status: 503, headers: { "Content-Type": "application/json", ...cors },
    })
  }

  const cache    = caches.default
  const cacheKey = new Request("https://cache.mktvision.internal/indices-v2")
  const cached   = await cache.match(cacheKey)
  if (cached) {
    const data = await cached.json()
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${CACHE_TTL}`, "X-Cache": "HIT", ...cors },
    })
  }

  try {
    const results = await Promise.all(
      INDICES.map(async ({ name, symbol }) => {
        const r = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${env.FINNHUB_KEY}`
        )
        if (!r.ok) throw new Error("upstream")
        const { c, dp } = await r.json()
        return { name, val: c || 0, pct: dp || 0 }
      })
    )

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
