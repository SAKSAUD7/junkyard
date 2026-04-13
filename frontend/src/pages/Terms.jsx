import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'

const sections = [
    {
        title: 'Definitions',
        subSections: [
            { sub: 'Parties', content: '"You" and "your" refer to you, as a user of the Site. A "user" is someone who accesses, browses, crawls, scrapes, or in any way uses the Site. "We," "us," and "our" refer to Junkyards Near Me.' },
            { sub: 'Content', content: '"Content" means text, images, logos, photos, audio, video, location data, and all other forms of data or communication. "Your Content" means Content that you submit or transmit to, through, or in connection with the Site, such as ratings, reviews, compliments, invitations, check-ins, messages, and information that you publicly display or in your account profile. "User Content" means Content that users submit or transmit to, through, or in connection with the Site. "Junkyards Near Me Content" means Content that we create and make available in connection with the Site.' }
        ]
    },
    { title: '1. Terms', content: 'By accessing this web site, you are agreeing to be bound by these web site Terms and Conditions of Use, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this web site are protected by applicable copyright and trade mark law.' },
    { title: '2. Disclaimer', content: 'The materials on Junkyards Near Me web site are provided "as shown." Junkyards Near Me makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties, including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights. Further, Junkyards Near Me does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its Internet web site.' },
    { title: '3. Limitations', content: 'In no event shall Junkyards Near Me or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our Internet site or offered services, even if we or an authorized representative has been notified orally or in writing of the possibility of such damage.' },
    { title: '4. Revisions and Errors', content: 'The materials appearing on our web site could include technical, typographical, or photographic errors. Junkyards Near Me does not warrant that any of the materials on its web site are accurate, complete, or current. We may make changes to the materials contained on our web site at any time without notice.' },
    { title: '5. Links', content: 'Junkyards Near Me has not reviewed all of the sites linked to its Internet web site and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by us of the site. Use of any such linked web site is at the user\'s own risk.' },
    { title: '6. Site Terms of Use Modifications', content: 'We may revise these terms of use for our web site at any time without notice. By using this web site you are agreeing to be bound by the then current version of these Terms and Conditions of Use.' },
    { title: '7. Governing Law', content: 'Any claim relating to Junkyards Near Me web site shall be governed by the laws of the country of note without regard to its conflict of law provisions.' },
    { title: '8. English Language', content: 'In the event of a conflict between these Terms and a foreign language version, the English language version governs. All disputes, claims and causes of action (and related proceedings) will be communicated in English.' },
    { title: '9. Copyright Notice', content: 'All materials on this site, whether separate or compiled, including but not limited to, text, graphics, audio clips, logos, buttons, images, digital downloads, data compilations, software, icons, html code and xml code, are owned or licensed by Junkyards Near Me and protected by international intellectual property laws.' },
    { title: '10. Comment Disclaimer', content: 'Junkyards Near Me is not responsible for the content of any comments posted by visitors or guests to our website. Responsibility for the content of comments belongs to the commenter alone. Opinions expressed by any contributor do not reflect the views of Junkyards Near Me or any organization the contributor may be associated with unless expressly stated.' },
]

export default function Terms() {
    return (
        <div className="min-h-screen" style={{ background: '#0a0b0d' }}>
            <SEO
                title="Terms of Service - User Agreement & Legal Terms"
                description="Terms and conditions for using Junkyards Near Me. User agreements, disclaimers, copyright policy, and legal information."
                canonical="/terms-and-conditions"
            />
            <Navbar />

            {/* Hero */}
            <div className="relative py-20 overflow-hidden border-b border-white/5" style={{ background: 'linear-gradient(135deg, #080909 0%, #0f1117 100%)' }}>
                <div className="absolute inset-0">
                    <img src="/images/static/car-white-luxury.png" alt="" loading="lazy" className="w-full h-full object-cover object-center" style={{ opacity: 0.12 }} />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(8,9,9,0.65) 0%, rgba(8,9,9,0.9) 100%)' }} />
                </div>
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 mb-6" style={{ background: 'rgba(245,158,11,0.08)' }}>
                            <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clipRule="evenodd" /></svg>
                            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Legal</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4">Terms of <span style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Service</span></h1>
                        <p className="text-white/30 text-sm">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </motion.div>
                </div>
            </div>

            {/* Content */}
            <div className="py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="space-y-6">
                        {sections.map((section, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.04 }}
                                className="rounded-2xl border border-white/[8%] p-6 md:p-8"
                                style={{ background: '#111318' }}
                            >
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                                    <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(to bottom, #f59e0b, #ea580c)' }} />
                                    {section.title}
                                </h2>
                                {section.content && <p className="text-white/50 text-sm leading-relaxed">{section.content}</p>}
                                {section.subSections && (
                                    <div className="space-y-5">
                                        {section.subSections.map((sub, j) => (
                                            <div key={j} className="border-t border-white/5 pt-5">
                                                <h3 className="text-base font-bold text-white/70 mb-2">{sub.sub}</h3>
                                                <p className="text-white/50 text-sm leading-relaxed">{sub.content}</p>
                                            </div>
                                        ))}
                                    </div>
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
