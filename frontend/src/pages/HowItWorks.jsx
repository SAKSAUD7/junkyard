import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const HowItWorks = () => {
    const navigate = useNavigate();

    // Scroll to top when page loads
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const steps = [
        {
            number: '01',
            title: 'Tell Us What You Need',
            description: 'Fill out our simple form with your vehicle details (make, model, year) and the specific part you\'re looking for. Add your contact information and location.',
            icon: (
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        {
            number: '02',
            title: 'We Connect You with Junkyards',
            description: 'Your request is instantly sent to our network of verified junkyards and auto salvage yards in your area. No need to call around - we do the work for you.',
            icon: (
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            )
        },
        {
            number: '03',
            title: 'Receive Quotes Directly',
            description: 'Junkyards with your part in stock will contact you directly with pricing, availability, and shipping options. Compare offers and choose the best deal.',
            icon: (
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            number: '04',
            title: 'Get Your Part',
            description: 'Purchase directly from the junkyard of your choice. Arrange pickup or shipping, and get your quality used part at a fraction of the cost of new.',
            icon: (
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            )
        }
    ];

    const benefits = [
        {
            title: 'Save Time',
            description: 'No more calling dozens of junkyards. One form reaches them all.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            title: 'Save Money',
            description: 'Compare prices from multiple vendors to get the best deal on quality used parts.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            title: 'Verified Vendors',
            description: 'All junkyards in our network are verified and rated by real customers.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            )
        },
        {
            title: '100% Free',
            description: 'Our service is completely free for buyers. No hidden fees, ever.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
            <Navbar />

            {/* Hero Section */}
            <div className="relative py-24 overflow-hidden">
                {/* Background Details */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

                {/* Glow Effects */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full mb-8">
                        <span className="text-cyan-400 font-bold">SIMPLE PROCESS</span>
                        <span className="text-white/30">|</span>
                        <span className="text-white/90 text-sm">Find parts in minutes</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
                        How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Works</span>
                    </h1>

                    <p className="text-xl text-white/60 max-w-3xl mx-auto mb-12">
                        Finding quality used auto parts has never been easier. We connect you with verified junkyards nationwide - no more endless phone calls or wasted time.
                    </p>
                </div>
            </div>

            {/* Steps Grid */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-cyan-500/30 via-blue-500/30 via-purple-500/30 to-green-500/30 z-0"></div>

                    {steps.map((step, index) => (
                        <div key={index} className="relative z-10 group">
                            <div className="bg-dark-800/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/5 hover:border-cyan-400/30 transition-all duration-500 h-full">
                                {/* Number Circle */}
                                <div className="w-16 h-16 bg-dark-900 border-2 border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:border-cyan-400 transition-all duration-500 mx-auto relative">
                                    <div className="absolute inset-0 bg-cyan-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                                    <span className="text-2xl font-bold text-white relative z-10">{step.number}</span>
                                </div>

                                {/* Content */}
                                <div className="text-center">
                                    <div className="inline-flex p-3 rounded-xl bg-white/5 mb-4 group-hover:bg-cyan-400/10 transition-colors">
                                        {step.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                                        {step.title}
                                    </h3>
                                    <p className="text-white/60 leading-relaxed text-sm">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Benefits Section */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                        Why Use <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">JYNM</span>?
                    </h2>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto">
                        We make finding used auto parts simple, fast, and affordable.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="bg-dark-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/5 hover:border-orange-400/30 transition-all duration-300">
                            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4 text-orange-400">
                                {benefit.icon}
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                            <p className="text-white/60 text-sm leading-relaxed">{benefit.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
                <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-white/10 rounded-3xl p-12 relative overflow-hidden text-center">
                    <div className="absolute inset-0 bg-blue-500/5 blur-3xl"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Find Your Part?</h2>
                        <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
                            Join thousands of satisfied customers who found their parts through our network of trusted junkyards.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold px-10 py-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                        >
                            Get Started - It's Free →
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default HowItWorks;
