import { Link } from 'react-router-dom'
import { useCMS } from '../hooks/useCMS'

export default function Footer() {
    const currentYear = new Date().getFullYear()
    const { get: getFooter } = useCMS('footer')
    const { get: getGlobal } = useCMS('global')
    const logoUrl = getGlobal('brand', 'logo');

    const quickLinks = [
        { name: getFooter('quick_links', 'link_home', 'Home'), path: '/' },
        { name: getFooter('quick_links', 'link_search', 'Search'), path: '/search' },
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
    ]

    const vendorLinks = [
        { name: getFooter('vendors', 'link_add', 'Add a Yard'), path: '/add-a-yard' },
        { name: getFooter('vendors', 'link_login', 'Vendor Login'), path: '/vendor/login' },
    ]

    const socials = [
        { key: 'facebook', href: getFooter('social', 'facebook', '#'), icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg> },
        { key: 'instagram', href: getFooter('social', 'instagram', '#'), icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg> },
        { key: 'twitter', href: getFooter('social', 'twitter', '#'), icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
        { key: 'youtube', href: getFooter('social', 'youtube', '#'), icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 00-2.122 2.136C0 8.084 0 12 0 12s0 3.916.501 5.814a3.016 3.016 0 002.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 002.122-2.136C24 15.916 24 12 24 12s0-3.916-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg> },
    ]

    return (
        <footer className="bg-white border-t border-slate-100 pt-10 pb-6">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-10">

                    {/* Brand */}
                    <div className="col-span-2 md:col-span-4 lg:col-span-1">
                        <div className="flex items-center gap-2.5 mb-4">
                            <img src={logoUrl || '/logo.png'} alt="JYNM Logo" className="w-7 h-7 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            <div>
                                <div className="text-base font-black text-slate-900 leading-none">{getGlobal('brand', 'name_short', 'JYNM')}</div>
                                <div className="text-[8px] font-bold text-slate-400 tracking-widest uppercase">{getGlobal('brand', 'name_long', 'Junkyards Near Me')}</div>
                            </div>
                        </div>
                        <p className="text-[12px] text-slate-500 leading-relaxed mb-4 max-w-[220px]">
                            {getFooter('brand', 'description', 'Connecting people to quality used auto parts from trusted junkyards nationwide.')}
                        </p>
                        <div className="flex gap-2">
                            {socials.map(s => (
                                <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer"
                                    className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-colors">
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4">{getFooter('quick_links', 'heading', 'Quick Links')}</h3>
                        <ul className="space-y-2.5">
                            {quickLinks.map(item => (
                                <li key={item.path}><Link to={item.path} className="text-[12px] font-medium text-slate-500 hover:text-blue-600 transition-colors">{item.name}</Link></li>
                            ))}
                        </ul>
                    </div>

                    {/* For Buyers */}
                    <div>
                        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4">{getFooter('buyers', 'heading', 'For Buyers')}</h3>
                        <ul className="space-y-2.5">
                            {buyerLinks.map(item => (
                                <li key={item.path}><Link to={item.path} className="text-[12px] font-medium text-slate-500 hover:text-blue-600 transition-colors">{item.name}</Link></li>
                            ))}
                        </ul>
                    </div>

                    {/* For Vendors */}
                    <div>
                        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4">{getFooter('vendors', 'heading', 'For Vendors')}</h3>
                        <ul className="space-y-2.5">
                            {vendorLinks.map(item => (
                                <li key={item.path}><Link to={item.path} className="text-[12px] font-medium text-slate-500 hover:text-blue-600 transition-colors">{item.name}</Link></li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact — compact inline */}
                    <div>
                        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4">{getFooter('contact', 'heading', 'Contact')}</h3>
                        <ul className="space-y-2.5">
                            <li>
                                <a href={`tel:${getFooter('contact', 'phone', '18662933731')}`} className="flex items-center gap-2 text-[12px] font-medium text-slate-500 hover:text-blue-600 transition-colors">
                                    <svg className="w-3.5 h-3.5 shrink-0 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02C8.76 8.2 8.57 7 8.57 5.77c0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>
                                    {getFooter('contact', 'phone', '1-866-293-3731')}
                                </a>
                            </li>
                            <li>
                                <a href={`mailto:${getFooter('contact', 'email', 'info@jynm.com')}`} className="flex items-center gap-2 text-[12px] font-medium text-slate-500 hover:text-blue-600 transition-colors">
                                    <svg className="w-3.5 h-3.5 shrink-0 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                                    {getFooter('contact', 'email', 'info@jynm.com')}
                                </a>
                            </li>
                            <li className="flex items-center gap-2 text-[12px] font-medium text-slate-500">
                                <svg className="w-3.5 h-3.5 shrink-0 text-orange-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                                {getFooter('contact', 'location', 'Nationwide — All 50 States')}
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-slate-100 pt-5 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <p className="text-[11px] font-medium text-slate-400">
                        © {currentYear} {getFooter('brand', 'copyright_name', 'JYNM')}. {getFooter('brand', 'copyright_text', 'All rights reserved.')}
                    </p>
                    <div className="flex gap-5">
                        <Link to="/privacy" className="text-[11px] font-medium text-slate-400 hover:text-blue-600 transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="text-[11px] font-medium text-slate-400 hover:text-blue-600 transition-colors">Terms &amp; Conditions</Link>
                        <Link to="/admin/login" className="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors">Admin</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
