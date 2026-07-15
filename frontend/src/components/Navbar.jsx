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
    const accountDropdownRef = useRef(null)
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
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = () => {
        logout()
        setAccountDropdownOpen(false)
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

                        <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="JYNM Home">
                            <img
                                src={getGlobal('brand', 'logo') || '/logo.png'}
                                alt="JYNM Logo"
                                className="h-9 md:h-11 w-auto object-contain"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <div className="hidden sm:flex flex-col leading-none">
                                <span className="text-xl md:text-2xl font-black tracking-tight text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    {get('brand', 'name_short', 'JYNM')}
                                </span>
                                <span className="text-[7px] md:text-[8px] uppercase tracking-widest text-slate-500 font-bold mt-0.5">
                                    {get('brand', 'name_long', 'Junkyards Near Me')}
                                </span>
                            </div>
                            {/* Mobile-only compact brand name */}
                            <span className="sm:hidden text-lg font-black tracking-tight text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {get('brand', 'name_short', 'JYNM')}
                            </span>
                        </Link>

                        {/* Desktop Nav Links */}
                        <div className="hidden lg:flex items-center gap-1 mx-auto">
                            {!location.pathname.startsWith('/admin-portal') && !isAuthRoute() && navLinks.map(link => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                                        isActive(link.path)
                                            ? 'text-blue-600'
                                            : 'text-slate-600 hover:text-blue-600'
                                    }`}
                                >
                                    <span className="relative z-10">{link.label}</span>
                                    {isActive(link.path) && (
                                        <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-blue-600 rounded-full" />
                                    )}
                                </Link>
                            ))}
                        </div>

                        {/* Desktop Auth/Action Buttons */}
                        <div className="hidden lg:flex items-center gap-3 shrink-0">
                            <div className="relative" ref={accountDropdownRef}>
                                <button
                                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 border-2 ${
                                        accountDropdownOpen 
                                            ? 'border-transparent text-white bg-gradient-to-r from-[#1a56ff] to-indigo-600 shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/20 ring-offset-1' 
                                            : 'border-slate-200/80 text-slate-700 bg-white hover:border-[#1a56ff]/30 hover:bg-blue-50/50 hover:text-[#1a56ff] shadow-sm'
                                    }`}
                                >
                                    {isAuthenticated ? (
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm border border-white/20">
                                            {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                                        </div>
                                    ) : (
                                        <svg className="w-4 h-4 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    )}
                                    <span>Account</span>
                                    <svg className={`w-3.5 h-3.5 opacity-80 transition-transform duration-300 ${accountDropdownOpen ? 'rotate-180 text-white' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
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
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile: Quote CTA + Menu Button */}
                        <div className="flex items-center gap-2 lg:hidden">
                            <Link
                                to="/quote"
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-black rounded-full shadow-md shadow-blue-600/25 transition-all active:scale-95"
                                aria-label="Get free quote"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span>Get Quote</span>
                            </Link>
                            <button
                                className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors touch-target"
                                onClick={() => setMobileMenuOpen(true)}
                                aria-label="Open mobile menu"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
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
