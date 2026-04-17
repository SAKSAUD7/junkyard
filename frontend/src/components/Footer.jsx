import { Link } from 'react-router-dom'
import { useCMS } from '../hooks/useCMS'

export default function Footer() {
    const currentYear = new Date().getFullYear()
    const { get } = useCMS('footer')

    return (
        <footer
            className="relative"
            style={{
                background: 'var(--bg-void)',
                borderTop: '1px solid rgba(37,99,235,0.1)',
                fontFamily: "'Inter', sans-serif"
            }}
        >
            {/* Neon top line */}
            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.4), rgba(234,88,12,0.3), transparent)' }} />

            {/* Subtle grid pattern */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(rgba(37,99,235,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.025) 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }}
            />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20" style={{ zIndex: 1 }}>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">

                    {/* Brand Column */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-3 mb-6">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(0,100,180,0.08))',
                                    border: '1px solid rgba(37,99,235,0.3)',
                                    boxShadow: '0 0 15px rgba(37,99,235,0.1)'
                                }}
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="var(--neon-blue)" strokeWidth="1.5" strokeLinejoin="round"/>
                                    <path d="M2 17l10 5 10-5" stroke="var(--neon-orange)" strokeWidth="1.5" strokeLinejoin="round"/>
                                    <path d="M2 12l10 5 10-5" stroke="var(--neon-blue)" strokeWidth="1.5" strokeLinejoin="round" opacity="0.6"/>
                                </svg>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em', lineHeight: 1 }}>JYNM</div>
                                <div style={{ color: 'rgba(37,99,235,0.6)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>AutoParts Hub</div>
                            </div>
                        </div>

                        <p style={{ color: '#667788', fontSize: '0.875rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                            {get('brand', 'description', "The nation's most trusted marketplace for verified used auto parts. Connecting mechanics and enthusiasts with salvage yards nationwide.")}
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-2.5">
                            {[
                                {
                                    name: 'Facebook',
                                    url: get('social', 'facebook', 'https://www.facebook.com/JunkYardsNearMe'),
                                    icon: (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                                        </svg>
                                    )
                                },
                                {
                                    name: 'X / Twitter',
                                    url: get('social', 'twitter', 'https://x.com/junkyardsnearme'),
                                    icon: (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                    )
                                },
                                {
                                    name: 'Pinterest',
                                    url: get('social', 'pinterest', 'https://www.pinterest.com/junkyardsnearme/'),
                                    icon: (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.111.224.082.345-.098.403-.315 1.285-.357 1.455-.055.225-.183.272-.421.162-1.565-.728-2.544-3.015-2.544-4.852 0-3.951 2.87-7.579 8.274-7.579 4.344 0 7.719 3.095 7.719 7.229 0 4.316-2.722 7.791-6.501 7.791-1.27 0-2.463-.659-2.871-1.438l-.782 2.977c-.283 1.077-1.048 2.427-1.558 3.262 1.077.332 2.222.513 3.411.513 6.621 0 11.988-5.367 11.988-11.988C24.005 5.367 18.638 0 12.017 0z" />
                                        </svg>
                                    )
                                }
                            ].map(social => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.name}
                                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300"
                                    style={{
                                        background: 'rgba(37,99,235,0.05)',
                                        border: '1px solid rgba(37,99,235,0.12)',
                                        color: 'var(--text-secondary)'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.color = 'var(--neon-blue)'
                                        e.currentTarget.style.borderColor = 'rgba(37,99,235,0.35)'
                                        e.currentTarget.style.background = 'rgba(37,99,235,0.1)'
                                        e.currentTarget.style.boxShadow = '0 0 12px rgba(37,99,235,0.2)'
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.color = 'var(--text-secondary)'
                                        e.currentTarget.style.borderColor = 'rgba(37,99,235,0.12)'
                                        e.currentTarget.style.background = 'rgba(37,99,235,0.05)'
                                        e.currentTarget.style.boxShadow = 'none'
                                    }}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.25rem', fontFamily: "'JetBrains Mono', monospace" }}>
                            Navigation
                        </h3>
                        <ul className="space-y-3">
                            {[
                                { to: '/', label: 'Home' },
                                { to: '/vendors', label: 'All Vendors' },
                                { to: '/browse', label: 'Browse by State' },
                                { to: '/about', label: 'About Us' },
                                { to: '/quote', label: 'Get a Quote' },
                            ].map(link => (
                                <li key={link.to}>
                                    <Link
                                        to={link.to}
                                        className="flex items-center gap-2 transition-all duration-200 text-sm"
                                        style={{ color: '#667788', textDecoration: 'none' }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.color = 'var(--neon-blue)'
                                            e.currentTarget.querySelector('span')?.style && (e.currentTarget.querySelector('span').style.opacity = '1')
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.color = '#667788'
                                        }}
                                    >
                                        <span style={{ color: 'var(--neon-blue)', opacity: 0, transition: 'opacity 0.2s' }}>›</span>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.25rem', fontFamily: "'JetBrains Mono', monospace" }}>
                            Resources
                        </h3>
                        <ul className="space-y-3">
                            {[
                                { to: '/how-it-works', label: 'How It Works' },
                                { to: '/faq', label: 'FAQ' },
                                { to: '/contact', label: 'Contact Support' },
                                { to: '/privacy', label: 'Privacy Policy' },
                                { to: '/terms', label: 'Terms of Service' },
                                { to: '/add-a-yard', label: 'List Your Yard' },
                            ].map(link => (
                                <li key={link.to}>
                                    <Link
                                        to={link.to}
                                        className="flex items-center gap-2 transition-all duration-200 text-sm"
                                        style={{ color: '#667788', textDecoration: 'none' }}
                                        onMouseEnter={e => e.currentTarget.style.color = 'var(--neon-blue)'}
                                        onMouseLeave={e => e.currentTarget.style.color = '#667788'}
                                    >
                                        <span style={{ color: 'var(--neon-blue)' }}>›</span>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.25rem', fontFamily: "'JetBrains Mono', monospace" }}>
                            Contact
                        </h3>
                        <div className="space-y-4">
                            <a
                                href={`tel:${get('contact', 'phone', '1-866-293-3731')}`}
                                className="flex items-center gap-3 transition-all duration-200"
                                style={{ color: '#667788', textDecoration: 'none' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--neon-blue)'}
                                onMouseLeave={e => e.currentTarget.style.color = '#667788'}
                            >
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.12)' }}
                                >
                                    <svg className="w-3.5 h-3.5" style={{ color: 'var(--neon-blue)' }} fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                    </svg>
                                </div>
                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.825rem' }}>{get('contact', 'phone', '1-866-293-3731')}</span>
                            </a>

                            <a
                                href={`mailto:${get('contact', 'email', 'info@jynm.com')}`}
                                className="flex items-center gap-3 transition-all duration-200"
                                style={{ color: '#667788', textDecoration: 'none' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--neon-blue)'}
                                onMouseLeave={e => e.currentTarget.style.color = '#667788'}
                            >
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.12)' }}
                                >
                                    <svg className="w-3.5 h-3.5" style={{ color: 'var(--neon-blue)' }} fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                </div>
                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.825rem' }}>{get('contact', 'email', 'info@jynm.com')}</span>
                            </a>

                            <div
                                className="flex items-center gap-3 pt-2"
                                style={{ borderTop: '1px solid rgba(37,99,235,0.08)' }}
                            >
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'rgba(234,88,12,0.06)', border: '1px solid rgba(234,88,12,0.12)' }}
                                >
                                    <svg className="w-3.5 h-3.5" style={{ color: 'var(--neon-orange)' }} fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', fontWeight: 600 }}>Nationwide Service</p>
                                    <p style={{ color: '#667788', fontSize: '0.75rem' }}>Serving all 50 States</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div style={{ borderTop: '1px solid rgba(37,99,235,0.08)', paddingTop: '1.5rem' }}>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace" }}>
                            © {currentYear} JunkyardsNearMe.com · All rights reserved
                        </p>
                        <div className="flex gap-6">
                            {[
                                { to: '/privacy', label: 'Privacy' },
                                { to: '/terms', label: 'Terms' },
                                { to: '/sitemap', label: 'Sitemap' },
                            ].map(link => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textDecoration: 'none', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--neon-blue)'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
