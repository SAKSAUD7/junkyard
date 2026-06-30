import { Link } from 'react-router-dom'
import { useCMS } from '../hooks/useCMS'

export default function Footer() {
    const currentYear = new Date().getFullYear()
    const { get: getFooter } = useCMS('footer')
    const { get: getNavbar } = useCMS('navbar')
    
    const logoUrl = getNavbar('brand', 'logo');

    return (
        <footer className="bg-white border-t border-slate-100 pt-12 pb-6 font-inter">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-5">
                            {logoUrl ? (
                                <img src={logoUrl} alt="JYNM Logo" className="w-8 h-8 object-contain" />
                            ) : (
                                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                                    </svg>
                                </div>
                            )}
                            <div>
                                <div className="text-lg font-black text-slate-900 leading-none tracking-tight">JYNM</div>
                                <div className="text-[9px] font-bold text-slate-500 tracking-widest uppercase mt-0.5">Junkyards Near Me</div>
                            </div>
                        </div>

                        <p className="text-[13px] font-medium text-slate-500 leading-relaxed max-w-[280px] mb-6">
                            {getFooter('brand', 'description', 'Connecting people to quality used auto parts from trusted junkyards across the nation.')}
                        </p>

                        <div className="flex gap-2">
                            {['facebook', 'instagram', 'twitter', 'youtube'].map((social) => (
                                <a key={social} href="#" className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-blue-600 transition-colors hover-rainbow-text hover:border-transparent" style={{ transition: 'none' }}>
                                    {social === 'facebook' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>}
                                    {social === 'instagram' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>}
                                    {social === 'twitter' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>}
                                    {social === 'youtube' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 00-2.122 2.136C0 8.084 0 12 0 12s0 3.916.501 5.814a3.016 3.016 0 002.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 002.122-2.136C24 15.916 24 12 24 12s0-3.916-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-[14px] text-slate-900 mb-4">Quick Links</h3>
                        <ul className="space-y-3">
                            {[
                                { name: 'Home', path: '/' },
                                { name: 'Search', path: '/search' },
                                { name: 'Browse', path: '/browse' },
                                { name: 'Junkyards', path: '/vendors' },
                                { name: 'Blog', path: '/blog' },
                                { name: 'About Us', path: '/about' },
                                { name: 'Contact', path: '/contact' }
                            ].map(item => (
                                <li key={item.name}>
                                    <Link to={item.path} className="text-[13px] font-medium text-slate-500 hover-rainbow-text hover:font-bold">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* For Buyers */}
                    <div>
                        <h3 className="font-bold text-[14px] text-slate-900 mb-4">For Buyers</h3>
                        <ul className="space-y-3">
                            {[
                                { name: 'How It Works', path: '/how-it-works' },
                                { name: 'FAQ', path: '/faq' },
                                { name: 'Get a Quote', path: '/quote' }
                            ].map(item => (
                                <li key={item.name}>
                                    <Link to={item.path} className="text-[13px] font-medium text-slate-500 hover-rainbow-text hover:font-bold">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* For Vendors */}
                    <div>
                         <h3 className="font-bold text-[14px] text-slate-900 mb-4">For Vendors</h3>
                        <ul className="space-y-3">
                            {[
                                { name: 'Add a Yard', path: '/add-a-yard' },
                                { name: 'Vendor Login', path: '/vendor/login' }
                            ].map(item => (
                                <li key={item.name}>
                                    <Link to={item.path} className="text-[13px] font-medium text-slate-500 hover-rainbow-text hover:font-bold">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {/* Contact */}
                    <div className="lg:col-span-1 min-w-[240px]">
                        <h3 className="font-bold text-[13px] tracking-widest text-slate-900 mb-6 uppercase">Contact</h3>
                        <div className="space-y-4">
                            {/* Phone */}
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>
                                </div>
                                <span className="text-[14px] font-medium text-slate-600 font-mono tracking-widest">{getFooter('contact', 'phone', '1-866-293-3731')}</span>
                            </div>
                            
                            {/* Email */}
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                                </div>
                                <span className="text-[14px] font-medium text-slate-600 font-mono tracking-widest">{getFooter('contact', 'email', 'info@jynm.com')}</span>
                            </div>

                            <div className="h-px bg-slate-100 w-full my-4"></div>

                            {/* Location */}
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl bg-[#fff2eb] border border-[#ffedd5] flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-[#ea580c]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[14px] font-bold text-slate-700">{getFooter('contact', 'location', 'Nationwide Service')}</span>
                                    <span className="text-[13px] font-medium text-slate-500">{getFooter('contact', 'location_desc', 'Serving all 50 States')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[12px] font-medium text-slate-500">
                        © {currentYear} JYNM. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link to="/privacy" className="text-[12px] font-medium text-slate-500 hover-rainbow-text">Privacy Policy</Link>
                        <Link to="/terms" className="text-[12px] font-medium text-slate-500 hover-rainbow-text">Terms & Conditions</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
