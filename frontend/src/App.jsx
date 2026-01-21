import { Routes, Route, Navigate } from 'react-router-dom'
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

// Admin Portal Imports
import AdminProtectedRoute from './components/admin/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminMessages from './pages/admin/Messages'
import AdminLeads from './pages/admin/Leads'
import AdminVendorLeads from './pages/admin/VendorLeads'
import AdminVendors from './pages/admin/Vendors'
import AdminAds from './pages/admin/Ads'
import AdminSettings from './pages/admin/Settings'


function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/quote" element={<QuoteRequest />} />

        {/* Auth Routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

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
          <Route path="vendors" element={<AdminVendors />} />
          <Route path="ads" element={<AdminAds />} />
          <Route path="settings" element={<AdminSettings />} />
          {/* Default redirect to dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
