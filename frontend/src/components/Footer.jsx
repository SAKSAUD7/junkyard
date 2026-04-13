import { Link } from 'react-router-dom'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="relative bg-gray-50 border-t border-gray-200 font-sans">
            <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 md:py-16">
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-12 mb-6 md:mb-12">

                    {/* Brand Column */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-6">
                            <div className="relative">
                                <div className="relative bg-gradient-to-br from-blue-600 to-teal-600 rounded-lg p-1.5 md:p-2">
                                    <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-base md:text-xl font-black text-gray-900 leading-none tracking-tight font-display">JYNM</span>
                                <span className="text-[8px] md:text-[10px] uppercase tracking-wider text-gray-500 font-mono">Industrial Parts</span>
                            </div>
                        </div>
                        <p className="text-gray-600 text-xs md:text-sm mb-3 md:mb-6 leading-relaxed">
                            Premium marketplace for verified auto parts. Connecting mechanics and enthusiasts with trusted salvage yards nationwide.
                        </p>
                        {/* Social Media Icons */}
                        <div className="flex gap-1.5 md:gap-2">
                            {[
                                {
                                    name: 'Facebook',
                                    url: 'https://www.facebook.com/JunkYardsNearMe',
                                    icon: (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                                        </svg>
                                    )
                                },
                                {
                                    name: 'X',
                                    url: 'https://x.com/junkyardsnearme',
                                    icon: (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                    )
                                },
                                {
                                    name: 'Pinterest',
                                    url: 'https://www.pinterest.com/junkyardsnearme/',
                                    icon: (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.307.307 0 01.07.252c-.098.403-.315 1.285-.357 1.455-.055.225-.183.272-.421.162-1.565-.728-2.544-3.015-2.544-4.852 0-3.951 2.87-7.579 8.274-7.579 4.344 0 7.719 3.095 7.719 7.229 0 4.316-2.722 7.791-6.501 7.791-1.27 0-2.463-.659-2.871-1.438l-.782 2.977c-.283 1.077-1.048 2.427-1.558 3.262 1.077.332 2.222.513 3.411.513 6.621 0 11.988-5.367 11.988-11.988C24.005 5.367 18.638 0 12.017 0z" />
                                        </svg>
                                    )
                                }
                            ].map((social) => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative"
                                    aria-label={social.name}
                                >
                                    <div className="relative bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 p-1.5 md:p-2.5 rounded-lg transition-all">
                                        <div className="text-gray-600 group-hover:text-blue-600 transition-colors">
                                            <div className="w-4 h-4 md:w-5 md:h-5">{social.icon}</div>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-xs md:text-sm uppercase tracking-wider text-gray-900 mb-3 md:mb-6">Quick Links</h3>
                        <ul className="space-y-1.5 md:space-y-3 text-xs md:text-sm">
                            {[
                                { to: '/', label: 'Home' },
                                { to: '/search', label: 'Search Parts' },
                                { to: '/vendors', label: 'All Vendors' },
                                { to: '/browse', label: 'Browse by State' },
                                { to: '/about', label: 'About Us' }
                            ].map(link => (
                                <li key={link.to}>
                                    <Link to={link.to} className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2 group">
                                        <span className="w-1 h-1 bg-blue-600 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="font-bold text-xs md:text-sm uppercase tracking-wider text-gray-900 mb-3 md:mb-6">Resources</h3>
                        <ul className="space-y-1.5 md:space-y-3 text-xs md:text-sm">
                            {[
                                { to: '/how-it-works', label: 'How It Works' },
                                { to: '/faq', label: 'FAQ' },
                                { to: '/contact', label: 'Contact Support' },
                                { to: '/privacy', label: 'Privacy Policy' },
                                { to: '/terms', label: 'Terms of Service' }
                            ].map(link => (
                                <li key={link.to}>
                                    <Link to={link.to} className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2 group">
                                        <span className="w-1 h-1 bg-blue-600 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="col-span-2 md:col-span-1">
                        <h3 className="font-bold text-xs md:text-sm uppercase tracking-wider text-gray-900 mb-3 md:mb-6">Contact</h3>
                        <div className="space-y-2 md:space-y-4 text-xs md:text-sm">
                            <a href="tel:1-866-293-3731" className="flex items-center gap-2 md:gap-3 text-gray-600 hover:text-blue-600 transition-colors group">
                                <div className="bg-white p-1.5 md:p-2 rounded-lg border border-gray-200 group-hover:border-blue-300 transition-colors">
                                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                    </svg>
                                </div>
                                <span className="font-mono text-xs md:text-sm">1-866-293-3731</span>
                            </a>
                            <a href="mailto:info@jynm.com" className="flex items-center gap-2 md:gap-3 text-gray-600 hover:text-blue-600 transition-colors group">
                                <div className="bg-white p-1.5 md:p-2 rounded-lg border border-gray-200 group-hover:border-blue-300 transition-colors">
                                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                </div>
                                <span className="font-mono text-xs md:text-sm">info@jynm.com</span>
                            </a>
                            <div className="flex items-start gap-2 md:gap-3 text-gray-600 mt-3 md:mt-6 pt-3 md:pt-6 border-t border-gray-200">
                                <div className="bg-white p-1.5 md:p-2 rounded-lg border border-gray-200">
                                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-xs md:text-sm">Nationwide Service<br /><span className="text-[10px] md:text-xs text-gray-500">Serving all 58 States</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-200 pt-4 md:pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4 text-[10px] md:text-xs text-gray-500 uppercase tracking-wider">
                        <p className="text-center md:text-left">© {currentYear} JunkyardsNearMe.com</p>
                        <div className="flex gap-3 md:gap-6">
                            <Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
                            <Link to="/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
                            <Link to="/sitemap" className="hover:text-blue-600 transition-colors">Sitemap</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
