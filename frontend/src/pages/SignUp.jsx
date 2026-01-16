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

            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50 pt-24 pb-20">
                <div className="max-w-md mx-auto px-4">
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-black text-gray-900 mb-2">
                                Create Account
                            </h1>
                            <p className="text-gray-600">
                                Join JYNM Auto Parts Hub
                            </p>
                            {/* Progress Indicator */}
                            <div className="flex items-center justify-center gap-2 mt-6">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    1
                                </div>
                                <div className={`h-1 w-12 rounded ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}></div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    2
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {/* Multi-Step Form */}
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
                                onClose={() => {
                                    // Called after successful registration
                                    // SignupStep2 handles its own registration API call
                                    navigate(returnUrl);
                                }}
                                onSwitchToLogin={handleSwitchToLogin}
                            />
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
