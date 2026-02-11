import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import {
    HomeIcon,
    BellIcon,
    BuildingOfficeIcon,
    UserIcon,
    MegaphoneIcon,
    ListBulletIcon,
    ChatBubbleLeftIcon,
    Cog6ToothIcon,
    CurrencyDollarIcon,
    TruckIcon,
    DocumentTextIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

export default function AdminLayout() {
    const { logout, user } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const navigation = [
        { name: 'Dashboard', href: '/admin-portal/dashboard', icon: HomeIcon },
        { name: 'Leads', href: '/admin-portal/leads', icon: ListBulletIcon },
        { name: 'Vendor Leads', href: '/admin-portal/vendor-leads', icon: TruckIcon },
        { name: 'Yard Submissions', href: '/admin-portal/yard-submissions', icon: DocumentTextIcon },
        { name: 'Vendors', href: '/admin-portal/vendors', icon: BuildingOfficeIcon },
        { name: 'Ads', href: '/admin-portal/ads', icon: MegaphoneIcon },
        { name: 'Part Pricing', href: '/admin-portal/pricing', icon: CurrencyDollarIcon },
        { name: 'Messages', href: '/admin-portal/messages', icon: ChatBubbleLeftIcon },
        { name: 'Settings', href: '/admin-portal/settings', icon: Cog6ToothIcon },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex h-screen bg-[#f5f5f7] overflow-hidden font-['Inter',sans-serif]">
            {/* Slim Icon Sidebar - Dark Theme */}
            <aside className="w-20 bg-[#3d4451]/95 backdrop-blur-xl border-r border-[#4a5160]/30 flex flex-col items-center py-6 gap-2 shadow-xl">
                {/* Navigation Icons */}
                <div className="flex flex-col gap-2 flex-1 mt-2">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group relative ${active
                                    ? 'bg-white/95 shadow-lg shadow-black/10 text-[#3d4451]'
                                    : 'text-[#9ca3af] hover:text-white hover:bg-white/10'
                                    }`}
                                title={item.name}
                            >
                                <Icon className="w-5 h-5" />
                                {/* Tooltip */}
                                <span className="absolute left-16 bg-[#2d3340] text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* Logout Button */}
                <button
                    onClick={logout}
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-[#9ca3af] hover:text-red-400 hover:bg-white/10 transition-all group relative"
                    title="Logout"
                >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span className="absolute left-16 bg-[#2d3340] text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                        Logout
                    </span>
                </button>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Modern Header */}
                <header className="bg-white border-b border-[#e5e7eb] px-8 py-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-medium text-[#1f2937]">
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-base text-[#6b7280]">
                                Welcome, <span className="font-semibold text-[#1f2937]">{user?.username || 'admin'}</span>
                            </span>
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white font-semibold shadow-md shadow-indigo-200 text-base">
                                {(user?.username || 'A').charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-8 bg-[#e5e7eb]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
