/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { manifest } from './src/core/pwa/manifest'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }
            }
          }
        ]
      },
      manifest,
    })
  ],
  server: {
    proxy: { '/api': 'http://localhost:3000' },
    allowedHosts: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
    // Node 25 and later define their own localStorage global, which hides jsdom's and is undefined
    // unless --localstorage-file is given. The app only ever runs in a browser, so tests turn Node's off.
    poolOptions: { forks: { execArgv: ['--no-experimental-webstorage'] } },
  }
})
