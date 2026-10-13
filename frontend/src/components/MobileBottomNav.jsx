import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MobileMoreMenu from './MobileMoreMenu';

export default function MobileBottomNav() {
    const location = useLocation();
    const [moreOpen, setMoreOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    // Hide navigation when footer comes into view
    useEffect(() => {
        const checkFooter = () => {
            const footer = document.getElementById('site-footer');
            if (!footer) return;
            
            const observer = new IntersectionObserver((entries) => {
                setIsVisible(!entries[0].isIntersecting);
            }, { rootMargin: "50px", threshold: 0.01 });
            
            observer.observe(footer);
            return observer;
        };
        
        const timer = setTimeout(() => {
            const observer = checkFooter();
            return () => observer && observer.disconnect();
        }, 300);
        
        return () => clearTimeout(timer);
    }, [location.pathname]);

    // Close More menu on navigation
    useEffect(() => {
        setMoreOpen(false);
    }, [location.pathname]);

    // Hide on excluded routes (admin portal, vendor portal, auth pages)
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
            {/* Dedicated "More" Sliding Drawer Screen */}
            <MobileMoreMenu isOpen={moreOpen} onClose={() => setMoreOpen(false)} />

            {/* Spacer to prevent content from hiding behind the fixed bottom nav */}
            <div className="h-[68px] lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)', boxSizing: 'content-box' }} />
            
            {/* iOS/Android style 5-destination bottom tab bar */}
            <div 
                className={`fixed bottom-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-2xl border-t border-slate-200/80 lg:hidden shadow-[0_-4px_25px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-out ${isVisible ? 'translate-y-0' : 'translate-y-full opacity-0'}`} 
                style={{ paddingBottom: 'env(safe-area-inset-bottom)', WebkitBackdropFilter: 'blur(20px)' }}
            >
                <div className="flex items-center justify-around h-[64px] px-1 relative">
                    
                    {/* 1. HOME */}
                    <Link 
                        to="/" 
                        className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                            isActive('/') ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <svg className="w-[22px] h-[22px]" fill={isActive('/') ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive('/') ? 0 : 2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="text-[10px] font-bold tracking-tight">Home</span>
                    </Link>
                    
                    {/* 2. SEARCH */}
                    <Link 
                        to="/search" 
                        className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                            isActive('/search') ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="text-[10px] font-bold tracking-tight">Search</span>
                    </Link>

                    {/* 3. YARDS */}
                    <Link 
                        to="/junkyards" 
                        className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                            isActive('/junkyards') ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <svg className="w-[22px] h-[22px]" fill={isActive('/junkyards') ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive('/junkyards') ? 0 : 2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="text-[10px] font-bold tracking-tight">Yards</span>
                    </Link>

                    {/* 4. BLOG */}
                    <Link 
                        to="/blog" 
                        className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                            isActive('/blog') ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <svg className="w-[22px] h-[22px]" fill={isActive('/blog') ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive('/blog') ? 0 : 2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        <span className="text-[10px] font-bold tracking-tight">Blog</span>
                    </Link>

                    {/* 5. MORE */}
                    <button 
                        type="button"
                        onClick={() => setMoreOpen(!moreOpen)} 
                        className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                            moreOpen ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                        <span className="text-[10px] font-bold tracking-tight">More</span>
                    </button>
                </div>
            </div>
        </>
    );
}
