import { Routes, Route } from 'react-router-dom'
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

        {/* Protected Routes */}
        <Route path="/add-a-yard" element={
          <ProtectedRoute>
            <AddYardPage />
          </ProtectedRoute>
        } />

        <Route path="/vendors" element={<AllVendors />} />
        <Route path="/vendors/:id" element={<VendorDetail />} />
        <Route path="/browse" element={<BrowseStates />} />
        <Route path="/browse/:state" element={<BrowseState />} />
        <Route path="/junkyard/:id" element={<JunkyardDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/faq" element={<FAQ />} />

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
      </Routes>
    </>
  )
}

export default App
