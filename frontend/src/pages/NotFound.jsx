import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const NotFound = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-[#f8fafc] min-h-screen flex flex-col font-inter">
            {/* noindex to prevent indexing of 404 pages */}
            <SEO 
                title="Page Not Found - 404 | Junkyards Near Me" 
                description="The page you are looking for does not exist." 
                noindex={true} 
            />
            
            <Navbar />
            
            <main className="flex-grow flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[100px] pointer-events-none opacity-60"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-orange-50 rounded-full blur-[80px] pointer-events-none opacity-40 translate-x-1/4 translate-y-1/4"></div>

                <div className="max-w-2xl w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-white p-10 text-center relative z-10">
                    <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    
                    <h1 className="text-8xl font-black text-slate-900 mb-4 tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        4<span className="text-blue-600">0</span>4
                    </h1>
                    
                    <h2 className="text-2xl font-bold text-slate-800 mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Page Not Found
                    </h2>
                    
                    <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto leading-relaxed">
                        Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/" className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-[0_4px_14px_rgb(37,99,235,0.3)] transition-all flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Go to Homepage
                        </Link>
                        <Link to="/junkyards-by-location" className="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 shadow-sm transition-all flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            Browse Junkyards
                        </Link>
                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
};

export default NotFound;
