import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'

// ── Critical CSS Inliner Plugin ───────────────────────────────────────────────
// This plugin post-processes index.html after build to:
//  1. Find the <link rel="stylesheet"> Vite injected for the main CSS bundle
//  2. Convert it to load asynchronously (non-render-blocking)
//  3. Inline minimal critical CSS directly in <head> so the page is usable immediately
function deferNonCriticalCSS() {
  return {
    name: 'defer-non-critical-css',
    apply: 'build',
    transformIndexHtml(html) {
      // Critical CSS — only what hero + body needs before JS loads
      const criticalCSS = `
        *,*::before,*::after{box-sizing:border-box}
        html,body{margin:0;padding:0;background:#060c14;color:#e8f0fe;font-family:system-ui,-apple-system,sans-serif;overflow-x:hidden}
        #root{min-height:100vh;background:#060c14}
        .spinner-glow{width:52px;height:52px;border-radius:50%;border:2px solid rgba(37,99,235,.15);border-top-color:#2563eb;animation:spin .85s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
      `
      // Convert Vite's injected stylesheet to non-blocking + add onload fallback
      html = html.replace(
        /(<link rel="stylesheet" crossorigin href="\/assets\/index-[^"]+\.css">)/,
        (match, linkTag) => {
          const href = linkTag.match(/href="([^"]+)"/)[1]
          return `<style id="critical-css">${criticalCSS}</style>
    <link rel="preload" as="style" href="${href}" onload="this.onload=null;this.rel='stylesheet'">
    <noscript>${linkTag}</noscript>`
        }
      )
      return html
    }
  }
}

// Plugin to exclude large uploaded image subdirectories from build
// Keeps essential UI images (logo-placeholder.png, og-default.png etc.)
// Removes only large vendor/association uploaded content subdirectories
function excludeLargeImageDirs() {
  const subdirsToRemove = ['vendors', 'associations', 'temp', 'ads', 'yard_submissions']
  return {
    name: 'exclude-large-image-dirs',
    closeBundle() {
      subdirsToRemove.forEach(subdir => {
        const fullPath = resolve(__dirname, 'dist', 'images', subdir)
        if (fs.existsSync(fullPath)) {
          fs.rmSync(fullPath, { recursive: true, force: true })
          console.log(`Removed dist/images/${subdir} (served from Azure Blob Storage instead)`)
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    deferNonCriticalCSS(),
    excludeLargeImageDirs(),
  ],
  server: {
    host: true,
    watch: {
      usePolling: true,
    }
  },
  esbuild: {
    // Remove console.log and debugger statements in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  build: {
    // Disable module preloading to stop Vite from injecting <link rel="modulepreload"> 
    // for huge lazy chunks like vendor-three.js on the home page.
    modulePreload: false,
    // Target modern browsers — eliminates large legacy polyfills
    target: 'es2020',
    // Don't generate sourcemaps in production (reduces bundle size)
    sourcemap: false,
    // Use esbuild minifier (built-in, fastest, no extra dependency)
    minify: 'esbuild',
    // Split CSS per chunk for better caching
    cssCodeSplit: true,
    cssMinify: true,
    // Warn if any single chunk exceeds 800KB
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // ── Manual Chunk Splitting ─────────────────────────────────────────
        // Split large vendor libraries into their own cached files.
        // Benefit: if we update app code, users only re-download the app chunk,
        // not React or animation libraries (which never change).
        manualChunks(id) {
          // React core — very stable, cache forever
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-is/')) {
            return 'vendor-react'
          }
          // React Router — changes infrequently
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router'
          }
          // Framer Motion — large animation library
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion'
          }
          // Three.js + 3D libs — heaviest chunk, only needed on 3D pages
          if (id.includes('node_modules/three') ||
              id.includes('node_modules/@react-three')) {
            return 'vendor-three'
          }
          // D3 — data visualization, large but only used in charts
          if (id.includes('node_modules/d3') ||
              id.includes('node_modules/d3-')) {
            return 'vendor-d3'
          }
          // Recharts — charting library (split from vendor-misc)
          if (id.includes('node_modules/recharts') ||
              id.includes('node_modules/victory-')) {
            return 'vendor-charts'
          }
          // Maps: react-simple-maps, topojson — only used on Browse States
          if (id.includes('node_modules/react-simple-maps') ||
              id.includes('node_modules/topojson') ||
              id.includes('node_modules/d3-geo') ||
              id.includes('node_modules/d3-scale') ||
              id.includes('node_modules/us-atlas') ||
              id.includes('node_modules/leaflet') ||
              id.includes('node_modules/react-leaflet')) {
            return 'vendor-maps'
          }
          // Sentry error tracking — separate so it doesn't block app
          if (id.includes('node_modules/@sentry') ||
              id.includes('node_modules/@sentry/react') ||
              id.includes('node_modules/@sentry/core') ||
              id.includes('node_modules/@sentry/hub') ||
              id.includes('node_modules/@sentry/browser')) {
            return 'vendor-sentry'
          }
          // Rich text editor — only needed on vendor/admin pages
          if (id.includes('node_modules/react-quill') ||
              id.includes('node_modules/quill')) {
            return 'vendor-quill'
          }
          // Axios + query utils — used everywhere but small, isolate for caching
          if (id.includes('node_modules/axios')) {
            return 'vendor-axios'
          }
          // Google reCAPTCHA — only loaded on forms
          if (id.includes('node_modules/react-google-recaptcha') ||
              id.includes('node_modules/react-async-script')) {
            return 'vendor-recaptcha'
          }
          // Heroicons — icon library, cache separately
          if (id.includes('node_modules/@heroicons')) {
            return 'vendor-icons'
          }
          // Sentry — async error tracking, keep isolated
          if (id.includes('node_modules/@sentry')) {
            return 'vendor-sentry'
          }
          // Windowing / intersection observer utils  
          if (id.includes('node_modules/react-window') ||
              id.includes('node_modules/react-intersection-observer')) {
            return 'vendor-ui-utils'
          }
          // All remaining node_modules
          if (id.includes('node_modules')) {
            return 'vendor-misc'
          }
        },
      },
    },
  },
})
