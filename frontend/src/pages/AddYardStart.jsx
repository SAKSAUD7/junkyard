import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

// ── Icons ──────────────────────────────────────────────────────────────────────

function VisitorIcon({ selected }) {
    return (
        <svg
            viewBox="0 0 100 100"
            className="w-20 h-20 sm:w-24 sm:h-24 transition-colors duration-300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="50" cy="50" r="49" fill={selected ? '#eff6ff' : '#f8fafc'} stroke={selected ? '#2563eb' : '#e2e8f0'} strokeWidth="2" />
            {/* Head */}
            <circle cx="50" cy="36" r="14" fill={selected ? '#2563eb' : '#94a3b8'} />
            {/* Body */}
            <path d="M18 82 C18 62 82 62 82 82" fill={selected ? '#2563eb' : '#94a3b8'} />
        </svg>
    );
}

function OwnerIcon({ selected }) {
    return (
        <svg
            viewBox="0 0 100 100"
            className="w-20 h-20 sm:w-24 sm:h-24 transition-colors duration-300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="50" cy="50" r="49" fill={selected ? '#eff6ff' : '#f8fafc'} stroke={selected ? '#2563eb' : '#e2e8f0'} strokeWidth="2" />
            {/* Hard hat */}
            <path d="M22 48 C22 34 78 34 78 48 L78 52 L22 52 Z" fill={selected ? '#2563eb' : '#94a3b8'} />
            <rect x="18" y="52" width="64" height="8" rx="4" fill={selected ? '#1d4ed8' : '#64748b'} />
            {/* Brim of hat */}
            <rect x="14" y="52" width="72" height="5" rx="2.5" fill={selected ? '#1e40af' : '#475569'} />
            {/* Head */}
            <path d="M36 52 C36 44 64 44 64 52 L64 60 C64 69 36 69 36 60 Z" fill={selected ? '#60a5fa' : '#cbd5e1'} />
            {/* Body / vest */}
            <path d="M22 85 C22 68 38 63 50 63 C62 63 78 68 78 85" fill={selected ? '#2563eb' : '#94a3b8'} />
            {/* Wrench */}
            <rect x="58" y="66" width="6" height="18" rx="3" fill={selected ? '#f59e0b' : '#cbd5e1'} transform="rotate(-35 61 75)" />
        </svg>
    );
}

// ── Role Card ──────────────────────────────────────────────────────────────────

function RoleCard({ id, label, icon: Icon, selected, onSelect }) {
    return (
        <button
            type="button"
            onClick={() => onSelect(id)}
            className={`
                flex flex-col items-center gap-6 p-8 rounded-3xl border w-full
                transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-4
                focus-visible:ring-blue-500/20 select-none
                ${selected
                    ? 'border-blue-500 bg-white shadow-[0_8px_30px_rgb(37,99,235,0.12)] -translate-y-1'
                    : 'border-slate-200 bg-slate-50 hover:border-blue-200 hover:bg-white hover:shadow-[0_8px_20px_rgb(0,0,0,0.04)]'
                }
            `}
            aria-pressed={selected}
        >
            <div className={`p-4 rounded-full ${selected ? 'bg-blue-50' : 'bg-white shadow-sm border border-slate-100'}`}>
                <Icon selected={selected} />
            </div>

            {/* Radio indicator & Text */}
            <div className="flex flex-col items-center gap-4">
                <div className="flex items-center justify-center gap-2">
                    <div
                        className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                            transition-all duration-200
                            ${selected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}
                        `}
                    >
                        {selected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div>
                </div>
                <span className={`text-[15px] font-bold leading-relaxed text-center ${selected ? 'text-blue-900' : 'text-slate-600'}`}>
                    {label}
                </span>
            </div>
        </button>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AddYardStart() {
    const [selectedRole, setSelectedRole] = useState('owner');
    const navigate = useNavigate();

    const handleAddYard = () => {
        sessionStorage.setItem('addYardRole', selectedRole);
        if (selectedRole === 'visitor') {
            navigate('/add-a-yard');
        } else {
            navigate('/signup');
        }
    };

    const handleCancel = () => {
        navigate('/');
    };

    const roles = [
        {
            id: 'visitor',
            label: 'I just want to submit a yard I know.',
            icon: VisitorIcon,
        },
        {
            id: 'owner',
            label: "I'm the owner or an authorized representative looking to manage my yard.",
            icon: OwnerIcon,
        },
    ];

    return (
        <div className="bg-[#f8fafc] min-h-screen flex flex-col">
            <SEO
                title="Add Your Yard – Tell Us About Yourself | Junkyards Near Me"
                description="Select your role to get started adding your junkyard to our directory."
                noindex={true}
            />
            <Navbar />

            <main className="flex-grow flex flex-col items-center justify-center pt-32 pb-20 px-4">
                <div className="w-full max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 mb-6">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
                            Tell Us About <span className="text-blue-600">Yourself</span>
                        </h1>
                        <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">
                            To ensure the best experience, please tell us how you're related to the junkyard you want to add.
                        </p>
                    </div>

                    {/* Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
                        <RoleCard
                            id={roles[0].id}
                            label={roles[0].label}
                            icon={roles[0].icon}
                            selected={selectedRole === roles[0].id}
                            onSelect={setSelectedRole}
                        />
                        <RoleCard
                            id={roles[1].id}
                            label={roles[1].label}
                            icon={roles[1].icon}
                            selected={selectedRole === roles[1].id}
                            onSelect={setSelectedRole}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-200 transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-slate-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleAddYard}
                            className="w-full sm:w-auto px-10 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-[0_4px_14px_rgb(37,99,235,0.3)] transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20 flexitems-center justify-center gap-2"
                        >
                            Continue Next →
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
