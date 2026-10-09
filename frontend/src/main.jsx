import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './contexts/AuthContext'
import { CMSProvider } from './contexts/CMSContext'
import { PermissionProvider } from './contexts/PermissionContext'
import { NotificationProvider } from './components/common/EnterpriseNotifications'
import { CartProvider } from './contexts/CartContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import App from './App.jsx'
import './index.css'

// ── Stale Asset Recovery ────────────────────────────────────────────────────
// When a new build is deployed, old sessions reference hashed chunks that no
// longer exist. Vite fires 'vite:preloadError' when a dynamic import fails.
// We reload ONCE per session to pick up the latest index.html and fresh assets.
// A sessionStorage guard prevents infinite reload loops.
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  const RELOAD_KEY = 'jynm_preload_reload'
  if (!sessionStorage.getItem(RELOAD_KEY)) {
    sessionStorage.setItem(RELOAD_KEY, '1')
    window.location.reload()
  } else {
    // Second failure — show a graceful recovery message instead of looping
    console.error('[JYNM] Dynamic import failed after recovery attempt. Please hard-refresh (Ctrl+Shift+R).', event.payload)
  }
})

import ErrorBoundary from './components/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <NotificationProvider>
            <AuthProvider>
              <CMSProvider>
                <PermissionProvider>
                  <FavoritesProvider>
                    <CartProvider>
                      <App />
                    </CartProvider>
                  </FavoritesProvider>
                </PermissionProvider>
              </CMSProvider>
            </AuthProvider>
          </NotificationProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
