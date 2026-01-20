import { useState, useEffect, useRef, useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import SignupModal from './auth/SignupModal'
import LoginModal from './auth/LoginModal'
import ForgotPasswordModal from './auth/ForgotPasswordModal'
import { AuthContext } from '../contexts/AuthContext'

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [signupModalOpen, setSignupModalOpen] = useState(false)
    const [loginModalOpen, setLoginModalOpen] = useState(false)
    const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false)
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)
    const location = useLocation()
    const navigate = useNavigate()
    const { user, isAuthenticated, logout } = useContext(AuthContext)

    // Handle scroll for navbar styling
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setProfileDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = () => {
        logout()
        setProfileDropdownOpen(false)
        navigate('/')
    }

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/'
        return location.pathname.startsWith(path)
    }

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/vendors', label: 'Vendors' },
        { path: '/browse', label: 'Browse' },
        { path: '/about', label: 'About' },  // OLD URL for SEO
    ]

    return (
        <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200'
            : 'bg-white border-b border-gray-100'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 md:h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="relative bg-gradient-to-br from-blue-600 to-teal-600 rounded-lg p-2 group-hover:shadow-md transition-all duration-200 transform group-hover:scale-105">
                                <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl md:text-2xl font-black tracking-tight text-gray-900 leading-none font-display">
                                JYNM
                            </span>
                            <span className="text-[9px] md:text-[10px] uppercase tracking-wider text-gray-500 font-mono">Auto Parts Hub</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-2">
                        {navLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive(link.path)
                                    ? 'text-white bg-blue-600 shadow-sm'
                                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Contact Support Button */}
                        <a
                            href="mailto:support@jynm.com"
                            className="relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 text-gray-700 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100"
                        >
                            Contact Support
                        </a>

                        {/* Account Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all border ${profileDropdownOpen ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                            >
                                {isAuthenticated ? (
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                                        {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                                    </div>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                )}
                                <span className="text-sm font-semibold text-gray-700">Account</span>
                                <svg className={`w-4 h-4 text-gray-500 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {profileDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden ring-1 ring-black ring-opacity-5">

                                    {isAuthenticated ? (
                                        <>
                                            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                                <p className="text-sm font-bold text-gray-900">{user?.first_name} {user?.last_name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                            </div>

                                            {/* Authenticated Links */}
                                            {user?.is_superuser && (
                                                <Link
                                                    to="/admin-portal/dashboard"
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                                    onClick={() => setProfileDropdownOpen(false)}
                                                >
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    Admin Portal
                                                </Link>
                                            )}

                                            {user?.user_type === 'vendor' ? (
                                                <>
                                                    <Link to="/vendor/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors" onClick={() => setProfileDropdownOpen(false)}>
                                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                                        Dashboard
                                                    </Link>
                                                    <Link to="/vendor/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors" onClick={() => setProfileDropdownOpen(false)}>
                                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                                        My Yard
                                                    </Link>
                                                </>
                                            ) : (
                                                <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors" onClick={() => setProfileDropdownOpen(false)}>
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                    Profile
                                                </Link>
                                            )}

                                            <div className="border-t border-gray-100 my-1"></div>
                                            <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                                Logout
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            {/* Unauthenticated Links */}
                                            <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                For Vendors
                                            </div>
                                            <Link
                                                to="/add-a-yard"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                                onClick={() => setProfileDropdownOpen(false)}
                                            >
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                                Add Your Yard
                                            </Link>
                                            <Link
                                                to="/vendor/login"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                                onClick={() => setProfileDropdownOpen(false)}
                                            >
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                                                Vendor Login
                                            </Link>

                                            <div className="border-t border-gray-100 my-1"></div>
                                            <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                General
                                            </div>

                                            <Link
                                                to="/signin"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                                onClick={() => setProfileDropdownOpen(false)}
                                            >
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                                                Sign In
                                            </Link>
                                            <Link
                                                to="/signup"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                                                onClick={() => setProfileDropdownOpen(false)}
                                            >
                                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                                Sign Up
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all duration-200"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
                    <div className="px-4 py-4 space-y-2">
                        {navLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive(link.path)
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                    }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}

                        <a
                            href="mailto:support@jynm.com"
                            className="block px-4 py-3 rounded-lg text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Contact Support
                        </a>

                        <div className="border-t border-gray-100 my-2"></div>
                        <div className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Account & Vendor Services
                        </div>

                        {/* Authenticated Mobile Links */}
                        {isAuthenticated ? (
                            <>
                                <div className="px-4 py-2 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                                        {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold text-gray-900 truncate">{user?.first_name} {user?.last_name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                    </div>
                                </div>

                                {user?.user_type === 'vendor' ? (
                                    <>
                                        <Link to="/vendor/dashboard" className="block px-4 py-3 rounded-lg text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                                            Vendor Dashboard
                                        </Link>
                                        <Link to="/vendor/profile" className="block px-4 py-3 rounded-lg text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                                            My Yard
                                        </Link>
                                    </>
                                ) : (
                                    <Link to="/profile" className="block px-4 py-3 rounded-lg text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                                        Profile
                                    </Link>
                                )}

                                {user?.is_superuser && (
                                    <Link to="/admin-portal/dashboard" className="block px-4 py-3 rounded-lg text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                                        Admin Portal
                                    </Link>
                                )}

                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-3 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Unauthenticated Mobile Links */}
                                <Link
                                    to="/add-a-yard"
                                    className="block px-4 py-3 rounded-lg text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Add Your Yard
                                </Link>
                                <Link
                                    to="/vendor/login"
                                    className="block px-4 py-3 rounded-lg text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Vendor Login
                                </Link>
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    <Link
                                        to="/signin"
                                        className="block px-4 py-2.5 rounded-lg text-sm font-bold text-center border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="block px-4 py-2.5 rounded-lg text-sm font-bold text-center bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Login Modal */}
            <LoginModal
                isOpen={loginModalOpen}
                onClose={() => setLoginModalOpen(false)}
                onSwitchToSignup={() => {
                    setLoginModalOpen(false);
                    setSignupModalOpen(true);
                }}
                onSwitchToForgotPassword={() => {
                    setLoginModalOpen(false);
                    setForgotPasswordModalOpen(true);
                }}
            />

            {/* Forgot Password Modal */}
            <ForgotPasswordModal
                isOpen={forgotPasswordModalOpen}
                onClose={() => setForgotPasswordModalOpen(false)}
                onBackToLogin={() => {
                    setForgotPasswordModalOpen(false);
                    setLoginModalOpen(true);
                }}
            />

            {/* Signup Modal */}
            <SignupModal
                isOpen={signupModalOpen}
                onClose={() => setSignupModalOpen(false)}
                onSwitchToLogin={() => {
                    setSignupModalOpen(false);
                    setLoginModalOpen(true);
                }}
            />
        </nav>
    )
}
