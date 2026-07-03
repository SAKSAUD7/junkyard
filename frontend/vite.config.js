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
    port: 3000,
    strictPort: true,
    host: true,
    hmr: {
      clientPort: 3000,
    },
    watch: {
      usePolling: true,
    }
  },
  esbuild: {
    keepNames: true
  }
})
