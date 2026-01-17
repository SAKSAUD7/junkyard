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

                        {/* Add Your Yard Link - Hide for authenticated vendors */}
                        {!(isAuthenticated && user?.user_type === 'vendor') && (
                            <Link
                                to={isAuthenticated ? "/add-a-yard" : `/signin?returnUrl=${encodeURIComponent('/add-a-yard')}`}
                                className={`relative px-3 py-2 lg:px-5 lg:py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${isActive('/add-a-yard')
                                    ? 'text-white bg-gradient-to-r from-teal-600 to-blue-600 shadow-md'
                                    : 'text-white bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 shadow-sm hover:shadow-md'
                                    }`}
                            >
                                Add Your Yard
                            </Link>
                        )}

                        {/* Vendor Login Button - Hide for authenticated vendors */}
                        {!(isAuthenticated && user?.user_type === 'vendor') && (
                            <Link
                                to="/vendor/login"
                                className="relative px-3 py-2 lg:px-5 lg:py-2.5 rounded-lg text-sm font-bold transition-all duration-200 text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Vendor Login
                            </Link>
                        )}

                        {/* Auth Buttons or Profile Dropdown */}
                        {isAuthenticated ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all"
                                >
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold">
                                        {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                                    </div>
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {profileDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-semibold text-gray-900">{user?.first_name} {user?.last_name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                        </div>

                                        {/* Vendor-specific menu items */}
                                        {user?.user_type === 'vendor' ? (
                                            <>
                                                <Link
                                                    to="/vendor/dashboard"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                                    onClick={() => setProfileDropdownOpen(false)}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                        </svg>
                                                        Dashboard
                                                    </div>
                                                </Link>
                                                <Link
                                                    to="/vendor/profile"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                                    onClick={() => setProfileDropdownOpen(false)}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                        </svg>
                                                        My Yard
                                                    </div>
                                                </Link>
                                                <Link
                                                    to="/vendor/leads"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                                    onClick={() => setProfileDropdownOpen(false)}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                        Leads
                                                    </div>
                                                </Link>
                                            </>
                                        ) : (
                                            <Link
                                                to="/profile"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                                onClick={() => setProfileDropdownOpen(false)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    Profile
                                                </div>
                                            </Link>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Logout
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Sign In Button */}
                                <Link
                                    to="/signin"
                                    className="relative px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow-md"
                                >
                                    Sign In
                                </Link>
                                {/* Sign Up Button */}
                                <Link
                                    to="/signup"
                                    className="relative px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
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
                <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
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

                        {/* Add Your Yard Link - Hide for authenticated vendors */}
                        {!(isAuthenticated && user?.user_type === 'vendor') && (
                            <Link
                                to={isAuthenticated ? "/add-a-yard" : `/signin?returnUrl=${encodeURIComponent('/add-a-yard')}`}
                                className={`block px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 text-center ${isActive('/add-a-yard')
                                    ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-md'
                                    : 'text-white bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 shadow-sm'
                                    }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Add Your Yard
                            </Link>
                        )}

                        {/* Vendor Login Button - Hide for authenticated vendors */}
                        {!(isAuthenticated && user?.user_type === 'vendor') && (
                            <Link
                                to="/vendor/login"
                                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Vendor Login
                            </Link>
                        )}
                        {/* Show auth buttons only if not authenticated */}
                        {!isAuthenticated && (
                            <>
                                {/* Sign In Button */}
                                <Link
                                    to="/signin"
                                    className="block px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 text-center"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Sign In
                                </Link>
                                {/* Sign Up Button */}
                                <Link
                                    to="/signup"
                                    className="block px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 text-white bg-blue-600 hover:bg-blue-700 shadow-sm text-center"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Sign Up
                                </Link>
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
