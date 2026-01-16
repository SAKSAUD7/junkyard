import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

/**
 * Legacy URL Redirect Component
 * Handles client-side redirects for old website URLs
 * Preserves SEO value from legacy junkyardsnearme.com site
 */
export default function LegacyRedirect() {
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const path = location.pathname
        const search = location.search

        // Redirect /junkyards to /vendors
        if (path === '/junkyards') {
            navigate(`/vendors${search}`, { replace: true })
            return
        }

        // Redirect /junkyards/{state}/{id}-{slug} to /vendors/{id}
        const vendorMatch = path.match(/^\/junkyards\/[^/]+\/(\d+)-/)
        if (vendorMatch) {
            navigate(`/vendors/${vendorMatch[1]}`, { replace: true })
            return
        }

        // Redirect /rate-junkyard/{id}-{slug} to /vendors/{id}
        const rateMatch = path.match(/^\/rate-junkyard\/(\d+)-/)
        if (rateMatch) {
            navigate(`/vendors/${rateMatch[1]}`, { replace: true })
            return
        }

        // Redirect /junkyards-by-location to /browse
        if (path === '/junkyards-by-location') {
            navigate('/browse', { replace: true })
            return
        }

        // Redirect /about-us to /about
        if (path === '/about-us') {
            navigate('/about', { replace: true })
            return
        }

        // Redirect /terms-and-conditions to /terms
        if (path === '/terms-and-conditions') {
            navigate('/terms', { replace: true })
            return
        }
    }, [location, navigate])

    return null
}
