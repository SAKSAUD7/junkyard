import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'

export default function Terms() {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white selection:bg-purple-500/30">
            {/* SEO Meta Tags */}
            <SEO
                title="Terms of Service - User Agreement & Legal Terms"
                description="Terms and conditions for using Junkyards Near Me. User agreements, disclaimers, copyright policy, and legal information."
            />

            <Navbar />

            <div className="relative pt-32 pb-20 overflow-hidden">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
                <div className="absolute inset-0 bg-purple-600/5 blur-[120px] pointer-events-none"></div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="mb-12 text-center">
                        <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full mb-6">
                            <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clipRule="evenodd" />
                            </svg>
                            <span className="text-white/90 text-sm font-semibold">LEGAL</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-gray-200">
                            Terms of Service
                        </h1>
                        <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 space-y-8 text-gray-300 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">DEFINITIONS</h2>

                            <h3 className="text-xl font-bold text-white mb-3 mt-6">Parties</h3>
                            <p className="mb-4">
                                "You" and "your" refer to you, as a user of the Site. A "user" is someone who accesses, browses, crawls, scrapes, or in any way uses the Site. "We," "us," and "our" refer to Junkyards Near Me.
                            </p>

                            <h3 className="text-xl font-bold text-white mb-3 mt-6">Content</h3>
                            <p>
                                "Content" means text, images, logos, photos, audio, video, location data, and all other forms of data or communication. "Your Content" means Content that you submit or transmit to, through, or in connection with the Site, such as ratings, reviews, compliments, invitations, check-ins, messages, and information that you publicly display or displayed in your account profile. "User Content" means Content that users submit or transmit to, through, or in connection with the Site. "Junkyards Near Me Content" means Content that we create and make available in connection with the Site. "Third Party Content" means Content that originates from parties other than Junkyards Near Me or its users, which is made available in connection with the Site. "Site Content" means all of the Content that is made available in connection with the Site, including Your Content, User Content, Third Party Content, and Junkyards Near Me Content.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Terms</h2>
                            <p>
                                By accessing this web site, you are agreeing to be bound by these web site Terms and Conditions of Use, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this web site are protected by applicable copyright and trade mark law.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. Disclaimer</h2>
                            <p>
                                The materials on Junkyards Near Me web site are provided "as shown." Junkyards Near Me makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties, including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights. Further, Junkyards Near Me does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its Internet web site or otherwise relating to such materials or on any sites linked to this site.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. Limitations</h2>
                            <p>
                                In no event shall Junkyards Near Me or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our Internet site or offered services, even if we or an authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Revisions and Errors</h2>
                            <p>
                                The materials appearing on our web site could include technical, typographical, or photographic errors. Junkyards Near Me does not warrant that any of the materials on its web site are accurate, complete, or current. We may make changes to the materials contained on our web site at any time without notice.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">5. Links</h2>
                            <p>
                                Junkyards Near Me has not reviewed all of the sites linked to its Internet web site and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by us of the site. Use of any such linked web site is at the user's own risk.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">6. Site Terms of Use Modifications</h2>
                            <p>
                                We may revise these terms of use for our web site at any time without notice. By using this web site you are agreeing to be bound by the then current version of these Terms and Conditions of Use.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">7. Governing Law</h2>
                            <p>
                                Any claim relating to Junkyards Near Me web site shall be governed by the laws of the country of note without regard to its conflict of law provisions.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">8. English Language</h2>
                            <p>
                                In the event of a conflict between these Terms and a foreign language version of our Terms of Use, the English language version of these Terms governs. All disputes, claims and causes of action (and related proceedings) will be communicated in English.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">9. Copyright policy, notice and claim information</h2>
                            <p>
                                All materials on this site, whether separate or compiled, including, but not limited to, text, graphics, audio clips, logos, buttons, images, digital downloads, data compilations, software, icons, html code and xml code, as well as all copyright, patent, trademark, trade dress, and other rights therein, are owned or licensed by Junkyards Near Me and its third-party information providers, and are protected by international intellectual property laws.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">10. Comment Disclaimer</h2>
                            <p className="mb-4">
                                Junkyards Near Me is not responsible for the content of any comments posted by visitors or guests to our website or any of our associated web pages. Responsibility for the content of comments belongs to the commenter alone.
                            </p>
                            <p className="mb-4">
                                In no way are the writings or comments of any one contributor meant to represent the views or beliefs of Junkyards Near Me or any other user – each opinion is unique and represents the opinion of that writer. An opinion expressed by any contributor does not reflect the views of any organization, employer, or religious congregation that contributor may be associated with unless expressly stated.
                            </p>
                            <p className="mb-4">
                                The content produced by Junkyards Near Me is owned by Junkyards Near Me. The content produced by any other contributors is owned by those individuals. Opinions expressed by any contributor to this web site are offered freely without direct compensation by any sponsor, advertiser, contributor, candidate, or employer.
                            </p>
                            <p>
                                If you have any questions regarding Junkyards Near Me comment policy, please feel free to contact us.
                            </p>
                        </section>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
