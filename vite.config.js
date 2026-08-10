import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: { enabled: false },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'MktVision — Markets Terminal & Financial Hub',
        short_name: 'MktVision',
        description: 'Bloomberg-style markets terminal with live stocks, Indian NSE, crypto and 18 free financial calculators.',
        theme_color: '#f5a623',
        background_color: '#020c18',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache the full app shell (JS/CSS/HTML/icons) so every calculator and
        // education page works offline once visited. Live-data routes (/dashboard)
        // still load from cache but their /api/* fetches are left untouched below —
        // they simply fail offline, which FinanceDashboard.jsx already handles.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        // Never let the service worker intercept or cache live market data —
        // keep those requests going straight to the network, online or not.
        runtimeCaching: [
          {
            urlPattern: /^\/api\//,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/api\.coingecko\.com\//,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
})
