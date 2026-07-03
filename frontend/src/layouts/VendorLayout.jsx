import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useVendorAuth } from '../contexts/VendorAuthContext';
import { api } from '../services/api';
import { getLogoUrl } from '../utils/imageUrl';

// Icons
const Icon = ({ path, path2, className = 'w-5 h-5' }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
        {path2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path2} />}
    </svg>
);

const NAV_ITEMS = [
    {
        to: '/vendor/dashboard', label: 'Dashboard',
        icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    {
        to: '/vendor/profile', label: 'Profile',
        icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    },
    {
        to: '/vendor/inventory', label: 'Inventory',
        icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    },
    {
        to: '/vendor/leads', label: 'Leads',
        icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    },
    {
        to: '/vendor/ads', label: 'Marketing & Ads',
        icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z',
        icon2: 'M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z',
    },
];

const VendorLayout = () => {
    const { user, vendorProfile, logout } = useVendorAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [logo, setLogo] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const content = await api.cms.getPageContent('global');
                if (content?.data) {
                    const logoItem = content.data.find(i => i.key === 'logo' && i.section === 'brand');
                    if (logoItem?.value) setLogo(logoItem.value);
                }
            } catch { /* cosmetic — fail silently */ }
        })();
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/vendor/login');
    };

    const closeSidebar = () => setSidebarOpen(false);

    const vendorName = vendorProfile?.vendor_name || vendorProfile?.vendor?.name || vendorProfile?.name || 'Your Yard';
    const vendorId = vendorProfile?.vendor_id || vendorProfile?.vendor?.yard_id || vendorProfile?.vendor?.id || '';
    const vendorLogo = vendorProfile?.vendor?.logo; // Logo may not be in vendorProfile, might need to rely on API if available
    const vendorInitial = vendorName.charAt(0).toUpperCase();

    // Current page title
    const currentNav = NAV_ITEMS.find(n => location.pathname.startsWith(n.to));
    const pageTitle = currentNav?.label || 'Portal';

    return (
        <div className="flex min-h-screen bg-[#f8fafc] font-sans selection:bg-blue-100">
            {/* ── Sidebar ─────────────────────────────────────────── */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 flex flex-col
                bg-white border-r border-slate-100
                shadow-[4px_0_24px_rgba(0,0,0,0.04)]
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
            `}>
                {/* Brand */}
                <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <img
                            src={logo || '/logo.png'}
                            alt="JYNM"
                            className="h-9 object-contain"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        {!logo && (
                            <div>
                                <span className="block text-[15px] font-black text-slate-900 tracking-tight leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>JYNM</span>
                                <span className="block text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">Vendor Portal</span>
                            </div>
                        )}
                    </div>
                    <button onClick={closeSidebar} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Vendor Identity Card */}
                <div className="mx-4 mt-4 mb-2 p-3 rounded-2xl bg-gradient-to-br from-[#eff6ff] to-[#e0e7ff] border border-blue-100">
                    <div className="flex items-center gap-3">
                        {vendorLogo ? (
                            <img src={getLogoUrl(vendorLogo)} alt={vendorName} className="w-10 h-10 rounded-xl object-contain bg-white border border-blue-100 p-1 flex-shrink-0" onError={e => e.target.style.display='none'} />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-[#1a56ff] flex items-center justify-center flex-shrink-0 font-black text-white text-[15px]">
                                {vendorInitial}
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="text-[12px] font-black text-slate-800 leading-tight line-clamp-1" style={{ fontFamily: "'Outfit', sans-serif" }}>{vendorName}</p>
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-blue-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                                Active
                            </span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-0.5">
                    {NAV_ITEMS.map(({ to, label, icon, icon2 }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={closeSidebar}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-[13px] transition-all duration-150 ${
                                    isActive
                                        ? 'bg-[#eff6ff] text-[#1a56ff] shadow-[inset_3px_0_0_#1a56ff]'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`
                            }
                        >
                            <Icon path={icon} path2={icon2} className="w-[18px] h-[18px] flex-shrink-0" />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="px-3 py-4 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
                    >
                        <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                    </button>
                    <p className="text-[10px] text-slate-400 font-medium text-center mt-2 truncate px-1">{user?.email}</p>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm" onClick={closeSidebar} />
            )}

            {/* ── Main Content ─────────────────────────────────────── */}
            <div className="flex-1 flex flex-col lg:ml-64 w-full min-w-0">
                {/* Top header bar */}
                <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white border-b border-slate-100 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center gap-3">
                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 lg:hidden rounded-xl bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400 font-medium hidden sm:block">Vendor Portal</span>
                            <span className="text-slate-300 hidden sm:block">/</span>
                            <h1 className="text-[15px] font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>{pageTitle}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Yard name pill */}
                        <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5">
                            <div className="w-5 h-5 rounded-full bg-[#1a56ff] flex items-center justify-center flex-shrink-0">
                                <span className="text-[9px] font-black text-white">{vendorInitial}</span>
                            </div>
                            <span className="text-[12px] font-bold text-slate-700 max-w-[140px] truncate">{vendorName}</span>
                        </div>
                        {/* View public profile link */}
                        <a
                            href={`/vendors/${vendorId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            View Profile
                        </a>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8 mx-auto w-full max-w-7xl">
                    <React.Suspense fallback={
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                            <p className="text-sm text-slate-400 font-medium">Loading...</p>
                        </div>
                    }>
                        <Outlet />
                    </React.Suspense>
                </main>
            </div>

            {/* ── Mobile bottom nav ────────────────────────────────── */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-slate-100 flex items-stretch shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
                {NAV_ITEMS.map(({ to, label, icon, icon2 }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[9px] font-bold uppercase tracking-wide transition-colors ${
                                isActive ? 'text-[#1a56ff]' : 'text-slate-400'
                            }`
                        }
                    >
                        <Icon path={icon} path2={icon2} className="w-5 h-5" />
                        <span className="line-clamp-1">{label.split(' ')[0]}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default VendorLayout;
