import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../contexts/AuthContext';
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
        name: '', phone: '', countryCode: '+91',
        email: '', password: '', password2: '',
        first_name: '', last_name: '', username: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) navigate(returnUrl);
    }, [isAuthenticated, navigate, returnUrl]);

    const handleStep1Next = (step1Data) => {
        setFormData(prev => ({
            ...prev, ...step1Data,
            first_name: step1Data.name.split(' ')[0] || step1Data.name,
            last_name: step1Data.name.split(' ').slice(1).join(' ') || ''
        }));
        setStep(2); setError('');
    };

    const handleStep2Complete = async (step2Data) => {
        setError(''); setLoading(true);
        const completeData = { ...formData, ...step2Data, username: step2Data.username || step2Data.email.split('@')[0] };
        try {
            await register(completeData);
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.email?.[0] || err.message || 'Failed to create account.');
            setLoading(false);
        }
    };

    const handleBackToStep1 = () => { setStep(1); setError(''); };
    const handleSwitchToLogin = () => { navigate(`/signin${returnUrl !== '/' ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`); };

    return (
        <>
            <SEO title="Sign Up - Create Your JYNM Account" description="Create a free account to list your junkyard, manage leads, and connect with customers." noindex={true} />

            <div className="min-h-screen flex" style={{ background: '#080909' }}>
                {/* Left — Cinematic Image Panel */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-start justify-end p-12">
                    <img src="/images/static/dashboard-speedometer.jpg" alt="Car Dashboard" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.5 }} />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #080909 0%, rgba(8,9,9,0.4) 60%, transparent 100%)' }} />
                    <div className="absolute top-0 left-0 w-1 h-full" style={{ background: 'linear-gradient(to bottom, transparent, #f59e0b, transparent)' }} />

                    <div className="relative z-10">
                        <Link to="/" className="inline-flex items-center gap-3 mb-12">
                            <span className="text-white font-black text-xl tracking-wider">JYNM</span>
                        </Link>
                        <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
                            List Your <span style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Junkyard</span><br />
                            Reach Thousands
                        </h2>
                        <p className="text-white/50 text-base max-w-sm leading-relaxed">
                            Join 6,000+ junkyards already on JYNM. Get leads from buyers searching for parts near you — for free.
                        </p>
                        <div className="mt-8 space-y-3">
                            {['Free listing — No hidden fees', 'Instant lead notifications', 'Nationwide buyer network'].map(t => (
                                <div key={t} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <span className="text-white/60 text-sm">{t}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right — Form Panel */}
                <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 relative overflow-y-auto">
                    <div className="lg:hidden mb-10 text-center">
                        <Link to="/" className="inline-flex items-center gap-2">
                            <span className="text-white font-black text-2xl tracking-wider">JYNM</span>
                        </Link>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">

                        <div className="mb-6">
                            <h1 className="text-4xl font-black text-white mb-2">Create Account</h1>
                            <p className="text-white/40">Join JYNM Auto Parts Hub</p>
                        </div>

                        {/* Step Progress */}
                        <div className="flex items-center gap-3 mb-8">
                            {[1, 2].map((s, i) => (
                                <>
                                    <div key={s} className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${step >= s ? 'text-black' : 'text-white/30 border border-white/10'}`}
                                        style={step >= s ? { background: 'linear-gradient(135deg, #f59e0b, #ea580c)' } : { background: 'rgba(255,255,255,0.05)' }}>
                                        {s}
                                    </div>
                                    {i === 0 && <div className={`flex-1 h-px transition-all ${step >= 2 ? 'bg-amber-500' : 'bg-white/10'}`} />}
                                </>
                            ))}
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10">
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        {/* The existing step components — preserve all their logic */}
                        <div className="signup-dark-wrapper">
                            {step === 1 && (
                                <SignupStep1 formData={formData} onNext={handleStep1Next} onSwitchToLogin={handleSwitchToLogin} />
                            )}
                            {step === 2 && (
                                <SignupStep2
                                    formData={formData}
                                    onBack={handleBackToStep1}
                                    onClose={() => navigate(returnUrl)}
                                    onSwitchToLogin={handleSwitchToLogin}
                                />
                            )}
                        </div>

                        <p className="text-center text-white/20 text-xs mt-8">
                            <Link to="/" className="hover:text-white/40 transition-colors">← Back to homepage</Link>
                        </p>
                    </motion.div>
                </div>
            </div>
        </>
    );
}
