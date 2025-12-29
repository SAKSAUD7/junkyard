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
        { path: '/vendors', label: 'Vendors' },
        { path: '/browse', label: 'Browse' },
        { path: '/about', label: 'About' },
    ]

    return (
        <nav className="bg-dark-950/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14 md:h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 md:gap-3 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                            <div className="relative bg-dark-900 border border-white/10 rounded-lg p-1.5 md:p-2 group-hover:border-primary-500/50 transition-colors">
                                <svg className="w-4 h-4 md:w-6 md:h-6 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base md:text-xl font-black tracking-tighter text-white leading-none font-display">
                                JYNM
                            </span>
                            <span className="text-[8px] md:text-[10px] uppercase tracking-widest text-white/40 font-mono">Industrial Parts</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`relative px-4 py-2 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 font-mono uppercase ${isActive(link.path)
                                    ? 'text-primary-400 bg-white/5 border border-white/5'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Add Your Yard Link */}
                        <Link
                            to="/add-a-yard"
                            className={`relative px-4 py-2 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 font-mono uppercase ${isActive('/add-a-yard')
                                ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                                : 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10'
                                }`}
                        >
                            Add Your Yard
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors ml-auto"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            {
                mobileMenuOpen && (
                    <div className="md:hidden border-t border-white/5 bg-dark-950/95 backdrop-blur-xl animate-slide-down">
                        <div className="px-2 py-3 space-y-1">
                            {navLinks.map(link => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`block px-3 py-2 rounded-lg font-mono text-xs uppercase font-bold transition-all duration-300 ${isActive(link.path)
                                        ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                                        }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            {/* Add Your Yard Link */}
                            <Link
                                to="/add-a-yard"
                                className={`block px-3 py-2 rounded-lg font-mono text-xs uppercase font-bold transition-all duration-300 ${isActive('/add-a-yard')
                                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                    : 'text-cyan-400 hover:bg-cyan-500/10'
                                    }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Add Your Yard
                            </Link>


                        </div>
                    </div>
                )
            }
        </nav>
    )
}
