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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, info: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    this.setState({ info })
    console.error('[ErrorBoundary]', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'monospace', background: '#fff', color: '#333', minHeight: '100vh' }}>
          <h1 style={{ color: 'red' }}>⚠ React Error (Blank Page Diagnosed)</h1>
          <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.toString()}
            {'\n\n'}
            {this.state.info?.componentStack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
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
  </React.StrictMode>,
)
