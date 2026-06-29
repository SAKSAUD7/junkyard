import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const SECTIONS = [
    {
        title: 'DEFINITIONS',
        subsections: [
            { heading: 'Parties', body: '"You" and "your" refer to you, as a user of the Site. A "user" is someone who accesses, browses, crawls, scrapes, or in any way uses the Site. "We," "us," and "our" refer to Junkyards Near Me.' },
            { heading: 'Content', body: '"Content" means text, images, logos, photos, audio, video, location data, and all other forms of data or communication. "Your Content" means Content that you submit to the Site. "Site Content" means all content made available in connection with the Site.' },
        ]
    },
    { title: '1. Terms', body: 'By accessing this web site, you are agreeing to be bound by these Terms and Conditions of Use, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.' },
    { title: '2. Disclaimer', body: 'The materials on Junkyards Near Me web site are provided "as shown." Junkyards Near Me makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties, including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose.' },
    { title: '3. Limitations', body: 'In no event shall Junkyards Near Me or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use materials on our Internet site.' },
    { title: '4. Revisions and Errors', body: 'The materials appearing on our web site could include technical, typographical, or photographic errors. We do not warrant that any of the materials on our web site are accurate, complete, or current. We may make changes to the materials at any time without notice.' },
    { title: '5. Links', body: 'Junkyards Near Me has not reviewed all of the sites linked to its Internet web site and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by us of the site.' },
    { title: '6. Site Terms of Use Modifications', body: 'We may revise these terms of use for our web site at any time without notice. By using this web site you are agreeing to be bound by the then current version of these Terms and Conditions of Use.' },
    { title: '7. Governing Law', body: 'Any claim relating to Junkyards Near Me web site shall be governed by the laws of the country of note without regard to its conflict of law provisions.' },
    { title: '8. English Language', body: 'In the event of a conflict between these Terms and a foreign language version, the English language version governs. All disputes, claims and causes of action will be communicated in English.' },
    { title: '9. Copyright Policy', body: 'All materials on this site, whether separate or compiled, including text, graphics, audio clips, logos, buttons, images, digital downloads, data compilations, software, icons, html code and xml code, as well as all copyright, patent, trademark, trade dress, and other rights therein, are owned or licensed by Junkyards Near Me.' },
    { title: '10. Comment Disclaimer', body: 'Junkyards Near Me is not responsible for the content of any comments posted by visitors. Responsibility for the content of comments belongs to the commenter alone. Comments express the views of the individual writer, not those of Junkyards Near Me.' },
];

export default function Terms() {
    return (
        <div className="bg-[#f8fafc] min-h-screen">
            <SEO
                title="Terms of Service - User Agreement & Legal Terms"
                description="Terms and conditions for using Junkyards Near Me. User agreements, disclaimers, copyright policy, and legal information."
            />
            <Navbar />

            {/* Light Hero */}
            <section className="relative pt-28 pb-14 bg-white border-b border-slate-100 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/80 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 bg-blue-50 border border-blue-100">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clipRule="evenodd" /></svg>
                        <span className="text-blue-600 text-[11px] font-black uppercase tracking-widest">Legal</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
                        Terms of <span className="text-blue-600">Service</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
            </section>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-5">
                {SECTIONS.map((section, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgb(0,0,0,0.04)] p-7">
                        <h2 className="text-[18px] font-black text-slate-900 mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>{section.title}</h2>
                        {section.subsections ? (
                            <div className="space-y-4">
                                {section.subsections.map((sub, j) => (
                                    <div key={j}>
                                        <h3 className="font-bold text-blue-600 mb-1 text-[14px]">{sub.heading}</h3>
                                        <p className="text-slate-600 leading-relaxed text-[15px]">{sub.body}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-600 leading-relaxed text-[15px]">{section.body}</p>
                        )}
                    </div>
                ))}
            </div>

            <Footer />
        </div>
    );
}
