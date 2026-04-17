"""
Default CMS content seed data.
Called via POST /api/cms/admin/content/seed/ to populate the database
with initial values that match the existing hardcoded frontend content.
Safe to call multiple times — uses get_or_create.
"""

DEFAULT_CMS_CONTENT = [
    # ─────────────── HOME ───────────────
    {'page': 'home', 'section': 'hero', 'key': 'heading', 'value': 'FIND THE JUNKYARD AUTO PARTS YOU NEED — SEARCH IN SECONDS.', 'content_type': 'text', 'label': 'Hero Main Heading'},
    {'page': 'home', 'section': 'hero', 'key': 'subheading', 'value': 'Locate quality used auto parts from verified junkyards near you!', 'content_type': 'text', 'label': 'Hero Subheading'},
    {'page': 'home', 'section': 'hero', 'key': 'cta_primary_text', 'value': 'Browse All Vendors', 'content_type': 'text', 'label': 'Primary CTA Button Text'},
    {'page': 'home', 'section': 'hero', 'key': 'cta_primary_link', 'value': '/vendors', 'content_type': 'url', 'label': 'Primary CTA Button Link'},
    {'page': 'home', 'section': 'hero', 'key': 'cta_secondary_text', 'value': 'How It Works', 'content_type': 'text', 'label': 'Secondary CTA Button Text'},
    {'page': 'home', 'section': 'hero', 'key': 'cta_secondary_link', 'value': '/how-it-works', 'content_type': 'url', 'label': 'Secondary CTA Button Link'},
    {'page': 'home', 'section': 'hero', 'key': 'trust_badge_1', 'value': 'No Spam Guarantee', 'content_type': 'text', 'label': 'Trust Badge 1'},
    {'page': 'home', 'section': 'hero', 'key': 'trust_badge_2', 'value': 'Instant Quotes', 'content_type': 'text', 'label': 'Trust Badge 2'},

    {'page': 'home', 'section': 'trust_pillars', 'key': 'badge_label', 'value': 'Why Trust JYNM', 'content_type': 'text', 'label': 'Section Badge Label'},
    {'page': 'home', 'section': 'trust_pillars', 'key': 'heading', 'value': 'Built on Reliability & Transparency', 'content_type': 'text', 'label': 'Section Heading'},
    {'page': 'home', 'section': 'trust_pillars', 'key': 'is_visible', 'value': 'true', 'content_type': 'boolean', 'label': 'Section Visible'},

    {'page': 'home', 'section': 'how_it_works', 'key': 'heading', 'value': 'How It Works', 'content_type': 'text', 'label': 'Section Heading'},
    {'page': 'home', 'section': 'how_it_works', 'key': 'subheading', 'value': 'Three simple steps to find the exact used auto parts you need at the best price.', 'content_type': 'text', 'label': 'Section Subheading'},
    {'page': 'home', 'section': 'how_it_works', 'key': 'step1_title', 'value': 'Search & Locate', 'content_type': 'text', 'label': 'Step 1 Title'},
    {'page': 'home', 'section': 'how_it_works', 'key': 'step1_desc', 'value': 'Enter your ZIP code or vehicle details. Our system instantly finds verified junkyards near you with the parts you need.', 'content_type': 'text', 'label': 'Step 1 Description'},
    {'page': 'home', 'section': 'how_it_works', 'key': 'step2_title', 'value': 'Get Free Quotes', 'content_type': 'text', 'label': 'Step 2 Title'},
    {'page': 'home', 'section': 'how_it_works', 'key': 'step2_desc', 'value': 'Submit a single request to multiple vendors simultaneously. Compare prices, availability, and shipping options in real time.', 'content_type': 'text', 'label': 'Step 2 Description'},
    {'page': 'home', 'section': 'how_it_works', 'key': 'step3_title', 'value': 'Order & Save', 'content_type': 'text', 'label': 'Step 3 Title'},
    {'page': 'home', 'section': 'how_it_works', 'key': 'step3_desc', 'value': 'Choose the best deal, order your parts, and save up to 80% compared to dealer prices. Fast shipping nationwide.', 'content_type': 'text', 'label': 'Step 3 Description'},

    {'page': 'home', 'section': 'cta_banner', 'key': 'heading', 'value': 'Ready to Find Your Part?', 'content_type': 'text', 'label': 'CTA Banner Heading'},
    {'page': 'home', 'section': 'cta_banner', 'key': 'subheading', 'value': 'Join thousands of satisfied customers who found quality used auto parts at unbeatable prices.', 'content_type': 'text', 'label': 'CTA Banner Subheading'},
    {'page': 'home', 'section': 'cta_banner', 'key': 'button_text', 'value': 'Search Parts Now', 'content_type': 'text', 'label': 'CTA Banner Button Text'},
    {'page': 'home', 'section': 'cta_banner', 'key': 'is_visible', 'value': 'true', 'content_type': 'boolean', 'label': 'Section Visible'},

    # ─────────────── ABOUT ───────────────
    {'page': 'about', 'section': 'hero', 'key': 'heading', 'value': 'About JYNM', 'content_type': 'text', 'label': 'Hero Heading'},
    {'page': 'about', 'section': 'hero', 'key': 'subheading', 'value': "America's most trusted marketplace for verified used auto parts.", 'content_type': 'text', 'label': 'Hero Subheading'},
    {'page': 'about', 'section': 'mission', 'key': 'heading', 'value': 'Our Mission', 'content_type': 'text', 'label': 'Mission Heading'},
    {'page': 'about', 'section': 'mission', 'key': 'body', 'value': 'We connect vehicle owners and mechanics with verified salvage yards across the nation, making it easy to find quality used auto parts at honest prices.', 'content_type': 'text', 'label': 'Mission Body'},

    # ─────────────── CONTACT ───────────────
    {'page': 'contact', 'section': 'hero', 'key': 'heading', 'value': "We'd Love to Hear from You", 'content_type': 'text', 'label': 'Hero Heading'},
    {'page': 'contact', 'section': 'hero', 'key': 'subheading', 'value': 'Have questions about finding a part? Need help using our platform? Our team is here to assist you 24/7.', 'content_type': 'text', 'label': 'Hero Subheading'},
    {'page': 'contact', 'section': 'info', 'key': 'address', 'value': '123 Auto Salvage Way, Phoenix, AZ 85001, United States', 'content_type': 'text', 'label': 'Office Address'},
    {'page': 'contact', 'section': 'info', 'key': 'email', 'value': 'support@jynm.com', 'content_type': 'text', 'label': 'Support Email'},
    {'page': 'contact', 'section': 'info', 'key': 'phone', 'value': '1-866-293-3731', 'content_type': 'text', 'label': 'Support Phone'},

    # ─────────────── BROWSE ───────────────
    {'page': 'browse', 'section': 'hero', 'key': 'heading', 'value': 'Browse by <span class="block mt-2" style="color: #60a5fa">Location</span>', 'content_type': 'html', 'label': 'Hero Heading'},
    {'page': 'browse', 'section': 'hero', 'key': 'subheading', 'value': 'Find <strong style="color: #ffffff">quality auto parts</strong> from trusted salvage yards. Select your state to discover local junkyards.', 'content_type': 'html', 'label': 'Hero Subheading'},

    # ─────────────── VENDORS ───────────────
    {'page': 'vendors', 'section': 'hero', 'key': 'heading', 'value': 'Browse All <span class="block md:inline mt-2 md:mt-0" style="color: #60a5fa">Junkyards</span>', 'content_type': 'html', 'label': 'Hero Heading'},
    {'page': 'vendors', 'section': 'hero', 'key': 'subheading', 'value': 'Find <strong style="color: #ffffff">quality auto parts</strong> from trusted salvage yards statewide. Filter by location and connect instantly.', 'content_type': 'html', 'label': 'Hero Subheading'},

    # ─────────────── HOW IT WORKS ───────────────
    {'page': 'how_it_works', 'section': 'hero', 'key': 'heading', 'value': 'How It <span class="text-blue-400">Works</span>', 'content_type': 'html', 'label': 'Hero Heading'},
    {'page': 'how_it_works', 'section': 'hero', 'key': 'subheading', 'value': 'Finding quality used auto parts has never been easier. We connect you with verified junkyards nationwide — no more endless phone calls or wasted time.', 'content_type': 'text', 'label': 'Hero Subheading'},

    # ─────────────── FAQ ───────────────
    {'page': 'faq', 'section': 'hero', 'key': 'heading', 'value': 'Frequently Asked <span class="text-blue-400">Questions</span>', 'content_type': 'html', 'label': 'Hero Heading'},
    {'page': 'faq', 'section': 'hero', 'key': 'subheading', 'value': 'Everything you need to know about finding and buying used auto parts through our platform.', 'content_type': 'text', 'label': 'Hero Subheading'},

    # ─────────────── BLOG ───────────────
    {'page': 'blog', 'section': 'hero', 'key': 'heading', 'value': 'JYNM Blog', 'content_type': 'text', 'label': 'Blog Hero Heading'},
    {'page': 'blog', 'section': 'hero', 'key': 'subheading', 'value': 'Expert tips, guides, and news from the world of auto salvage and used parts.', 'content_type': 'text', 'label': 'Blog Hero Subheading'},
    {'page': 'blog', 'section': 'listing', 'key': 'posts_per_page', 'value': '9', 'content_type': 'text', 'label': 'Posts Per Page'},
    {'page': 'blog', 'section': 'listing', 'key': 'show_featured', 'value': 'true', 'content_type': 'boolean', 'label': 'Show Featured Posts Section'},
    {'page': 'blog', 'section': 'listing', 'key': 'cta_text', 'value': 'Read More', 'content_type': 'text', 'label': 'Post Card CTA Text'},

    # ─────────────── NAVBAR ───────────────
    {'page': 'navbar', 'section': 'brand', 'key': 'tagline', 'value': 'AutoParts Hub', 'content_type': 'text', 'label': 'Brand Tagline'},
    {'page': 'navbar', 'section': 'cta', 'key': 'support_label', 'value': 'Support', 'content_type': 'text', 'label': 'Support Button Label'},

    # ─────────────── FOOTER ───────────────
    {'page': 'footer', 'section': 'brand', 'key': 'description', 'value': "The nation's most trusted marketplace for verified used auto parts. Connecting mechanics and enthusiasts with salvage yards nationwide.", 'content_type': 'text', 'label': 'Brand Description'},
    {'page': 'footer', 'section': 'brand', 'key': 'copyright', 'value': 'JunkyardsNearMe.com · All rights reserved', 'content_type': 'text', 'label': 'Copyright Text'},
    {'page': 'footer', 'section': 'contact', 'key': 'phone', 'value': '1-866-293-3731', 'content_type': 'text', 'label': 'Footer Phone'},
    {'page': 'footer', 'section': 'contact', 'key': 'email', 'value': 'info@jynm.com', 'content_type': 'text', 'label': 'Footer Email'},
    {'page': 'footer', 'section': 'social', 'key': 'facebook', 'value': 'https://www.facebook.com/JunkYardsNearMe', 'content_type': 'url', 'label': 'Facebook URL'},
    {'page': 'footer', 'section': 'social', 'key': 'twitter', 'value': 'https://x.com/junkyardsnearme', 'content_type': 'url', 'label': 'Twitter/X URL'},
    {'page': 'footer', 'section': 'social', 'key': 'pinterest', 'value': 'https://www.pinterest.com/junkyardsnearme/', 'content_type': 'url', 'label': 'Pinterest URL'},

    # ─────────────── SEO ───────────────
    {'page': 'seo_home', 'section': 'meta', 'key': 'title', 'value': 'Junkyards Near Me – Find Used Auto Parts Fast | JYNM', 'content_type': 'text', 'label': 'Meta Title'},
    {'page': 'seo_home', 'section': 'meta', 'key': 'description', 'value': 'Search 1000+ verified junkyards near you. Get instant quotes on quality used auto parts. Save up to 80% vs dealer pricing.', 'content_type': 'text', 'label': 'Meta Description'},
    {'page': 'seo_about', 'section': 'meta', 'key': 'title', 'value': "About Us – America's Most Trusted Auto Parts Marketplace | JYNM", 'content_type': 'text', 'label': 'Meta Title'},
    {'page': 'seo_about', 'section': 'meta', 'key': 'description', 'value': 'Learn about JYNM – the nation\'s most trusted marketplace connecting you with verified junkyards and quality used auto parts.', 'content_type': 'text', 'label': 'Meta Description'},
    {'page': 'seo_contact', 'section': 'meta', 'key': 'title', 'value': 'Contact Us – Get Help Finding Auto Parts | JYNM', 'content_type': 'text', 'label': 'Meta Title'},
    {'page': 'seo_contact', 'section': 'meta', 'key': 'description', 'value': 'Contact Junkyards Near Me for support. Questions about finding parts, vendor inquiries, or technical support.', 'content_type': 'text', 'label': 'Meta Description'},
    {'page': 'seo_blog', 'section': 'meta', 'key': 'title', 'value': 'Auto Parts Blog – Tips, Guides & News | JYNM', 'content_type': 'text', 'label': 'Meta Title'},
    {'page': 'seo_blog', 'section': 'meta', 'key': 'description', 'value': 'Read expert tips, how-to guides, and the latest news on used auto parts, junkyards, and vehicle salvage from JYNM.', 'content_type': 'text', 'label': 'Meta Description'},
    {'page': 'seo_browse', 'section': 'meta', 'key': 'title', 'value': 'Browse Junkyards by State – Find Auto Salvage Yards Near You | JYNM', 'content_type': 'text', 'label': 'Meta Title'},
    {'page': 'seo_browse', 'section': 'meta', 'key': 'description', 'value': 'Find junkyards and auto salvage yards across all 50 US states. Search 1000+ verified vendors nationwide. Free quotes on quality used auto parts.', 'content_type': 'text', 'label': 'Meta Description'},
    {'page': 'seo_vendors', 'section': 'meta', 'key': 'title', 'value': 'All Junkyards – Browse Auto Salvage Yards Nationwide | JYNM', 'content_type': 'text', 'label': 'Meta Title'},
    {'page': 'seo_vendors', 'section': 'meta', 'key': 'description', 'value': 'Browse our complete directory of verified auto salvage yards. Find used auto parts, compare prices, and connect with junkyards across all 50 states.', 'content_type': 'text', 'label': 'Meta Description'},
]
