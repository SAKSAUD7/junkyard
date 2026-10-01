import React, { useState } from 'react';

export default function SecurityQuestionnaireModal({ isOpen, onClose, onComplete }) {
    const [step, setStep] = useState(1);
    const [answers, setAnswers] = useState({
        userType: '',
        purpose: ''
    });

    if (!isOpen) return null;

    const handleNext = () => {
        if (step === 1 && answers.userType) {
            setStep(2);
        } else if (step === 2 && answers.purpose) {
            onComplete(answers);
            // reset for future
            setTimeout(() => {
                setStep(1);
                setAnswers({ userType: '', purpose: '' });
            }, 300);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
            <div className="relative bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2 font-outfit tracking-tight">
                            Quick Security Check
                        </h2>
                        <p className="text-sm text-slate-500">
                            To protect our network, we verify all new users.
                        </p>
                    </div>

                    {/* Step 1 */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 text-center mb-4">Which best describes you?</h3>
                            
                            <label className={`block cursor-pointer p-4 rounded-xl border-2 transition-all ${answers.userType === 'individual' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="radio" 
                                        name="userType" 
                                        value="individual"
                                        checked={answers.userType === 'individual'}
                                        onChange={() => setAnswers({ ...answers, userType: 'individual' })}
                                        className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div>
                                        <p className="font-bold text-slate-900">Individual</p>
                                        <p className="text-xs text-slate-500">I am looking for personal use</p>
                                    </div>
                                </div>
                            </label>

                            <label className={`block cursor-pointer p-4 rounded-xl border-2 transition-all ${answers.userType === 'business' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="radio" 
                                        name="userType" 
                                        value="business"
                                        checked={answers.userType === 'business'}
                                        onChange={() => setAnswers({ ...answers, userType: 'business' })}
                                        className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div>
                                        <p className="font-bold text-slate-900">Business / Shop</p>
                                        <p className="text-xs text-slate-500">I am a mechanic or auto business</p>
                                    </div>
                                </div>
                            </label>

                        </div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 text-center mb-4">What brings you here today?</h3>
                            
                            <label className={`block cursor-pointer p-4 rounded-xl border-2 transition-all ${answers.purpose === 'buy_parts' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="radio" 
                                        name="purpose" 
                                        value="buy_parts"
                                        checked={answers.purpose === 'buy_parts'}
                                        onChange={() => setAnswers({ ...answers, purpose: 'buy_parts' })}
                                        className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                                    />
                                    <p className="font-bold text-slate-900 text-sm">I'm looking to buy auto parts</p>
                                </div>
                            </label>

                            <label className={`block cursor-pointer p-4 rounded-xl border-2 transition-all ${answers.purpose === 'sell_car' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="radio" 
                                        name="purpose" 
                                        value="sell_car"
                                        checked={answers.purpose === 'sell_car'}
                                        onChange={() => setAnswers({ ...answers, purpose: 'sell_car' })}
                                        className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                                    />
                                    <p className="font-bold text-slate-900 text-sm">I want to sell a junk car</p>
                                </div>
                            </label>

                            <label className={`block cursor-pointer p-4 rounded-xl border-2 transition-all ${answers.purpose === 'browse' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="radio" 
                                        name="purpose" 
                                        value="browse"
                                        checked={answers.purpose === 'browse'}
                                        onChange={() => setAnswers({ ...answers, purpose: 'browse' })}
                                        className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                                    />
                                    <p className="font-bold text-slate-900 text-sm">Just browsing junkyards</p>
                                </div>
                            </label>
                        </div>
                    )}

                    <div className="mt-8 flex gap-3">
                        {step === 2 && (
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 py-3 px-4 border-2 border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            disabled={(step === 1 && !answers.userType) || (step === 2 && !answers.purpose)}
                            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            {step === 1 ? 'Continue' : 'Complete Review'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
