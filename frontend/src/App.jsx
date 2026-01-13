import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'

// Lazy load all pages for better performance (Code Splitting)
const Home = lazy(() => import('./pages/Home'))
const Search = lazy(() => import('./pages/Search'))
const BrowseStates = lazy(() => import('./pages/BrowseStates'))
const BrowseState = lazy(() => import('./pages/BrowseState'))
const JunkyardDetail = lazy(() => import('./pages/JunkyardDetail'))
const AllVendors = lazy(() => import('./pages/AllVendors'))
const VendorDetail = lazy(() => import('./pages/VendorDetail'))
const QuoteRequest = lazy(() => import('./pages/QuoteRequest'))
const AddYardPage = lazy(() => import('./pages/AddYardPage'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const HowItWorks = lazy(() => import('./pages/HowItWorks'))
const FAQ = lazy(() => import('./pages/FAQ'))

// Import specialized components

// Loading Fallback Component
const PageLoader = () => (
  <div className="min-h-screen bg-dark-950 flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-white/60 font-medium">Loading...</p>
    </div>
  </div>
)

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/quote" element={<QuoteRequest />} />
        <Route path="/add-a-yard" element={<AddYardPage />} />
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

        {/* SEO: Legacy URL Redirects */}
        {/* Captures pattern: /junkyards/:state/:slug */}
        {/* Example: /junkyards/pennsylvania/6481441-1-morgan-highway-auto-parts-scranton-pa */}
        <Route path="/junkyards/:state/:slug" element={<VendorDetail />} />

        {/* Legacy pagination redirects (optional, redirect to main vendors list) */}
        <Route path="/junkyards" element={<AllVendors />} />

      </Routes>
    </Suspense>
  )
}

export default App
