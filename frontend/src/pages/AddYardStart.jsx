import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import { useVendorAuth } from '../contexts/VendorAuthContext';
import VendorAuthModal from '../components/vendor/VendorAuthModal';

export default function AddYardStart() {
    const navigate = useNavigate();
    const { isAuthenticated, loading } = useVendorAuth();

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <SEO
                title="Add Your Junkyard – JYNM"
                description="List your salvage yard on JYNM and connect with thousands of buyers looking for used auto parts."
            />
            <Navbar />

            {/* In-page Gatekeeper */}
            {!loading && <VendorAuthModal isOpen={!isAuthenticated()} />}

            <div className="max-w-3xl mx-auto px-4 py-12">
                {/* Card */}
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
        </div>
    );
}
