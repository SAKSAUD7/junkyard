/**
 * URL Helper Functions for SEO Preservation
 * Generates URLs in the old website format to preserve backlinks
 */

/**
 * Generate vendor detail URL in old format
 * Format: /junkyards/{state}/{id}-{vendor-name-slug}-{city}-{state}
 * Example: /junkyards/california/2008470-a-r-auto-sun-valley-ca
 */
export function generateVendorUrl(vendor) {
    if (!vendor) return '/junkyards'

    const { id, name, city, state } = vendor

    // Create slug: {id}-{name}-{city}-{state}
    const namePart = (name || 'vendor').toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')

    const cityPart = (city || '').toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')

    const statePart = (state || '').toLowerCase()

    const slug = `${id}-${namePart}${cityPart ? '-' + cityPart : ''}${statePart ? '-' + statePart : ''}`

    if (!statePart) {
        return `/junkyards/${slug}`
    }
    return `/junkyards/${statePart}/${slug}`
}

/**
 * Generate rating URL in old format
 * Format: /rate-junkyard/{id}-{vendor-name-slug}-{city}-{state}
 */
export function generateRatingUrl(vendor) {
    if (!vendor) return '/junkyards'

    const { id, name, city, state } = vendor

    const namePart = (name || 'vendor').toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')

    const cityPart = (city || '').toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')

    const statePart = (state || '').toLowerCase()

    const slug = `${id}-${namePart}${cityPart ? '-' + cityPart : ''}${statePart ? '-' + statePart : ''}`

    return `/vendors/${slug}/rate`
}

/**
 * Extract vendor ID from old-style slug
 * Slug format: {id}-{name}-{city}-{state}
 * Example: "2008470-a-r-auto-sun-valley-ca" → "2008470"
 */
export function extractVendorIdFromSlug(slug) {
    if (!slug) return null

    const match = slug.match(/^(\d+)-/)
    return match ? match[1] : null
}

/**
 * Get main vendor listing URL
 */
export function getVendorsListUrl(page = null) {
    const baseUrl = '/junkyards'
    return page ? `${baseUrl}?p=${page}` : baseUrl
}

/**
 * Get browse by location URL
 */
export function getBrowseLocationUrl() {
    return '/junkyards-by-location'
}

/**
 * Get about page URL
 */
export function getAboutUrl() {
    return '/about'
}

/**
 * Get terms page URL
 */
export function getTermsUrl() {
    return '/terms'
}
