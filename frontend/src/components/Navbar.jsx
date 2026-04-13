import { useState, useEffect, useRef, useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import SignupModal from './auth/SignupModal'
import LoginModal from './auth/LoginModal'
import ForgotPasswordModal from './auth/ForgotPasswordModal'
import { AuthContext } from '../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
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

    useEffect(() => { setMobileMenuOpen(false) }, [location])

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
        return location.pathname.startsWith(path)
    }

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/junkyards', label: 'Junkyards' },
        { path: '/junkyards-by-location', label: 'Browse' },
        { path: '/about-us', label: 'About' },
    ]

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-black/80 backdrop-blur-xl border-b border-amber-500/20 shadow-2xl shadow-black/50'
                : 'bg-transparent border-b border-white/5'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 md:h-20">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="relative rounded-xl p-2 transition-all duration-300 group-hover:scale-105"
                                style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}>
                                <svg className="w-6 h-6 md:w-7 md:h-7 text-black" fill="currentColor" viewBox="0 0 24 24">
  <path d="M3.375 7.125a1.125 1.125 0 0 1 1.125-1.125h15a1.125 1.125 0 0 1 1.125 1.125v6.5a1.125 1.125 0 0 1-1.125 1.125h-.52a2.875 2.875 0 0 0-5.59 0h-2.78a2.875 2.875 0 0 0-5.59 0h-.52a1.125 1.125 0 0 1-1.125-1.125v-6.5Z" />
  <path d="M7.5 18a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM19.5 18a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
</svg>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl md:text-2xl font-black tracking-tight text-white leading-none"
                                style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.05em' }}>
                                JYNM
                            </span>
                            <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-amber-400/70 font-mono">
                                Auto Parts Hub
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {!location.pathname.startsWith('/admin-portal') && !isAuthRoute() && navLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive(link.path)
                                    ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                                    : 'text-white/70 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {link.label}
                                {isActive(link.path) && (
                                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full" />
                                )}
                            </Link>
                        ))}

                        {/* Contact Button */}
                        <Link
                            to="/contact"
                            className="relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-amber-400 border border-amber-500/30 hover:bg-amber-500/10 ml-2 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Contact
                        </Link>

                        {/* Account Dropdown */}
                        <div className="relative ml-2" ref={accountDropdownRef}>
                            <button
                                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 bg-amber-500 hover:bg-amber-400 text-black"
                            >
                                {isAuthenticated ? (
                                    <>
                                        <div className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center text-black font-bold text-xs">
                                            {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                                        </div>
                                        <span>Account</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>Sign In</span>
                                    </>
                                )}
                                <svg className={`w-4 h-4 transition-transform duration-200 ${accountDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            <AnimatePresence>
                                {accountDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/10 py-2 z-50 overflow-hidden"
                                        style={{ background: 'rgba(15,17,23,0.95)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
                                    >
                                        {isAuthenticated ? (
                                            <>
                                                <div className="px-4 py-3 border-b border-white/10">
                                                    <p className="text-sm font-semibold text-white">{user?.first_name} {user?.last_name}</p>
                                                    <p className="text-xs text-white/40 truncate">{user?.email}</p>
                                                </div>
                                                {user?.is_superuser && (
                                                    <Link to="/admin-portal/dashboard" className="block px-4 py-2.5 text-sm text-white/70 hover:text-amber-400 hover:bg-white/5 transition-colors" onClick={() => setAccountDropdownOpen(false)}>
                                                        <div className="flex items-center gap-3">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                            Admin Portal
                                                        </div>
                                                    </Link>
                                                )}
                                                {user?.user_type === 'vendor' ? (
                                                    <>
                                                        <Link to="/vendor/dashboard" className="block px-4 py-2.5 text-sm text-white/70 hover:text-amber-400 hover:bg-white/5 transition-colors" onClick={() => setAccountDropdownOpen(false)}>
                                                            <div className="flex items-center gap-3"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>Dashboard</div>
                                                        </Link>
                                                        <Link to="/vendor/leads" className="block px-4 py-2.5 text-sm text-white/70 hover:text-amber-400 hover:bg-white/5 transition-colors" onClick={() => setAccountDropdownOpen(false)}>
                                                            <div className="flex items-center gap-3"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>My Leads</div>
                                                        </Link>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Link to="/profile" className="block px-4 py-2.5 text-sm text-white/70 hover:text-amber-400 hover:bg-white/5 transition-colors" onClick={() => setAccountDropdownOpen(false)}>
                                                            <div className="flex items-center gap-3"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>Profile</div>
                                                        </Link>
                                                        {!user?.is_superuser && (
                                                            <Link to="/add-yard/start" className="block px-4 py-2.5 text-sm text-white/70 hover:text-amber-400 hover:bg-white/5 transition-colors" onClick={() => setAccountDropdownOpen(false)}>
                                                                <div className="flex items-center gap-3"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Add Your Yard</div>
                                                            </Link>
                                                        )}
                                                    </>
                                                )}
                                                <div className="border-t border-white/10 mt-1 pt-1">
                                                    <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                                                        <div className="flex items-center gap-3"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>Logout</div>
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Link to="/add-yard/start" className="block px-4 py-2.5 text-sm text-white/70 hover:text-amber-400 hover:bg-white/5 transition-colors" onClick={() => setAccountDropdownOpen(false)}>
                                                    <div className="flex items-center gap-3"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>Add Your Yard</div>
                                                </Link>
                                                <Link to="/vendor/login" className="block px-4 py-2.5 text-sm text-white/70 hover:text-amber-400 hover:bg-white/5 transition-colors" onClick={() => setAccountDropdownOpen(false)}>
                                                    <div className="flex items-center gap-3"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>Vendor Login</div>
                                                </Link>
                                                <Link to="/admin-portal" className="block px-4 py-2.5 text-sm text-white/70 hover:text-amber-400 hover:bg-white/5 transition-colors" onClick={() => setAccountDropdownOpen(false)}>
                                                    <div className="flex items-center gap-3"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>Admin Login</div>
                                                </Link>
                                                <div className="border-t border-white/10 my-1" />
                                                <Link to="/signin" className="block px-4 py-2.5 text-sm text-white/70 hover:text-amber-400 hover:bg-white/5 transition-colors" onClick={() => setAccountDropdownOpen(false)}>
                                                    <div className="flex items-center gap-3"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>Sign In</div>
                                                </Link>
                                                <Link to="/signup" className="block mx-2 mt-1 px-4 py-2.5 text-sm text-black font-bold bg-amber-500 hover:bg-amber-400 rounded-xl transition-colors text-center" onClick={() => setAccountDropdownOpen(false)}>
                                                    Sign Up Free
                                                </Link>
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-amber-500/40 transition-all duration-200"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <AnimatePresence mode="wait">
                            {mobileMenuOpen ? (
                                <motion.svg key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }} className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </motion.svg>
                            ) : (
                                <motion.svg key="open" initial={{ rotate: 90 }} animate={{ rotate: 0 }} exit={{ rotate: -90 }} className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </motion.svg>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden border-t border-white/5 overflow-hidden"
                        style={{ background: 'rgba(10,11,13,0.98)', backdropFilter: 'blur(20px)' }}
                    >
                        <div className="px-4 py-4 space-y-1">
                            {!location.pathname.startsWith('/admin-portal') && !isAuthRoute() && navLinks.map(link => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive(link.path)
                                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                                    }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            <Link to="/contact" className="block px-4 py-3 rounded-xl text-sm font-semibold text-amber-400 border border-amber-500/20 hover:bg-amber-500/10 transition-all" onClick={() => setMobileMenuOpen(false)}>
                                Contact Support
                            </Link>

                            <div className="border-t border-white/10 my-3" />

                            {isAuthenticated ? (
                                <>
                                    <div className="px-4 py-3 bg-white/5 rounded-xl mb-2">
                                        <p className="text-sm font-semibold text-white">{user?.first_name} {user?.last_name}</p>
                                        <p className="text-xs text-white/40 truncate">{user?.email}</p>
                                    </div>
                                    {user?.user_type === 'vendor' && (
                                        <>
                                            <Link to="/vendor/dashboard" className="block px-4 py-3 rounded-xl text-sm text-white/70 hover:bg-white/5 hover:text-amber-400 transition-all" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                                            <Link to="/vendor/leads" className="block px-4 py-3 rounded-xl text-sm text-white/70 hover:bg-white/5 hover:text-amber-400 transition-all" onClick={() => setMobileMenuOpen(false)}>My Leads</Link>
                                        </>
                                    )}
                                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all">Logout</button>
                                </>
                            ) : (
                                <>
                                    <Link to="/signin" className="block px-4 py-3 rounded-xl text-sm text-white/70 hover:bg-white/5 hover:text-white transition-all" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                                    <Link to="/signup" className="block px-4 py-3 rounded-xl text-sm text-center font-bold text-black bg-amber-500 hover:bg-amber-400 transition-all" onClick={() => setMobileMenuOpen(false)}>Sign Up Free</Link>
                                    <Link to="/vendor/login" className="block px-4 py-3 rounded-xl text-sm text-white/70 hover:bg-white/5 hover:text-amber-400 transition-all" onClick={() => setMobileMenuOpen(false)}>Vendor Login</Link>
                                    <Link to="/add-yard/start" className="block px-4 py-3 rounded-xl text-sm text-white/70 hover:bg-white/5 hover:text-white transition-all" onClick={() => setMobileMenuOpen(false)}>Add Your Yard</Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} onSwitchToSignup={() => { setLoginModalOpen(false); setSignupModalOpen(true); }} onSwitchToForgotPassword={() => { setLoginModalOpen(false); setForgotPasswordModalOpen(true); }} />
            <ForgotPasswordModal isOpen={forgotPasswordModalOpen} onClose={() => setForgotPasswordModalOpen(false)} onBackToLogin={() => { setForgotPasswordModalOpen(false); setLoginModalOpen(true); }} />
            <SignupModal isOpen={signupModalOpen} onClose={() => setSignupModalOpen(false)} onSwitchToLogin={() => { setSignupModalOpen(false); setLoginModalOpen(true); }} />
        </motion.nav>
    )
}
