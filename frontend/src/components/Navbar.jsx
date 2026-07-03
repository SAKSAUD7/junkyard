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
        return location.pathname.startsWith(path)
    }

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/vendors', label: 'Junkyards' },
        { path: '/browse', label: 'Browse States' },
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
                    background: 'rgba(255, 255, 255, 0.98)'
                }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 md:h-[72px]">

                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="JYNM Home">
                            <img
                                src={getGlobal('brand', 'logo') || '/logo.png'}
                                alt="JYNM Logo"
                                className="h-11 md:h-13 w-auto object-contain"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <div className="flex flex-col leading-none">
                                <span className="text-xl md:text-2xl font-black tracking-tight text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    {get('brand', 'name_short', 'JYNM')}
                                </span>
                                <span className="text-[7px] md:text-[8px] uppercase tracking-widest text-slate-500 font-bold mt-0.5">
                                    {get('brand', 'name_long', 'Junkyards Near Me')}
                                </span>
                            </div>
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
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${
                                        accountDropdownOpen 
                                            ? 'border-blue-600 text-blue-600 bg-blue-50' 
                                            : 'border-slate-200 text-slate-700 bg-white hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    {isAuthenticated ? (
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white bg-blue-600 shadow-sm">
                                            {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                                        </div>
                                    ) : (
                                        <svg className="w-5 h-5 text-current opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    )}
                                    <span>Account</span>
                                    <svg className={`w-4 h-4 opacity-70 transition-transform duration-300 ${accountDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {accountDropdownOpen && (
                                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden transform origin-top-right transition-all">
                                        {isAuthenticated ? (
                                            <>
                                                <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50">
                                                    <p className="text-sm font-bold text-slate-900 truncate">{user?.first_name} {user?.last_name}</p>
                                                    <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
                                                </div>

                                                <div className="py-2">
                                                    {user?.is_superuser && (
                                                        <DropdownLink to="/admin-portal/dashboard" icon="⚙️" label="Admin Portal" onClick={() => setAccountDropdownOpen(false)} />
                                                    )}

                                                    {user?.user_type === 'vendor' ? (
                                                        <>
                                                            <DropdownLink to="/vendor/dashboard" icon="📊" label="Dashboard" onClick={() => setAccountDropdownOpen(false)} />
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
                                                </div>
                                                
                                                <div className="border-t border-slate-50" />
                                                <div className="py-2">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full text-left px-5 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors"
                                                    >
                                                        <span className="text-lg">🚪</span> Log out
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="pt-2 pb-1 px-5">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">For Buyers</span>
                                                </div>
                                                <button onClick={() => { setAccountDropdownOpen(false); setLoginModalOpen(true); }} className="w-full text-left px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 flex items-center gap-3 transition-colors">
                                                    <span className="text-lg">👤</span> Sign In
                                                </button>
                                                <button onClick={() => { setAccountDropdownOpen(false); setSignupModalOpen(true); }} className="w-full text-left px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 flex items-center gap-3 transition-colors">
                                                    <span className="text-lg">🚀</span> Create Free Account
                                                </button>
                                                
                                                <div className="border-t border-slate-50 my-2 mx-3" />
                                                
                                                <div className="pt-2 pb-1 px-5">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">For Partners</span>
                                                </div>
                                                <DropdownLink to="/add-a-yard" icon="➕" label="Add Your Yard" onClick={() => setAccountDropdownOpen(false)} />
                                                <DropdownLink to="/vendor/login" icon="🏪" label="Vendor Login" onClick={() => setAccountDropdownOpen(false)} />
                                                
                                                <div className="border-t border-slate-50 my-2 mx-3" />
                                                
                                                <div className="py-1">
                                                    <DropdownLink to="/admin/login" icon="⚙️" label="Admin Login" onClick={() => setAccountDropdownOpen(false)} />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="p-2 -mr-2 transition-colors text-slate-600 hover:text-blue-600 lg:hidden"
                            onClick={() => setMobileMenuOpen(true)}
                            aria-label="Open mobile menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
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

            {/* Spacer for fixed navbar */}
            <div className="h-16 md:h-[72px]" />

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
            className="flex items-center gap-3 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 transition-colors w-full text-left"
        >
            <span className="text-lg">{icon}</span>
            <span>{label}</span>
        </Link>
    )
}
