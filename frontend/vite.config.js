import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'

// Plugin to exclude large uploaded image subdirectories from build
// Keeps essential UI images (logo-placeholder.png, og-default.png etc.)
// Removes only large vendor/association uploaded content subdirectories
function excludeLargeImageDirs() {
  // These subdirectories contain vendor-uploaded images (too large for SWA free tier)
  // Essential UI images at root of /images are kept
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
    keepNames: true
  },
  build: {
    // Warn when any single chunk exceeds 600KB; split further if needed
    chunkSizeWarningLimit: 600,
    // Enable CSS code splitting for faster per-route style loading
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // ─────────────────────────────────────────────────────────────────
        // Manual chunk splitting:
        // Heavy vendor libraries are split into separate async chunks that
        // only load when the route that needs them is first visited.
        // This dramatically reduces the initial JS bundle size and improves
        // Lighthouse FCP / LCP / TTI scores.
        // ─────────────────────────────────────────────────────────────────
        manualChunks(id) {
          // Three.js 3D engine (~580KB) — only used by 3D components
          if (id.includes('three') || id.includes('@react-three')) {
            return 'vendor-three'
          }
          // Framer Motion animation library (~140KB)
          if (id.includes('framer-motion')) {
            return 'vendor-framer'
          }
          // Recharts charting library + D3 dependencies (~300KB)
          if (id.includes('recharts') || id.includes('d3-') || id.includes('d3/')) {
            return 'vendor-charts'
          }
          // US map / geo rendering
          if (id.includes('react-simple-maps') || id.includes('topojson') || id.includes('us-atlas')) {
            return 'vendor-maps'
          }
          // Sentry error monitoring — only load after user session starts
          if (id.includes('@sentry')) {
            return 'vendor-sentry'
          }
          // React Router + React core (small, but keep together)
          if (id.includes('react-router') || id.includes('react-dom') || id.includes('/react/')) {
            return 'vendor-react'
          }
          // All remaining node_modules get grouped into a shared vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor-misc'
          }
        },
      },
    },
  },
})
