import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Search from './pages/Search'
import BrowseStates from './pages/BrowseStates'
import BrowseState from './pages/BrowseState'
import JunkyardDetail from './pages/JunkyardDetail'
import AllVendors from './pages/AllVendors'
import VendorDetail from './pages/VendorDetail'
import QuoteRequest from './pages/QuoteRequest'
import About from './pages/About'
import Contact from './pages/Contact'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import HowItWorks from './pages/HowItWorks'
import FAQ from './pages/FAQ'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/quote" element={<QuoteRequest />} />
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
      </Routes>
    </>
  )
}

export default App
