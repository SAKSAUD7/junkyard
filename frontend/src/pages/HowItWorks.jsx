import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const HowItWorks = () => {
    const navigate = useNavigate();

    const steps = [
        {
            number: '01',
            title: 'Search Your Part',
            description: 'Enter your vehicle details or browse by state to find the exact part you need.',
            icon: (
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            )
        },
        {
            number: '02',
            title: 'Compare Vendors',
            description: 'View rated junkyards, check reviews, and compare prices from trusted vendors.',
            icon: (
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
            )
        },
        {
            number: '03',
            title: 'Get Instant Quotes',
            description: 'Connect directly with vendors to get quotes, check availability, and arrange shipping.',
            icon: (
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

                    <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12">
                        We've streamlined the process of finding used auto parts. No more calling around - search hundreds of junkyards instantly.
                    </p>
                </div>
            </div>

            {/* Steps Grid */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-cyan-500/30 z-0"></div>

                    {steps.map((step, index) => (
                        <div key={index} className="relative z-10 group">
                            <div className="bg-dark-800/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/5 hover:border-cyan-400/30 transition-all duration-500 h-full">
                                {/* Number Circle */}
                                <div className="w-16 h-16 bg-dark-900 border-2 border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:border-cyan-400 transition-all duration-500 mx-auto md:mx-0 relative">
                                    <div className="absolute inset-0 bg-cyan-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                                    <span className="text-2xl font-bold text-white relative z-10">{step.number}</span>
                                </div>

                                {/* Content */}
                                <div className="text-center md:text-left">
                                    <div className="inline-flex p-3 rounded-xl bg-white/5 mb-4 group-hover:bg-cyan-400/10 transition-colors">
                                        {step.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">
                                        {step.title}
                                    </h3>
                                    <p className="text-white/60 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="mt-20 text-center">
                    <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-white/10 rounded-3xl p-12 relative overflow-hidden">
                        <div className="absolute inset-0 bg-blue-500/5 blur-3xl"></div>
                        <h2 className="text-3xl font-bold text-white mb-6 relative z-10">Ready to find your part?</h2>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold px-10 py-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 relative z-10"
                        >
                            Start Searching Now →
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default HowItWorks;
