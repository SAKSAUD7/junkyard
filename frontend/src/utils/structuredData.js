/**
 * Structured Data (Schema.org) Utilities
 * Generates JSON-LD structured data for SEO
 */

const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://junkyardsnearme.com';
const SITE_NAME = 'Junkyards Near Me';

/**
 * Organization Schema - Use on homepage and site-wide
 */
export const getOrganizationSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    description: 'Find junkyards and auto salvage yards near you. Search by make, model, part, or location.',
    contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-800-555-1234',
        contactType: 'Customer Service',
        areaServed: 'US',
        availableLanguage: 'English'
    },
    sameAs: [
        // Add social media profiles when available
    ]
});

/**
 * Website Schema - Use on homepage
 */
export const getWebsiteSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
        '@type': 'SearchAction',
        target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/search?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
    }
});

/**
 * Breadcrumb Schema
 * @param {Array} items - Array of breadcrumb items [{name, url}, ...]
 */
export const getBreadcrumbSchema = (items) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
    }))
});

/**
 * Local Business Schema - Use for vendor/junkyard pages
 * @param {Object} business - Business data
 */
export const getLocalBusinessSchema = (business) => ({
    '@context': 'https://schema.org',
    '@type': 'AutoPartsStore',
    name: business.name,
    description: business.description || `${business.name} - Auto salvage yard and used auto parts`,
    address: {
        '@type': 'PostalAddress',
        streetAddress: business.address,
        addressLocality: business.city,
        addressRegion: business.state,
        postalCode: business.zipcode,
        addressCountry: 'US'
    },
    ...(business.phone && { telephone: business.phone }),
    ...(business.rating && {
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: typeof business.rating === 'number'
                ? business.rating / 20  // If number (e.g., 4.8), convert to 5-star scale
                : parseFloat(String(business.rating).replace('%', '')) / 20, // If string "100%"
            bestRating: '5',
            worstRating: '1'
        }
    }),
    url: `${SITE_URL}/vendors/${business.id}`,
    priceRange: '$$'
});

/**
 * FAQ Schema - Use on FAQ page
 * @param {Array} faqs - Array of FAQ items [{question, answer}, ...]
 */
export const getFAQSchema = (faqs) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
        }
    }))
});

/**
 * Collection Page Schema - Use for browse/listing pages
 * @param {Object} params - Collection parameters
 */
export const getCollectionPageSchema = ({ name, description, url, numberOfItems }) => ({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    ...(numberOfItems && { numberOfItems })
});
