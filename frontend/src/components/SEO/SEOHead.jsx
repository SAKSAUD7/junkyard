import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SEOHead = ({ title, description, schema }) => {
  const location = useLocation();
  const baseUrl = 'https://junkyardsnearme.com';
  
  // Clean off trailing slashes or trailing query params if we want strict canonicals
  const currentPath = location.pathname;
  const canonicalUrl = `${baseUrl}${currentPath === '/' ? '' : currentPath}`;

  const defaultTitle = 'Junkyards Near Me - Used Auto Parts & Scrap Cars';
  const defaultDesc = 'Find top-rated junkyards near you. Search thousands of used auto parts and get cash for junk cars from salvage yards nationwide.';

  const pageTitle = title ? `${title} | Junkyards Near Me` : defaultTitle;
  const pageDesc = description || defaultDesc;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />
      
      {/* Canonical Link - The absolute most critical element for SEO preservation */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDesc} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={pageTitle} />
      <meta property="twitter:description" content={pageDesc} />

      {/* Structured Data (Schema.org) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
