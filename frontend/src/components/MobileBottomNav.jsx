import { Link, useLocation } from 'react-router-dom';
import { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export default function MobileBottomNav() {
    const location = useLocation();
    const { isAuthenticated } = useContext(AuthContext);
    const [moreOpen, setMoreOpen] = useState(false);
    const moreMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
                setMoreOpen(false);
            }
        };
        if (moreOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [moreOpen]);

    // Shut menu on navigation
    useEffect(() => {
        setMoreOpen(false);
    }, [location.pathname]);

    // Hide on excluded routes (admin, vendor, auth pages)
    const EXCLUDED_PREFIXES = [
        '/admin-portal',
        '/admin',
        '/vendor',
        '/signin',
        '/signup',
        '/forgot-password'
    ];
    if (EXCLUDED_PREFIXES.some(p => location.pathname.startsWith(p))) {
        return null;
    }

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <>
            {/* Spacer to prevent content from hiding behind the fixed bottom nav */}
            <div className="h-[68px] lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)', boxSizing: 'content-box' }} />
            
            {/* iOS/Android style bottom tab bar */}
            {/* Ultra-transparent frosted glass so content below is still visible */}
            <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white/40 backdrop-blur-3xl border-t border-white/30 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)]" style={{ paddingBottom: 'env(safe-area-inset-bottom)', WebkitBackdropFilter: 'blur(24px)' }}>
                
                {/* Expandable "More" Menu overlay */}
                {moreOpen && (
                    <div ref={moreMenuRef} className="absolute bottom-[75px] right-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 p-2 w-[240px] max-w-[calc(100vw-16px)] max-h-[calc(100vh-100px)] overflow-y-auto flex flex-col z-[110] overscroll-contain">
                        <Link to="/junkyards-by-location" onClick={() => setMoreOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 shrink-0`}>
                            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Browse States
                        </Link>

                        <Link to="/sell-your-car" onClick={() => setMoreOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 shrink-0`}>
                            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Sell My Vehicle
                        </Link>
                        
                        <Link to="/blog" onClick={() => setMoreOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 shrink-0`}>
                            <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                            Blog
                        </Link>
                        
                        <Link to="/contact" onClick={() => setMoreOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 shrink-0`}>
                            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            Contact Us
                        </Link>

                        <div className="h-px bg-slate-100 my-1 mx-2 shrink-0"></div>

                        {/* Admin Portal — discoverable link; auth enforced by Django backend */}
                        <Link to="/admin-portal/login" onClick={() => setMoreOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-purple-700 hover:bg-purple-50 shrink-0">
                            <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Admin Portal
                        </Link>
                        
                        <div className="h-px bg-slate-100 my-1 mx-2 shrink-0"></div>
                        <Link to="/add-a-yard" onClick={() => setMoreOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-extrabold text-[13px] text-blue-600 bg-blue-50/50 hover:bg-blue-100/50 shrink-0`}>
                            Are you a Junkyard?
                            <svg className="w-4 h-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </Link>
                    </div>
                )}

                <div className="flex items-center justify-around h-[68px] px-1 relative">
                    
                    <Link to="/" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive('/') ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                        <svg className="w-[22px] h-[22px]" fill={isActive('/') ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive('/') ? 0 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        <span className="text-[10px] font-bold tracking-tight">Home</span>
                    </Link>
                    
                    <Link to="/junkyards-by-location" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive('/junkyards') ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                        <svg className="w-[22px] h-[22px]" fill={isActive('/junkyards') ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive('/junkyards') ? 0 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span className="text-[10px] font-bold tracking-tight">Yards</span>
                    </Link>

                    {/* Request Part - Center FAB style - Request icon */}
                    <div className="relative w-full flex justify-center h-full">
                        {/* the FAB itself has a more translucent backdrop approach to avoid blocking */}
                        <Link to="/quote" className="absolute -top-[20px] flex flex-col items-center justify-center w-[52px] h-[52px] bg-gradient-to-br from-[#1a56ff] to-[#4f46e5] text-white rounded-full shadow-[0_8px_20px_rgba(26,86,255,0.3)] transform transition-transform active:scale-95 z-10 border-4 border-slate-50/20 backdrop-blur-md">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </Link>
                        <span className="absolute bottom-2.5 text-[10px] font-bold tracking-tight text-blue-600">Request</span>
                    </div>

                    <Link to={isAuthenticated ? "/profile" : "/signin"} className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive('/profile') || isActive('/signin') ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                        <svg className="w-[22px] h-[22px]" fill={isActive('/profile') || isActive('/signin') ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive('/profile') || isActive('/signin') ? 0 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        <span className="text-[10px] font-bold tracking-tight">{isAuthenticated ? 'Profile' : 'Log In'}</span>
                    </Link>

                    <button onClick={() => setMoreOpen(!moreOpen)} className={`flex flex-col items-center justify-center w-full h-full gap-1 ${moreOpen ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                        <svg className="w-[22px] h-[22px]" fill={moreOpen ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={moreOpen ? 0 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                        <span className="text-[10px] font-bold tracking-tight">More</span>
                    </button>
                </div>
            </div>
        </>
    );
}
