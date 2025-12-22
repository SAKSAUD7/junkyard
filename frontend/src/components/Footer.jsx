import { Link } from 'react-router-dom'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="relative bg-dark-950 border-t border-white/5 font-sans">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Brand Column */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary-500 rounded-lg blur opacity-20"></div>
                                <div className="relative bg-dark-900 border border-white/10 rounded-lg p-2">
                                    <svg className="w-6 h-6 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-white leading-none tracking-tighter font-display">JYNM</span>
                                <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Industrial Parts</span>
                            </div>
                        </div>
                        <p className="text-white/50 text-sm mb-6 leading-relaxed">
                            Premium marketplace for verified auto parts. Connecting mechanics and enthusiasts with trusted salvage yards nationwide.
                        </p>
                        {/* Social Media Icons */}
                        <div className="flex gap-2">
                            {['Facebook', 'Twitter', 'Instagram'].map((social) => (
                                <a key={social} href="#" className="group relative">
                                    <div className="absolute inset-0 bg-primary-500 rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                    <div className="relative bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary-500/30 p-2.5 rounded-lg transition-all" aria-label={social}>
                                        <div className="w-5 h-5 bg-white/40 group-hover:bg-primary-400 transition-colors rounded-sm"></div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-sm uppercase tracking-wider text-white mb-6 font-mono">Quick Links</h3>
                        <ul className="space-y-3 text-sm">
                            {[
                                { to: '/', label: 'Home' },
                                { to: '/search', label: 'Search Parts' },
                                { to: '/vendors', label: 'All Vendors' },
                                { to: '/browse', label: 'Browse by State' },
                                { to: '/about', label: 'About Us' }
                            ].map(link => (
                                <li key={link.to}>
                                    <Link to={link.to} className="text-white/50 hover:text-primary-400 transition-colors flex items-center gap-2 group">
                                        <span className="w-1 h-1 bg-primary-400 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="font-bold text-sm uppercase tracking-wider text-white mb-6 font-mono">Resources</h3>
                        <ul className="space-y-3 text-sm">
                            {[
                                { to: '/how-it-works', label: 'How It Works' },
                                { to: '/faq', label: 'FAQ' },
                                { to: '/contact', label: 'Contact Support' },
                                { to: '/privacy', label: 'Privacy Policy' },
                                { to: '/terms', label: 'Terms of Service' }
                            ].map(link => (
                                <li key={link.to}>
                                    <Link to={link.to} className="text-white/50 hover:text-primary-400 transition-colors flex items-center gap-2 group">
                                        <span className="w-1 h-1 bg-primary-400 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-bold text-sm uppercase tracking-wider text-white mb-6 font-mono">Contact</h3>
                        <div className="space-y-4 text-sm">
                            <a href="tel:1-866-293-3731" className="flex items-center gap-3 text-white/50 hover:text-primary-400 transition-colors group">
                                <div className="bg-white/5 p-2 rounded-lg border border-white/5 group-hover:border-primary-500/30 transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                    </svg>
                                </div>
                                <span className="font-mono">1-866-293-3731</span>
                            </a>
                            <a href="mailto:info@jynm.com" className="flex items-center gap-3 text-white/50 hover:text-primary-400 transition-colors group">
                                <div className="bg-white/5 p-2 rounded-lg border border-white/5 group-hover:border-primary-500/30 transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                </div>
                                <span className="font-mono">info@jynm.com</span>
                            </a>
                            <div className="flex items-start gap-3 text-white/50 mt-6 pt-6 border-t border-white/5">
                                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span>Nationwide Service<br /><span className="text-xs opacity-60">Serving all 50 US States</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/5 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/30 uppercase tracking-wider font-mono">
                        <p>© {currentYear} JunkyardsNearMe.com</p>
                        <div className="flex gap-6">
                            <Link to="/privacy" className="hover:text-primary-400 transition-colors">Privacy</Link>
                            <Link to="/terms" className="hover:text-primary-400 transition-colors">Terms</Link>
                            <Link to="/sitemap" className="hover:text-primary-400 transition-colors">Sitemap</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
