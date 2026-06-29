import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function SignUp() {
    const [searchParams] = useSearchParams();
    const returnUrl = searchParams.get('returnUrl') || '/';
    const navigate = useNavigate();
    const { register, isAuthenticated } = useContext(AuthContext);

    const [role, setRole] = useState('buyer'); // 'buyer' or 'vendor'
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        agreed: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) { navigate(returnUrl); }
    }, [isAuthenticated, navigate, returnUrl]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData(prev => ({
            ...prev,
            [e.target.name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.email || !formData.phone || !formData.password) {
            setError('Please fill in all fields.');
            return;
        }

        if (!formData.agreed) {
            setError('You must agree to the Terms & Conditions.');
            return;
        }

        setLoading(true);
        const completeData = {
            name: formData.name,
            first_name: formData.name.split(' ')[0] || formData.name,
            last_name: formData.name.split(' ').slice(1).join(' ') || '',
            username: formData.email.split('@')[0],
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            password2: formData.password,
            countryCode: '+1',
            role: role // Include role if backend expects it
        };

        try {
            await register(completeData);
            // Registration automatically logs in or navigates in AuthContext
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.error || err.response?.data?.email?.[0] || err.message || 'Failed to create account. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#f8faff] min-h-screen font-inter relative overflow-hidden flex flex-col">
            <SEO title="Sign Up - Create Your JYNM Account" description="Create a free account to list your junkyard, manage leads, and connect with customers." noindex={true} />
            <Navbar />

            {/* Background Decorations */}
            <div className="absolute top-20 right-[10%] w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-10 left-[5%] w-[400px] h-[400px] bg-indigo-100/30 rounded-full blur-[80px] pointer-events-none" />

            {/* Main Content Area */}
            <div className="flex-grow max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 relative z-10 flex flex-col lg:flex-row gap-16 lg:gap-24 items-center justify-center w-full">
                
                {/* Left Side - Text & Value Props */}
                <div className="flex-1 w-full lg:max-w-md self-start lg:mt-10">
                    <h1 className="text-[36px] font-black text-slate-900 leading-tight mb-4 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Create Your Account
                    </h1>
                    <p className="text-[15px] text-slate-500 font-medium mb-12 max-w-sm leading-relaxed">
                        Join thousands of buyers and sellers on JYNM today.
                    </p>

                    <div className="space-y-6">
                        {[
                            { text: 'Find Quality Parts', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /> },
                            { text: 'Connect with Trusted Vendors', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> },
                            { text: 'Get the Best Deals', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
                            { text: 'Grow Your Business', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /> }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 items-center">
                                <div className="w-10 h-10 bg-blue-100/60 rounded flex items-center justify-center text-blue-600 flex-shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{item.icon}</svg>
                                </div>
                                <h3 className="font-bold text-slate-800 text-[15px]">{item.text}</h3>
                            </div>
                        ))}
                    </div>

                    {/* Temporary space for the truck illustration */}
                    <div className="mt-12 opacity-80 h-32 relative">
                        {/* Could place an img src="/images/tow-truck.png" here if it existed */}
                    </div>
                </div>

                {/* Right Side - Signup Form Card */}
                <div className="flex-1 w-full max-w-[480px]">
                    <div className="bg-white rounded-[24px] p-8 md:p-10 shadow-[0_15px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 relative z-10 w-full ml-auto">
                        <h2 className="text-[22px] font-black text-slate-900 mb-6 tracking-tight text-center">
                            Sign Up
                        </h2>

                        {/* Role Tabs */}
                        <div className="flex w-full mb-8 border-b border-slate-200">
                            <button 
                                onClick={() => setRole('buyer')}
                                className={`flex-1 pb-3 text-[14px] font-bold text-center transition-colors relative ${role === 'buyer' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                I'm a Buyer
                                {role === 'buyer' && <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-blue-600 rounded-t-full" />}
                            </button>
                            <button 
                                onClick={() => setRole('vendor')}
                                className={`flex-1 pb-3 text-[14px] font-bold text-center transition-colors relative ${role === 'vendor' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                I'm a Vendor
                                {role === 'vendor' && <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-blue-600 rounded-t-full" />}
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
                                <span className="font-bold">Error:</span> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-[12px] font-bold text-slate-600 mb-2">Full Name</label>
                                <input
                                    type="text" name="name" value={formData.name} onChange={handleChange} required
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 placeholder-[#94a3b8] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-[14px] font-medium transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-[12px] font-bold text-slate-600 mb-2">Email Address</label>
                                <input
                                    type="email" name="email" value={formData.email} onChange={handleChange} required
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 placeholder-[#94a3b8] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-[14px] font-medium transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-[12px] font-bold text-slate-600 mb-2">Phone Number</label>
                                <input
                                    type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 placeholder-[#94a3b8] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-[14px] font-medium transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-[12px] font-bold text-slate-600 mb-2">Password</label>
                                <input
                                    type="password" name="password" value={formData.password} onChange={handleChange} required
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 placeholder-[#94a3b8] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-[14px] font-medium transition-colors"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <input 
                                    type="checkbox" 
                                    name="agreed"
                                    checked={formData.agreed}
                                    onChange={handleChange}
                                    id="agree-terms"
                                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" 
                                />
                                <label htmlFor="agree-terms" className="text-[13px] text-slate-600 font-medium">
                                    I agree to the <Link to="/terms" className="text-blue-600 hover:underline hover:text-blue-700">Terms & Conditions</Link>
                                </label>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-[#f97316] text-white font-bold rounded-lg px-4 py-3.5 hover:bg-[#ea580c] transition-colors disabled:opacity-50 mt-4 shadow-sm text-[15px]"
                            >
                                {loading ? 'Creating...' : 'Create Account'}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-[13px] font-medium text-slate-500">
                            Already have an account? <Link to="/signin" className="text-blue-600 font-bold hover:underline">Sign In</Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
