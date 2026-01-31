import { useState } from 'react';
import {
    HomeIcon,
    BellIcon,
    BuildingOfficeIcon,
    UserIcon,
    PaintBrushIcon,
    ListBulletIcon,
    ChatBubbleLeftIcon,
    Cog6ToothIcon,
    CylinderIcon,
    SunIcon,
    MoonIcon
} from '@heroicons/react/24/outline';

export default function ModernAdminPortal() {
    const [selectedView, setSelectedView] = useState('planner');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [tasks, setTasks] = useState({
        unplanned: [
            { id: 1, title: 'HI-1', project: null, completed: false },
            { id: 2, title: 'HI-1', project: null, completed: false }
        ],
        today: [],
        scheduled: [],
        done: []
    });
    const [expandedGroups, setExpandedGroups] = useState({
        unplanned: true,
        today: true,
        scheduled: true,
        done: true
    });

    const sidebarIcons = [
        { icon: HomeIcon, id: 'home', label: 'Home' },
        { icon: BellIcon, id: 'notifications', label: 'Notifications' },
        { icon: BuildingOfficeIcon, id: 'vendors', label: 'Vendors' },
        { icon: UserIcon, id: 'users', label: 'Users' },
        { icon: PaintBrushIcon, id: 'ads', label: 'Ads' },
        { icon: ListBulletIcon, id: 'planner', label: 'Planner' },
        { icon: ChatBubbleLeftIcon, id: 'messages', label: 'Messages' },
        { icon: Cog6ToothIcon, id: 'settings', label: 'Settings' },
        { icon: CylinderIcon, id: 'database', label: 'Database' }
    ];

    const toggleGroup = (group) => {
        setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const currentDay = currentDate.getDate();

    // Generate calendar days
    const generateCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        // Previous month padding
        for (let i = 0; i < firstDay; i++) {
            days.push({ day: '', isCurrentMonth: false });
        }
        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, isCurrentMonth: true, isToday: i === currentDay });
        }
        return days;
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 overflow-hidden font-['Inter',sans-serif]">
            {/* Slim Icon Sidebar */}
            <aside className="w-20 bg-white/40 backdrop-blur-xl border-r border-white/60 flex flex-col items-center py-6 gap-2">
                {/* Logo */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-lg shadow-slate-900/20 flex items-center justify-center mb-6">
                    <HomeIcon className="w-6 h-6 text-white" />
                </div>

                {/* Navigation Icons */}
                <div className="flex flex-col gap-2 flex-1">
                    {sidebarIcons.map((item) => {
                        const Icon = item.icon;
                        const isActive = selectedView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setSelectedView(item.id)}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group relative ${isActive
                                        ? 'bg-white shadow-lg shadow-slate-200/60 text-slate-700'
                                        : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                                    }`}
                                title={item.label}
                            >
                                <Icon className="w-5 h-5" />
                                {/* Tooltip */}
                                <span className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white/50 transition-all"
                >
                    {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                </button>
            </aside>

            {/* Main Planner Section */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-8">
                        <h1 className="text-2xl font-semibold text-slate-700">Floor Main</h1>
                        <div className="flex gap-2">
                            <span className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-xs">👤</span>
                            <span className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-xs">🎨</span>
                        </div>
                    </div>

                    {/* Planner Card */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg shadow-slate-200/40">
                        <h2 className="text-lg font-medium text-slate-700 mb-4">Planner</h2>

                        {/* Filter Tabs */}
                        <div className="space-y-2 mb-6">
                            <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-100/60 hover:bg-slate-100 transition-all text-slate-600">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">📋</span>
                                    <span className="text-sm font-medium">Unplanned</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full">2</span>
                                    <span className="text-xs">›</span>
                                </div>
                            </button>

                            <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-100/40 transition-all text-slate-500">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">✓</span>
                                    <span className="text-sm">Planned</span>
                                </div>
                            </button>

                            <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-100/40 transition-all text-slate-500">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">📚</span>
                                    <span className="text-sm">All</span>
                                </div>
                            </button>
                        </div>

                        {/* Time Card */}
                        <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl p-6 shadow-md shadow-slate-200/30 mb-6">
                            <div className="flex items-center justify-center mb-4">
                                {/* Analog Clock */}
                                <div className="relative w-32 h-32">
                                    <svg className="w-full h-full" viewBox="0 0 100 100">
                                        {/* Clock face dots */}
                                        {[...Array(12)].map((_, i) => {
                                            const angle = (i * 30 - 90) * (Math.PI / 180);
                                            const x = 50 + 38 * Math.cos(angle);
                                            const y = 50 + 38 * Math.sin(angle);
                                            return <circle key={i} cx={x} cy={y} r="1.5" fill="#94a3b8" />;
                                        })}
                                        {/* Hour hand */}
                                        <line x1="50" y1="50" x2="50" y2="30" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
                                        {/* Minute hand */}
                                        <line x1="50" y1="50" x2="50" y2="20" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
                                        {/* Center dot */}
                                        <circle cx="50" cy="50" r="3" fill="#334155" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-semibold text-slate-700">4pm</div>
                                <div className="text-sm text-slate-500">Wed, 17th July</div>
                            </div>
                        </div>

                        {/* Calendar */}
                        <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl p-5 shadow-md shadow-slate-200/30">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-slate-600">{currentMonth}</h3>
                                <div className="flex gap-2">
                                    <button className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">‹</button>
                                    <button className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">›</button>
                                </div>
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                    <div key={day} className="text-center text-xs text-slate-400 font-medium py-2">
                                        {day}
                                    </div>
                                ))}
                                {generateCalendar().map((day, idx) => (
                                    <button
                                        key={idx}
                                        className={`aspect-square rounded-lg text-sm flex items-center justify-center transition-all ${day.isToday
                                                ? 'bg-slate-700 text-white shadow-md'
                                                : day.isCurrentMonth
                                                    ? 'text-slate-600 hover:bg-slate-100'
                                                    : 'text-slate-300'
                                            }`}
                                    >
                                        {day.day}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Task Management Panel */}
            <aside className="w-96 bg-gradient-to-br from-blue-50/40 to-indigo-50/30 backdrop-blur-xl border-l border-white/60 p-6 overflow-y-auto">
                <h2 className="text-xl font-semibold text-slate-700 mb-6">Todo's</h2>

                {/* Add Task Input */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-md shadow-slate-200/30 mb-6">
                    <div className="flex items-center gap-2 text-slate-500">
                        <ListBulletIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">ToDo Unplanned</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                        <span>+</span>
                        <input
                            type="text"
                            placeholder="Add todo, press ↵ ENTER to save"
                            className="flex-1 bg-transparent outline-none placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Unplanned Tasks */}
                <div className="mb-6">
                    <button
                        onClick={() => toggleGroup('unplanned')}
                        className="w-full flex items-center justify-between mb-3 text-slate-600 hover:text-slate-700"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm">{expandedGroups.unplanned ? '∧' : '∨'}</span>
                            <span className="text-sm font-medium">Unplanned</span>
                            <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full">{tasks.unplanned.length}</span>
                        </div>
                    </button>

                    {expandedGroups.unplanned && (
                        <div className="space-y-2">
                            {tasks.unplanned.map(task => (
                                <div key={task.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-3 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-3">
                                        <button className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-slate-400 transition-colors flex-shrink-0" />
                                        <div className="flex-1 flex items-center gap-2">
                                            <span className="text-sm text-slate-600">{task.title}</span>
                                            <span className="text-sm text-slate-400">{task.title}</span>
                                        </div>
                                        <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-slate-400">⋮⋮</span>
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Without Project Section */}
                            <div className="mt-4">
                                <div className="text-xs text-slate-500 mb-2 px-2">Without Project</div>
                                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <button className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-slate-400 transition-colors flex-shrink-0" />
                                        <div className="flex-1 flex items-center gap-2">
                                            <span className="text-sm text-slate-600">HI-1</span>
                                            <span className="text-sm text-slate-400">HI-1</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Today's Tasks */}
                <div className="mb-6">
                    <button
                        onClick={() => toggleGroup('today')}
                        className="w-full flex items-center justify-between mb-3 text-slate-600 hover:text-slate-700"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm">{expandedGroups.today ? '∧' : '∨'}</span>
                            <span className="text-sm font-medium">Todo's</span>
                            <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full">0</span>
                        </div>
                    </button>
                </div>

                {/* Scheduled Tasks */}
                <div className="mb-6">
                    <button
                        onClick={() => toggleGroup('scheduled')}
                        className="w-full flex items-center justify-between mb-3 text-slate-600 hover:text-slate-700"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm">{expandedGroups.scheduled ? '∧' : '∨'}</span>
                            <span className="text-sm font-medium">Scheduled</span>
                            <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full">0</span>
                        </div>
                    </button>
                </div>

                {/* Done Tasks */}
                <div>
                    <button
                        onClick={() => toggleGroup('done')}
                        className="w-full flex items-center justify-between mb-3 text-slate-600 hover:text-slate-700"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm">{expandedGroups.done ? '∧' : '∨'}</span>
                            <span className="text-sm font-medium">Done</span>
                            <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full">0</span>
                        </div>
                    </button>
                </div>
            </aside>
        </div>
    );
}
