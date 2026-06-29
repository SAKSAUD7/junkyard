import { Link } from 'react-router-dom'
import { useCMS } from '../hooks/useCMS'

export default function Footer() {
    const currentYear = new Date().getFullYear()
    const { get } = useCMS('footer')

    return (
        <footer className="bg-white border-t border-slate-100 pt-12 pb-6 font-inter">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-5">
                            {get('brand', 'logo') ? (
                                <img src={get('brand', 'logo')} alt="JYNM Logo" className="w-8 h-8 object-contain" />
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
                            Connecting people to quality used auto parts from trusted junkyards across the nation.
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
                            {['Home', 'Browse Parts', 'Junkyards', 'Blog', 'About Us', 'Contact Us'].map(link => (
                                <li key={link}>
                                    <Link to={`/${link.toLowerCase().replace(' ', '-')}`} className="text-[13px] font-medium text-slate-500 hover-rainbow-text hover:font-bold">
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* For Buyers */}
                    <div>
                        <h3 className="font-bold text-[14px] text-slate-900 mb-4">For Buyers</h3>
                        <ul className="space-y-3">
                            {['Search Parts', 'How It Works', 'Buying Guides', 'Shipping Info', 'Returns', 'Help Center'].map(link => (
                                <li key={link}>
                                    <Link to={`/${link.toLowerCase().replace(' ', '-')}`} className="text-[13px] font-medium text-slate-500 hover-rainbow-text hover:font-bold">
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* For Vendors */}
                    <div>
                         <h3 className="font-bold text-[14px] text-slate-900 mb-4">For Vendors</h3>
                        <ul className="space-y-3">
                            {['Become a Vendor', 'Vendor Dashboard', 'Add Inventory', 'Pricing Plans', 'Resources', 'Vendor Support'].map(link => (
                                <li key={link}>
                                    <Link to={`/${link.toLowerCase().replace(' ', '-')}`} className="text-[13px] font-medium text-slate-500 hover-rainbow-text hover:font-bold">
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {/* Newsletter */}
                    <div className="lg:col-span-1 min-w-[240px]">
                         <h3 className="font-bold text-[14px] text-slate-900 mb-4">Newsletter</h3>
                         <p className="text-[12px] font-medium text-slate-500 mb-3">
                            Subscribe for tips, deals & latest updates.
                         </p>
                         <form className="space-y-2.5" onSubmit={e => e.preventDefault()}>
                            <input 
                                type="email" 
                                placeholder="Your email address" 
                                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium text-[13px] shadow-inner"
                            />
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded px-3 py-2 transition-colors shadow-sm text-[13px]">
                                Subscribe
                            </button>
                         </form>
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
                        <Link to="/sitemap" className="text-[12px] font-medium text-slate-500 hover-rainbow-text">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
