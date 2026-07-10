import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';

export default function AddYardStart() {
    const navigate = useNavigate();
    const [selected, setSelected] = useState('owner');

    const handleContinue = () => {
        if (selected === 'owner') {
            navigate('/add-a-yard/form');
        } else {
            navigate('/vendor/signup');
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <SEO
                title="Add Your Junkyard – JYNM"
                description="List your salvage yard on JYNM and connect with thousands of buyers looking for used auto parts."
            />
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 py-12">
                {/* Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8 sm:p-12">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Tell Us About Yourself
                        </h1>
                        <p className="text-slate-500 text-[15px]">Select the option that best describes you.</p>
                    </div>

                    {/* Option cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        {/* Option 1: Just add a yard */}
                        <button
                            type="button"
                            onClick={() => setSelected('owner')}
                            className={`relative p-6 rounded-xl border-2 text-center transition-all cursor-pointer ${
                                selected === 'owner'
                                    ? 'border-blue-600 bg-blue-50/40 shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
                                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/20'
                            }`}
                        >
                            {/* Radio indicator */}
                            <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                selected === 'owner' ? 'border-blue-600' : 'border-slate-300'
                            }`}>
                                {selected === 'owner' && (
                                    <div className="w-3 h-3 rounded-full bg-blue-600" />
                                )}
                            </div>

                            {/* Icon */}
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                                <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                                </svg>
                            </div>

                            <h3 className="text-[15px] font-black text-slate-900 mb-2">Quick Directory Submission</h3>
                            <p className="text-[13px] text-slate-500 leading-relaxed">
                                No account needed. Just add a yard's details to our public directory quickly.
                            </p>
                        </button>

                        {/* Option 2: Owner / Employee / Authorized */}
                        <button
                            type="button"
                            onClick={() => setSelected('authorized')}
                            className={`relative p-6 rounded-xl border-2 text-center transition-all cursor-pointer ${
                                selected === 'authorized'
                                    ? 'border-blue-600 bg-blue-50/40 shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
                                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/20'
                            }`}
                        >
                            {/* Radio indicator */}
                            <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                selected === 'authorized' ? 'border-blue-600' : 'border-slate-300'
                            }`}>
                                {selected === 'authorized' && (
                                    <div className="w-3 h-3 rounded-full bg-blue-600" />
                                )}
                            </div>

                            {/* Icon */}
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-50 flex items-center justify-center">
                                <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                            </div>

                            <h3 className="text-[15px] font-black text-slate-900 mb-2">
                                Vendor Account Setup
                            </h3>
                            <p className="text-[13px] text-slate-500 leading-relaxed">
                                I work here. Create a secure login to claim, edit, and manage this listing.
                            </p>
                        </button>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={handleContinue}
                            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-[0_4px_12px_rgba(37,99,235,0.3)] text-[15px]"
                        >
                            Continue
                        </button>
                        <Link
                            to="/"
                            className="px-8 py-3 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition text-[15px]"
                        >
                            Cancel
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
