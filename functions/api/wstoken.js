// Serves the Finnhub key for WebSocket connections
// Key is not in the client bundle — fetched at runtime, origin-locked
function corsHeaders(origin, allowed) {
  return {
    "Access-Control-Allow-Origin": allowed ? (origin === allowed ? origin : "null") : "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Vary": "Origin",
  }
}

export async function onRequest({ request, env }) {
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
    return new Response(JSON.stringify({ error: "unavailable" }), {
      status: 503, headers: { "Content-Type": "application/json", ...cors },
    })
  }

  return new Response(JSON.stringify({ token: env.FINNHUB_KEY }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",  // never cache — always fresh token
      ...cors,
    },
  })
}
