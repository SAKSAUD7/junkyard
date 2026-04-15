import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home'
import Search from './pages/Search'
import BrowseStates from './pages/BrowseStates'
import BrowseState from './pages/BrowseState'
import JunkyardDetail from './pages/JunkyardDetail'
import AllVendors from './pages/AllVendors'
import VendorDetail from './pages/VendorDetail'
import QuoteRequest from './pages/QuoteRequest'
import AddYardPage from './pages/AddYardPage'
import About from './pages/About'
import Contact from './pages/Contact'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import HowItWorks from './pages/HowItWorks'
import FAQ from './pages/FAQ'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import Profile from './pages/Profile'

// Auth Components
import ProtectedRoute from './components/ProtectedRoute'

// Vendor Portal Imports
import { VendorAuthProvider } from './contexts/VendorAuthContext'
import ProtectedVendorRoute from './components/vendor/ProtectedRoute'
import VendorLayout from './layouts/VendorLayout'
import VendorLogin from './pages/vendor/Login'
import VendorForgotPassword from './pages/vendor/ForgotPassword'
import VendorDashboard from './pages/vendor/Dashboard'
import VendorProfile from './pages/vendor/Profile'
import VendorInventory from './pages/vendor/Inventory'
import VendorLeads from './pages/vendor/Leads'
import VendorLeadDetail from './pages/vendor/LeadDetail'
import VendorNotifications from './pages/vendor/Notifications'
import VendorAds from './pages/vendor/Ads'

// Admin Portal Imports
import AdminProtectedRoute from './components/admin/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminMessages from './pages/admin/Messages'
import AdminLeads from './pages/admin/Leads'
import AdminVendorLeads from './pages/admin/VendorLeads'
import AdminYardSubmissions from './pages/admin/YardSubmissions'
import AdminVendors from './pages/admin/Vendors'
import AdminAds from './pages/admin/Ads'
import AdminSettings from './pages/admin/Settings'

// Blog imports
import BlogList from './pages/blog/BlogList'
import BlogDetail from './pages/blog/BlogDetail'
import AdminBlogList from './pages/admin/blog/BlogList'
import AdminBlogEditor from './pages/admin/blog/BlogEditor'

// ─────────────────────────────────────────────────────────────────────────────
// SEO: Pattern-based redirect for ALL legacy /junkyards/* URLs (5200+ routes)
// Replaces the old staticwebapp.config.json routes that exceeded Azure's 100KB limit
// Pattern 1: /junkyards/:state           → /browse/:state
// Pattern 2: /junkyards/:state/:slug     → /vendors/:slug
// ─────────────────────────────────────────────────────────────────────────────
function JunkyardRedirect() {
  const location = useLocation()
  const parts = location.pathname.replace(/^\/junkyards\//, '').split('/')
  // If there's a vendor slug (2 parts: state + slug) → /vendors/:slug
  if (parts.length >= 2 && parts[1]) {
    return <Navigate to={`/vendors/${parts[1]}`} replace />
  }
  // Otherwise state-level → /browse/:state
  return <Navigate to={`/browse/${parts[0]}`} replace />
}

function ScrollObserver() {
  const location = useLocation()

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible')
        }
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })

    const timeout = setTimeout(() => {
      document.querySelectorAll('.scroll-fade-in').forEach(el => observer.observe(el))
    }, 100)

    return () => {
      clearTimeout(timeout)
      observer.disconnect()
    }
  }, [location.pathname])

  return null
}

function App() {
  return (
    <>
      <ScrollObserver />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/quote" element={<QuoteRequest />} />

        {/* Auth Routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/login" element={<SignIn />} />

        {/* Protected Routes */}
        <Route path="/add-a-yard" element={
          <ProtectedRoute>
            <AddYardPage />
          </ProtectedRoute>
        } />

        <Route path="/vendors" element={<AllVendors />} />
        <Route path="/junkyards" element={<Navigate to="/vendors" replace />} /> {/* Legacy SEO Redirect */}
        <Route path="/vendors/:id" element={<VendorDetail />} />
        <Route path="/browse" element={<BrowseStates />} />
        <Route path="/browse/:state" element={<BrowseState />} />
        <Route path="/junkyard/:id" element={<JunkyardDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/about-us" element={<Navigate to="/about" replace />} /> {/* Legacy SEO Redirect */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/faq" element={<FAQ />} />

        {/* ── Legacy SEO Redirects (covers all 5200+ /junkyards/* URLs) ── */}
        <Route path="/junkyards-by-location" element={<Navigate to="/browse" replace />} />
        <Route path="/junkyards/:state" element={<JunkyardRedirect />} />
        <Route path="/junkyards/:state/:vendorSlug" element={<JunkyardRedirect />} />
        {/* Other legacy static redirects */}
        <Route path="/terms-and-conditions" element={<Navigate to="/terms" replace />} />
        <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />

        {/* Blog Routes */}
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        {/* Vendor Portal Routes */}
        <Route path="/vendor/login" element={
          <VendorAuthProvider>
            <VendorLogin />
          </VendorAuthProvider>
        } />
        <Route path="/vendor/forgot-password" element={
          <VendorAuthProvider>
            <VendorForgotPassword />
          </VendorAuthProvider>
        } />

        {/* Protected Vendor Routes */}
        <Route path="/vendor/*" element={
          <VendorAuthProvider>
            <ProtectedVendorRoute>
              <VendorLayout />
            </ProtectedVendorRoute>
          </VendorAuthProvider>
        }>
          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="profile" element={<VendorProfile />} />
          <Route path="inventory" element={<VendorInventory />} />
          <Route path="leads" element={<VendorLeads />} />
          <Route path="leads/:id" element={<VendorLeadDetail />} />
          <Route path="notifications" element={<VendorNotifications />} />
          <Route path="ads" element={<VendorAds />} />
        </Route>

        {/* Admin Portal Routes */}
        <Route path="/admin-portal/*" element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="leads" element={<AdminLeads />} />
          <Route path="vendor-leads" element={<AdminVendorLeads />} />
          <Route path="yard-submissions" element={<AdminYardSubmissions />} />
          <Route path="vendors" element={<AdminVendors />} />
          <Route path="ads" element={<AdminAds />} />
          <Route path="settings" element={<AdminSettings />} />
          {/* Blog Management */}
          <Route path="blog" element={<AdminBlogList />} />
          <Route path="blog/new" element={<AdminBlogEditor />} />
          <Route path="blog/edit/:id" element={<AdminBlogEditor />} />
          {/* Default redirect to dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
