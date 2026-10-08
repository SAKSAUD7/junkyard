import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useVendorAuth } from '../contexts/VendorAuthContext';
import { api } from '../services/api';
import { getLogoUrl } from '../utils/imageUrl';
import VendorNotificationDrawer from '../components/VendorNotificationDrawer';
import { vendorNotifications } from '../services/vendorApi';

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
    const [notifOpen, setNotifOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
    const accountDropdownRef = React.useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
                setAccountDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    // Poll unread notification count
    useEffect(() => {
        const fetchCount = async () => {
            try {
                const res = await vendorNotifications.list();
                const all = res?.data?.results || res?.data || [];
                setUnreadCount(all.filter(n => !n.is_read).length);
            } catch {}
        };
        if (user) {
            fetchCount();
            const id = setInterval(fetchCount, 30000);
            return () => clearInterval(id);
        }
    }, [user, notifOpen]);

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
                        {/* Notification Bell — opens slide-in drawer */}
                        <button
                            onClick={() => setNotifOpen(true)}
                            title="Notifications"
                            className="relative p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 text-white text-[9px] font-bold px-1 rounded-full border-2 border-white flex items-center justify-center">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>
                        {/* Vendor Account Dropdown */}
                        <div className="relative" ref={accountDropdownRef}>
                            <button
                                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                                className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-sm font-bold transition-all duration-300 border-2 ${
                                    accountDropdownOpen 
                                        ? 'border-transparent text-white bg-gradient-to-r from-[#1a56ff] to-indigo-600 shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/20 ring-offset-1' 
                                        : 'border-slate-200/80 text-slate-700 bg-white hover:border-[#1a56ff]/30 hover:bg-blue-50/50 hover:text-[#1a56ff] shadow-sm'
                                }`}
                            >
                                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black text-white bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm border border-white/20">
                                    {vendorInitial}
                                </div>
                                <span className="hidden sm:block truncate max-w-[120px]">{vendorName}</span>
                                <svg className={`w-3.5 h-3.5 opacity-80 transition-transform duration-300 ${accountDropdownOpen ? 'rotate-180 text-white' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                            </button>

                            {accountDropdownOpen && (
                                <div className="absolute right-0 mt-3 w-72 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] border border-slate-100 p-2 z-50 transform origin-top-right transition-all duration-200">
                                    <div className="flex flex-col gap-1 p-1">
                                        <div className="px-4 py-3 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl border border-slate-100 mb-2">
                                            <p className="text-sm font-black text-slate-900 truncate">{vendorName}</p>
                                            <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{user?.email}</p>
                                        </div>

                                        <NavLink
                                            to="/vendor/dashboard"
                                            onClick={() => setAccountDropdownOpen(false)}
                                            className="flex items-start gap-3.5 px-3 py-2.5 rounded-xl group hover:bg-slate-50 transition-all duration-300"
                                        >
                                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-110 transition-transform">
                                                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <span className="text-[13px] font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">Dashboard</span>
                                                <span className="text-[11px] font-semibold text-slate-400 mt-0.5">Business overview</span>
                                            </div>
                                        </NavLink>

                                        <a
                                            href={vendorProfile?.slug && vendorProfile?.state ? `/junkyards/${vendorProfile.state.toLowerCase()}/${vendorProfile.slug}` : '/junkyards'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => setAccountDropdownOpen(false)}
                                            className="flex items-start gap-3.5 px-3 py-2.5 rounded-xl group hover:bg-slate-50 transition-all duration-300"
                                        >
                                            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border border-blue-100/50 group-hover:scale-110 transition-transform">
                                                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <span className="text-[13px] font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors">Public Profile</span>
                                                <span className="text-[11px] font-semibold text-slate-400 mt-0.5">View your yard listing</span>
                                            </div>
                                        </a>

                                        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-1" />
                                        
                                        <button 
                                            onClick={handleLogout}
                                            className="flex items-start gap-3.5 px-3 py-2.5 rounded-xl group hover:bg-rose-50/50 transition-all duration-300 w-full text-left"
                                        >
                                            <div className="p-2 rounded-xl bg-rose-50 border border-rose-100 group-hover:scale-110 transition-transform">
                                                <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <span className="text-[13px] font-extrabold text-rose-600 group-hover:text-rose-700 transition-colors">Log out</span>
                                                <span className="text-[11px] font-semibold text-slate-400 mt-0.5">End your session</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
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

            <VendorNotificationDrawer
                isOpen={notifOpen}
                onClose={() => setNotifOpen(false)}
            />
        </div>
    );
};

export default VendorLayout;
