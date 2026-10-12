import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCMS } from '../hooks/useCMS'

export default function Footer() {
    const currentYear = new Date().getFullYear()
    const { get: getFooter } = useCMS('footer')
    const { get: getGlobal } = useCMS('global')
    const logoUrl = getGlobal('brand', 'logo');

    // State for mobile accordion collapse/expand
    const [openSections, setOpenSections] = useState({})

    const toggleSection = (id) => {
        setOpenSections(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    const quickLinks = [
        { name: getFooter('quick_links', 'link_home', 'Home'), path: '/' },
        { name: getFooter('quick_links', 'link_browse', 'Browse States'), path: '/junkyards-by-location' },
        { name: getFooter('quick_links', 'link_junkyards', 'Junkyards'), path: '/junkyards' },
        { name: getFooter('quick_links', 'link_blog', 'Blog'), path: '/blog' },
        { name: getFooter('quick_links', 'link_about', 'About Us'), path: '/about' },
        { name: getFooter('quick_links', 'link_contact', 'Contact'), path: '/contact' },
    ]

    const buyerLinks = [
        { name: getFooter('buyers', 'link_how', 'How It Works'), path: '/how-it-works' },
        { name: getFooter('buyers', 'link_faq', 'FAQ'), path: '/faq' },
        { name: getFooter('buyers', 'link_quote', 'Get a Quote'), path: '/quote' },
        { name: 'Sell Your Vehicle', path: '/sell-your-car' },
    ]

    const vendorLinks = [
        { name: getFooter('vendors', 'link_add', 'Add a Yard'), path: '/add-a-yard' },
        { name: getFooter('vendors', 'link_login', 'Vendor Login'), path: '/vendor/login' },
    ]

    const socials = [
        { key: 'facebook', href: getFooter('social', 'facebook', 'https://www.facebook.com/junkyardsnearme'), icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg> },
        { key: 'pinterest', href: getFooter('social', 'pinterest', 'https://www.pinterest.com/junkyardsnearme'), icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg> },
        { key: 'twitter', href: getFooter('social', 'twitter', 'https://x.com/junkyardsnearme'), icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
        { key: 'youtube', href: getFooter('social', 'youtube', 'https://www.youtube.com/@junkyardsnearme'), icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 00-2.122 2.136C0 8.084 0 12 0 12s0 3.916.501 5.814a3.016 3.016 0 002.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 002.122-2.136C24 15.916 24 12 24 12s0-3.916-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg> },
    ]

    return (
        <footer id="site-footer" className="bg-white border-t border-slate-100 pt-8 sm:pt-10 pb-6"
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))' }}>
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* Top Brand Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
                    <div className="flex items-center gap-3">
                        <img 
                            src={logoUrl || '/logo.png'} 
                            alt="JYNM Logo" 
                            width="32" 
                            height="32" 
                            className="w-8 h-8 object-contain" 
                            onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                        />
                        <div>
                            <div className="text-base font-black text-slate-900 leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {getGlobal('brand', 'name_short', 'JYNM')}
                            </div>
                            <div className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                                {getGlobal('brand', 'name_long', 'Junkyards Near Me')}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {socials.map(s => (
                            <a 
                                key={s.key} 
                                href={s.href} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                aria-label={`Follow us on ${s.key.charAt(0).toUpperCase() + s.key.slice(1)}`}
                                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-colors"
                            >
                                {s.icon}
                            </a>
                        ))}
                    </div>
                </div>

                {/* ============================================================
                    MOBILE VIEW (< md): Expandable Accordion Groups
                ============================================================ */}
                <div className="md:hidden divide-y divide-slate-100 mb-8">
                    {/* 1. For Buyers */}
                    <div className="py-3">
                        <button
                            type="button"
                            onClick={() => toggleSection('buyers')}
                            className="w-full flex items-center justify-between py-1 text-left font-black text-xs uppercase tracking-wider text-slate-800"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            <span>For Buyers</span>
                            <svg 
                                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openSections['buyers'] ? 'rotate-180 text-blue-600' : ''}`} 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {openSections['buyers'] && (
                            <ul className="mt-2.5 space-y-2 pl-1 animate-fade-in">
                                {buyerLinks.map(item => (
                                    <li key={item.path}>
                                        <Link to={item.path} className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors block py-1">
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* 2. For Junkyards */}
                    <div className="py-3">
                        <button
                            type="button"
                            onClick={() => toggleSection('vendors')}
                            className="w-full flex items-center justify-between py-1 text-left font-black text-xs uppercase tracking-wider text-slate-800"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            <span>For Junkyards</span>
                            <svg 
                                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openSections['vendors'] ? 'rotate-180 text-blue-600' : ''}`} 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {openSections['vendors'] && (
                            <ul className="mt-2.5 space-y-2 pl-1 animate-fade-in">
                                {vendorLinks.map(item => (
                                    <li key={item.path}>
                                        <Link to={item.path} className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors block py-1">
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* 3. Resources */}
                    <div className="py-3">
                        <button
                            type="button"
                            onClick={() => toggleSection('resources')}
                            className="w-full flex items-center justify-between py-1 text-left font-black text-xs uppercase tracking-wider text-slate-800"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            <span>Resources</span>
                            <svg 
                                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openSections['resources'] ? 'rotate-180 text-blue-600' : ''}`} 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {openSections['resources'] && (
                            <ul className="mt-2.5 space-y-2 pl-1 animate-fade-in">
                                {quickLinks.map(item => (
                                    <li key={item.path}>
                                        <Link to={item.path} className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors block py-1">
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* 4. Support & Contact */}
                    <div className="py-3">
                        <button
                            type="button"
                            onClick={() => toggleSection('contact')}
                            className="w-full flex items-center justify-between py-1 text-left font-black text-xs uppercase tracking-wider text-slate-800"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            <span>Support &amp; Contact</span>
                            <svg 
                                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openSections['contact'] ? 'rotate-180 text-blue-600' : ''}`} 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {openSections['contact'] && (
                            <ul className="mt-2.5 space-y-2 pl-1 animate-fade-in">
                                <li>
                                    <a href={`tel:${getFooter('contact', 'phone', '18662933731')}`} className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 py-1">
                                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02C8.76 8.2 8.57 7 8.57 5.77c0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>
                                        <span>{getFooter('contact', 'phone', '1-866-293-3731')}</span>
                                    </a>
                                </li>
                                <li>
                                    <a href={`mailto:${getFooter('contact', 'email', 'info@jynm.com')}`} className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 py-1">
                                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                                        <span>{getFooter('contact', 'email', 'info@jynm.com')}</span>
                                    </a>
                                </li>
                                <li className="flex items-center gap-2 text-xs font-semibold text-slate-500 py-1">
                                    <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                                    <span>{getFooter('contact', 'location', 'Nationwide Service')}</span>
                                </li>
                            </ul>
                        )}
                    </div>
                </div>

                {/* ============================================================
                    DESKTOP VIEW (>= md): Full Multi-Column Grid
                ============================================================ */}
                <div className="hidden md:grid grid-cols-4 gap-8 mb-8">
                    <div>
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-3">Quick Links</p>
                        <ul className="space-y-2.5">
                            {quickLinks.map(item => (
                                <li key={item.path}>
                                    <Link to={item.path} className="text-[13px] font-medium text-slate-500 hover:text-blue-600 transition-colors">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-3">For Buyers</p>
                        <ul className="space-y-2.5">
                            {buyerLinks.map(item => (
                                <li key={item.path}>
                                    <Link to={item.path} className="text-[13px] font-medium text-slate-500 hover:text-blue-600 transition-colors">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-3">For Vendors</p>
                        <ul className="space-y-2.5">
                            {vendorLinks.map(item => (
                                <li key={item.path}>
                                    <Link to={item.path} className="text-[13px] font-medium text-slate-500 hover:text-blue-600 transition-colors">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-3">Contact</p>
                        <ul className="space-y-3">
                            <li>
                                <a href={`tel:${getFooter('contact', 'phone', '18662933731')}`} className="flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-blue-600 transition-colors">
                                    <svg className="w-4 h-4 shrink-0 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02C8.76 8.2 8.57 7 8.57 5.77c0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>
                                    {getFooter('contact', 'phone', '1-866-293-3731')}
                                </a>
                            </li>
                            <li>
                                <a href={`mailto:${getFooter('contact', 'email', 'info@jynm.com')}`} className="flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-blue-600 transition-colors">
                                    <svg className="w-4 h-4 shrink-0 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                                    {getFooter('contact', 'email', 'info@jynm.com')}
                                </a>
                            </li>
                            <li className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                                <svg className="w-4 h-4 shrink-0 text-orange-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                                {getFooter('contact', 'location', 'Nationwide Service')}
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar: Copyright & Legal */}
                <div className="border-t border-slate-100 pt-5 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <p className="text-[11px] font-medium text-slate-400 text-center sm:text-left">
                        © {currentYear} {getFooter('brand', 'copyright_name', 'JYNM')}. {getFooter('brand', 'copyright_text', 'All rights reserved.')}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <span className="text-[11px] font-medium text-slate-400">
                            Sponsored by <a href="https://www.qualityautoparts.com/" target="_blank" rel="noopener noreferrer" className="font-bold text-slate-500 hover:text-blue-600 transition-colors">Quality Auto Parts</a>
                        </span>
                        <span className="hidden sm:inline text-slate-300">|</span>
                        <Link to="/privacy" className="text-[11px] font-medium text-slate-400 hover:text-blue-600 transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="text-[11px] font-medium text-slate-400 hover:text-blue-600 transition-colors">Terms &amp; Conditions</Link>
                        <Link to="/admin-portal/login" className="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors">Admin</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
