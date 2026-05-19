const ALLOWED_SYMBOLS = new Set(["AAPL", "MSFT", "NVDA", "TSLA", "GOOGL", "AMZN"])
const MAX_SYMBOLS_PER_REQUEST = 10
const CACHE_TTL_SECONDS = 30

function buildCorsHeaders(requestOrigin, allowedOrigin) {
  const allow = allowedOrigin
    ? (requestOrigin === allowedOrigin ? requestOrigin : "null")
    : "*"
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  }
}

export async function onRequest({ request, env, waitUntil }) {
  const requestOrigin = request.headers.get("Origin") || ""
  const allowedOrigin = env.ALLOWED_ORIGIN || ""
  const cors = buildCorsHeaders(requestOrigin, allowedOrigin)

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors })
  }

  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { "Content-Type": "application/json", ...cors },
    })
  }

  if (allowedOrigin && requestOrigin && requestOrigin !== allowedOrigin) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403, headers: { "Content-Type": "application/json", ...cors },
    })
  }

  const { searchParams } = new URL(request.url)
  const symbols = (searchParams.get("symbols") || "")
    .split(",")
    .map(s => s.trim().toUpperCase().replace(/[^A-Z]/g, ""))
    .filter(s => s.length >= 1 && s.length <= 5)
    .filter(s => ALLOWED_SYMBOLS.has(s))
    .slice(0, MAX_SYMBOLS_PER_REQUEST)

  if (!symbols.length) {
    return new Response(JSON.stringify({ error: "No valid symbols" }), {
      status: 400, headers: { "Content-Type": "application/json", ...cors },
    })
  }

  if (!env.FINNHUB_KEY) {
    return new Response(JSON.stringify({ error: "Service unavailable" }), {
      status: 503, headers: { "Content-Type": "application/json", ...cors },
    })
  }

  const cacheKey = new Request(
    `https://cache.mktvision.internal/stocks?s=${[...symbols].sort().join(",")}`
  )
  const cache = caches.default
  const cached = await cache.match(cacheKey)

  if (cached) {
    const data = await cached.json()
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}`, "X-Cache": "HIT", ...cors },
    })
  }

  try {
    const quotes = await Promise.all(
      symbols.map(async sym => {
        const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${env.FINNHUB_KEY}`)
        if (!res.ok) throw new Error("upstream")
        const { c, d, dp, h, l } = await res.json()
        return { symbol: sym, price: c, change: d, pct: dp, high: h, low: l }
      })
    )

    const body = JSON.stringify(quotes)
    const response = new Response(body, {
      headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}`, "X-Cache": "MISS", ...cors },
    })

    waitUntil(cache.put(cacheKey, response.clone()))
    return response
  } catch {
    return new Response(JSON.stringify({ error: "Service unavailable" }), {
      status: 502, headers: { "Content-Type": "application/json", ...cors },
    })
  }
}
