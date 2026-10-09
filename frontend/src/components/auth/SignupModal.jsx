import { useState } from 'react';
import SignupStep1 from './SignupStep1';
import SignupStep2 from './SignupStep2';
import { useCMS } from '../../hooks/useCMS';

const SignupModal = ({ isOpen, onClose, onSwitchToLogin }) => {
    const { get: getGlobal } = useCMS('global');
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        countryCode: '+1',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleStep1Next = (step1Data) => {
        setFormData({ ...formData, ...step1Data });
        setStep(2);
    };

    const handleStep2Back = () => setStep(1);

    const handleClose = () => {
        setStep(1);
        setFormData({ name: '', phone: '', countryCode: '+1', email: '', password: '', confirmPassword: '' });
        onClose();
    };

    const handleSwitchToLogin = () => {
        handleClose();
        if (onSwitchToLogin) onSwitchToLogin();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
            onClick={handleClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal Card */}
            <div
                className="relative w-full max-w-[400px] mx-auto rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                style={{ maxHeight: '96vh' }}
            >
                {/* Background Image with dark overlay - vendor-yard theme */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1581092335397-9583eb92d232?q=80&w=800&auto=format&fit=crop"
                        alt="Junkyard background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/85 via-slate-900/75 to-slate-900/90" />
                </div>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Content */}
                <div className="relative z-10 px-6 pt-8 pb-6 overflow-y-auto" style={{ maxHeight: '96vh' }}>

                    {/* Logo + Badge */}
                    <div className="flex flex-col items-center mb-6">
                        <img src="/logo.png" alt="JYNM" className="h-14 w-auto object-contain mb-3 drop-shadow-lg" onError={e => e.currentTarget.style.display = 'none'} />
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-bold rounded-full uppercase tracking-wider mb-2">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/></svg>
                            Create Free Account
                        </span>
                        <h1 className="text-2xl font-black text-white tracking-tight text-center" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Join <span className="text-blue-400">JYNM</span> Today
                        </h1>
                        <p className="text-slate-300 text-[13px] mt-1 font-medium text-center">Find quality auto parts near you,<br />completely free.</p>
                    </div>

                    {/* Step Forms */}
                    {step === 1 ? (
                        <SignupStep1
                            formData={formData}
                            onNext={handleStep1Next}
                            onSwitchToLogin={handleSwitchToLogin}
                            darkMode={true}
                        />
                    ) : (
                        <SignupStep2
                            formData={formData}
                            onBack={handleStep2Back}
                            onClose={handleClose}
                            onSwitchToLogin={handleSwitchToLogin}
                            darkMode={true}
                        />
                    )}

                    {/* Feature icons footer */}
                    <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/10">
                        {[
                            { icon: '🔧', label: 'Find Parts Easily' },
                            { icon: '📍', label: 'Nearby Junkyards' },
                            { icon: '💰', label: 'Save Big Money' },
                        ].map((f, i) => (
                            <div key={i} className="flex flex-col items-center gap-1.5 text-center">
                                <span className="text-xl">{f.icon}</span>
                                <span className="text-[10px] text-slate-400 font-semibold leading-tight">{f.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupModal;
