import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionContext';
import {
    HomeIcon, BuildingOfficeIcon, MegaphoneIcon, ListBulletIcon,
    ChatBubbleLeftIcon, Cog6ToothIcon, DocumentTextIcon, ShieldCheckIcon,
    NewspaperIcon, ArrowTopRightOnSquareIcon, Bars3Icon, BookOpenIcon,
    MagnifyingGlassIcon, BellIcon, EnvelopeIcon, QuestionMarkCircleIcon,
    TruckIcon, XMarkIcon, UserIcon, ClockIcon, CreditCardIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

// ── Search Result Item ─────────────────────────────────────────────────────
function SearchResult({ item, onClose, navigate }) {
    const icons = { lead: '📋', vendor: '🏢', message: '✉️' };
    return (
        <button
            onClick={() => { navigate(item.href); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left group"
        >
            <span className="text-xl">{icons[item.type]}</span>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{item.title}</p>
                <p className="text-xs text-slate-400 truncate">{item.subtitle}</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                {item.type}
            </span>
        </button>
    );
}

export default function AdminLayout() {
    const { logout, user, isAdmin } = useContext(AuthContext);
    const { hasPermission, roleName } = usePermissions();
    const location = useLocation();
    const navigate = useNavigate();
    const [logo, setLogo] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const searchRef = useRef(null);
    const searchTimeout = useRef(null);

    // Notifications state (recent new leads)
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notifLoading, setNotifLoading] = useState(false);
    const notifRef = useRef(null);

    // Messages state (unread contact messages)
    const [msgOpen, setMsgOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [msgLoading, setMsgLoading] = useState(false);
    const msgRef = useRef(null);

    // User Profile Dropdown state
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    // Logo fetch
    useEffect(() => {
        const fetchBrand = async () => {
            try {
                const response = await api.cms.getPageContent('global');
                if (response?.data) {
                    const logoItem = response.data.find(i => i.key === 'logo' && i.section === 'brand');
                    if (logoItem?.value) setLogo(logoItem.value);
                }
            } catch {}
        };
        fetchBrand();
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        const handle = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
            if (msgRef.current && !msgRef.current.contains(e.target)) setMsgOpen(false);
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, []);

    // Search function
    const doSearch = useCallback(async (q) => {
        if (!q.trim() || q.length < 2) { setSearchResults([]); return; }
        setSearchLoading(true);
        try {
            const results = [];
            const [leadsData, vendorsData, msgsData] = await Promise.allSettled([
                api.getAdminLeads(null, { search: q, page_size: 5 }),
                api.getAdminVendors(null, { search: q, page_size: 5 }),
                api.getContactMessages(null),
            ]);

            if (leadsData.status === 'fulfilled') {
                const leads = leadsData.value?.results || leadsData.value || [];
                leads.slice(0, 5).forEach(l => results.push({
                    type: 'lead', title: `${l.year || ''} ${l.make || ''} ${l.model || ''} — ${l.part || ''}`.trim(),
                    subtitle: `${l.name || ''} · ${l.email || ''}`, href: `/admin-portal/leads`
                }));
            }
            if (vendorsData.status === 'fulfilled') {
                const vendors = vendorsData.value?.results || vendorsData.value || [];
                vendors.slice(0, 5).forEach(v => results.push({
                    type: 'vendor', title: v.name || 'Unnamed Vendor',
                    subtitle: `${v.city || ''}, ${v.state || ''}`, href: `/admin-portal/vendors`
                }));
            }
            if (msgsData.status === 'fulfilled') {
                const msgs = msgsData.value?.results || msgsData.value || [];
                msgs.filter(m => 
                    m.name?.toLowerCase().includes(q.toLowerCase()) ||
                    m.subject?.toLowerCase().includes(q.toLowerCase()) ||
                    m.email?.toLowerCase().includes(q.toLowerCase())
                ).slice(0, 3).forEach(m => results.push({
                    type: 'message', title: m.subject || 'No subject',
                    subtitle: `${m.name} · ${m.email}`, href: `/admin-portal/messages`
                }));
            }
            setSearchResults(results);
        } catch {
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    }, []);

    const handleSearchChange = (e) => {
        const q = e.target.value;
        setSearchQuery(q);
        setSearchOpen(true);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => doSearch(q), 400);
    };

    // Fetch notifications (recent new leads)
    const fetchNotifications = async () => {
        setNotifLoading(true);
        try {
            const data = await api.getAdminLeads(null, { status: 'new', page_size: 8 });
            const list = data?.results || data || [];
            setNotifications(list);
        } catch {
            setNotifications([]);
        } finally {
            setNotifLoading(false);
        }
    };

    // Fetch messages panel
    const fetchMessages = async () => {
        setMsgLoading(true);
        try {
            const data = await api.getContactMessages(null);
            const list = data?.results || (Array.isArray(data) ? data : []);
            setMessages(list.filter(m => !m.is_read).slice(0, 8));
        } catch {
            setMessages([]);
        } finally {
            setMsgLoading(false);
        }
    };

    const handleNotifOpen = () => {
        setMsgOpen(false);
        setSearchOpen(false);
        if (!notifOpen) fetchNotifications();
        setNotifOpen(v => !v);
    };

    const handleMsgOpen = () => {
        setNotifOpen(false);
        setSearchOpen(false);
        if (!msgOpen) fetchMessages();
        setMsgOpen(v => !v);
    };

    const handleMarkRead = async (msgId) => {
        try {
            await api.markMessageAsRead(null, msgId);
            setMessages(prev => prev.filter(m => m.id !== msgId));
        } catch {}
    };

    const unreadMsgCount = messages.length;
    const newLeadCount = notifications.length;

    const allNavItems = [
        { name: 'Dashboard',        href: '/admin-portal/dashboard',       icon: HomeIcon,          permission: null,                        exact: true },
        { name: 'Vendors',          href: '/admin-portal/vendors',          icon: BuildingOfficeIcon, permission: 'can_manage_vendors' },
        { name: 'Leads',            href: '/admin-portal/leads',           icon: ListBulletIcon,    permission: 'can_manage_leads' },
        { name: 'Vendor Leads',     href: '/admin-portal/vendor-leads',    icon: TruckIcon,         permission: 'can_manage_leads' },
        { name: 'Ads',              href: '/admin-portal/ads',              icon: MegaphoneIcon,     permission: 'can_manage_ads' },
        { name: 'Payments',         href: '/admin-portal/payments',         icon: CreditCardIcon,    permission: null },
        { name: 'Website Pages',    href: '/admin-portal/cms',              icon: DocumentTextIcon,  permission: 'can_manage_cms' },
        { name: 'Knowledge Center', href: '/admin-portal/blog',             icon: BookOpenIcon,      permission: 'can_manage_cms' },
        { name: 'Users',            href: '/admin-portal/roles',            icon: ShieldCheckIcon,   permission: 'can_manage_roles' },
        { name: 'Yard Submissions', href: '/admin-portal/yard-submissions', icon: NewspaperIcon,     permission: 'can_manage_yard_submissions' },
        { name: 'Messages',         href: '/admin-portal/messages',         icon: ChatBubbleLeftIcon, permission: 'can_manage_messages' },
        { name: 'Feedback',         href: '/admin-portal/feedback',         icon: QuestionMarkCircleIcon, permission: 'can_manage_messages' },
        { name: 'Settings',         href: '/admin-portal/settings',         icon: Cog6ToothIcon,     permission: 'can_manage_settings' },
    ];

    const navigation = allNavItems.filter(item => !item.permission || isAdmin || hasPermission(item.permission));
    const isActive = (item) => item.exact ? location.pathname === item.href : location.pathname.startsWith(item.href);

    return (
        <div className="flex h-screen bg-[#f8fafc]" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* ── Sidebar ─────────────────────────────────────────────── */}
            <aside className={`flex flex-col bg-white border-r border-slate-100 shadow-sm transition-all duration-300 flex-shrink-0 z-20 ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
                <div className="flex items-center gap-3 px-6 h-20 flex-shrink-0">
                    <img src={logo || '/logo.png'} alt="JYNM Logo" className="h-8 w-auto object-contain flex-shrink-0" onError={e => { e.currentTarget.style.display = 'none'; }} />
                    <div className="flex flex-col leading-none">
                        <span className="text-xl font-black tracking-tight text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>JYNM</span>
                        <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">Junkyards Near Me</span>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                    {navigation.map(item => {
                        const Icon = item.icon;
                        const active = isActive(item);
                        return (
                            <Link key={item.name} to={item.href}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${active ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                                <Icon className={`flex-shrink-0 w-[18px] h-[18px] ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4">
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-4 border border-blue-100/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10"><SparklesIcon className="w-12 h-12 text-blue-600" /></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <SparklesIcon className="w-5 h-5 text-blue-600" />
                                <span className="font-bold text-slate-900 text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>Platform Live</span>
                            </div>
                            <p className="text-xs text-slate-500 mb-4 leading-relaxed">You are viewing the production administration environment.</p>
                            <Link to="/" className="block w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl text-center shadow-md shadow-blue-200 transition-all">
                                View Main Site
                            </Link>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── Main Content ─────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">

                {/* Top Header */}
                <header className="bg-white h-20 px-6 flex items-center justify-between flex-shrink-0 border-b border-slate-100 z-30 relative">
                    <div className="flex items-center gap-6 flex-1">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <Bars3Icon className="w-6 h-6" />
                        </button>

                        {/* ── Search Bar ─────────────────────────────────── */}
                        <div className="hidden md:block relative flex-1 max-w-md" ref={searchRef}>
                            <div className="flex items-center bg-slate-50 rounded-full px-4 py-2.5 w-full border border-slate-100 focus-within:bg-white focus-within:border-blue-200 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                                <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search leads, vendors, messages..."
                                    className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm ml-2 w-full text-slate-700 placeholder-slate-400"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onFocus={() => { if (searchQuery.length >= 2) setSearchOpen(true); }}
                                />
                                {searchQuery && (
                                    <button onClick={() => { setSearchQuery(''); setSearchResults([]); setSearchOpen(false); }}>
                                        <XMarkIcon className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                                    </button>
                                )}
                            </div>

                            {/* Search Dropdown */}
                            {searchOpen && searchQuery.length >= 2 && (
                                <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 max-h-96 overflow-y-auto">
                                    {searchLoading ? (
                                        <div className="flex items-center justify-center py-8 gap-3">
                                            <div className="w-5 h-5 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                                            <span className="text-sm text-slate-500">Searching...</span>
                                        </div>
                                    ) : searchResults.length === 0 ? (
                                        <div className="py-8 text-center">
                                            <p className="text-sm font-semibold text-slate-500">No results for "{searchQuery}"</p>
                                            <p className="text-xs text-slate-400 mt-1">Try a different keyword</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50">
                                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                                                </span>
                                            </div>
                                            {searchResults.map((item, i) => (
                                                <SearchResult key={i} item={item} onClose={() => { setSearchOpen(false); setSearchQuery(''); }} navigate={navigate} />
                                            ))}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center gap-5 pl-4">
                        <div className="flex items-center gap-4 border-r border-slate-200 pr-5">

                            {/* ── Notifications (New Leads) ──────────── */}
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={handleNotifOpen}
                                    className={`relative text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg ${notifOpen ? 'bg-blue-50 text-blue-600' : ''}`}
                                >
                                    <BellIcon className="w-6 h-6" />
                                    {newLeadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 text-white text-[9px] font-bold px-1 rounded-full border-2 border-white flex items-center justify-center">
                                            {newLeadCount > 99 ? '99+' : newLeadCount}
                                        </span>
                                    )}
                                </button>

                                {notifOpen && (
                                    <div className="absolute right-0 top-full mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>New Leads</h3>
                                                <p className="text-xs text-slate-400 mt-0.5">Recent unactioned lead submissions</p>
                                            </div>
                                            <Link to="/admin-portal/leads" onClick={() => setNotifOpen(false)}
                                                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                                                View All
                                            </Link>
                                        </div>

                                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                                            {notifLoading ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <div className="w-5 h-5 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                                                </div>
                                            ) : notifications.length === 0 ? (
                                                <div className="py-10 text-center">
                                                    <BellIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                    <p className="text-sm text-slate-400">No new leads</p>
                                                </div>
                                            ) : notifications.map(lead => (
                                                <button key={lead.id}
                                                    onClick={() => { navigate('/admin-portal/leads'); setNotifOpen(false); }}
                                                    className="w-full flex items-start gap-3 px-5 py-3.5 hover:bg-blue-50/50 transition-colors text-left">
                                                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <span className="text-blue-600 text-xs font-bold">{(lead.name || 'L').charAt(0).toUpperCase()}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-slate-800 truncate">
                                                            {lead.year} {lead.make} {lead.model}
                                                        </p>
                                                        <p className="text-xs text-slate-500 truncate">{lead.part} · {lead.name}</p>
                                                        <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                                            <ClockIcon className="w-3 h-3" />
                                                            {new Date(lead.created_at).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full flex-shrink-0">NEW</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ── Messages Panel (Unread) ───────────── */}
                            <div className="relative" ref={msgRef}>
                                <button
                                    onClick={handleMsgOpen}
                                    className={`relative text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg ${msgOpen ? 'bg-blue-50 text-blue-600' : ''}`}
                                >
                                    <EnvelopeIcon className="w-6 h-6" />
                                    {unreadMsgCount > 0 && (
                                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 text-white text-[9px] font-bold px-1 rounded-full border-2 border-white flex items-center justify-center">
                                            {unreadMsgCount > 99 ? '99+' : unreadMsgCount}
                                        </span>
                                    )}
                                </button>

                                {msgOpen && (
                                    <div className="absolute right-0 top-full mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Unread Messages</h3>
                                                <p className="text-xs text-slate-400 mt-0.5">Customer inquiries awaiting review</p>
                                            </div>
                                            <Link to="/admin-portal/messages" onClick={() => setMsgOpen(false)}
                                                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                                                View All
                                            </Link>
                                        </div>

                                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                                            {msgLoading ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <div className="w-5 h-5 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                                                </div>
                                            ) : messages.length === 0 ? (
                                                <div className="py-10 text-center">
                                                    <EnvelopeIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                    <p className="text-sm text-slate-400">No unread messages</p>
                                                </div>
                                            ) : messages.map(msg => (
                                                <div key={msg.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                                                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <span className="text-indigo-600 text-xs font-bold">{(msg.name || 'U').charAt(0).toUpperCase()}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-slate-800 truncate">{msg.name}</p>
                                                        <p className="text-xs text-slate-500 truncate font-medium">{msg.subject}</p>
                                                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{msg.message?.slice(0, 60)}...</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleMarkRead(msg.id)}
                                                        title="Mark as read"
                                                        className="text-slate-300 hover:text-blue-500 transition-colors flex-shrink-0 mt-1"
                                                    >
                                                        <XMarkIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {messages.length > 0 && (
                                            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                                                <Link to="/admin-portal/messages" onClick={() => setMsgOpen(false)}
                                                    className="block w-full text-center text-xs font-bold text-blue-600 hover:text-blue-700 py-1">
                                                    Open Messages →
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <button className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg">
                                <QuestionMarkCircleIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* User Profile */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className={`flex items-center gap-3 p-1.5 pr-3 rounded-full transition-all duration-300 border-2 ${
                                    userMenuOpen 
                                        ? 'border-indigo-500 bg-indigo-50/50' 
                                        : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                                }`}
                                title="Admin Profile"
                            >
                                <div className="text-right hidden sm:block ml-2">
                                    <p className="text-sm font-extrabold text-slate-800 leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        {user?.username || 'Admin'}
                                    </p>
                                    <p className="text-[11px] text-slate-500 font-bold">{roleName || 'Superuser'}</p>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-sm ring-2 ring-white">
                                    {(user?.username || 'A').charAt(0).toUpperCase()}
                                </div>
                                <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${userMenuOpen ? 'rotate-180 text-indigo-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {userMenuOpen && (
                                <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] border border-slate-100 p-2 z-50 transform origin-top-right transition-all duration-200 animate-in fade-in zoom-in-95">
                                    <div className="px-4 py-3 bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-xl border border-slate-100 mb-2">
                                        <p className="text-sm font-black text-slate-900 truncate">{user?.username || 'Admin'}</p>
                                        <p className="text-xs font-semibold text-slate-500 truncate mt-0.5">{user?.email || 'admin@jynm.com'}</p>
                                    </div>
                                    
                                    <div className="flex flex-col gap-1">
                                        <Link
                                            to="/admin-portal/settings"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-start gap-3 px-3 py-2.5 rounded-xl group transition-all duration-300 hover:bg-slate-50 text-left w-full focus:outline-none"
                                        >
                                            <div className="p-2 rounded-xl flex-shrink-0 bg-slate-50 border border-slate-100 transition-transform duration-300 group-hover:scale-110 shadow-sm">
                                                <Cog6ToothIcon className="w-5 h-5 text-slate-600 group-hover:text-indigo-600" />
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <span className="text-[13px] font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors">Settings</span>
                                                <span className="text-[11px] font-semibold text-slate-400 mt-0.5 leading-snug">System preferences</span>
                                            </div>
                                        </Link>
                                        
                                        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-1" />
                                        
                                        <button
                                            onClick={() => { setUserMenuOpen(false); logout(); }}
                                            className="flex items-start gap-3 px-3 py-2.5 rounded-xl group transition-all duration-300 hover:bg-rose-50 text-left w-full focus:outline-none"
                                        >
                                            <div className="p-2 rounded-xl flex-shrink-0 bg-rose-50 border border-rose-100 transition-transform duration-300 group-hover:scale-110 shadow-sm">
                                                <ArrowTopRightOnSquareIcon className="w-5 h-5 text-rose-500" />
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <span className="text-[13px] font-extrabold text-rose-600 group-hover:text-rose-700 transition-colors">Log out</span>
                                                <span className="text-[11px] font-semibold text-slate-400 mt-0.5 leading-snug">End administrative session</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
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
