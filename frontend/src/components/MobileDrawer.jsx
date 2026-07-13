import { Link, useLocation } from 'react-router-dom';

export default function MobileDrawer({ isOpen, onClose, navLinks, isAuthenticated, user, handleLogout, onOpenLogin, onOpenSignup }) {
    const location = useLocation();

    if (!isOpen) return null;

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex" role="dialog" aria-modal="true" aria-label="Navigation menu">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity no-bounce"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="relative ml-auto w-full max-w-sm h-full bg-white shadow-2xl flex flex-col animate-slide-left touch-scroll"
                style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 border-b border-slate-100"
                    style={{ paddingTop: 'max(1.25rem, env(safe-area-inset-top, 1.25rem))', paddingBottom: '1rem' }}>
                    <Link to="/" onClick={onClose} className="flex items-center gap-3" aria-label="JYNM Home">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                                <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                                <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-lg font-black text-slate-900 tracking-tight leading-none block">JYNM</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Junkyards Near Me</span>
                        </div>
                    </Link>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors touch-target"
                        aria-label="Close menu"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-3 px-3 touch-scroll">
                    <nav className="space-y-0.5">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={onClose}
                                className={`flex items-center gap-3.5 px-3 rounded-xl min-h-[52px] text-sm font-semibold transition-colors ${
                                    isActive(link.path)
                                        ? 'bg-blue-50 text-blue-600 border-l-[3px] border-blue-600 pl-[calc(0.75rem-3px)]'
                                        : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                                }`}
                            >
                                <span className="w-5 flex justify-center text-slate-400">
                                    {link.path === '/' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>}
                                    {link.path === '/junkyards' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>}
                                    {link.path === '/junkyards-by-location' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>}
                                    {link.path === '/blog' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v2H5V6zm6 3H5v2h6V9z" clipRule="evenodd" /></svg>}
                                    {link.path === '/about' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>}
                                    {link.path === '/contact' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>}
                                    {(!['/', '/junkyards', '/junkyards-by-location', '/blog', '/about', '/contact'].includes(link.path)) && <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>}
                                </span>
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="my-4 h-px bg-slate-100" />

                    {/* Auth & Actions */}
                    <div className="space-y-2 px-0">
                        {isAuthenticated ? (
                            <>
                                {/* User info card */}
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-3 border border-slate-100">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-sm flex-shrink-0">
                                        {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate">{user?.first_name} {user?.last_name}</p>
                                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                                    </div>
                                </div>

                                {user?.user_type === 'vendor' && (
                                    <Link to="/vendor/dashboard" onClick={onClose}
                                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 min-h-[52px] transition-colors">
                                        <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                        Vendor Dashboard
                                    </Link>
                                )}

                                <button
                                    onClick={() => { handleLogout(); onClose(); }}
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 min-h-[52px] transition-colors"
                                >
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Section: For Buyers */}
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-3 pb-1">For Buyers</p>

                                <button
                                    onClick={() => { onClose(); onOpenLogin(); }}
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 min-h-[52px] transition-colors border border-blue-100"
                                >
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                                    Sign In
                                </button>

                                <button
                                    onClick={() => { onClose(); onOpenSignup?.(); }}
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 min-h-[52px] transition-colors shadow-md shadow-blue-600/20"
                                >
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    Create Free Account
                                </button>

                                <div className="h-px bg-slate-100 my-2" />

                                {/* Section: For Partners */}
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-3 pb-1">For Partners</p>

                                <Link
                                    to="/add-a-yard"
                                    onClick={onClose}
                                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 min-h-[52px] transition-colors border border-slate-100"
                                >
                                    <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                    Add Your Yard
                                    <span className="ml-auto text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">Free</span>
                                </Link>

                                <Link
                                    to="/vendor/login"
                                    onClick={onClose}
                                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 min-h-[52px] transition-colors border border-slate-100"
                                >
                                    <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    Vendor Login
                                    <span className="ml-auto text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Portal</span>
                                </Link>

                                <Link
                                    to="/admin/login"
                                    onClick={onClose}
                                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 min-h-[52px] transition-colors"
                                >
                                    <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    Admin Gateway
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Bottom Icon Dock */}
                <div className="grid grid-cols-3 gap-1 px-4 py-3 border-t border-slate-100 bg-slate-50/80"
                    style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))' }}>
                    <a href={`tel:+18662933731`}
                        className="flex flex-col items-center gap-1.5 py-2 text-slate-500 hover:text-blue-600 transition-colors rounded-xl hover:bg-white min-h-[52px] justify-center touch-target">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        <span className="text-[10px] font-semibold tracking-wide">Call Us</span>
                    </a>
                    <a href={`https://wa.me/18662933731`} target="_blank" rel="noopener noreferrer"
                        className="flex flex-col items-center gap-1.5 py-2 text-slate-500 hover:text-green-600 transition-colors rounded-xl hover:bg-white min-h-[52px] justify-center touch-target">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.711.927 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z"/></svg>
                        <span className="text-[10px] font-semibold tracking-wide">WhatsApp</span>
                    </a>
                    <Link to="/search" onClick={onClose}
                        className="flex flex-col items-center gap-1.5 py-2 text-slate-500 hover:text-blue-600 transition-colors rounded-xl hover:bg-white min-h-[52px] justify-center touch-target">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <span className="text-[10px] font-semibold tracking-wide">Search</span>
                    </Link>
                </div>
            </div>

            <style>{`
                @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
                .animate-slide-left { animation: slideLeft 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards; will-change: transform; }
            `}</style>
        </div>
    );
}
