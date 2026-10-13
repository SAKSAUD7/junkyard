import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'

export default function MobileMoreMenu({ isOpen, onClose }) {
    const { isAuthenticated, user, logout } = useContext(AuthContext)
    const navigate = useNavigate()

    if (!isOpen) return null

    const navItems = [
        {
            label: 'Browse States',
            path: '/junkyards-by-location',
            icon: (
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        },
        {
            label: 'Junkyards',
            path: '/junkyards',
            icon: (
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            )
        },
        {
            label: 'Search Parts',
            path: '/search',
            icon: (
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            )
        },
        {
            label: 'Sell My Vehicle',
            path: '/sell-your-car',
            icon: (
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            label: 'Saved Junkyards',
            path: isAuthenticated ? '/profile?tab=saved' : '/junkyards',
            icon: (
                <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            )
        },
        {
            label: 'Compare Yards',
            path: '/junkyards',
            icon: (
                <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            )
        },
        {
            label: 'About Us',
            path: '/about',
            icon: (
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            label: 'Contact Us',
            path: '/contact',
            icon: (
                <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            )
        }
    ]

    return (
        <div className="fixed inset-0 z-[200] lg:hidden flex flex-col bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            {/* Backdrop click to close */}
            <div className="flex-1" onClick={onClose} />

            {/* Slide-Up / Slide-In Drawer */}
            <div 
                className="w-full bg-white rounded-t-[2.5rem] shadow-2xl flex flex-col max-h-[88vh] overflow-hidden border-t border-slate-100"
                style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))' }}
            >
                {/* Header: Close Button + "More" Title */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close More menu"
                        className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <h2 
                        className="text-lg font-black text-slate-900"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        More
                    </h2>
                    <div className="w-9" /> {/* Spacer for centered title */}
                </div>

                {/* Content: Scrollable list */}
                <div className="flex-1 overflow-y-auto px-4 py-3 divide-y divide-slate-100/80">
                    {/* Primary Secondary Navigation List */}
                    <div className="space-y-1 pb-3">
                        {navItems.map((item, idx) => (
                            <Link
                                key={idx}
                                to={item.path}
                                onClick={onClose}
                                className="flex items-center justify-between px-3 py-3 rounded-2xl hover:bg-slate-50 active:bg-slate-100 transition-colors group"
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        {item.icon}
                                    </div>
                                    <span 
                                        className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors"
                                        style={{ fontFamily: "'Outfit', sans-serif" }}
                                    >
                                        {item.label}
                                    </span>
                                </div>
                                <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        ))}
                    </div>

                    {/* Account Section */}
                    <div className="pt-3">
                        <p className="px-3 text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                            Account
                        </p>

                        {!isAuthenticated ? (
                            <div className="space-y-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        window.dispatchEvent(new CustomEvent('jynm:open-login'));
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-3 rounded-2xl hover:bg-slate-50 active:bg-slate-100 transition-colors group"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                            </svg>
                                        </div>
                                        <span 
                                            className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors"
                                            style={{ fontFamily: "'Outfit', sans-serif" }}
                                        >
                                            Sign In
                                        </span>
                                    </div>
                                    <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        window.dispatchEvent(new CustomEvent('jynm:open-signup'));
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-3 rounded-2xl hover:bg-slate-50 active:bg-slate-100 transition-colors group"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                            </svg>
                                        </div>
                                        <span 
                                            className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors"
                                            style={{ fontFamily: "'Outfit', sans-serif" }}
                                        >
                                            Sign Up
                                        </span>
                                    </div>
                                    <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <Link
                                    to="/profile"
                                    onClick={onClose}
                                    className="w-full flex items-center justify-between px-3 py-3 rounded-2xl hover:bg-slate-50 active:bg-slate-100 transition-colors group"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <span 
                                            className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors"
                                            style={{ fontFamily: "'Outfit', sans-serif" }}
                                        >
                                            My Profile
                                        </span>
                                    </div>
                                    <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        logout();
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-3 rounded-2xl hover:bg-rose-50 text-rose-600 transition-colors group"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                        </div>
                                        <span 
                                            className="text-sm font-bold text-rose-600"
                                            style={{ fontFamily: "'Outfit', sans-serif" }}
                                        >
                                            Sign Out
                                        </span>
                                    </div>
                                    <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
