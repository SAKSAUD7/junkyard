import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useVendorAuth } from '../contexts/VendorAuthContext';
import NotificationBell from '../components/vendor/NotificationBell';
import '../styles/vendor.css';

const VendorLayout = () => {
    const { user, vendorProfile, logout } = useVendorAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
        <div className="vendor-layout">
            {/* Sidebar */}
            <aside className={`vendor-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="vendor-sidebar-logo">
                    <h1>JYNM Vendor</h1>
                    {/* Close button for mobile */}
                    <button
                        onClick={closeSidebar}
                        className="vendor-sidebar-close"
                        aria-label="Close menu"
                    >
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="vendor-sidebar-nav">
                    <NavLink
                        to="/vendor/dashboard"
                        className={({ isActive }) => `vendor-nav-item ${isActive ? 'active' : ''}`}
                        onClick={closeSidebar}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/vendor/profile"
                        className={({ isActive }) => `vendor-nav-item ${isActive ? 'active' : ''}`}
                        onClick={closeSidebar}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                    </NavLink>

                    <NavLink
                        to="/vendor/inventory"
                        className={({ isActive }) => `vendor-nav-item ${isActive ? 'active' : ''}`}
                        onClick={closeSidebar}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Inventory
                    </NavLink>

                    <NavLink
                        to="/vendor/leads"
                        className={({ isActive }) => `vendor-nav-item ${isActive ? 'active' : ''}`}
                        onClick={closeSidebar}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Leads
                    </NavLink>
                </nav>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div className="vendor-sidebar-overlay" onClick={closeSidebar} />
            )}

            {/* Main Content */}
            <div className="vendor-main">
                {/* Header */}
                <header className="vendor-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {/* Hamburger Menu Button */}
                        <button
                            onClick={toggleSidebar}
                            className="vendor-hamburger"
                            aria-label="Toggle menu"
                        >
                            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                            {vendorProfile?.vendor?.name || 'Vendor Portal'}
                        </h2>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }} className="vendor-user-info">
                            <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                                {user?.email}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--vendor-text-secondary)' }}>
                                Vendor Account
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="vendor-btn vendor-btn-secondary"
                            style={{ fontSize: '0.875rem' }}
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="vendor-content">
                    <Outlet />
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
            </nav>
        </div>
    );
};

export default VendorLayout;
