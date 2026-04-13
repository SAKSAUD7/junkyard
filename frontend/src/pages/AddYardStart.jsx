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
            className="w-20 h-20 sm:w-24 sm:h-24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="50" cy="50" r="49" fill={selected ? '#dbeafe' : '#f3f4f6'} stroke={selected ? '#3b82f6' : '#d1d5db'} strokeWidth="2" />
            {/* Head */}
            <circle cx="50" cy="36" r="14" fill={selected ? '#3b82f6' : '#6b7280'} />
            {/* Body */}
            <path d="M18 82 C18 62 82 62 82 82" fill={selected ? '#3b82f6' : '#6b7280'} />
        </svg>
    );
}

function OwnerIcon({ selected }) {
    return (
        <svg
            viewBox="0 0 100 100"
            className="w-20 h-20 sm:w-24 sm:h-24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="50" cy="50" r="49" fill={selected ? '#dbeafe' : '#f3f4f6'} stroke={selected ? '#3b82f6' : '#d1d5db'} strokeWidth="2" />
            {/* Hard hat */}
            <path d="M22 48 C22 34 78 34 78 48 L78 52 L22 52 Z" fill={selected ? '#3b82f6' : '#6b7280'} />
            <rect x="18" y="52" width="64" height="8" rx="4" fill={selected ? '#2563eb' : '#4b5563'} />
            {/* Brim of hat */}
            <rect x="14" y="52" width="72" height="5" rx="2.5" fill={selected ? '#1d4ed8' : '#374151'} />
            {/* Head */}
            <path d="M36 52 C36 44 64 44 64 52 L64 60 C64 69 36 69 36 60 Z" fill={selected ? '#60a5fa' : '#9ca3af'} />
            {/* Body / vest */}
            <path d="M22 85 C22 68 38 63 50 63 C62 63 78 68 78 85" fill={selected ? '#3b82f6' : '#6b7280'} />
            {/* Wrench */}
            <rect x="58" y="66" width="6" height="18" rx="3" fill={selected ? '#fbbf24' : '#d1d5db'} transform="rotate(-35 61 75)" />
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
                flex flex-col items-center gap-5 p-8 rounded-2xl border-2 w-full
                transition-all duration-250 cursor-pointer focus:outline-none focus-visible:ring-4
                focus-visible:ring-blue-300 select-none
                ${selected
                    ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-md'
                }
            `}
            aria-pressed={selected}
        >
            <Icon selected={selected} />

            {/* Radio indicator */}
            <div className="flex items-center gap-2.5">
                <div
                    className={`
                        w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                        transition-all duration-200
                        ${selected ? 'border-blue-500 bg-blue-500' : 'border-gray-400 bg-white'}
                    `}
                >
                    {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className={`text-sm sm:text-base font-medium leading-snug text-left ${selected ? 'text-blue-700' : 'text-gray-700'}`}>
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
        // Persist role so the form can read it later
        sessionStorage.setItem('addYardRole', selectedRole);

        if (selectedRole === 'visitor') {
            // Regular visitor – go straight to the yard form (no auth required)
            navigate('/add-a-yard');
        } else {
            // Owner / employee – must create an account first
            navigate('/signup');
        }
    };

    const handleCancel = () => {
        navigate('/');
    };

    const roles = [
        {
            id: 'visitor',
            label: 'I just want to add a yard.',
            icon: VisitorIcon,
        },
        {
            id: 'owner',
            label: "I'm an owner, employee, or authorized person looking to add my junkyard.",
            icon: OwnerIcon,
        },
    ];

    return (
        <>
            <SEO
                title="Add Your Yard – Tell Us About Yourself | Junkyards Near Me"
                description="Select your role to get started adding your junkyard to our directory."
                noindex={true}
            />
            <Navbar />

            <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50 flex flex-col items-center justify-center pt-24 pb-20 px-4">
                <div className="w-full max-w-2xl">
                    {/* Title */}
                    <h1 className="text-center text-2xl sm:text-3xl font-bold text-gray-800 tracking-widest uppercase mb-10">
                        Tell Us About Yourself
                    </h1>

                    {/* Cards row */}
                    <div className="flex flex-col sm:flex-row items-stretch gap-0">
                        {/* Left card */}
                        <div className="flex-1">
                            <RoleCard
                                id={roles[0].id}
                                label={roles[0].label}
                                icon={roles[0].icon}
                                selected={selectedRole === roles[0].id}
                                onSelect={setSelectedRole}
                            />
                        </div>

                        {/* Vertical divider – desktop */}
                        <div className="hidden sm:flex flex-col items-center mx-4">
                            <div className="flex-1 w-px bg-gray-300" />
                        </div>
                        {/* Horizontal divider – mobile */}
                        <div className="sm:hidden flex items-center my-4">
                            <div className="flex-1 h-px bg-gray-300" />
                        </div>

                        {/* Right card */}
                        <div className="flex-1">
                            <RoleCard
                                id={roles[1].id}
                                label={roles[1].label}
                                icon={roles[1].icon}
                                selected={selectedRole === roles[1].id}
                                onSelect={setSelectedRole}
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-center gap-3 mt-10">
                        <button
                            type="button"
                            onClick={handleAddYard}
                            className="px-7 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-bold text-sm shadow-sm transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
                        >
                            Add a Yard
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="
                                px-5 py-2.5 rounded
                                bg-white hover:bg-gray-100 active:bg-gray-200
                                text-gray-700 font-medium text-sm
                                border border-gray-300
                                transition-colors duration-200
                                focus:outline-none focus-visible:ring-4 focus-visible:ring-gray-300
                            "
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
