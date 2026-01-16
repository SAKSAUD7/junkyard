import { useState } from 'react';

const SignupStep1 = ({ formData, onNext, onSwitchToLogin }) => {
    const [name, setName] = useState(formData.name || '');
    const [phone, setPhone] = useState(formData.phone || '');
    const [countryCode, setCountryCode] = useState(formData.countryCode || '+91');
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const validateName = (value) => {
        if (!value || value.trim().length < 2) {
            return 'Please fill in this field';
        }
        return '';
    };

    const validatePhone = (value) => {
        if (!value) {
            return 'Please fill in this field';
        }
        if (countryCode === '+91' && !/^\d{10}$/.test(value)) {
            return 'Please enter a valid 10-digit phone number';
        }
        return '';
    };

    const handleBlur = (field) => {
        setTouched({ ...touched, [field]: true });

        const newErrors = { ...errors };
        if (field === 'name') {
            newErrors.name = validateName(name);
        } else if (field === 'phone') {
            newErrors.phone = validatePhone(phone);
        }
        setErrors(newErrors);
    };

    const handleNext = () => {
        const nameError = validateName(name);
        const phoneError = validatePhone(phone);

        if (nameError || phoneError) {
            setErrors({ name: nameError, phone: phoneError });
            setTouched({ name: true, phone: true });
            return;
        }

        onNext({ name, phone, countryCode });
    };

    const isValid = !validateName(name) && !validatePhone(phone);

    const handleSocialAuth = (provider) => {
        alert(`${provider} authentication is not yet configured.\n\nPlease use email signup for now.\n\nTo enable social login, OAuth must be configured in the backend.`);
    };

    return (
        <div>
            <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Welcome to <span className="text-blue-600">JYNM</span>!
                </h1>
                <p className="text-xl font-semibold text-gray-700">Sign-up</p>
            </div>

            <div className="space-y-5">
                {/* Name Input */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={() => handleBlur('name')}
                        placeholder="eg. Arun"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${touched.name && errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                    />
                    {touched.name && errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                </div>

                {/* Phone Number */}
                <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Phone Number
                    </label>
                    <div className="flex gap-2">
                        {/* Country Code Dropdown */}
                        <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="w-24 px-2 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                            style={{ maxWidth: '90px' }}
                        >
                            <option value="+91">🇮🇳 +91</option>
                            <option value="+1">🇺🇸 +1</option>
                            <option value="+44">🇬🇧 +44</option>
                            <option value="+61">🇦🇺 +61</option>
                            <option value="+971">🇦🇪 +971</option>
                        </select>

                        {/* Phone Input */}
                        <input
                            type="tel"
                            name="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            onBlur={() => handleBlur('phone')}
                            className={`flex-1 px-3 py-3 border-2 rounded-lg focus:outline-none focus:border-blue-500 text-sm sm:text-base ${touched.phone && errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="eg. 9999999999"
                            maxLength={10}
                            style={{
                                fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                                maxWidth: '100%'
                            }}
                        />
                    </div>
                    {touched.phone && errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                </div>

                {/* Next Button */}
                <button
                    onClick={handleNext}
                    disabled={!isValid}
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${isValid
                        ? 'bg-blue-700 hover:bg-blue-800 shadow-md hover:shadow-lg'
                        : 'bg-gray-300 cursor-not-allowed'
                        }`}
                >
                    Next
                </button>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                </div>

                {/* Social Auth Buttons - Disabled */}
                <button
                    onClick={() => handleSocialAuth('Google')}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Sign up with Google
                </button>

                <button
                    onClick={() => handleSocialAuth('Facebook')}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Sign up with Facebook
                </button>

                {/* Sign In Link */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            className="text-blue-600 hover:text-blue-700 font-semibold"
                        >
                            Sign In
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupStep1;
