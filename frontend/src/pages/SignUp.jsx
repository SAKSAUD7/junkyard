import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import SignupStep1 from '../components/auth/SignupStep1';
import SignupStep2 from '../components/auth/SignupStep2';

export default function SignUp() {
    const [searchParams] = useSearchParams();
    const returnUrl = searchParams.get('returnUrl') || '/';
    const navigate = useNavigate();
    const { register, isAuthenticated } = useContext(AuthContext);

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        countryCode: '+91',
        email: '',
        password: '',
        password2: '',
        first_name: '',
        last_name: '',
        username: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate(returnUrl);
        }
    }, [isAuthenticated, navigate, returnUrl]);

    const handleStep1Next = (step1Data) => {
        // Step1 provides: name, phone, countryCode
        setFormData(prev => ({
            ...prev,
            ...step1Data,
            // Split name into first_name and last_name
            first_name: step1Data.name.split(' ')[0] || step1Data.name,
            last_name: step1Data.name.split(' ').slice(1).join(' ') || ''
        }));
        setStep(2);
        setError('');
    };

    const handleStep2Complete = async (step2Data) => {
        // Step2 provides: email, password, password2, username
        setError('');
        setLoading(true);

        const completeData = {
            ...formData,
            ...step2Data,
            // Generate username from email if not provided
            username: step2Data.username || step2Data.email.split('@')[0]
        };

        try {
            await register(completeData);
            // AuthContext will update isAuthenticated, useEffect will handle redirect
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.error || err.response?.data?.email?.[0] || err.message || 'Failed to create account. Please try again.');
            setLoading(false);
        }
    };

    const handleBackToStep1 = () => {
        setStep(1);
        setError('');
    };

    const handleSwitchToLogin = () => {
        navigate(`/signin${returnUrl !== '/' ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`);
    };

    return (
        <>
            <SEO
                title="Sign Up - Create Your JYNM Account"
                description="Create a free account to list your junkyard, manage leads, and connect with customers."
                noindex={true}
            />
            <Navbar />

            <div className="flex min-h-screen w-full bg-[#030712] relative overflow-hidden">
                {/* LEFT SIDE: Cinematic 3D Visual (Absolute Background on Mobile, Split Pane on Desktop) */}
                <div className="absolute inset-0 z-0 lg:relative lg:flex lg:w-1/2 bg-black flex items-center justify-center border-r border-[#10b981]/10">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#10b981]/20 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-[120px] pointer-events-none" />
                    
                    <img
                        src="/3d/auth-signup.png"
                        alt="JYNM Salvage Network Registration"
                        className="absolute inset-0 w-full h-full object-cover lg:opacity-85 opacity-30 mix-blend-screen"
                        style={{ filter: 'contrast(1.1) brightness(0.9) drop-shadow(0 0 20px rgba(16,185,129,0.3))' }}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-[#030712]/50 lg:bg-gradient-to-r lg:from-black/20 lg:via-transparent lg:to-[#030712]" />
                    <div className="hidden lg:block absolute inset-0 bg-gradient-to-b from-[#030712] via-transparent to-[#030712]" />
                    
                    <div className="hidden lg:block absolute bottom-12 left-12 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black/60 backdrop-blur-md border border-[#10b981]/20 shadow-2xl">
                            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_8px_#10b981]"></span>
                            <span className="text-[#10b981] text-sm font-bold tracking-widest uppercase font-mono">Network Uplink Initiated</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Auth Card */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-16 relative z-10 overflow-y-auto">
                    <div className="w-full max-w-md animate-fade-in-up delay-100 py-12">
                        {/* Title Block outside the card */}
                        <div className="mb-8">
                            <h1 className="text-3xl sm:text-4xl font-black text-white font-outfit tracking-tight mb-2">Create Account</h1>
                            <p className="text-slate-400 text-sm sm:text-base">Join the JYNM Network to locate parts globally.</p>
                        </div>

                        {/* Progress Indicator */}
                        <div className="flex items-center gap-2 mb-8 ml-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>1</div>
                            <div className={`h-0.5 w-12 rounded transition-all ${step >= 2 ? 'bg-blue-600' : 'bg-slate-800'}`} />
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>2</div>
                        </div>

                        {/* Card */}
                        <div className="rounded-2xl overflow-hidden bg-[#0f172a]/80 backdrop-blur-3xl border border-slate-800 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
                            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
                            
                            <div className="p-6 sm:p-8">
                                {/* Error Message */}
                                {error && (
                                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* Multi-Step Form */}
                                <div className="auth-form-container-override">
                                    {step === 1 && (
                                        <SignupStep1
                                            formData={formData}
                                            onNext={handleStep1Next}
                                            onSwitchToLogin={handleSwitchToLogin}
                                        />
                                    )}

                                    {step === 2 && (
                                        <SignupStep2
                                            formData={formData}
                                            onBack={handleBackToStep1}
                                            onClose={() => { navigate(returnUrl); }}
                                            onSwitchToLogin={handleSwitchToLogin}
                                        />
                                    )}
                                </div>
                                <style>{`
                                    /* Force step inputs to match the new dark sleek design */
                                    .auth-form-container-override input, .auth-form-container-override select {
                                        background-color: #0a0f18 !important;
                                        border: 1px solid rgba(51,65,85,0.5) !important;
                                        color: white !important;
                                        border-radius: 0.75rem !important;
                                    }
                                    .auth-form-container-override input:focus, .auth-form-container-override select:focus {
                                        border-color: rgba(59,130,246,0.5) !important;
                                        box-shadow: 0 0 0 1px rgba(59,130,246,0.5) !important;
                                    }
                                    .auth-form-container-override button[type="submit"] {
                                        background: linear-gradient(to right, #2563eb, #3b82f6) !important;
                                        color: white !important;
                                        border: none !important;
                                        border-radius: 0.75rem !important;
                                        box-shadow: 0 0 20px rgba(37,99,235,0.3) !important;
                                        text-transform: none !important;
                                        font-weight: bold !important;
                                    }
                                    .auth-form-container-override button.btn-outline {
                                        background: transparent !important;
                                        border: 1px solid rgba(59,130,246,0.5) !important;
                                        color: #60a5fa !important;
                                        border-radius: 0.75rem !important;
                                    }
                                    .auth-form-container-override label {
                                        color: #94a3b8 !important;
                                        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
                                        text-transform: uppercase;
                                        font-size: 0.75rem;
                                        font-weight: bold;
                                        letter-spacing: 0.05em;
                                    }
                                `}</style>
                            </div>
                        </div>

                        {/* Back block */}
                        <div className="mt-8 text-center text-sm font-medium text-slate-500">
                            <Link to="/" className="hover:text-white transition-colors flex items-center justify-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Back to main site
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
