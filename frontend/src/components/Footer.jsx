import { Link } from 'react-router-dom'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    const quickLinks = [
        { to: '/', label: 'Home' },
        { to: '/junkyards', label: 'All Junkyards' },
        { to: '/junkyards-by-location', label: 'Browse by State' },
        { to: '/about-us', label: 'About Us' }
    ]

    const resourceLinks = [
        { to: '/how-it-works', label: 'How It Works' },
        { to: '/faq', label: 'FAQ' },
        { to: '/contact', label: 'Contact Support' },
        { to: '/privacy', label: 'Privacy Policy' },
        { to: '/terms', label: 'Terms of Service' }
    ]

    return (
        <footer className="relative border-t border-white/[8%]" style={{ background: '#080909' }}>
            {/* Amber top glow line */}
            <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent)' }} />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-10">

                    {/* Brand Column */}
                    <div className="col-span-2 lg:col-span-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="rounded-xl p-2" style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}>
                                <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
  <path d="M3.375 7.125a1.125 1.125 0 0 1 1.125-1.125h15a1.125 1.125 0 0 1 1.125 1.125v6.5a1.125 1.125 0 0 1-1.125 1.125h-.52a2.875 2.875 0 0 0-5.59 0h-2.78a2.875 2.875 0 0 0-5.59 0h-.52a1.125 1.125 0 0 1-1.125-1.125v-6.5Z" />
  <path d="M7.5 18a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM19.5 18a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
</svg>
                            </div>
                            <div>
                                <span className="text-xl font-black text-white leading-none block" style={{ fontFamily: 'Rajdhani, sans-serif' }}>JYNM</span>
                                <span className="text-[9px] uppercase tracking-widest text-amber-400/60 font-mono">Auto Parts Hub</span>
                            </div>
                        </div>
                        <p className="text-white/40 text-sm mb-5 leading-relaxed">
                            Premium marketplace for verified auto parts. Connecting mechanics and enthusiasts with trusted salvage yards nationwide.
                        </p>
                        {/* Social Icons */}
                        <div className="flex gap-2">
                            {[
                                { name: 'Facebook', url: 'https://www.facebook.com/JunkYardsNearMe', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg> },
                                { name: 'X', url: 'https://x.com/junkyardsnearme', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
                                { name: 'Pinterest', url: 'https://www.pinterest.com/junkyardsnearme/', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.07.087.081.164.056.253-.098.403-.315 1.285-.357 1.455-.055.225-.183.272-.421.162-1.565-.728-2.544-3.015-2.544-4.852 0-3.951 2.87-7.579 8.274-7.579 4.344 0 7.719 3.095 7.719 7.229 0 4.316-2.722 7.791-6.501 7.791-1.27 0-2.463-.659-2.871-1.438l-.782 2.977c-.283 1.077-1.048 2.427-1.558 3.262 1.077.332 2.222.513 3.411.513 6.621 0 11.988-5.367 11.988-11.988C24.005 5.367 18.638 0 12.017 0z" /></svg> },
                            ].map(s => (
                                <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.name}
                                    className="p-2 rounded-lg border border-white/10 text-white/40 hover:text-amber-400 hover:border-amber-500/40 transition-all duration-200">
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-xs uppercase tracking-widest text-white/30 mb-5">Quick Links</h3>
                        <ul className="space-y-3 text-sm">
                            {quickLinks.map(link => (
                                <li key={link.to}>
                                    <Link to={link.to} className="text-white/50 hover:text-amber-400 transition-colors flex items-center gap-2 group">
                                        <span className="w-0 group-hover:w-3 h-px bg-amber-400 transition-all duration-200 opacity-0 group-hover:opacity-100" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="font-bold text-xs uppercase tracking-widest text-white/30 mb-5">Resources</h3>
                        <ul className="space-y-3 text-sm">
                            {resourceLinks.map(link => (
                                <li key={link.to}>
                                    <Link to={link.to} className="text-white/50 hover:text-amber-400 transition-colors flex items-center gap-2 group">
                                        <span className="w-0 group-hover:w-3 h-px bg-amber-400 transition-all duration-200 opacity-0 group-hover:opacity-100" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="col-span-2 lg:col-span-1">
                        <h3 className="font-bold text-xs uppercase tracking-widest text-white/30 mb-5">Contact</h3>
                        <div className="space-y-4 text-sm">
                            <a href="tel:1-866-293-3731" className="flex items-center gap-3 text-white/50 hover:text-amber-400 transition-colors group">
                                <div className="p-2 rounded-lg border border-white/10 group-hover:border-amber-500/40 transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                    </svg>
                                </div>
                                <span className="font-mono">1-866-293-3731</span>
                            </a>
                            <a href="mailto:info@jynm.com" className="flex items-center gap-3 text-white/50 hover:text-amber-400 transition-colors group">
                                <div className="p-2 rounded-lg border border-white/10 group-hover:border-amber-500/40 transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                </div>
                                <span className="font-mono">info@jynm.com</span>
                            </a>
                            <div className="flex items-center gap-3 text-white/30 pt-4 border-t border-white/[8%]">
                                <div className="p-2 rounded-lg border border-white/10">
                                    <svg className="w-4 h-4 text-amber-400/60" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-xs">Nationwide Service<br /><span className="text-white/20">Serving 55+ states</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/[8%] pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/25 uppercase tracking-widest">
                        <p>© {currentYear} JunkyardsNearMe.com · All Rights Reserved</p>
                        <div className="flex gap-5">
                            <Link to="/privacy" className="hover:text-amber-400 transition-colors">Privacy</Link>
                            <Link to="/terms" className="hover:text-amber-400 transition-colors">Terms</Link>
                            <Link to="/sitemap" className="hover:text-amber-400 transition-colors">Sitemap</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
