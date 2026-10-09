import { useState } from 'react';
import SignupStep1 from './SignupStep1';
import SignupStep2 from './SignupStep2';

const SignupModal = ({ isOpen, onClose, onSwitchToLogin }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '', phone: '', countryCode: '+1', email: '', password: '', confirmPassword: ''
    });

    const handleStep1Next = (step1Data) => { setFormData({ ...formData, ...step1Data }); setStep(2); };
    const handleStep2Back = () => setStep(1);
    const handleClose = () => {
        setStep(1);
        setFormData({ name: '', phone: '', countryCode: '+1', email: '', password: '', confirmPassword: '' });
        onClose();
    };
    const handleSwitchToLogin = () => { handleClose(); if (onSwitchToLogin) onSwitchToLogin(); };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={handleClose}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            <div
                className="relative w-full max-w-[380px] mx-4 rounded-3xl overflow-hidden shadow-2xl"
                style={{ maxHeight: '95vh', overflowY: 'auto' }}
                onClick={e => e.stopPropagation()}
            >
                {/* === BACKGROUND IMAGE fills entire modal === */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop"
                        alt=""
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/80" />
                </div>

                {/* Close X */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-30 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="relative z-10 flex flex-col">
                    {/* Top — Logo + Title */}
                    <div className="flex flex-col items-center pt-8 pb-6 px-6 text-center">
                        <img
                            src="/logo.png"
                            alt="JYNM"
                            className="h-16 w-auto object-contain mb-4 drop-shadow-2xl"
                            onError={e => e.currentTarget.style.display = 'none'}
                        />
                        <h1 className="text-2xl font-black text-white leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Welcome to <span className="text-yellow-400">JYNM</span>!
                        </h1>
                        <p className="text-white/70 text-[13px] mt-1.5 font-medium leading-snug">
                            Create your account and start exploring<br />junkyards, auto parts and more.
                        </p>
                    </div>

                    {/* White Form Card */}
                    <div className="bg-white mx-3 mb-3 rounded-2xl px-5 py-5 shadow-2xl">
                        {step === 1 ? (
                            <SignupStep1DarkCard
                                formData={formData}
                                onNext={handleStep1Next}
                                onSwitchToLogin={handleSwitchToLogin}
                            />
                        ) : (
                            <SignupStep2
                                formData={formData}
                                onBack={handleStep2Back}
                                onClose={handleClose}
                                onSwitchToLogin={handleSwitchToLogin}
                            />
                        )}
                    </div>

                    {/* Feature icons */}
                    <div className="grid grid-cols-3 gap-2 px-4 pb-6 pt-2">
                        {[
                            { emoji: '🔍', label: 'Find Quality Parts' },
                            { emoji: '🌿', label: 'Connect with Trusted Junkyards' },
                            { emoji: '✅', label: 'Save Time & Money' },
                        ].map((f, i) => (
                            <div key={i} className="flex flex-col items-center gap-1 text-center">
                                <span className="text-2xl">{f.emoji}</span>
                                <span className="text-[10px] text-white/70 font-semibold leading-tight">{f.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

/* Inline Step1 form — styled for white card context */
function SignupStep1DarkCard({ formData, onNext, onSwitchToLogin }) {
    const [name, setName] = useState(formData.name || '');
    const [phone, setPhone] = useState(formData.phone || '');
    const [countryCode, setCountryCode] = useState(formData.countryCode || '+1');
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const validateName = v => (!v || v.trim().length < 2 ? 'Please enter your name' : '');
    const validatePhone = v => (!v ? 'Required' : (countryCode === '+1' && !/^\d{10}$/.test(v) ? 'Enter valid 10-digit number' : ''));

    const handleNext = () => {
        const ne = validateName(name), pe = validatePhone(phone);
        if (ne || pe) { setErrors({ name: ne, phone: pe }); setTouched({ name: true, phone: true }); return; }
        onNext({ name, phone, countryCode });
    };

    const isValid = !validateName(name) && !validatePhone(phone);

    return (
        <div className="space-y-4">
            {/* Name */}
            <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Name</label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </span>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onBlur={() => setTouched(t => ({ ...t, name: true }))}
                        placeholder="e.g. Arun"
                        className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-slate-50 ${touched.name && errors.name ? 'border-red-400' : 'border-slate-200'}`}
                    />
                </div>
                {touched.name && errors.name && <p className="mt-1 text-[11px] text-red-500">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Phone Number</label>
                <div className="flex gap-2">
                    <select
                        value={countryCode}
                        onChange={e => setCountryCode(e.target.value)}
                        className="w-20 px-2 py-2.5 border border-slate-200 rounded-xl text-[13px] bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+91">🇮🇳 +91</option>
                    </select>
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </span>
                        <input
                            type="tel"
                            value={phone}
                            onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                            onBlur={() => setTouched(t => ({ ...t, phone: true }))}
                            placeholder="e.g. 9999999999"
                            maxLength={10}
                            className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-slate-50 ${touched.phone && errors.phone ? 'border-red-400' : 'border-slate-200'}`}
                        />
                    </div>
                </div>
                {touched.phone && errors.phone && <p className="mt-1 text-[11px] text-red-500">{errors.phone}</p>}
            </div>

            {/* Next */}
            <button
                type="button"
                onClick={handleNext}
                disabled={!isValid}
                className="w-full py-3 rounded-xl font-black text-[15px] bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_14px_rgba(37,99,235,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                Next <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>

            <p className="text-center text-[13px] text-slate-500 font-medium">
                Already have an account?{' '}
                <button type="button" onClick={onSwitchToLogin} className="text-blue-600 hover:text-blue-700 font-bold transition-colors">Sign In</button>
            </p>
        </div>
    );
}

export default SignupModal;
