import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'

export default function Privacy() {
    return (
        <div style={{ background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)' }}>
            <SEO
                title="Privacy Policy - Your Data Protection & Privacy Rights"
                description="Privacy policy for Junkyards Near Me. Learn how we collect, use, and protect your personal information. COPPA compliant, secure data handling."
            />

            <Navbar />

            {/* Hero - Cinematic Car Imagery */}
            <div className="hero-depth pt-24 pb-20 flex flex-col justify-center items-center text-center" style={{ minHeight: '40vh', background: 'var(--bg-base)' }}>
                <div className="hero-bg-primary" style={{ backgroundImage: "url('/heroes/salvage-sunset.png')", opacity: 0.55 }} />
                <div className="hero-bg-depth" style={{ backgroundImage: "url('/heroes/stacked-cars.png')" }} />
                <div className="hero-overlay-base" />
                <div className="hero-vignette" />
                <div className="hero-glow-teal" />
                <div className="hero-glow-orange" />
                <div className="hero-grid" />
                <div className="hero-scanline" />
                <div className="hero-fade-bottom" />

                <div className="hero-content relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="mb-12 text-center">
                        <div className="inline-flex items-center gap-2 border px-4 py-2 rounded-full mb-6 shadow-xl" style={{ border: '1px solid rgba(37,99,235,0.3)', background: 'rgba(37,99,235,0.08)', backdropFilter: 'blur(10px)' }}>
                            <svg className="w-4 h-4" style={{ color: 'var(--neon-blue)' }} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--neon-blue)' }}>LEGAL</span>
                        </div>
                        <h1 className="font-black mb-4 px-2" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontFamily: "'Outfit', sans-serif" }}>
                            Privacy <span style={{ background: 'linear-gradient(135deg, var(--neon-blue), #66e0ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Policy</span>
                        </h1>
                        <p className="font-mono text-sm" style={{ color: 'var(--neon-orange)' }}>Last updated: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="rounded-3xl p-8 sm:p-12 space-y-8 text-base shadow-2xl relative z-20 text-left" style={{ background: 'rgba(240,245,250,0.8)', border: '1px solid rgba(37,99,235,0.1)', backdropFilter: 'blur(20px)', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        <section>
                            <p className="mb-6">
                                Your privacy is very important to us. Accordingly, Junkyards Near Me has developed this Policy in order for you to understand how we collect, use, communicate and disclose and make use of personal information. The following outlines our privacy policy.
                            </p>
                            <ul className="list-none space-y-4">
                                {[
                                    "Before or at the time of collecting personal information, we will identify the purposes for which information is being collected.",
                                    "We will collect and use personal information solely with the objective of fulfilling those purposes specified by us and for other compatible purposes, unless we obtain the consent of the individual concerned or as required by law.",
                                    "We will only retain personal information as long as necessary for the fulfillment of those purposes.",
                                    "We will collect personal information by lawful and fair means and, where appropriate, with the knowledge or consent of the individual concerned.",
                                    "Personal data should be relevant to the purposes for which it is to be used, and, to the extent necessary for those purposes, should be accurate, complete, and up-to-date.",
                                    "We will protect personal information by reasonable security safeguards against loss or theft, as well as unauthorized access, disclosure, copying, use or modification.",
                                    "We will make readily available to customers information about our policies and practices relating to the management of personal information."
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-4">
                                        <span className="flex-shrink-0 mt-1.5 w-2 h-2 rounded-full" style={{ background: 'var(--neon-blue)', boxShadow: '0 0 8px rgba(37,99,235,0.8)' }}></span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-6">
                                We are committed to conducting our business in accordance with these principles in order to ensure that the confidentiality of personal information is protected and maintained.
                            </p>
                        </section>

                        <section className="pt-8 border-t" style={{ borderColor: 'rgba(37,99,235,0.1)' }}>
                            <h2 className="font-bold text-2xl mb-4" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>How do we protect your information?</h2>
                            <p className="mb-4">
                                We implement a variety of security measures to maintain the safety of your personal information when you place an order for services.
                            </p>
                            <p className="mb-4">
                                Junkyards Near Me offers the use of a secure server. All supplied sensitive/credit information is transmitted via Secure Socket Layer (SSL) technology and then encrypted into our Payment gateway providers database only to be accessible by those authorized with special access rights to such systems, and are required to keep the information confidential.
                            </p>
                            <p>
                                After a transaction, your private information will not be stored on our servers.
                            </p>
                        </section>

                        <section className="pt-8 border-t" style={{ borderColor: 'rgba(37,99,235,0.1)' }}>
                            <h2 className="font-bold text-2xl mb-4" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>Do we use cookies?</h2>
                            <p className="mb-4">
                                Yes. Cookies are small files that a site or its service provider transfers to your computer's hard drive through your Web browser (if you allow) that enables the site's or service provider's systems to recognize your browser and capture and remember certain information.
                            </p>
                            <p className="mb-4">
                                Our users search for local junkyards by zip code and are able to search any location across the country. We store cookies of each search session making page navigation easier and much more effective for the user. This creates a user experience of a localized directory and only stores your information here on our site.
                            </p>
                            <p>
                                Users have the ability to reset their zip code and begin a new search. Junkyards Near Me does NOT clear users' cookies for them; users must clear their own cookies in their browser's settings.
                            </p>
                        </section>

                        <section className="pt-8 border-t" style={{ borderColor: 'rgba(37,99,235,0.1)' }}>
                            <h2 className="font-bold text-2xl mb-4" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>Do we disclose any information to outside parties?</h2>
                            <p className="mb-4">
                                Junkyards Near Me does not sell, trade, or otherwise transfer to outside parties your personally identifiable information. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential. We may also release your information when we believe release is appropriate to comply with the law, enforce our site policies, or protect ours or others rights, property, or safety.
                            </p>
                            <p>
                                However, non-personally identifiable visitor information may be provided to other parties for marketing, advertising, or other uses.
                            </p>
                        </section>

                        <section className="pt-8 border-t" style={{ borderColor: 'rgba(37,99,235,0.1)' }}>
                            <h2 className="font-bold text-2xl mb-4" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>Children's Online Privacy Protection Act Compliance</h2>
                            <p>
                                Junkyards Near Me is in compliance with the requirements of COPPA (Children's Online Privacy Protection Act); we do not collect any information from anyone under 13 years of age. Our website, products and services are all directed to people who are at least 13 years old or older.
                            </p>
                        </section>

                        <section className="pt-8 border-t" style={{ borderColor: 'rgba(37,99,235,0.1)' }}>
                            <h2 className="font-bold text-2xl mb-4" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>English Language</h2>
                            <p>
                                The English version of this Privacy Policy governs. All disputes, claims and causes of action (and related proceedings) will be communicated in English.
                            </p>
                        </section>

                        <section className="pt-8 border-t" style={{ borderColor: 'rgba(37,99,235,0.1)' }}>
                            <h2 className="font-bold text-2xl mb-4" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>Your Consent</h2>
                            <p>
                                By using our site, you consent to our privacy policy.
                            </p>
                        </section>

                        <section className="pt-8 border-t" style={{ borderColor: 'rgba(37,99,235,0.1)' }}>
                            <h2 className="font-bold text-2xl mb-4" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>Changes to our Privacy Policy</h2>
                            <p>
                                If we make a material change to our privacy policies and procedures as to the collection, use or disclosure of your Personal Information, we will post a notice of those changes on our Website or notify you by email (sent to the email address specified in your account) to keep you aware of what information we collect, how we use it and under what circumstances we may disclose it, prior to the change becoming effective. You are bound by changes to the Privacy Policy when you use the site after those changes have been posted. Junkyards Near Me encourages you to periodically review this page for the latest information on our privacy practices.
                            </p>
                        </section>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
