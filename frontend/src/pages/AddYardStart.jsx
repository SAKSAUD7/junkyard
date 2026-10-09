import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import { useVendorAuth } from '../contexts/VendorAuthContext';
import { AuthContext } from '../contexts/AuthContext';
import VendorAuthModal from '../components/vendor/VendorAuthModal';

/**
 * AddYardStart — gateway page for adding a junkyard to JYNM.
 *
 * Scenarios:
 *   A) Guest (no auth)           → VendorAuthModal (Create / Sign In)
 *   B) Customer (non-vendor)     → "Vendor Account Required" polished message
 *   C) Vendor (authenticated)    → proceed to listing form
 */
export default function AddYardStart() {
    const navigate = useNavigate();
    const { isAuthenticated: isVendorAuthenticated, loading } = useVendorAuth();
    const { isAuthenticated: isCustomerAuthenticated, user } = useContext(AuthContext);

    // Determine scenario
    const isVendor = isVendorAuthenticated();
    // A customer is authenticated via customer auth but NOT vendor auth
    const isCustomer = isCustomerAuthenticated && !isVendor;
    // Guest: no auth whatsoever
    const isGuest = !isCustomerAuthenticated && !isVendor;

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <SEO
                title="Add Your Junkyard – JYNM"
                description="List your salvage yard on JYNM and connect with thousands of buyers looking for used auto parts."
            />

            {/* Background Image - Matches SignIn */}
            {isGuest && (
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1620892019318-7b243ebd7f7e?q=80&w=2000&auto=format&fit=crop"
                        alt="Luxury Auto Background"
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-slate-50/90 to-white/95"></div>
                </div>
            )}

            <Navbar />

            {/* SCENARIO A — Guest: show the vendor auth modal */}
            {!loading && isGuest && <VendorAuthModal isOpen={true} />}

            {/* SCENARIO B — Logged-in CUSTOMER: Vendor account required message */}
            {!loading && isCustomer && (
                <div className="max-w-2xl mx-auto px-4 py-20 flex flex-col items-center text-center">
                    <div className="mb-6 w-16 h-16 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center p-2">
                        <img src="/logo.png" alt="JYNM Logo" className="w-full h-full object-contain" onError={e => { e.target.style.display = 'none'; }} />
                    </div>

                    <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-6 shadow-sm">
                        <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Vendor Account Required
                    </h1>
                    <p className="text-[16px] text-slate-500 font-medium max-w-md mb-2 leading-relaxed">
                        You're currently signed in as a <span className="font-bold text-slate-700">{user?.first_name || 'customer'}</span>.
                    </p>
                    <p className="text-[15px] text-slate-400 max-w-md mb-10 leading-relaxed">
                        To add and manage a junkyard listing on JYNM, you'll need a dedicated vendor account.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <a
                            href="/vendor/register"
                            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-[0_4px_12px_rgba(37,99,235,0.3)] text-[15px] text-center"
                        >
                            Create Vendor Account
                        </a>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition text-[15px]"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* SCENARIO C — Vendor authenticated: show the listing start page */}
            {!loading && isVendor && (
                <div className="max-w-3xl mx-auto px-4 py-12">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8 sm:p-12">
                        <div className="text-center mb-8">
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Add Your Junkyard
                            </h1>
                            <p className="text-slate-500 text-[15px]">You're signed in and ready to go. Let's get your yard listed!</p>
                        </div>

                        {/* Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                            {[
                                { icon: '📋', title: 'Business Info', desc: 'Name, email, phone and website' },
                                { icon: '📍', title: 'Location', desc: 'State, city and ZIP code' },
                                { icon: '🔧', title: 'Services', desc: 'Parts, brands and photos' },
                            ].map(step => (
                                <div key={step.title} className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-3xl mb-2">{step.icon}</span>
                                    <h3 className="text-[14px] font-black text-slate-800 mb-1">{step.title}</h3>
                                    <p className="text-[12px] text-slate-500">{step.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Action */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/add-a-yard/form')}
                                className="w-full sm:w-auto px-10 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-[0_4px_12px_rgba(37,99,235,0.3)] text-[15px]"
                            >
                                Start Listing My Yard →
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="w-full sm:w-auto px-10 py-3.5 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition text-[15px]"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
