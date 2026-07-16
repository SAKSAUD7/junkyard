import { lazy, Suspense, useState } from 'react'
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import PageTransition from './components/PageTransition'

// Eagerly loaded (critical path)
import Home from './pages/Home'
import FloatingLeadWidget from './components/FloatingLeadWidget'
import GlobalFAB from './components/GlobalFAB'

// Lazily loaded pages — split into separate chunks
const Search       = lazy(() => import('./pages/Search'))
const BrowseStates = lazy(() => import('./pages/BrowseStates'))
const BrowseState  = lazy(() => import('./pages/BrowseState'))
const AllVendors   = lazy(() => import('./pages/AllVendors'))
const VendorDetail = lazy(() => import('./pages/VendorDetail'))
const QuoteRequest = lazy(() => import('./pages/QuoteRequest'))
const AddYardStart = lazy(() => import('./pages/AddYardStart'))
const AddYardPage  = lazy(() => import('./pages/AddYardPage'))
const AdminLogin   = lazy(() => import('./pages/AdminLogin'))
const About        = lazy(() => import('./pages/About'))
const Contact      = lazy(() => import('./pages/Contact'))
const Privacy      = lazy(() => import('./pages/Privacy'))
const Terms        = lazy(() => import('./pages/Terms'))
const HowItWorks   = lazy(() => import('./pages/HowItWorks'))
const FAQ          = lazy(() => import('./pages/FAQ'))
const SignIn       = lazy(() => import('./pages/SignIn'))
const SignUp       = lazy(() => import('./pages/SignUp'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Profile      = lazy(() => import('./pages/Profile'))

// Auth Components
import ProtectedRoute from './components/ProtectedRoute'

// Vendor Portal Imports
import { VendorAuthProvider } from './contexts/VendorAuthContext'
import ProtectedVendorRoute from './components/vendor/ProtectedRoute'
import VendorLayout from './layouts/VendorLayout'
const VendorLogin = lazy(() => import('./pages/vendor/Login'))
const VendorSignUp = lazy(() => import('./pages/vendor/SignUp'))
const VendorForgotPassword = lazy(() => import('./pages/vendor/ForgotPassword'))
const VendorDashboard = lazy(() => import('./pages/vendor/Dashboard'))
const VendorProfile = lazy(() => import('./pages/vendor/Profile'))
const VendorInventory = lazy(() => import('./pages/vendor/Inventory'))
const VendorLeads = lazy(() => import('./pages/vendor/Leads'))
const VendorLeadDetail = lazy(() => import('./pages/vendor/LeadDetail'))
const VendorNotifications = lazy(() => import('./pages/vendor/Notifications'))
const VendorAds = lazy(() => import('./pages/vendor/Ads'))

// Admin Portal Imports
import AdminProtectedRoute from './components/admin/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminMessages = lazy(() => import('./pages/admin/Messages'))
const AdminLeads = lazy(() => import('./pages/admin/Leads'))
const AdminVendorLeads = lazy(() => import('./pages/admin/VendorLeads'))
const AdminYardSubmissions = lazy(() => import('./pages/admin/YardSubmissions'))
const AdminVendors = lazy(() => import('./pages/admin/Vendors'))
const AdminAds = lazy(() => import('./pages/admin/Ads'))
const AdminSettings = lazy(() => import('./pages/admin/Settings'))
const AdminCMS = lazy(() => import('./pages/admin/CMS'))
const AdminRoles = lazy(() => import('./pages/admin/Roles'))
const AdminPartPricing = lazy(() => import('./pages/admin/PartPricing'))
const AdminFeedback = lazy(() => import('./pages/admin/FeedbackAdmin'))

// Blog imports
const BlogList = lazy(() => import('./pages/blog/BlogList'))
const BlogDetail = lazy(() => import('./pages/blog/BlogDetail'))
const AdminBlogList = lazy(() => import('./pages/admin/blog/BlogList'))
const AdminBlogEditor = lazy(() => import('./pages/admin/blog/BlogEditor'))
const NotFound = lazy(() => import('./pages/NotFound'))
const FeedbackWidget = lazy(() => import('./components/FeedbackWidget'))

// Page load spinner (minimal, no deps)
function PageSpinner() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base, #0a0f18)',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '3px solid rgba(37,99,235,0.15)',
          borderTopColor: '#2563eb',
          animation: 'spin 0.75s linear infinite',
        }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy URL Components removed as we now render them natively.


function ScrollObserver() {
  const location = useLocation()

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible')
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })

    const timeout = setTimeout(() => {
      document.querySelectorAll('.scroll-fade-in').forEach(el => observer.observe(el))
    }, 100)

    return () => { clearTimeout(timeout); observer.disconnect() }
  }, [location.pathname])

  return null
}

function RedirectVendorSlug() {
  const params = useParams();
  return <Navigate to={`/junkyards/unknown/${params.slug}`} replace />;
}

function RedirectBrowseState() {
  const params = useParams();
  return <Navigate to={`/junkyards/${params.state}`} replace />;
}

function App() {
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  return (
    <MotionConfig reducedMotion="user">
      <ScrollObserver />
      <FloatingLeadWidget />
      <GlobalFAB onOpenFeedback={() => setFeedbackOpen(true)} />
      <Suspense fallback={<PageSpinner />}>
        <FeedbackWidget externalOpen={feedbackOpen} onExternalClose={() => setFeedbackOpen(false)} />
        <PageTransition>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/quote" element={<QuoteRequest />} />

            {/* Auth Routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            {/* Protected Public Routes (Uses Modal for auth instead of redirect) */}
            <Route path="/add-a-yard" element={
              <VendorAuthProvider>
                <AddYardStart />
              </VendorAuthProvider>
            } />
            <Route path="/add-a-yard/form" element={
              <VendorAuthProvider>
                <AddYardPage />
              </VendorAuthProvider>
            } />

            {/* Protected Routes */}

            {/* Legacy SEO Native Routes - these perfectly match final_working_urls.csv */}
            <Route path="/junkyards" element={<AllVendors />} />
            <Route path="/junkyards-by-location" element={<BrowseStates />} />
            <Route path="/junkyards/:state" element={<BrowseState />} />
            <Route path="/junkyards/:state/:slug" element={<VendorDetail />} />
            <Route path="/junkyard/:slug" element={<VendorDetail />} />

            {/* Backwards compatibility for paths that temporarily used /vendors or /browse */}
            <Route path="/vendors" element={<Navigate to="/junkyards" replace />} />
            <Route path="/vendors/:slug" element={<RedirectVendorSlug />} />
            <Route path="/browse" element={<Navigate to="/junkyards-by-location" replace />} />
            <Route path="/browse/:state" element={<RedirectBrowseState />} />

            <Route path="/about" element={<About />} />
            <Route path="/about-us" element={<Navigate to="/about" replace />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/faq" element={<FAQ />} />

            {/* Legacy SEO Redirects */}
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
            <Route path="/vendor/signup" element={
              <VendorAuthProvider>
                <VendorSignUp />
              </VendorAuthProvider>
            } />
            <Route path="/vendor/forgot-password" element={
              <VendorAuthProvider>
                <VendorForgotPassword />
              </VendorAuthProvider>
            } />

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
            <Route path="/admin/login" element={<AdminLogin />} />
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
              <Route path="blog" element={<AdminBlogList />} />
              <Route path="blog/new" element={<AdminBlogEditor />} />
              <Route path="blog/edit/:id" element={<AdminBlogEditor />} />
              <Route path="feedback" element={<AdminFeedback />} />
              <Route path="cms" element={<AdminCMS />} />
              <Route path="cms/:page" element={<AdminCMS />} />
              <Route path="roles" element={<AdminRoles />} />
              <Route path="part-pricing" element={<AdminPartPricing />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Catch-all 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTransition>
      </Suspense>
    </MotionConfig>
  )
}

export default App
