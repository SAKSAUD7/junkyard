import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Navigate, Link } from 'react-router-dom';

export default function Profile() {
    const { user, isAuthenticated, logout } = useContext(AuthContext);

    if (!isAuthenticated) return <Navigate to="/signin" replace />;

    const initials = user?.first_name
        ? (user.first_name[0] + (user.last_name?.[0] || '')).toUpperCase()
        : (user?.email?.[0] || 'U').toUpperCase();

    const accountType = user?.is_superuser ? 'Admin' : (user?.user_type === 'vendor' ? 'Vendor' : 'Customer');
    const accountTypeBadge = user?.is_superuser
        ? 'bg-purple-100 text-purple-700'
        : user?.user_type === 'vendor'
        ? 'bg-blue-100 text-blue-700'
        : 'bg-emerald-100 text-emerald-700';

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <SEO title="My Profile | JYNM" description="Manage your JYNM account" />
            <Navbar />

            <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Page heading */}
                <div className="mb-8">
                    <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        My <span className="text-blue-600">Profile</span>
                    </h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Manage your account and preferences.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left: Avatar card */}
                    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-lg mb-4">
                            {initials}
                        </div>
                        <h2 className="text-lg font-black text-slate-900 leading-tight">
                            {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'JYNM User'}
                        </h2>
                        <p className="text-[13px] text-slate-500 truncate max-w-full mt-1">{user?.email}</p>
                        <span className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wide ${accountTypeBadge}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                            {accountType}
                        </span>

                        {/* Quick links */}
                        <div className="w-full mt-6 space-y-2">
                            {user?.user_type === 'vendor' && (
                                <Link to="/vendor/dashboard"
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-[13px] font-bold hover:bg-blue-100 transition-colors">
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6m16 0V9a2 2 0 00-2-2H7a2 2 0 00-2 2v10" />
                                    </svg>
                                    Vendor Dashboard
                                </Link>
                            )}
                            {user?.is_superuser && (
                                <Link to="/admin-portal/dashboard"
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-purple-50 text-purple-700 text-[13px] font-bold hover:bg-purple-100 transition-colors">
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Admin Portal
                                </Link>
                            )}
                            <Link to="/junkyards"
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-700 text-[13px] font-semibold hover:bg-slate-100 transition-colors border border-slate-100">
                                <svg className="w-4 h-4 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Browse Junkyards
                            </Link>
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="lg:col-span-2 space-y-4">

                        {/* Account Details */}
                        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                                <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-wider">Account Details</h3>
                            </div>
                            <dl className="divide-y divide-slate-50">
                                {[
                                    { label: 'Full Name',     value: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '—' },
                                    { label: 'Email Address', value: user?.email || '—' },
                                    { label: 'Account Type', value: accountType },
                                    { label: 'Status',       value: 'Active', highlight: 'text-emerald-600' },
                                ].map(({ label, value, highlight }) => (
                                    <div key={label} className="px-6 py-4 flex items-center justify-between gap-4">
                                        <dt className="text-[12px] font-bold text-slate-400 uppercase tracking-wide flex-shrink-0 w-36">{label}</dt>
                                        <dd className={`text-[14px] font-semibold text-right truncate ${highlight || 'text-slate-800'}`}>{value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                                <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-wider">Quick Actions</h3>
                            </div>
                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Link to="/quote"
                                    className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group">
                                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-slate-800">Request a Quote</p>
                                        <p className="text-[11px] text-slate-400 font-medium">Find parts fast</p>
                                    </div>
                                </Link>
                                <Link to="/junkyards-by-location"
                                    className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-rose-200 hover:bg-rose-50/50 transition-all group">
                                    <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0 group-hover:bg-rose-200 transition-colors">
                                        <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-slate-800">Saved Junkyards</p>
                                        <p className="text-[11px] text-slate-400 font-medium">Your favorites</p>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="bg-white border border-red-100 rounded-2xl shadow-sm p-5 flex items-center justify-between gap-4">
                            <div>
                                <p className="text-[14px] font-bold text-slate-800">Sign Out</p>
                                <p className="text-[12px] text-slate-400 font-medium mt-0.5">You'll be returned to the home page.</p>
                            </div>
                            <button
                                onClick={logout}
                                className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-[13px] font-bold transition-colors border border-rose-100"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
