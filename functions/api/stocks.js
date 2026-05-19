// ─── Symbol validation ────────────────────────────────────────────────────────
// Format check only (1–6 uppercase letters) — supports search results for any
// valid US ticker. Origin check (ALLOWED_ORIGIN env var) is the security layer
// that prevents external abuse of this endpoint.
const isValidSymbol       = s => /^[A-Z]{1,6}$/.test(s)
const MAX_SYMBOLS_PER_REQUEST = 10
const CACHE_TTL_SECONDS = 30

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Set ALLOWED_ORIGIN in Cloudflare Pages → Settings → Environment Variables
// to your Pages URL (e.g. https://mktvision.pages.dev).
// If unset, falls back to * — fine for dev, tighten before launch.
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

// ─── Handler ──────────────────────────────────────────────────────────────────
export async function onRequest({ request, env, waitUntil }) {
  const requestOrigin = request.headers.get("Origin") || ""
  const allowedOrigin = env.ALLOWED_ORIGIN || ""
  const cors = buildCorsHeaders(requestOrigin, allowedOrigin)

  // Preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors })
  }

  // Method guard
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...cors },
    })
  }

  // Origin check — block cross-origin requests when ALLOWED_ORIGIN is configured
  if (allowedOrigin && requestOrigin && requestOrigin !== allowedOrigin) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json", ...cors },
    })
  }

  // ── Input validation ────────────────────────────────────────────────────────
  const { searchParams } = new URL(request.url)
  const symbols = (searchParams.get("symbols") || "")
    .split(",")
    .map(s => s.trim().toUpperCase().replace(/[^A-Z]/g, "")) // strip non-alpha
    .filter(isValidSymbol)                                   // format gate
    .slice(0, MAX_SYMBOLS_PER_REQUEST)                       // hard cap

  if (!symbols.length) {
    return new Response(JSON.stringify({ error: "No valid symbols" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...cors },
    })
  }

  // Fail vaguely — never reveal whether the key exists or what went wrong internally
  if (!env.FINNHUB_KEY) {
    return new Response(JSON.stringify({ error: "Service unavailable" }), {
      status: 503,
      headers: { "Content-Type": "application/json", ...cors },
    })
  }

  // ── Workers Cache API (server-side) ─────────────────────────────────────────
  // Sorted so AAPL,MSFT and MSFT,AAPL hit the same cache entry.
  const cacheKey = new Request(
    `https://cache.mktvision.internal/stocks?s=${[...symbols].sort().join(",")}`
  )
  const cache = caches.default
  const cached = await cache.match(cacheKey)

  if (cached) {
    const data = await cached.json()
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}`,
        "X-Cache": "HIT",
        ...cors,
      },
    })
  }

  // ── Finnhub fetch ────────────────────────────────────────────────────────────
  try {
    const quotes = await Promise.all(
      symbols.map(async sym => {
        const res = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${sym}&token=${env.FINNHUB_KEY}`
        )
        if (!res.ok) throw new Error("upstream")
        const { c, d, dp, h, l } = await res.json()
        // Return only what the dashboard needs — don't forward raw Finnhub shape
        return { symbol: sym, price: c, change: d, pct: dp, high: h, low: l }
      })
    )

    const body = JSON.stringify(quotes)

    const response = new Response(body, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}`,
        "X-Cache": "MISS",
        ...cors,
      },
    })

    // Populate cache without blocking the response
    waitUntil(cache.put(cacheKey, response.clone()))

    return response
  } catch {
    // Intentionally vague — don't leak upstream error details
    return new Response(JSON.stringify({ error: "Service unavailable" }), {
      status: 502,
      headers: { "Content-Type": "application/json", ...cors },
    })
  }
}
