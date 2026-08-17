import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'

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
          // All other node_modules go into a generic vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor-misc'
          }
        },
      },
    },
  },
})
