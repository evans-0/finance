// AMFI Mutual Fund NAV lookup
// Fetches NAVAll.txt (~3MB), caches for 24h, searches by fund name

const AMFI_URL   = 'https://portal.amfiindia.com/spages/NAVAll.txt'
const CACHE_TTL  = 86400  // 24 hours — AMFI updates once daily

function corsHeaders(origin, allowed) {
  return {
    'Access-Control-Allow-Origin': allowed ? (origin === allowed ? origin : 'null') : '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Vary': 'Origin',
  }
}

function parseAMFI(text) {
  const funds = []
  const lines = text.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || !trimmed.includes(';')) continue
    const parts = trimmed.split(';')
    if (parts.length < 6) continue
    const code = parts[0].trim()
    const name = parts[3].trim()
    const nav  = parseFloat(parts[4])
    const date = parts[5].trim()
    if (!code || !name || isNaN(nav) || nav <= 0) continue
    funds.push({ code, name, nav, date })
  }
  return funds
}

export async function onRequest({ request, env, waitUntil }) {
  const origin  = request.headers.get('Origin') || ''
  const allowed = env.ALLOWED_ORIGIN || ''
  const cors    = corsHeaders(origin, allowed)

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
  if (allowed && origin && origin !== allowed) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403, headers: { 'Content-Type': 'application/json', ...cors }
    })
  }

  const { searchParams } = new URL(request.url)
  const q     = (searchParams.get('q') || '').trim().toLowerCase().slice(0, 100)
  const code  = (searchParams.get('code') || '').trim().replace(/\D/g, '').slice(0, 10)
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

  if (!q && !code) {
    return new Response(JSON.stringify({ error: 'q or code required' }), {
      status: 400, headers: { 'Content-Type': 'application/json', ...cors }
    })
  }

  // Try cache first
  const cacheKey = new Request('https://cache.mktvision.internal/amfi-nav-all')
  let allFunds = null

  try {
    const cached = await caches.default.match(cacheKey)
    if (cached) {
      allFunds = await cached.json()
    }
  } catch {}

  if (!allFunds) {
    try {
      const r = await fetch(AMFI_URL, { redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'text/plain,*/*', 'Referer': 'https://www.amfiindia.com/' } })
      if (!r.ok) throw new Error('AMFI fetch failed: ' + r.status)
      const text = await r.text()
      allFunds = parseAMFI(text)
      // Cache the parsed array
      const cacheResp = new Response(JSON.stringify(allFunds), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${CACHE_TTL}` }
      })
      waitUntil(caches.default.put(cacheKey, cacheResp))
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message, funds: [] }), {
        status: 502, headers: { 'Content-Type': 'application/json', ...cors }
      })
    }
  }

  // Search
  let results
  if (code) {
    results = allFunds.filter(f => f.code === code)
  } else {
    const terms = q.split(' ').filter(Boolean)
    results = allFunds.filter(f => {
      const name = f.name.toLowerCase()
      return terms.every(t => name.includes(t))
    }).slice(0, limit)
  }

  return new Response(JSON.stringify({ funds: results, total: results.length, date: results[0]?.date || '' }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600', ...cors }
  })
}
