import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

/**
 * SEO Component - Manages all meta tags, Open Graph, Twitter Cards, and structured data
 * 
 * @param {Object} props - SEO configuration
 * @param {string} props.title - Page title (will be appended with site name)
 * @param {string} props.description - Meta description
 * @param {string} props.canonical - Canonical URL (optional, auto-generated from current URL)
 * @param {string} props.ogImage - Open Graph image URL
 * @param {string} props.ogType - Open Graph type (default: 'website')
 * @param {Object} props.schema - JSON-LD structured data object
 * @param {boolean} props.noindex - If true, adds noindex meta tag
 */
export default function SEO({
    title = '',
    description = '',
    canonical = '',
    ogImage = '/images/og-default.jpg',
    ogType = 'website',
    schema = null,
    noindex = false,
}) {
    // Site-wide defaults
    const siteName = 'Junkyards Near Me';
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://junkyardsnearme.com';

    // Default SEO values
    const defaultTitle = 'Find Auto Salvage Yards & Used Auto Parts';
    const defaultDescription = 'Find junkyards and auto salvage yards near you. Search by make, model, part, or location. Get used auto parts from over 1,000 verified junkyards across the USA.';

    // Construct full title
    const fullTitle = title ? `${title} | ${siteName}` : `${siteName} - ${defaultTitle}`;

    // Use provided description or default
    const metaDescription = description || defaultDescription;

    // Construct canonical URL
    const canonicalUrl = canonical || (typeof window !== 'undefined' ? window.location.href.split('?')[0] : siteUrl);

    // Construct full OG image URL
    const fullOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />
            {noindex && <meta name="robots" content="noindex,nofollow" />}

            {/* Canonical URL */}
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph Tags */}
            <meta property="og:type" content={ogType} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:image" content={fullOgImage} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter Card Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={fullOgImage} />

            {/* Structured Data (JSON-LD) */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}
        </Helmet>
    );
}

SEO.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    canonical: PropTypes.string,
    ogImage: PropTypes.string,
    ogType: PropTypes.string,
    schema: PropTypes.object,
    noindex: PropTypes.bool,
};
