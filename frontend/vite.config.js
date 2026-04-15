import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'

// Plugin to exclude large image directories from build
function excludePublicDirs(dirsToExclude) {
  return {
    name: 'exclude-public-dirs',
    closeBundle() {
      dirsToExclude.forEach(dir => {
        const fullPath = resolve(__dirname, 'dist', dir)
        if (fs.existsSync(fullPath)) {
          fs.rmSync(fullPath, { recursive: true, force: true })
          console.log(`Removed ${dir} from dist (too large for Azure SWA free tier)`)
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    excludePublicDirs(['images']),
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
  }
})
