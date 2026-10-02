import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export default function MobileBottomNav() {
    const location = useLocation();
    const { isAuthenticated } = useContext(AuthContext);

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
            <div className="h-16 lg:hidden pb-[env(safe-area-inset-bottom)]" />
            
            {/* iOS/Android style bottom tab bar */}
            <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-xl border-t border-slate-200 lg:hidden pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
                <div className="flex items-center justify-around h-[68px] px-1 relative">
                    
                    <Link to="/" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive('/') ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                        <svg className="w-[22px] h-[22px]" fill={isActive('/') ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive('/') ? 0 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        <span className="text-[10px] font-bold tracking-tight">Home</span>
                    </Link>
                    
                    <Link to="/junkyards-by-location" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive('/junkyards') ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                        <svg className="w-[22px] h-[22px]" fill={isActive('/junkyards') ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive('/junkyards') ? 0 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span className="text-[10px] font-bold tracking-tight">Yards</span>
                    </Link>

                    {/* Request Part - Center FAB style */}
                    <div className="relative w-full flex justify-center h-full">
                        <Link to="/quote" className="absolute -top-6 flex flex-col items-center justify-center w-[60px] h-[60px] bg-gradient-to-br from-[#1a56ff] to-[#4f46e5] text-white rounded-full shadow-[0_8px_24px_rgba(26,86,255,0.4)] border-4 border-white transform transition-transform active:scale-95 z-10">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </Link>
                        <span className="absolute bottom-1.5 text-[10px] font-bold tracking-tight text-[#1a56ff]">Request</span>
                    </div>

                    <Link to="/search" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive('/search') ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                        <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive('/search') ? 2.5 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <span className="text-[10px] font-bold tracking-tight">Search</span>
                    </Link>

                    <Link to={isAuthenticated ? "/profile" : "/signin"} className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive('/profile') || isActive('/signin') ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                        <svg className="w-[22px] h-[22px]" fill={isActive('/profile') || isActive('/signin') ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive('/profile') || isActive('/signin') ? 0 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        <span className="text-[10px] font-bold tracking-tight">{isAuthenticated ? 'Profile' : 'Log In'}</span>
                    </Link>
                </div>
            </div>
        </>
    );
}
