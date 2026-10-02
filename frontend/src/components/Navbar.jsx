import { useState, useEffect, useRef, useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import SignupModal from './auth/SignupModal'
import LoginModal from './auth/LoginModal'
import ForgotPasswordModal from './auth/ForgotPasswordModal'
import MobileDrawer from './MobileDrawer'
import { AuthContext } from '../contexts/AuthContext'
import { useCMS } from '../hooks/useCMS'

export default function Navbar() {
    const { get } = useCMS('navbar')
    const { get: getGlobal } = useCMS('global')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [signupModalOpen, setSignupModalOpen] = useState(false)
    const [loginModalOpen, setLoginModalOpen] = useState(false)
    const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false)
    const [accountDropdownOpen, setAccountDropdownOpen] = useState(false)
    const [mobileAccountOpen, setMobileAccountOpen] = useState(false)
    const accountDropdownRef = useRef(null)
    const mobileAccountRef = useRef(null)
    const location = useLocation()
    const navigate = useNavigate()
    const { user, isAuthenticated, logout } = useContext(AuthContext)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
                setAccountDropdownOpen(false)
            }
            if (mobileAccountRef.current && !mobileAccountRef.current.contains(event.target)) {
                setMobileAccountOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = () => {
        logout()
        setAccountDropdownOpen(false)
        setMobileAccountOpen(false)
        navigate('/')
    }

    const isAuthRoute = () => {
        const authRoutes = ['/admin/login', '/admin-portal', '/vendor/login', '/signin', '/signup']
        return authRoutes.some(route => location.pathname.startsWith(route))
    }

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/'
        return location.pathname === path || location.pathname.startsWith(path + '/')
    }

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/junkyards', label: 'Junkyards' },
        { path: '/junkyards-by-location', label: 'Browse States' },
        { path: '/blog', label: 'Blog' },
        { path: '/about', label: 'About' },
        { path: '/contact', label: 'Contact' },
    ]

    // Action Icons Data
    const actionIcons = [
        {
            id: 'saved',
            icon: <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
            label: 'Saved Parts',
            onClick: () => isAuthenticated ? navigate('/profile') : setLoginModalOpen(true),
            hasDot: false,
        },
        {
            id: 'notifications',
            icon: <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>,
            label: 'Notifications',
            onClick: () => isAuthenticated ? navigate('/profile') : setLoginModalOpen(true),
            hasDot: true, // Example ping
            dotClass: 'bg-rose-500'
        },
        {
            id: 'vendor',
            icon: <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.999 2.999 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.999 2.999 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5-.615a3.001 3.001 0 013.75-.615A2.999 2.999 0 019.75 8.75c.896 0 1.7-.393 2.25-1.016A2.999 2.999 0 0114.25 8.75c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 013.75.614m-16.5-.615V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25v7.45m-16.5 0v7.45" /></svg>,
            label: 'Vendor Hub',
            onClick: () => isAuthenticated && user?.user_type === 'vendor' ? navigate('/vendor/dashboard') : navigate('/vendor/login'),
            hasDot: false,
        },
    ]

    return (
        <>
            <nav
                className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-xl border-b border-slate-200/80 shadow-sm"
                style={{
                    fontFamily: "'Inter', sans-serif",
                    background: 'rgba(255, 255, 255, 0.98)',
                    paddingTop: 'env(safe-area-inset-top, 0px)',
                }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-14 md:h-[72px]">

                        {/* Mobile spacer to balance header */}
                        <div className="flex items-center lg:hidden w-1/3 justify-start shrink-0"></div>

                        {/* Center Logo — bigger on mobile */}
                        <Link to="/" className="flex items-center gap-2 shrink-0 justify-center w-1/3 lg:w-auto lg:justify-start" aria-label="JYNM Home">
                            <picture>
                                <source srcSet="/logo.webp" type="image/webp" />
                                <img
                                    src={getGlobal('brand', 'logo') || '/logo.png'}
                                    alt="JYNM Logo"
                                    width="52"
                                    height="52"
                                    fetchpriority="high"
                                    className="h-11 md:h-12 w-auto object-contain"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                            </picture>
                            <div className="hidden sm:flex flex-col leading-none">
                                <span className="text-xl md:text-2xl font-black tracking-tight text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    {get('brand', 'name_short', 'JYNM')}
                                </span>
                                <span className="text-[7px] md:text-[8px] uppercase tracking-widest text-slate-500 font-bold mt-0.5">
                                    {get('brand', 'name_long', 'Junkyards Near Me')}
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Empty Center for minimalist look */}
                        <div className="hidden lg:flex flex-1"></div>

                        {/* Desktop Actions / Icon Cluster */}
                        <div className="hidden lg:flex items-center shrink-0 gap-1.5 xl:gap-2.5">
                            
                            {/* Standard 3 Icons: Saved, Notifications, Vendor */}
                            {actionIcons.map(icon => (
                                <button
                                    key={icon.id}
                                    onClick={icon.onClick}
                                    title={icon.label}
                                    className="relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 border-2 border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-95 group"
                                >
                                    {icon.icon}
                                    {icon.hasDot && (
                                        <span className={`absolute top-[9px] right-[9px] w-2.5 h-2.5 rounded-full border-2 border-white ${icon.dotClass || 'bg-blue-500'}`}></span>
                                    )}
                                </button>
                            ))}

                            <div className="w-px h-6 bg-slate-200 mx-1"></div>

                            {/* User Menu Icon */}
                            <div className="relative" ref={accountDropdownRef}>
                                <button
                                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                                    aria-label="Account Settings"
                                    className={`relative flex items-center justify-center gap-1.5 h-11 px-3 rounded-full transition-all duration-300 border-2 active:scale-95 group ${
                                        accountDropdownOpen 
                                            ? 'border-blue-200 text-blue-700 bg-blue-50' 
                                            : 'border-transparent text-slate-700 bg-slate-50 hover:bg-slate-100'
                                    }`}
                                >
                                    {isAuthenticated ? (
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_2px_8px_rgba(79,70,229,0.3)] border-white border">
                                            {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                                        </div>
                                    ) : (
                                        <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                        </svg>
                                    )}
                                    <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${accountDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {accountDropdownOpen && (
                                    <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] border border-slate-100 p-2 z-50 transform origin-top-right transition-all duration-200">
                                        {isAuthenticated ? (
                                            <div className="flex flex-col gap-1 p-1">
                                                <div className="px-4 py-3 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl border border-slate-100 mb-2">
                                                    <p className="text-sm font-black text-slate-900 truncate">{user?.first_name} {user?.last_name}</p>
                                                    <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{user?.email}</p>
                                                </div>

                                                {user?.is_superuser && (
                                                    <ModernDropdownLink to="/admin-portal/dashboard" icon={<svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} label="Admin Portal" description="Manage platform settings" onClick={() => setAccountDropdownOpen(false)} gradient={true} />
                                                )}

                                                {user?.user_type === 'vendor' ? (
                                                    <>
                                                        <ModernDropdownLink to="/vendor/dashboard" icon={<svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} label="Dashboard" description="Business metrics & overview" onClick={() => setAccountDropdownOpen(false)} />
                                                        <ModernDropdownLink to="/vendor/leads" icon={<svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} label="Leads" description="View customer requests" onClick={() => setAccountDropdownOpen(false)} />
                                                    </>
                                                ) : (
                                                    <>
                                                        <ModernDropdownLink to="/profile" icon={<svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} label="Profile" description="Your personal settings" onClick={() => setAccountDropdownOpen(false)} />
                                                        {!user?.is_superuser && (
                                                            <ModernDropdownLink to="/add-a-yard" icon={<svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>} label="Add Your Yard" description="Become a certified partner" onClick={() => setAccountDropdownOpen(false)} gradient={true} />
                                                        )}
                                                    </>
                                                )}
                                                
                                                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-1" />
                                                
                                                <ModernDropdownButton 
                                                    onClick={handleLogout}
                                                    icon={<svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>}
                                                    label="Log out"
                                                    danger={true}
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-1 p-1">
                                                <div className="px-3 pt-2 pb-1.5 flex items-center gap-2">
                                                    <div className="w-1 h-3.5 rounded-full bg-gradient-to-b from-[#1a56ff] to-indigo-600 shadow-sm"></div>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">For Buyers</span>
                                                </div>
                                                
                                                <ModernDropdownButton 
                                                    onClick={() => { setAccountDropdownOpen(false); setLoginModalOpen(true); }}
                                                    icon={<svg className="w-5 h-5 text-[#1a56ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>}
                                                    label="Sign In"
                                                    description="Access your account history"
                                                />
                                                
                                                <ModernDropdownButton 
                                                    onClick={() => { setAccountDropdownOpen(false); setSignupModalOpen(true); }}
                                                    icon={<svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                                                    label="Create Free Account"
                                                    description="Join thousands of smart buyers"
                                                    gradient={true}
                                                />
                                                
                                                <div className="h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent my-2" />
                                                
                                                <div className="px-3 pt-2 pb-1.5 flex items-center gap-2">
                                                    <div className="w-1 h-3.5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500 shadow-sm"></div>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">For Partners</span>
                                                </div>
                                                
                                                <ModernDropdownLink 
                                                    to="/add-a-yard" 
                                                    onClick={() => setAccountDropdownOpen(false)}
                                                    icon={<svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>}
                                                    label="Add Your Yard"
                                                    description="List inventory & get leads"
                                                    gradient={true}
                                                />
                                                
                                                <ModernDropdownLink 
                                                    to="/vendor/login" 
                                                    onClick={() => setAccountDropdownOpen(false)}
                                                    icon={<svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                                                    label="Vendor Login"
                                                    description="Manage business dashboard"
                                                />
                                                
                                                <ModernDropdownLink 
                                                    to="/admin/login" 
                                                    onClick={() => setAccountDropdownOpen(false)}
                                                    icon={<svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                                                    label="Admin Gateway"
                                                />

                                                    <ModernDropdownLink
                                                        to="/"
                                                        onClick={() => setAccountDropdownOpen(false)}
                                                        icon={<svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
                                                        label="Back to Homepage"
                                                        description="Return to JunkyardsNearMe.com"
                                                    />
                                                </div>
                                        )}
                                        </div>
                                )}
                            </div>

                            {/* Quote/Cart Icon */}
                            <button
                                onClick={() => navigate('/quotes')}
                                title="Active Quotes"
                                className="relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 ml-1.5 xl:ml-2.5 bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-[0_4px_16px_rgba(37,99,235,0.3)] shadow-blue-500/30 group"
                            >
                                <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
                                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[10px] font-black text-blue-700 bg-white border-2 border-blue-600 rounded-full">
                                    3
                                </span>
                            </button>
                        </div>

                        {/* Mobile right — Account icon with dropdown */}
                        <div className="w-1/3 lg:hidden flex justify-end shrink-0" ref={mobileAccountRef}>
                            <button
                                onClick={() => setMobileAccountOpen(!mobileAccountOpen)}
                                aria-label="Account"
                                className="relative flex items-center justify-center w-9 h-9 rounded-full border-2 border-slate-200 bg-white shadow-sm active:scale-95 transition-all"
                            >
                                {isAuthenticated ? (
                                    <div className="w-full h-full rounded-full flex items-center justify-center text-xs font-black text-white bg-gradient-to-br from-indigo-500 to-purple-600">
                                        {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                                    </div>
                                ) : (
                                    <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                )}
                            </button>

                            {/* Mobile account dropdown */}
                            {mobileAccountOpen && (
                                <div className="absolute top-[calc(100%+8px)] right-4 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.12)] border border-slate-100 p-2 min-w-[220px] z-50">
                                    {isAuthenticated ? (
                                        <div className="flex flex-col gap-0.5">
                                            <div className="px-4 py-3 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl border border-slate-100 mb-1">
                                                <p className="text-sm font-black text-slate-900 truncate">{user?.first_name} {user?.last_name}</p>
                                                <p className="text-xs font-medium text-slate-500 truncate">{user?.email}</p>
                                            </div>
                                            <Link to="/profile" onClick={() => setMobileAccountOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50">
                                                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                My Profile
                                            </Link>
                                            <div className="h-px bg-slate-100 my-1" />
                                            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 w-full text-left">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                                Log Out
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-0.5">
                                            <div className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Welcome to JYNM</div>
                                            <button
                                                onClick={() => { setMobileAccountOpen(false); setLoginModalOpen(true); }}
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#1a56ff] bg-blue-50 hover:bg-blue-100 w-full text-left"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                                                Sign In
                                            </button>
                                            <button
                                                onClick={() => { setMobileAccountOpen(false); setSignupModalOpen(true); }}
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#1a56ff] to-indigo-600 shadow-md hover:shadow-lg w-full text-left"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                Create Free Account
                                            </button>
                                            <div className="h-px bg-slate-100 my-1" />
                                            <Link to="/vendor/login" onClick={() => setMobileAccountOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                                Vendor / Yard Login
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <MobileDrawer 
                isOpen={mobileMenuOpen} 
                onClose={() => setMobileMenuOpen(false)} 
                navLinks={navLinks}
                isAuthenticated={isAuthenticated}
                user={user}
                handleLogout={handleLogout}
                onOpenLogin={() => setLoginModalOpen(true)}
                onOpenSignup={() => setSignupModalOpen(true)}
            />

            {/* Spacer for fixed navbar — accounts for safe-area-inset-top */}
            <div className="h-14 md:h-[72px]" style={{ marginTop: 'env(safe-area-inset-top, 0px)' }} />

            {/* Modals */}
            <LoginModal
                isOpen={loginModalOpen}
                onClose={() => setLoginModalOpen(false)}
                onSwitchToSignup={() => { setLoginModalOpen(false); setSignupModalOpen(true) }}
                onSwitchToForgotPassword={() => { setLoginModalOpen(false); setForgotPasswordModalOpen(true) }}
            />
            <ForgotPasswordModal
                isOpen={forgotPasswordModalOpen}
                onClose={() => setForgotPasswordModalOpen(false)}
                onBackToLogin={() => { setForgotPasswordModalOpen(false); setLoginModalOpen(true) }}
            />
            <SignupModal
                isOpen={signupModalOpen}
                onClose={() => setSignupModalOpen(false)}
                onSwitchToLogin={() => { setSignupModalOpen(false); setLoginModalOpen(true) }}
            />
        </>
    )
}

function ModernDropdownLink({ to, icon, label, description, onClick, gradient }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className="flex items-start gap-3.5 px-3 py-2.5 rounded-xl group transition-all duration-300 hover:bg-slate-50 relative overflow-hidden text-left bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
            <div className={`p-2 rounded-xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-sm ${gradient ? 'bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border border-blue-100/50' : 'bg-slate-50 border border-slate-100'}`}>
                {icon}
            </div>
            <div className="flex flex-col justify-center">
                <span className="text-[13px] font-extrabold text-slate-800 group-hover:text-[#1a56ff] transition-colors">{label}</span>
                {description && <span className="text-[11px] font-semibold text-slate-400 mt-0.5 leading-snug truncate pr-2 max-w-[200px]">{description}</span>}
            </div>
        </Link>
    )
}

function ModernDropdownButton({ onClick, icon, label, description, gradient, danger }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-start gap-3.5 px-3 py-2.5 rounded-xl group transition-all duration-300 relative overflow-hidden text-left focus:outline-none w-full ${danger ? 'hover:bg-rose-50/50' : 'hover:bg-slate-50'}`}
        >
            <div className={`p-2 rounded-xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-sm ${danger ? 'bg-rose-50 border border-rose-100' : gradient ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50' : 'bg-slate-50 border border-slate-100'}`}>
                {icon}
            </div>
            <div className="flex flex-col justify-center">
                <span className={`text-[13px] font-extrabold transition-colors ${danger ? 'text-rose-600 group-hover:text-rose-700' : 'text-slate-800 group-hover:text-indigo-600'}`}>{label}</span>
                {description && <span className="text-[11px] font-semibold text-slate-400 mt-0.5 leading-snug truncate pr-2 max-w-[200px]">{description}</span>}
            </div>
        </button>
    )
}
