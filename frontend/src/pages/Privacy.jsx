import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'

const sections = [
    {
        title: null,
        content: `Your privacy is very important to us. Accordingly, Junkyards Near Me has developed this Policy in order for you to understand how we collect, use, communicate and disclose and make use of personal information. We are committed to conducting our business in accordance with these principles in order to ensure that the confidentiality of personal information is protected.`,
        list: [
            'Before or at the time of collecting personal information, we will identify the purposes for which information is being collected.',
            'We will collect and use personal information solely with the objective of fulfilling those purposes specified by us.',
            'We will only retain personal information as long as necessary for the fulfillment of those purposes.',
            'We will collect personal information by lawful and fair means.',
            'Personal data should be relevant, accurate, complete, and up-to-date.',
            'We will protect personal information by reasonable security safeguards against loss, theft, or unauthorized access.',
            'We will make readily available information about our policies and practices relating to the management of personal information.',
        ]
    },
    { title: 'How do we protect your information?', content: `We implement a variety of security measures to maintain the safety of your personal information when you place an order for services. Junkyards Near Me offers the use of a secure server. All supplied sensitive information is transmitted via SSL technology and encrypted into our database. After a transaction, your private information will not be stored on our servers.` },
    { title: 'Do we use cookies?', content: `Yes. Cookies are small files that a site or its service provider transfers to your computer's hard drive through your Web browser (if you allow) that enables the site's systems to recognize your browser and capture and remember certain information. Our users search for local junkyards by zip code. We store cookies of each search session making page navigation easier. Users must clear their own cookies in their browser's settings.` },
    { title: 'Do we disclose any information to outside parties?', content: `Junkyards Near Me does not sell, trade, or otherwise transfer to outside parties your personally identifiable information. This does not include trusted third parties who assist us in operating our website, so long as those parties agree to keep this information confidential. We may also release your information when we believe release is appropriate to comply with the law or protect rights, property, or safety. Non-personally identifiable visitor information may be provided to other parties for marketing or advertising.` },
    { title: "Children's Online Privacy Protection Act Compliance", content: `Junkyards Near Me is in compliance with the requirements of COPPA (Children's Online Privacy Protection Act); we do not collect any information from anyone under 13 years of age. Our website, products and services are all directed to people who are at least 13 years old or older.` },
    { title: 'English Language', content: `The English version of this Privacy Policy governs. All disputes, claims and causes of action (and related proceedings) will be communicated in English.` },
    { title: 'Your Consent', content: `By using our site, you consent to our privacy policy.` },
    { title: 'Changes to our Privacy Policy', content: `If we make a material change to our privacy policies, we will post a notice of those changes on our Website or notify you by email prior to the change becoming effective. You are bound by changes to the Privacy Policy when you use the site after those changes have been posted. Junkyards Near Me encourages you to periodically review this page for the latest information on our privacy practices.` },
]

export default function Privacy() {
    return (
        <div className="min-h-screen" style={{ background: '#0a0b0d' }}>
            <SEO
                title="Privacy Policy - Your Data Protection & Privacy Rights"
                description="Privacy policy for Junkyards Near Me. Learn how we collect, use, and protect your personal information. COPPA compliant, secure data handling."
                canonical="/privacy-policy"
            />
            <Navbar />

            {/* Hero */}
            <div className="relative py-20 overflow-hidden border-b border-white/5" style={{ background: 'linear-gradient(135deg, #080909 0%, #0f1117 100%)' }}>
                <div className="absolute inset-0">
                    <img src="/images/static/car-interior-dashboard.png" alt="" loading="lazy" className="w-full h-full object-cover object-center" style={{ opacity: 0.09 }} />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(8,9,9,0.65) 0%, rgba(8,9,9,0.9) 100%)' }} />
                </div>
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 mb-6" style={{ background: 'rgba(245,158,11,0.08)' }}>
                            <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Legal</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4">Privacy <span style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Policy</span></h1>
                        <p className="text-white/30 text-sm">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </motion.div>
                </div>
            </div>

            {/* Content */}
            <div className="py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="space-y-8">
                        {sections.map((section, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.05 }}
                                className="rounded-2xl border border-white/[8%] p-6 md:p-8"
                                style={{ background: '#111318' }}
                            >
                                {section.title && (
                                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                                        <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(to bottom, #f59e0b, #ea580c)' }} />
                                        {section.title}
                                    </h2>
                                )}
                                {section.content && <p className="text-white/50 text-sm leading-relaxed mb-4 last:mb-0">{section.content}</p>}
                                {section.list && (
                                    <ul className="space-y-3 mt-4">
                                        {section.list.map((item, j) => (
                                            <li key={j} className="flex items-start gap-3 text-sm text-white/50">
                                                <div className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                </div>
                                                <span className="leading-relaxed">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
