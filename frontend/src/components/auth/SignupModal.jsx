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

    const handleStep2Back = () => {
        setStep(1);
    };

    const handleClose = () => {
        setStep(1);
        setFormData({
            name: '',
            phone: '',
            countryCode: '+1',
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
                className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
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

                <div className="flex flex-col">
                    {/* Right Panel - Form */}
                    <div className="w-full p-8 md:p-10 overflow-y-auto max-h-[90vh]">
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
