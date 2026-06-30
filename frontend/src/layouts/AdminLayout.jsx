import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionContext';
import {
    HomeIcon,
    BuildingOfficeIcon,
    MegaphoneIcon,
    ListBulletIcon,
    ChatBubbleLeftIcon,
    Cog6ToothIcon,
    DocumentTextIcon,
    ShieldCheckIcon,
    NewspaperIcon,
    ArrowTopRightOnSquareIcon,
    Bars3Icon,
    BookOpenIcon,
    MagnifyingGlassIcon,
    BellIcon,
    EnvelopeIcon,
    QuestionMarkCircleIcon,
    TruckIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

export default function AdminLayout() {
    const { logout, user, isAdmin } = useContext(AuthContext);
    const { hasPermission, roleName } = usePermissions();
    const location = useLocation();
    const navigate = useNavigate();
    const [logo, setLogo] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        const fetchBrand = async () => {
            try {
                const response = await api.cms.getPageContent('global');
                if (response?.data) {
                    const logoItem = response.data.find(i => i.key === 'portal_logo');
                    if (logoItem?.value) setLogo(logoItem.value);
                }
            } catch (err) {
                console.error("CMS Admin Logo Fetch Failed", err);
            }
        };
        fetchBrand();
    }, []);

    const allNavItems = [
        { name: 'Dashboard',        href: '/admin-portal/dashboard',        icon: HomeIcon,           permission: null,                         exact: true },
        { name: 'Vendors',          href: '/admin-portal/vendors',           icon: BuildingOfficeIcon,  permission: 'can_manage_vendors' },
        { name: 'Leads',            href: '/admin-portal/leads',            icon: ListBulletIcon,     permission: 'can_manage_leads' },
        { name: 'Vendor Leads',     href: '/admin-portal/vendor-leads',     icon: TruckIcon,          permission: 'can_manage_leads' },
        { name: 'Ads',              href: '/admin-portal/ads',               icon: MegaphoneIcon,      permission: 'can_manage_ads' },
        { name: 'Website Pages',    href: '/admin-portal/cms',               icon: DocumentTextIcon,   permission: 'can_manage_cms' },
        { name: 'Knowledge Center', href: '/admin-portal/blog',              icon: BookOpenIcon,       permission: 'can_manage_cms' },
        { name: 'Users',            href: '/admin-portal/roles',             icon: ShieldCheckIcon,    permission: 'can_manage_roles' },
        { name: 'Yard Submissions', href: '/admin-portal/yard-submissions',  icon: NewspaperIcon,      permission: 'can_manage_yard_submissions' },
        { name: 'Messages',         href: '/admin-portal/messages',          icon: ChatBubbleLeftIcon,  permission: 'can_manage_messages' },
        { name: 'Settings',         href: '/admin-portal/settings',          icon: Cog6ToothIcon,      permission: 'can_manage_settings' },
    ];

    const navigation = allNavItems.filter(item =>
        !item.permission || isAdmin || hasPermission(item.permission)
    );

    const isActive = (item) => {
        if (item.exact) return location.pathname === item.href;
        return location.pathname.startsWith(item.href);
    };

    return (
        <div className="flex h-screen bg-[#f8fafc]" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* ── Sidebar ─────────────────────────────────────────────────────── */}
            <aside
                className={`flex flex-col bg-white border-r border-slate-100 shadow-sm transition-all duration-300 flex-shrink-0 z-20 ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}
            >
                {/* Brand Header */}
                <div className="flex items-center gap-3 px-6 h-20 flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600 flex-shrink-0">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                            <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                            <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-xl font-black tracking-tight text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            JYNM
                        </span>
                        <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">
                            Junkyards Near Me
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                                    active
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                <Icon className={`flex-shrink-0 w-[18px] h-[18px] ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Upgrade Action (Simulated from reference image) */}
                <div className="p-4">
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-4 border border-blue-100/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <SparklesIcon className="w-12 h-12 text-blue-600" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <SparklesIcon className="w-5 h-5 text-blue-600" />
                                <span className="font-bold text-slate-900 text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>Platform Live</span>
                            </div>
                            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                                You are viewing the production administration environment.
                            </p>
                            <Link
                                to="/"
                                className="block w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl text-center shadow-md shadow-blue-200 transition-all"
                            >
                                View Main Site
                            </Link>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── Main Content ─────────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">

                {/* Top Header */}
                <header className="bg-white h-20 px-6 flex items-center justify-between flex-shrink-0 border-b border-slate-100 z-10">
                    <div className="flex items-center gap-6 flex-1">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <Bars3Icon className="w-6 h-6" />
                        </button>
                        
                        {/* Search Bar */}
                        <div className="hidden md:flex items-center bg-slate-50 rounded-full px-4 py-2.5 w-full max-w-md border border-slate-100 focus-within:bg-white focus-within:border-blue-200 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search anything..."
                                className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm ml-2 w-full text-slate-700 placeholder-slate-400"
                            />
                        </div>
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center gap-5 pl-4">
                        <div className="flex items-center gap-4 border-r border-slate-200 pr-5">
                            <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
                                <BellIcon className="w-6 h-6" />
                                <span className="absolute top-0 right-0.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                            </button>
                            <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
                                <EnvelopeIcon className="w-6 h-6" />
                                <span className="absolute -top-1 -right-1.5 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">3</span>
                            </button>
                            <button className="text-slate-400 hover:text-slate-600 transition-colors">
                                <QuestionMarkCircleIcon className="w-6 h-6" />
                            </button>
                        </div>
                        
                        {/* User Profile */}
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={logout} title="Click to logout">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-800 leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    {user?.username || 'Admin'}
                                </p>
                                <p className="text-[11px] text-slate-500 font-medium">
                                    {roleName || 'Superuser'}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:bg-rose-500 transition-colors">
                                {(user?.username || 'A').charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className={`flex-1 overflow-y-auto bg-[#f8fafc] ${location.pathname.includes('/cms') ? 'p-0' : 'p-6 lg:p-8'}`}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
