import { useState } from 'react';
import { useNotifications } from '../common/EnterpriseNotifications';

const SignupStep1 = ({ formData, onNext, onSwitchToLogin }) => {
    const { showToast } = useNotifications();
    const [name, setName] = useState(formData.name || '');
    const [phone, setPhone] = useState(formData.phone || '');
    const [countryCode, setCountryCode] = useState(formData.countryCode || '+1');
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
        if (countryCode === '+1' && !/^\d{10}$/.test(value)) {
            return 'Please enter a valid 10-digit US/CA phone number';
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
        showToast({ type: 'error', message: `${provider} authentication is not yet configured. Please use email signup for now.` });
    };

    return (
        <div>
            <div className="text-center mb-8 flex flex-col items-center">
                <picture>
                    <source srcSet="/logo.webp" type="image/webp" />
                    <img src="/logo.png" alt="JYNM Logo" className="h-12 sm:h-14 w-auto object-contain mb-4" />
                </picture>
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
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${touched.name && errors.name ? 'border-red-500' : 'border-gray-300'
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
                            className="w-24 px-2 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                            style={{ maxWidth: '90px' }}
                        >
                            <option value="+1">🇺🇸 +1</option>
                        </select>

                        {/* Phone Input */}
                        <input
                            type="tel"
                            name="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            onBlur={() => handleBlur('phone')}
                            className={`flex-1 px-3 py-2 border-2 rounded-lg focus:outline-none focus:border-blue-500 text-sm sm:text-base ${touched.phone && errors.phone ? 'border-red-500' : 'border-gray-300'}`}
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
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-slate-800 transition-all ${isValid
                        ? 'bg-blue-700 hover:bg-blue-800 shadow-md hover:shadow-lg'
                        : 'bg-gray-300 cursor-not-allowed'
                        }`}
                >
                    Next
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
