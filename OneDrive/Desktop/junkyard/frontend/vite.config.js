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
    // Don't generate sourcemaps in production (reduces bundle size)
    sourcemap: false,
    // Split CSS per chunk for better caching
    cssCodeSplit: true,
    // Warn if any single chunk exceeds 1000KB (Three.js and Charts are unavoidably large)
    chunkSizeWarningLimit: 1000,
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
          // Three.js + 3D libs — heaviest chunk, load only when needed
          if (id.includes('node_modules/three') ||
              id.includes('node_modules/@react-three')) {
            return 'vendor-three'
          }
          // Let Vite handle d3, recharts, and maps automatically to prevent Rollup minification bugs
          // Sentry error tracking — separate so it doesn't block app
          if (id.includes('node_modules/@sentry')) {
            return 'vendor-sentry'
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
