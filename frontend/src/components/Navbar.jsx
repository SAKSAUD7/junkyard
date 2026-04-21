import { useState, useEffect, useRef, useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import SignupModal from './auth/SignupModal'
import LoginModal from './auth/LoginModal'
import ForgotPasswordModal from './auth/ForgotPasswordModal'
import { AuthContext } from '../contexts/AuthContext'
import { useCMS } from '../hooks/useCMS'

export default function Navbar() {
    const { get } = useCMS('navbar')
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
        return location.pathname.startsWith(path)
    }

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/vendors', label: 'Junkyards' },
        { path: '/browse', label: 'Browse' },
        { path: '/blog', label: 'Blog' },
        { path: '/about', label: 'About' },
    ]

    return (
        <>
            <nav
                className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-xl border-b border-slate-200/80 shadow-sm"
                style={{
                    fontFamily: "'Outfit', sans-serif",
                    background: 'rgba(255, 255, 255, 0.95)'
                }}
            >

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 md:h-20">

                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 group" aria-label="JYNM Home">
                            <div className="relative">
                                {get('brand', 'logo') ? (
                                    <img src={get('brand', 'logo')} alt="JYNM Logo" className="w-10 h-10 object-contain mx-auto" />
                                ) : (
                                    <>
                                        <div
                                            className="w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all duration-300"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(0,100,180,0.1))',
                                                border: '1px solid rgba(37,99,235,0.35)',
                                                boxShadow: '0 0 15px rgba(37,99,235,0.15)'
                                            }}
                                        >
                                            <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none">
                                                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="var(--neon-blue)" strokeWidth="1.5" strokeLinejoin="round" />
                                                <path d="M2 17l10 5 10-5" stroke="var(--neon-orange)" strokeWidth="1.5" strokeLinejoin="round" />
                                                <path d="M2 12l10 5 10-5" stroke="var(--neon-blue)" strokeWidth="1.5" strokeLinejoin="round" opacity="0.6" />
                                            </svg>
                                        </div>
                                        {/* Glow dot */}
                                        <span
                                            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                                            style={{
                                                background: 'var(--neon-blue)',
                                                boxShadow: '0 0 6px var(--neon-blue)',
                                                animation: 'pulse 2s ease-in-out infinite'
                                            }}
                                        />
                                    </>
                                )}
                            </div>
                            <div className="flex flex-col leading-none">
                                <span
                                    className="text-xl md:text-2xl font-black tracking-tighter"
                                    style={{ color: '#0f172a', letterSpacing: '-0.03em' }}
                                >
                                    JYNM
                                </span>
                                <span
                                    className="text-[8px] md:text-[9px] uppercase tracking-[0.2em]"
                                    style={{ color: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}
                                >
                                    {get('brand', 'tagline', 'AutoParts Hub')}
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-1">
                            {!location.pathname.startsWith('/admin-portal') && !isAuthRoute() && navLinks.map(link => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`relative px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 group overflow-hidden ${isActive(link.path)
                                            ? 'text-blue-600 bg-blue-50/50'
                                            : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {/* Active/hover background */}
                                    <span
                                        className={`absolute inset-0 rounded-lg transition-opacity duration-300 ${isActive(link.path) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                            }`}
                                        style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.12)' }}
                                    />
                                    {/* Underline */}
                                    <span
                                        className={`absolute bottom-1 left-4 right-4 h-[1px] transition-all duration-300 ${isActive(link.path) ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'
                                            }`}
                                        style={{ background: 'linear-gradient(90deg, transparent, var(--neon-blue), transparent)' }}
                                    />
                                    <span className="relative z-10">{link.label}</span>
                                </Link>
                            ))}

                            {/* Contact */}
                            <Link
                                to="/contact"
                                className="relative px-4 py-2 ml-1 text-sm font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 text-slate-600 hover:text-blue-600"
                                style={{ border: '1px solid rgba(15,23,42,0.1)', background: '#ffffff' }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)'
                                    e.currentTarget.style.background = '#f8fafc'
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'rgba(15,23,42,0.1)'
                                    e.currentTarget.style.background = '#ffffff'
                                }}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                {get('cta', 'support_label', 'Support')}
                            </Link>

                            {/* Account Dropdown */}
                            <div className="flex items-center gap-2 ml-2 pl-4 border-l border-slate-200">
                                <div className="relative" ref={accountDropdownRef}>
                                    <button
                                        onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                                        style={{ background: '#f8fafc', border: '1px solid rgba(15,23,42,0.08)' }}
                                    >
                                        {isAuthenticated ? (
                                            <div
                                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white"
                                                style={{ background: 'linear-gradient(135deg, var(--neon-blue), #0099dd)' }}
                                            >
                                                {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                                            </div>
                                        ) : (
                                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        )}
                                        <span>Account</span>
                                        <svg
                                            className={`w-3.5 h-3.5 transition-transform duration-300 ${accountDropdownOpen ? 'rotate-180' : ''}`}
                                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {accountDropdownOpen && (
                                        <div
                                            className="absolute right-0 mt-2 w-56 rounded-xl py-2 z-50 animate-scale-in"
                                            style={{
                                                background: '#ffffff',
                                                border: '1px solid rgba(15,23,42,0.08)',
                                                boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
                                            }}
                                        >
                                            {isAuthenticated ? (
                                                <>
                                                    <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(37,99,235,0.08)' }}>
                                                        <p className="text-sm font-semibold text-slate-900">{user?.first_name} {user?.last_name}</p>
                                                        <p className="text-xs truncate text-slate-500">{user?.email}</p>
                                                    </div>

                                                    {user?.is_superuser && (
                                                        <>
                                                            <DropdownLink to="/admin-portal/dashboard" icon="⚙" label="Admin Portal" onClick={() => setAccountDropdownOpen(false)} />
                                                            <div style={{ borderTop: '1px solid rgba(37,99,235,0.06)', margin: '4px 0' }} />
                                                        </>
                                                    )}

                                                    {user?.user_type === 'vendor' ? (
                                                        <>
                                                            <DropdownLink to="/vendor/dashboard" icon="📊" label="Dashboard" onClick={() => setAccountDropdownOpen(false)} />
                                                            <DropdownLink to="/vendor/profile" icon="🏭" label="My Yard" onClick={() => setAccountDropdownOpen(false)} />
                                                            <DropdownLink to="/vendor/leads" icon="👥" label="Leads" onClick={() => setAccountDropdownOpen(false)} />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <DropdownLink to="/profile" icon="👤" label="Profile" onClick={() => setAccountDropdownOpen(false)} />
                                                            {!user?.is_superuser && (
                                                                <DropdownLink to="/add-a-yard" icon="➕" label="Manage Yard" onClick={() => setAccountDropdownOpen(false)} />
                                                            )}
                                                        </>
                                                    )}

                                                    <div style={{ borderTop: '1px solid rgba(37,99,235,0.06)', margin: '4px 0' }} />
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full text-left px-4 py-2.5 text-sm transition-all duration-200 flex items-center gap-3 rounded-none text-red-600 hover:bg-red-50"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                        </svg>
                                                        Logout
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="px-3 py-1.5 mt-1 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">For Buyers</div>
                                                    <DropdownLink to="/signin" icon="👤" label="Sign In" onClick={() => setAccountDropdownOpen(false)} />
                                                    <DropdownLink to="/signup" icon="🚀" label="Create Free Account" onClick={() => setAccountDropdownOpen(false)} />

                                                    <div style={{ borderTop: '1px solid rgba(37,99,235,0.08)', margin: '6px 0' }} />

                                                    <div className="px-3 py-1.5 mt-1 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">For Partners</div>
                                                    <DropdownLink to="/add-a-yard" icon="➕" label="Add Your Yard" onClick={() => setAccountDropdownOpen(false)} />
                                                    <DropdownLink to="/vendor/login" icon="🏪" label="Vendor Login" onClick={() => setAccountDropdownOpen(false)} />

                                                    <div style={{ borderTop: '1px solid rgba(37,99,235,0.08)', margin: '6px 0' }} />

                                                    <DropdownLink to="/admin/login" icon="⚙" label="Admin Login" onClick={() => setAccountDropdownOpen(false)} />
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="p-2 -mr-2 transition-colors text-slate-600 hover:text-slate-900 md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div
                        className="md:hidden animate-slide-up"
                        style={{
                            background: 'rgba(6,12,20,0.97)',
                            backdropFilter: 'blur(20px)',
                            borderTop: '1px solid rgba(37,99,235,0.12)'
                        }}
                    >
                        <div className="px-4 py-4 space-y-1">
                            {!location.pathname.startsWith('/admin-portal') && !isAuthRoute() && navLinks.map(link => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${isActive(link.path) ? 'text-[var(--neon-blue)]' : 'text-[var(--text-secondary)]'
                                        }`}
                                    style={isActive(link.path) ? {
                                        background: 'rgba(37,99,235,0.08)',
                                        border: '1px solid rgba(37,99,235,0.15)'
                                    } : {
                                        border: '1px solid transparent'
                                    }}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            <div style={{ borderTop: '1px solid rgba(37,99,235,0.08)', margin: '8px 0' }} />

                            {isAuthenticated ? (
                                <>
                                    <div className="px-4 py-2 rounded-lg" style={{ background: 'rgba(37,99,235,0.04)', border: '1px solid rgba(37,99,235,0.08)' }}>
                                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.first_name} {user?.last_name}</p>
                                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
                                    </div>
                                    {user?.user_type === 'vendor' && (
                                        <>
                                            <MobileLink to="/vendor/dashboard" label="Dashboard" onClick={() => setMobileMenuOpen(false)} />
                                            <MobileLink to="/vendor/leads" label="Leads" onClick={() => setMobileMenuOpen(false)} />
                                        </>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
                                        style={{ color: '#ff4444', border: '1px solid rgba(255,68,68,0.15)', background: 'rgba(255,68,68,0.04)' }}
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <MobileLink to="/signin" label="Sign In" onClick={() => setMobileMenuOpen(false)} />
                                    <Link
                                        to="/signup"
                                        className="block px-4 py-3 rounded-lg text-sm font-bold text-center transition-all duration-300"
                                        style={{ background: 'linear-gradient(135deg, var(--neon-blue), #0099dd)', color: '#000' }}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Sign Up Free
                                    </Link>
                                    <div style={{ borderTop: '1px solid rgba(37,99,235,0.08)', margin: '8px 0' }} />
                                    <MobileLink to="/vendor/login" label="Vendor Login" onClick={() => setMobileMenuOpen(false)} />
                                    <MobileLink to="/add-a-yard" label="Add Your Yard" onClick={() => setMobileMenuOpen(false)} />
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Spacer for fixed navbar */}
            <div className="h-16 md:h-20" />

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

function DropdownLink({ to, icon, label, onClick }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className="flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--text-primary)'
                e.currentTarget.style.background = 'rgba(37,99,235,0.05)'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--text-secondary)'
                e.currentTarget.style.background = 'transparent'
            }}
        >
            <span className="text-base">{icon}</span>
            <span className="font-medium">{label}</span>
        </Link>
    )
}

function MobileLink({ to, label, onClick }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className="block px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
            style={{
                color: 'var(--text-secondary)',
                border: '1px solid rgba(136,153,170,0.1)',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--text-primary)'
                e.currentTarget.style.borderColor = 'rgba(37,99,235,0.2)'
                e.currentTarget.style.background = 'rgba(37,99,235,0.04)'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--text-secondary)'
                e.currentTarget.style.borderColor = 'rgba(136,153,170,0.1)'
                e.currentTarget.style.background = 'transparent'
            }}
        >
            {label}
        </Link>
    )
}
