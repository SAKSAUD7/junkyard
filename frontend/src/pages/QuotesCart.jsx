import { useContext } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { AuthContext } from '../contexts/AuthContext';

export default function QuotesCart() {
    const { isAuthenticated, user } = useContext(AuthContext);

    return (
        <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Inter', sans-serif" }}>
            <SEO
                title="My Quotes — JYNM | Junkyards Near Me"
                description="View and manage your active part quote requests from verified junkyards across the USA."
            />
            <Navbar />

            {isAuthenticated ? (
                /* ── Authenticated: show empty cart state ── */
                <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center text-center">

                    {/* Animated Cart Illustration */}
                    <div className="relative mb-8">
                        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-inner border border-blue-200">
                            <svg className="w-14 h-14 text-blue-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                            </svg>
                        </div>
                        {/* Sparkle dots */}
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-400 rounded-full opacity-50 animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-indigo-400 rounded-full opacity-40 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 bg-blue-50 border border-blue-100">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        <span className="text-blue-700 text-[11px] font-black uppercase tracking-widest">Quote Requests</span>
                    </div>

                    <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Your cart is <span className="text-blue-600">empty</span>
                    </h1>
                    <p className="text-[17px] text-slate-500 leading-relaxed max-w-md mb-10 font-medium">
                        Welcome back, <strong className="text-slate-700">{user?.first_name || 'there'}</strong>! When you request a quote from a junkyard, it will appear here.
                    </p>

                    {/* Quick-action cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mb-10">
                        <Link to="/junkyards" className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 00-1-1h-2a1 1 0 00-1 1v5m4 0H9" /></svg>
                            </div>
                            <div className="text-left">
                                <p className="font-extrabold text-slate-900 text-[15px]">Browse Junkyards</p>
                                <p className="text-slate-500 text-[13px] font-medium">Find trusted yards near you</p>
                            </div>
                        </Link>

                        <Link to="/quote" className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            </div>
                            <div className="text-left">
                                <p className="font-extrabold text-slate-900 text-[15px]">Request a Quote</p>
                                <p className="text-slate-500 text-[13px] font-medium">Get free quotes for any part</p>
                            </div>
                        </Link>
                    </div>

                    <Link to="/quote"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-[15px] rounded-2xl shadow-[0_8px_20px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 transition-all duration-300">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Submit a Part Request
                    </Link>
                </section>
            ) : (
                /* ── Guest: prompt to sign in ── */
                <section className="max-w-xl mx-auto px-4 sm:px-6 py-24 flex flex-col items-center text-center">

                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-8 border border-slate-200 shadow-inner">
                        <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                    </div>

                    <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Sign in to view <span className="text-blue-600">your cart</span>
                    </h1>
                    <p className="text-[16px] text-slate-500 leading-relaxed mb-10 max-w-sm font-medium">
                        Create a free account to track your quote requests, save your favorite junkyards, and get faster responses.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-md">
                        <Link to="/signin"
                            className="flex-1 text-center px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md hover:-translate-y-0.5 transition-all duration-200">
                            Sign In
                        </Link>
                        <Link to="/signup"
                            className="flex-1 text-center px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-black rounded-xl border border-slate-200 shadow-sm hover:-translate-y-0.5 transition-all duration-200">
                            Create Account
                        </Link>
                    </div>
                </section>
            )}

            <Footer />
        </div>
    );
}
