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
        countryCode: '+91',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleStep1Next = (step1Data) => {
        setFormData({ ...formData, ...step1Data });
        setStep(2);
    };

    const handleStep2Back = () => {
        setStep(1);
    };

    const handleClose = () => {
        setStep(1);
        setFormData({
            name: '',
            phone: '',
            countryCode: '+91',
            email: '',
            password: '',
            confirmPassword: ''
        });
        onClose();
    };

    const handleSwitchToLogin = () => {
        handleClose();
        if (onSwitchToLogin) {
            onSwitchToLogin();
        }
    };

    if (!isOpen) return null;

    const logoUrl = getGlobal('brand', 'logo');

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={handleClose}
        >
            <div
                className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex flex-col md:flex-row">
                    {/* Left Panel - Blue Visual */}
                    <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-blue-700 to-blue-500 p-10 flex-col justify-center items-center">
                        <div className="text-center">
                            <div className="bg-white rounded-2xl shadow-xl px-8 py-6 mb-8 inline-flex items-center justify-center">
                                <img
                                    src={logoUrl || '/logo.png'}
                                    alt="JYNM"
                                    className="h-16 w-auto object-contain"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                            </div>
                            <p className="text-xl font-bold text-white mb-2">Find Auto Parts</p>
                            <p className="text-blue-100 text-sm">Connect with trusted junkyards nationwide</p>
                        </div>
                    </div>

                    {/* Right Panel - Form */}
                    <div className="w-full md:w-3/5 p-8 md:p-12 overflow-y-auto max-h-[90vh]">
                        {step === 1 ? (
                            <SignupStep1
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
                </div>
            </div>
        </div>
    );
};

export default SignupModal;
