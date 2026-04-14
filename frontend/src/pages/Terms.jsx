import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'

export default function Terms() {
    return (
        <div style={{ background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)' }}>
            <SEO
                title="Terms of Service - User Agreement & Legal Terms"
                description="Terms and conditions for using Junkyards Near Me. User agreements, disclaimers, copyright policy, and legal information."
            />

            <Navbar />

            {/* Hero - Cinematic Car Imagery */}
            <div className="hero-depth pt-24 pb-20 flex flex-col justify-center items-center text-center" style={{ minHeight: '40vh', background: 'var(--bg-base)' }}>
                <div className="hero-bg-primary" style={{ backgroundImage: "url('/heroes/car-crusher.png')", opacity: 0.52 }} />
                <div className="hero-bg-depth" style={{ backgroundImage: "url('/heroes/aerial-night.png')" }} />
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
                                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--neon-blue)' }}>LEGAL</span>
                        </div>
                        <h1 className="font-black mb-4 px-2" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontFamily: "'Outfit', sans-serif" }}>
                            Terms of <span style={{ background: 'linear-gradient(135deg, var(--neon-blue), #66e0ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Service</span>
                        </h1>
                        <p className="font-mono text-sm" style={{ color: 'var(--neon-orange)' }}>Last updated: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="rounded-3xl p-8 sm:p-12 space-y-8 text-base shadow-2xl relative z-20 text-left" style={{ background: 'rgba(240,245,250,0.8)', border: '1px solid rgba(37,99,235,0.1)', backdropFilter: 'blur(20px)', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        <section>
                            <h2 className="font-bold text-2xl mb-4" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>DEFINITIONS</h2>

                            <h3 className="font-bold mb-2 mt-6" style={{ color: 'var(--neon-blue)', fontFamily: "'JetBrains Mono', monospace" }}>Parties</h3>
                            <p className="mb-4">
                                "You" and "your" refer to you, as a user of the Site. A "user" is someone who accesses, browses, crawls, scrapes, or in any way uses the Site. "We," "us," and "our" refer to Junkyards Near Me.
                            </p>

                            <h3 className="font-bold mb-2 mt-6" style={{ color: 'var(--neon-blue)', fontFamily: "'JetBrains Mono', monospace" }}>Content</h3>
                            <p>
                                "Content" means text, images, logos, photos, audio, video, location data, and all other forms of data or communication. "Your Content" means Content that you submit or transmit to, through, or in connection with the Site, such as ratings, reviews, compliments, invitations, check-ins, messages, and information that you publicly display or displayed in your account profile. "User Content" means Content that users submit or transmit to, through, or in connection with the Site. "Junkyards Near Me Content" means Content that we create and make available in connection with the Site. "Third Party Content" means Content that originates from parties other than Junkyards Near Me or its users, which is made available in connection with the Site. "Site Content" means all of the Content that is made available in connection with the Site, including Your Content, User Content, Third Party Content, and Junkyards Near Me Content.
                            </p>
                        </section>

                        <section className="pt-8 border-t" style={{ borderColor: 'rgba(37,99,235,0.1)' }}>
                            <h2 className="font-bold text-2xl mb-4" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>1. Terms</h2>
                            <p>
                                By accessing this web site, you are agreeing to be bound by these web site Terms and Conditions of Use, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this web site are protected by applicable copyright and trade mark law.
                            </p>
                        </section>

                        <section className="pt-8 border-t" style={{ borderColor: 'rgba(37,99,235,0.1)' }}>
                            <h2 className="font-bold text-2xl mb-4" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>2. Disclaimer</h2>
                            <p>
                                The materials on Junkyards Near Me web site are provided "as shown." Junkyards Near Me makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties, including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights. Further, Junkyards Near Me does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its Internet web site or otherwise relating to such materials or on any sites linked to this site.
                            </p>
                        </section>

                        <section className="pt-8 border-t" style={{ borderColor: 'rgba(37,99,235,0.1)' }}>
                            <h2 className="font-bold text-2xl mb-4" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>3. Limitations</h2>
                            <p>
                                In no event shall Junkyards Near Me or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our Internet site or offered services, even if we or an authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
                            </p>
                        </section>

                        <section className="pt-8 border-t" style={{ borderColor: 'rgba(37,99,235,0.1)' }}>
                            <h2 className="font-bold text-2xl mb-4" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>4. Revisions and Errors</h2>
                            <p>
                                The materials appearing on our web site could include technical, typographical, or photographic errors. Junkyards Near Me does not warrant that any of the materials on its web site are accurate, complete, or current. We may make changes to the materials contained on our web site at any time without notice.
                            </p>
                        </section>

                        <section className="pt-8 border-t" style={{ borderColor: 'rgba(37,99,235,0.1)' }}>
                            <h2 className="font-bold text-2xl mb-4" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>5. Links</h2>
                            <p>
                                Junkyards Near Me has not reviewed all of the sites linked to its Internet web site and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by us of the site. Use of any such linked web site is at the user's own risk.
                            </p>
                        </section>

                        <section className="pt-8 border-t" style={{ borderColor: 'rgba(37,99,235,0.1)' }}>
                            <h2 className="font-bold text-2xl mb-4" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>6. Site Terms of Use Modifications</h2>
                            <p>
                                We may revise these terms of use for our web site at any time without notice. By using this web site you are agreeing to be bound by the then current version of these Terms and Conditions of Use.
                            </p>
                        </section>

                        <section className="pt-8 border-t" style={{ borderColor: 'rgba(37,99,235,0.1)' }}>
                            <h2 className="font-bold text-2xl mb-4" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>7. Governing Law</h2>
                            <p>
                                Any claim relating to Junkyards Near Me web site shall be governed by the laws of the country of note without regard to its conflict of law provisions.
                            </p>
                        </section>

                        <section className="pt-8 border-t" style={{ borderColor: 'rgba(37,99,235,0.1)' }}>
                            <h2 className="font-bold text-2xl mb-4" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>8. English Language</h2>
                            <p>
                                In the event of a conflict between these Terms and a foreign language version of our Terms of Use, the English language version of these Terms governs. All disputes, claims and causes of action (and related proceedings) will be communicated in English.
                            </p>
                        </section>

                        <section className="pt-8 border-t" style={{ borderColor: 'rgba(37,99,235,0.1)' }}>
                            <h2 className="font-bold text-2xl mb-4" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>9. Copyright policy, notice and claim information</h2>
                            <p>
                                All materials on this site, whether separate or compiled, including, but not limited to, text, graphics, audio clips, logos, buttons, images, digital downloads, data compilations, software, icons, html code and xml code, as well as all copyright, patent, trademark, trade dress, and other rights therein, are owned or licensed by Junkyards Near Me and its third-party information providers, and are protected by international intellectual property laws.
                            </p>
                        </section>

                        <section className="pt-8 border-t" style={{ borderColor: 'rgba(37,99,235,0.1)' }}>
                            <h2 className="font-bold text-2xl mb-4" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>10. Comment Disclaimer</h2>
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
