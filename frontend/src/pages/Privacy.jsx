import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'

export default function Privacy() {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white selection:bg-blue-500/30">
            {/* SEO Meta Tags */}
            <SEO
                title="Privacy Policy - Your Data Protection & Privacy Rights"
                description="Privacy policy for Junkyards Near Me. Learn how we collect, use, and protect your personal information. COPPA compliant, secure data handling."
            />

            <Navbar />

            <div className="relative pt-32 pb-20 overflow-hidden">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
                <div className="absolute inset-0 bg-blue-600/5 blur-[120px] pointer-events-none"></div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="mb-12 text-center">
                        <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full mb-6">
                            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-white/90 text-sm font-semibold">LEGAL</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-gray-200">
                            Privacy Policy
                        </h1>
                        <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 space-y-8 text-gray-300 leading-relaxed">
                        <section>
                            <p className="mb-6">
                                Your privacy is very important to us. Accordingly, Junkyards Near Me has developed this Policy in order for you to understand how we collect, use, communicate and disclose and make use of personal information. The following outlines our privacy policy.
                            </p>
                            <ul className="list-disc pl-6 space-y-3">
                                <li>Before or at the time of collecting personal information, we will identify the purposes for which information is being collected.</li>
                                <li>We will collect and use personal information solely with the objective of fulfilling those purposes specified by us and for other compatible purposes, unless we obtain the consent of the individual concerned or as required by law.</li>
                                <li>We will only retain personal information as long as necessary for the fulfillment of those purposes.</li>
                                <li>We will collect personal information by lawful and fair means and, where appropriate, with the knowledge or consent of the individual concerned.</li>
                                <li>Personal data should be relevant to the purposes for which it is to be used, and, to the extent necessary for those purposes, should be accurate, complete, and up-to-date.</li>
                                <li>We will protect personal information by reasonable security safeguards against loss or theft, as well as unauthorized access, disclosure, copying, use or modification.</li>
                                <li>We will make readily available to customers information about our policies and practices relating to the management of personal information.</li>
                            </ul>
                            <p className="mt-6">
                                We are committed to conducting our business in accordance with these principles in order to ensure that the confidentiality of personal information is protected and maintained.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">How do we protect your information?</h2>
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

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">Do we use cookies?</h2>
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

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">Do we disclose any information to outside parties?</h2>
                            <p className="mb-4">
                                Junkyards Near Me does not sell, trade, or otherwise transfer to outside parties your personally identifiable information. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential. We may also release your information when we believe release is appropriate to comply with the law, enforce our site policies, or protect ours or others rights, property, or safety.
                            </p>
                            <p>
                                However, non-personally identifiable visitor information may be provided to other parties for marketing, advertising, or other uses.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">Children's Online Privacy Protection Act Compliance</h2>
                            <p>
                                Junkyards Near Me is in compliance with the requirements of COPPA (Children's Online Privacy Protection Act); we do not collect any information from anyone under 13 years of age. Our website, products and services are all directed to people who are at least 13 years old or older.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">English Language</h2>
                            <p>
                                The English version of this Privacy Policy governs. All disputes, claims and causes of action (and related proceedings) will be communicated in English.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">Your Consent</h2>
                            <p>
                                By using our site, you consent to our privacy policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">Changes to our Privacy Policy</h2>
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
