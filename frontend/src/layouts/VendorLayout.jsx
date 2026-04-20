import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useVendorAuth } from '../contexts/VendorAuthContext';
import { api } from '../services/api';
import '../styles/vendor.css';

const VendorLayout = () => {
    const { user, vendorProfile, logout } = useVendorAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [logo, setLogo] = useState('');

    useEffect(() => {
        const fetchBrand = async () => {
            try {
                const response = await api.cms.getContent('global');
                if (response?.data) {
                    const logoItem = response.data.find(i => i.key === 'portal_logo');
                    if (logoItem?.value) setLogo(logoItem.value);
                }
            } catch (err) {
                console.error("CMS Vendor Logo Fetch Failed", err);
            }
        };
        fetchBrand();
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/vendor/login');
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="flex min-h-screen bg-slate-900 font-sans text-slate-100 selection:bg-indigo-500/30">
            {/* Sidebar (Glassmorphism Dark) */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out bg-slate-900/60 backdrop-blur-3xl border-r border-slate-700/50 flex flex-col shadow-2xl lg:shadow-none`}>
                <div className="flex items-center justify-between px-6 py-8 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        {logo ? (
                            <img src={logo} alt="JYNM Logo" className="h-10 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
                        ) : (
                            <div className="flex flex-col">
                                <span className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">JYNM</span>
                                <span className="text-[0.6rem] tracking-[0.2em] font-mono text-slate-400 uppercase">Vendor Portal</span>
                            </div>
                        )}
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={closeSidebar}
                        className="lg:hidden text-slate-400 hover:text-white transition-colors"
                        aria-label="Close menu"
                    >
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto hidden-scrollbar">
                    <NavLink
                        to="/vendor/dashboard"
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive ? 'bg-indigo-500/10 text-indigo-400 border-l-4 border-indigo-500' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
                        onClick={closeSidebar}
                    >
                        <svg className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/vendor/profile"
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive ? 'bg-indigo-500/10 text-indigo-400 border-l-4 border-indigo-500' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
                        onClick={closeSidebar}
                    >
                        <svg className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                    </NavLink>

                    <NavLink
                        to="/vendor/inventory"
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive ? 'bg-indigo-500/10 text-indigo-400 border-l-4 border-indigo-500' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
                        onClick={closeSidebar}
                    >
                        <svg className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Inventory
                    </NavLink>

                    <NavLink
                        to="/vendor/leads"
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive ? 'bg-indigo-500/10 text-indigo-400 border-l-4 border-indigo-500' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
                        onClick={closeSidebar}
                    >
                        <svg className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Leads
                    </NavLink>

                    <NavLink
                        to="/vendor/ads"
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive ? 'bg-indigo-500/10 text-indigo-400 border-l-4 border-indigo-500' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
                        onClick={closeSidebar}
                    >
                        <svg className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                        </svg>
                        Marketing & Ads
                    </NavLink>
                </nav>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={closeSidebar} />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-64 w-full relative">
                {/* Header Glassmorphism */}
                <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-slate-900/60 backdrop-blur-xl border-b border-slate-700/50 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 lg:hidden rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                            aria-label="Toggle menu"
                        >
                            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h2 className="hidden sm:block text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-white">
                            {vendorProfile?.vendor?.name || 'Authorized Network Yard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex flex-col text-right">
                            <span className="text-sm font-bold text-slate-200">{user?.email}</span>
                            <span className="text-xs font-mono tracking-widest text-indigo-400">VENDOR HUB</span>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all duration-200"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 md:p-10 mx-auto w-full max-w-7xl">
                    <React.Suspense fallback={
                        <div className="flex justify-center items-center h-64">
                            <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    }>
                        <Outlet />
                    </React.Suspense>
                </main>
            </div>

            {/* Bottom Navigation Bar - Mobile Only */}
            <nav className="vendor-bottom-nav">
                <NavLink
                    to="/vendor/dashboard"
                    className={({ isActive }) => `vendor-bottom-nav-item ${isActive ? 'active' : ''}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/vendor/profile"
                    className={({ isActive }) => `vendor-bottom-nav-item ${isActive ? 'active' : ''}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profile</span>
                </NavLink>

                <NavLink
                    to="/vendor/inventory"
                    className={({ isActive }) => `vendor-bottom-nav-item ${isActive ? 'active' : ''}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span>Inventory</span>
                </NavLink>

                <NavLink
                    to="/vendor/leads"
                    className={({ isActive }) => `vendor-bottom-nav-item ${isActive ? 'active' : ''}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Leads</span>
                </NavLink>

                <NavLink
                    to="/vendor/ads"
                    className={({ isActive }) => `vendor-bottom-nav-item ${isActive ? 'active' : ''}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                    <span>Ads</span>
                </NavLink>
            </nav>
        </div>
    );
};

export default VendorLayout;
