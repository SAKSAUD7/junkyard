import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Navigate } from 'react-router-dom';

const Profile = () => {
    const { user, isAuthenticated, logout } = useContext(AuthContext);

    if (!isAuthenticated) return <Navigate to="/signin" replace />;

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col">
            <SEO title="My Profile | JYNM" description="Manage your account settings" />
            <Navbar />

            {/* Light Hero */}
            <section className="relative pt-28 pb-10 bg-white border-b border-slate-100 overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-50/80 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        My <span className="text-blue-600">Profile</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg">Manage your account settings.</p>
                </div>
            </section>

            <div className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_40px_rgb(0,0,0,0.04)] overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 font-black text-xl flex items-center justify-center">
                                {user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Account Details</h3>
                            </div>
                        </div>
                    </div>
                    
                    <div className="px-8 py-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                <dt className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</dt>
                                <dd className="text-lg font-bold text-slate-900">{user?.first_name} {user?.last_name}</dd>
                            </div>
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                <dt className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</dt>
                                <dd className="text-lg font-bold text-slate-900">{user?.email}</dd>
                            </div>
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                <dt className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">Account Type</dt>
                                <dd className="text-lg font-bold text-slate-900 capitalize inline-flex items-center gap-2">
                                    {user?.user_type || 'User'}
                                    {user?.user_type === 'vendor' && <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded uppercase">Partners</span>}
                                </dd>
                            </div>
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                <dt className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</dt>
                                <dd className="text-lg font-bold text-green-600 inline-flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span> Active
                                </dd>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-slate-100">
                            <button onClick={logout} className="px-6 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-bold transition flex items-center justify-center gap-2 w-full md:w-auto">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                                Sign Out Securely
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Profile;
