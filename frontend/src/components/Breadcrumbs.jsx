import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { getBreadcrumbSchema } from '../utils/structuredData'

export default function Breadcrumbs({ items }) {
    if (!items || items.length === 0) return null

    // Map internal schema layout (needs { name, url })
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://junkyardsnearme.com'
    const schemaItems = items.map(item => ({
        name: item.label,
        url: item.href.startsWith('http') ? item.href : `${siteUrl}${item.href}`
    }))
    const schema = getBreadcrumbSchema(schemaItems)

    return (
        <nav aria-label="Breadcrumb" className="flex text-sm text-gray-500 my-4 items-center flex-wrap gap-2">
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            </Helmet>
            {items.map((item, index) => {
                const isLast = index === items.length - 1
                return (
                    <div key={index} className="flex items-center gap-2">
                        {isLast ? (
                            <span className="text-gray-900 font-bold" aria-current="page">{item.label}</span>
                        ) : (
                            <Link to={item.href} className="hover:text-blue-600 transition-colors font-medium">
                                {item.label}
                            </Link>
                        )}
                        {!isLast && (
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        )}
                    </div>
                )
            })}
        </nav>
    )
}

Breadcrumbs.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            href: PropTypes.string.isRequired
        })
    ).isRequired
}
