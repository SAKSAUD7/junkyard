import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import AnimatedPage from './components/ui/AnimatedPage'
import Home from './pages/Home'
import BrowseStates from './pages/BrowseStates'
import BrowseState from './pages/BrowseState'
import JunkyardDetail from './pages/JunkyardDetail'
import AllVendors from './pages/AllVendors'
import VendorDetail from './pages/VendorDetail'
import QuoteRequest from './pages/QuoteRequest'
import AddYardPage from './pages/AddYardPage'
import AddYardStart from './pages/AddYardStart'
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
import Blog from './pages/Blog'

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
import AdminPartPricing from './pages/admin/PartPricing'
import AdminSettings from './pages/admin/Settings'

// Helper: redirect /browse/:state → /junkyards/:state preserving the param
function BrowseStateRedirect() {
  const { state } = useParams()
  return <Navigate to={`/junkyards/${state}`} replace />
}

function App() {
  const location = useLocation()
  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

        {/* ════════════════════════════════════════════════════════
            PUBLIC ROUTES
        ════════════════════════════════════════════════════════ */}
        <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
        <Route path="/quote" element={<AnimatedPage><QuoteRequest /></AnimatedPage>} />

        {/* ── Auth ──────────────────────────────────────────── */}
        <Route path="/signin" element={<AnimatedPage><SignIn /></AnimatedPage>} />
        <Route path="/signup" element={<AnimatedPage><SignUp /></AnimatedPage>} />
        <Route path="/forgot-password" element={<AnimatedPage><ForgotPassword /></AnimatedPage>} />

        {/* ── Junkyard Listings ─────────────────────────────── */}
        {/*
          SEO NOTE: /junkyards is the CANONICAL URL — all 51 backlinks point
          to the root domain; this listing page carries the most link equity.
          Do NOT redirect /junkyards away — render AllVendors directly here.
        */}
        <Route path="/junkyards" element={<AnimatedPage><AllVendors /></AnimatedPage>} />
        {/* /vendors → /junkyards (301 equivalent via replace) */}
        <Route path="/vendors" element={<AnimatedPage><Navigate to="/junkyards" replace /></AnimatedPage>} />
        <Route path="/vendors/:id" element={<AnimatedPage><VendorDetail /></AnimatedPage>} />

        {/* Junkyard detail via legacy numeric ID */}
        <Route path="/junkyard/:id" element={<AnimatedPage><JunkyardDetail /></AnimatedPage>} />

        {/* ── Browse by Location ────────────────────────────── */}
        {/*
          SEO NOTE: /junkyards-by-location is the canonical URL.
          /browse is a legacy alias — redirect to canonical form.
        */}
        <Route path="/junkyards-by-location" element={<AnimatedPage><BrowseStates /></AnimatedPage>} />
        <Route path="/browse" element={<AnimatedPage><Navigate to="/junkyards-by-location" replace /></AnimatedPage>} />

        {/* State-level listing: /junkyards/california */}
        <Route path="/junkyards/:state" element={<AnimatedPage><BrowseState /></AnimatedPage>} />
        {/* Yard profile via state+slug: /junkyards/california/2735934-yard-name */}
        <Route path="/junkyards/:state/:slug" element={<AnimatedPage><JunkyardDetail /></AnimatedPage>} />
        {/* Legacy /browse/:state → /junkyards/:state */}
        <Route path="/browse/:state" element={<AnimatedPage><BrowseStateRedirect /></AnimatedPage>} />

        {/* ── Canonical Info Pages ──────────────────────────── */}
        {/*
          SEO NOTE: /about-us is canonical per the site footer social links.
          Do NOT redirect /about-us — render About directly.
          /about redirects TO /about-us to consolidate any stray link equity.
        */}
        <Route path="/about-us" element={<AnimatedPage><About /></AnimatedPage>} />
        <Route path="/about" element={<AnimatedPage><Navigate to="/about-us" replace /></AnimatedPage>} />

        {/* /privacy-policy is the canonical, SEO-friendly URL */}
        <Route path="/privacy-policy" element={<AnimatedPage><Privacy /></AnimatedPage>} />
        <Route path="/privacy" element={<AnimatedPage><Navigate to="/privacy-policy" replace /></AnimatedPage>} />

        {/* /terms-and-conditions is the canonical, SEO-friendly URL */}
        <Route path="/terms-and-conditions" element={<AnimatedPage><Terms /></AnimatedPage>} />
        <Route path="/terms" element={<AnimatedPage><Navigate to="/terms-and-conditions" replace /></AnimatedPage>} />

        <Route path="/how-it-works" element={<AnimatedPage><HowItWorks /></AnimatedPage>} />
        <Route path="/faq" element={<AnimatedPage><FAQ /></AnimatedPage>} />
        <Route path="/contact" element={<AnimatedPage><Contact /></AnimatedPage>} />

        {/* ── Blog ─────────────────────────────────────────── */}
        <Route path="/blog" element={<AnimatedPage><Blog /></AnimatedPage>} />

        {/* ── Get Listed (replaces /admin/register-junkyard) ─ */}
        <Route path="/get-listed" element={<AnimatedPage><AddYardStart /></AnimatedPage>} />
        <Route path="/add-yard/start" element={<AnimatedPage><AddYardStart /></AnimatedPage>} />

        {/* ════════════════════════════════════════════════════════
            PROTECTED USER ROUTES
        ════════════════════════════════════════════════════════ */}
        <Route path="/add-a-yard" element={<AnimatedPage><ProtectedRoute><AddYardPage /></ProtectedRoute></AnimatedPage>} />
        <Route path="/profile" element={<AnimatedPage><ProtectedRoute><Profile /></ProtectedRoute></AnimatedPage>} />

        {/* ════════════════════════════════════════════════════════
            VENDOR PORTAL
        ════════════════════════════════════════════════════════ */}
        <Route path="/vendor/login" element={<AnimatedPage><VendorAuthProvider><VendorLogin /></VendorAuthProvider></AnimatedPage>} />
        <Route path="/vendor/forgot-password" element={<AnimatedPage><VendorAuthProvider><VendorForgotPassword /></VendorAuthProvider></AnimatedPage>} />
        <Route path="/vendor/*" element={<AnimatedPage><VendorAuthProvider><ProtectedVendorRoute><VendorLayout /></ProtectedVendorRoute></VendorAuthProvider></AnimatedPage>}>
          <Route path="dashboard" element={<AnimatedPage><VendorDashboard /></AnimatedPage>} />
          <Route path="profile" element={<AnimatedPage><VendorProfile /></AnimatedPage>} />
          <Route path="inventory" element={<AnimatedPage><VendorInventory /></AnimatedPage>} />
          <Route path="leads" element={<AnimatedPage><VendorLeads /></AnimatedPage>} />
          <Route path="leads/:id" element={<AnimatedPage><VendorLeadDetail /></AnimatedPage>} />
          <Route path="notifications" element={<AnimatedPage><VendorNotifications /></AnimatedPage>} />
        </Route>

        {/* ════════════════════════════════════════════════════════
            ADMIN PORTAL
        ════════════════════════════════════════════════════════ */}
        <Route path="/admin-portal/*" element={<AnimatedPage><AdminProtectedRoute><AdminLayout /></AdminProtectedRoute></AnimatedPage>}>
          <Route path="dashboard" element={<AnimatedPage><AdminDashboard /></AnimatedPage>} />
          <Route path="messages" element={<AnimatedPage><AdminMessages /></AnimatedPage>} />
          <Route path="leads" element={<AnimatedPage><AdminLeads /></AnimatedPage>} />
          <Route path="vendor-leads" element={<AnimatedPage><AdminVendorLeads /></AnimatedPage>} />
          <Route path="yard-submissions" element={<AnimatedPage><AdminYardSubmissions /></AnimatedPage>} />
          <Route path="vendors" element={<AnimatedPage><AdminVendors /></AnimatedPage>} />
          <Route path="ads" element={<AnimatedPage><AdminAds /></AnimatedPage>} />
          <Route path="pricing" element={<AnimatedPage><AdminPartPricing /></AnimatedPage>} />
          <Route path="settings" element={<AnimatedPage><AdminSettings /></AnimatedPage>} />
          <Route index element={<AnimatedPage><Navigate to="dashboard" replace /></AnimatedPage>} />
        </Route>

      </Routes>
      </AnimatePresence>
    </>
  )
}

export default App
