import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const SECTIONS = [
    {
        title: 'Information We Collect',
        content: `Before or at the time of collecting personal information, we will identify the purposes for which information is being collected. We will collect and use personal information solely with the objective of fulfilling those purposes specified by us and for other compatible purposes, unless we obtain the consent of the individual concerned or as required by law. We will only retain personal information as long as necessary for the fulfillment of those purposes.`,
    },
    {
        title: 'How We Protect Your Information',
        content: 'We implement a variety of security measures to maintain the safety of your personal information. All supplied sensitive information is transmitted via Secure Socket Layer (SSL) technology and then encrypted. After a transaction, your private information will not be stored on our servers.',
    },
    {
        title: 'Do We Use Cookies?',
        content: 'Yes. Cookies are small files that a site or its service provider transfers to your computer\'s hard drive through your Web browser (if you allow). We store cookies of each search session making page navigation easier. Users have the ability to reset their search and begin a new session.',
    },
    {
        title: 'Do We Share Information?',
        content: 'Junkyards Near Me does not sell, trade, or otherwise transfer to outside parties your personally identifiable information. This does not include trusted third parties who assist us in operating our website, so long as those parties agree to keep this information confidential.',
    },
    {
        title: "Children's Online Privacy (COPPA)",
        content: 'Junkyards Near Me is in compliance with the requirements of COPPA (Children\'s Online Privacy Protection Act). We do not collect any information from anyone under 13 years of age. Our website, products and services are all directed to people who are at least 13 years old or older.',
    },
    {
        title: 'Changes to Our Privacy Policy',
        content: 'If we make a material change to our privacy policies and procedures, we will post a notice of those changes on our Website or notify you by email to keep you aware of what information we collect, how we use it, and under what circumstances we may disclose it.',
    },
];

export default function Privacy() {
    return (
        <div className="bg-[#f8fafc] min-h-screen">
            <SEO
                title="Privacy Policy - Your Data Protection & Privacy Rights"
                description="Privacy policy for Junkyards Near Me. Learn how we collect, use, and protect your personal information. COPPA compliant, secure data handling."
            />
            <Navbar />

            {/* Light Hero */}
            <section className="relative pt-28 pb-14 bg-white border-b border-slate-100 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/80 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 bg-blue-50 border border-blue-100">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        <span className="text-blue-600 text-[11px] font-black uppercase tracking-widest">Legal</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
                        Privacy <span className="text-blue-600">Policy</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
            </section>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Summary box */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-10">
                    <p className="text-slate-700 leading-relaxed text-[15px]">
                        Your privacy is very important to us. Junkyards Near Me has developed this policy in order for you to understand how we collect, use, communicate, and disclose personal information. We are committed to conducting our business in accordance with these principles.
                    </p>
                </div>

                <div className="space-y-6">
                    {SECTIONS.map((section, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgb(0,0,0,0.04)] p-7">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white text-[12px] font-black flex items-center justify-center flex-shrink-0">{i + 1}</div>
                                <h2 className="text-[18px] font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>{section.title}</h2>
                            </div>
                            <p className="text-slate-600 leading-relaxed text-[15px]">{section.content}</p>
                        </div>
                    ))}
                </div>
            </div>

            <Footer />
        </div>
    );
}
