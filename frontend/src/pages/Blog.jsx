import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'

export default function Blog() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-teal-50 text-gray-700 selection:bg-blue-100 flex flex-col">
            {/* SEO Meta Tags */}
            <SEO
                title="Auto Salvage & Junkyard Blog"
                description="Tips, guides, and news about finding used auto parts, navigating auto salvage yards, and DIY car repair from Junkyards Near Me."
                canonical="/blog"
            />

            <Navbar />

            <main className="flex-grow flex items-center justify-center p-4">
                <div className="max-w-2xl w-full bg-white shadow-xl border border-gray-100 rounded-2xl md:rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
                    {/* Background blob */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                    
                    <div className="relative z-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 text-blue-600 rounded-full mb-6 ring-8 ring-blue-50/50">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15M9 11l3 3m0 0l3-3m-3 3V8" />
                            </svg>
                        </div>
                        
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
                            Our Blog is <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">Coming Soon</span>
                        </h1>
                        
                        <p className="text-gray-600 text-lg mb-8 leading-relaxed max-w-lg mx-auto">
                            We're working hard on bringing you the best guides, tips, and news about auto salvage and used parts. Stay tuned!
                        </p>
                        
                        <a 
                            href="/" 
                            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white transition-all duration-200 bg-gray-900 border border-transparent rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                        >
                            Return to Homepage
                        </a>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
