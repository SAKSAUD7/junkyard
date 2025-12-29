import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const location = useLocation()

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/'
        return location.pathname.startsWith(path)
    }

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/search', label: 'Search' },
        { path: '/vendors', label: 'Vendors' },
        { path: '/browse', label: 'Browse' },
        { path: '/about', label: 'About' },
    ]

    return (
        <nav className="bg-dark-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                            <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-2.5 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 hidden sm:block">
                                JYNM
                            </span>
                            <span className="text-xs text-white/40 hidden lg:block">Junkyards Near Me</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-2">
                        {navLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`relative px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${isActive(link.path)
                                    ? 'text-white'
                                    : 'text-white/60 hover:text-white'
                                    }`}
                            >
                                {isActive(link.path) && (
                                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl"></div>
                                )}
                                <span className="relative z-10">{link.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* CTA Button (Desktop) */}
                    <div className="hidden md:block">
                        <Link
                            to="/#lead-form"
                            className="relative group"
                        >
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
                            <div className="relative bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold px-6 py-3 rounded-xl transition-all duration-300 transform group-hover:scale-105">
                                Get Quote
                            </div>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-white/10 bg-dark-900/95 backdrop-blur-xl animate-slide-down">
                    <div className="px-4 py-6 space-y-2">
                        {navLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`block px-5 py-3 rounded-xl font-semibold transition-all duration-300 ${isActive(link.path)
                                    ? 'bg-white/10 text-white border border-white/20'
                                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                                    }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            to="/#lead-form"
                            className="block bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold px-5 py-3 rounded-xl text-center transition-all duration-300 mt-4 shadow-glow"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Get Quote
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    )
}
