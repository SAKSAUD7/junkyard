"""
Default CMS content — every editable field across the entire website.
"""

DEFAULT_CMS_CONTENT = [
    # ══════════════════════════════════════════════════════════════════
    # GLOBAL: Brand & SEO
    # ══════════════════════════════════════════════════════════════════
    {'page': 'global', 'section': 'brand', 'key': 'logo', 'label': 'Main Website Logo', 'value': '/logo.png', 'content_type': 'image'},

    # ══════════════════════════════════════════════════════════════════
    # GLOBAL: Navbar
    # ══════════════════════════════════════════════════════════════════
    {'page': 'navbar', 'section': 'brand', 'key': 'name_short', 'label': 'Brand Short Name', 'value': 'JYNM', 'content_type': 'text'},
    {'page': 'navbar', 'section': 'brand', 'key': 'name_long', 'label': 'Brand Long Name', 'value': 'Junkyards Near Me', 'content_type': 'text'},
    
    # ══════════════════════════════════════════════════════════════════
    # GLOBAL: Footer
    # ══════════════════════════════════════════════════════════════════
    {'page': 'footer', 'section': 'brand', 'key': 'description', 'label': 'Footer Brand Description', 'value': 'Connecting people to quality used auto parts from trusted junkyards across the nation.', 'content_type': 'textarea'},
    {'page': 'footer', 'section': 'contact', 'key': 'phone', 'label': 'Contact Phone', 'value': '1-866-293-3731', 'content_type': 'text'},
    {'page': 'footer', 'section': 'contact', 'key': 'email', 'label': 'Contact Email', 'value': 'info@jynm.com', 'content_type': 'text'},
    {'page': 'footer', 'section': 'contact', 'key': 'location', 'label': 'Location Title', 'value': 'Nationwide Service', 'content_type': 'text'},
    {'page': 'footer', 'section': 'contact', 'key': 'location_desc', 'label': 'Location Description', 'value': 'Serving all 50 States', 'content_type': 'text'},

    # ══════════════════════════════════════════════════════════════════
    # HOME PAGE
    # ══════════════════════════════════════════════════════════════════
    # Hero Section
    {'page': 'home', 'section': 'hero', 'key': 'heading', 'label': 'Main Headline (HTML allowed)', 'value': 'Find Verified Auto Parts <br /> From <span class="text-blue-600">6,500+</span> Junkyards <br /> In Under <span class="text-emerald-600">60</span> Seconds', 'content_type': 'textarea'},
    {'page': 'home', 'section': 'hero', 'key': 'subheading', 'label': 'Sub-Headline (HTML allowed)', 'value': 'Compare prices from licensed salvage yards nationwide <br class="hidden sm:block" /> and save up to 80% compared to dealership pricing.', 'content_type': 'textarea'},
    {'page': 'home', 'section': 'hero', 'key': 'video_bg', 'label': 'Background Video URL', 'value': '/Video/hero-models-bg.mp4', 'content_type': 'url'},
    
    # Stats Section
    {'page': 'home', 'section': 'stats', 'key': 'label_1', 'label': 'Stat 1 Label', 'value': 'Verified Vendors', 'content_type': 'text'},
    {'page': 'home', 'section': 'stats', 'key': 'value_1', 'label': 'Stat 1 Value', 'value': '6,500+', 'content_type': 'text'},
    {'page': 'home', 'section': 'stats', 'key': 'label_2', 'label': 'Stat 2 Label', 'value': 'Quality Parts', 'content_type': 'text'},
    {'page': 'home', 'section': 'stats', 'key': 'value_2', 'label': 'Stat 2 Value', 'value': '347,000+', 'content_type': 'text'},
    {'page': 'home', 'section': 'stats', 'key': 'label_3', 'label': 'Stat 3 Label', 'value': 'Searches Completed', 'content_type': 'text'},
    {'page': 'home', 'section': 'stats', 'key': 'value_3', 'label': 'Stat 3 Value', 'value': '1M+', 'content_type': 'text'},
    {'page': 'home', 'section': 'stats', 'key': 'label_4', 'label': 'Stat 4 Label', 'value': 'States Covered', 'content_type': 'text'},
    {'page': 'home', 'section': 'stats', 'key': 'value_4', 'label': 'Stat 4 Value', 'value': '50', 'content_type': 'text'},
    {'page': 'home', 'section': 'stats', 'key': 'label_5', 'label': 'Stat 5 Label', 'value': 'Customer Rating', 'content_type': 'text'},
    {'page': 'home', 'section': 'stats', 'key': 'value_5', 'label': 'Stat 5 Value', 'value': '4.9/5', 'content_type': 'text'},

    # Trusted Vendors
    {'page': 'home', 'section': 'trusted_vendors', 'key': 'heading', 'label': 'Heading', 'value': 'Our Network Of Trusted Vendors', 'content_type': 'text'},
    {'page': 'home', 'section': 'trusted_vendors', 'key': 'subheading', 'label': 'Subheading', 'value': 'We partner with over 6,500 verified junkyards across the country.', 'content_type': 'textarea'},

    # Popular Parts
    {'page': 'home', 'section': 'popular_parts', 'key': 'heading', 'label': 'Heading', 'value': 'Popular Auto Parts', 'content_type': 'text'},
    {'page': 'home', 'section': 'popular_parts', 'key': 'subheading', 'label': 'Subheading', 'value': 'Find the most requested used car parts available in our network right now.', 'content_type': 'textarea'},

    # Real Savings Table
    {'page': 'home', 'section': 'real_savings', 'key': 'heading', 'label': 'Heading', 'value': 'See Your Real Savings', 'content_type': 'text'},
    {'page': 'home', 'section': 'real_savings', 'key': 'subheading', 'label': 'Subheading', 'value': 'Compare dealership prices with our average network prices.', 'content_type': 'textarea'},

    # Auto Parts Insights
    {'page': 'home', 'section': 'insights', 'key': 'heading', 'label': 'Heading', 'value': 'Auto Parts Insights', 'content_type': 'text'},
    {'page': 'home', 'section': 'insights', 'key': 'subheading', 'label': 'Subheading', 'value': 'Learn more about finding the best used auto parts for your vehicle.', 'content_type': 'textarea'},

    # Why Choose JYNM
    {'page': 'home', 'section': 'why_choose', 'key': 'heading', 'label': 'Heading', 'value': 'Why Choose Junkyards Near Me?', 'content_type': 'text'},
    {'page': 'home', 'section': 'why_choose', 'key': 'subheading', 'label': 'Subheading', 'value': 'We make finding quality used auto parts simple, fast, and secure.', 'content_type': 'textarea'},

    # How It Works
    {'page': 'home', 'section': 'how_it_works', 'key': 'heading', 'label': 'Heading', 'value': 'How It Works', 'content_type': 'text'},
    {'page': 'home', 'section': 'how_it_works', 'key': 'subheading', 'label': 'Subheading', 'value': 'Simple steps to get the parts you need', 'content_type': 'textarea'},
    {'page': 'home', 'section': 'how_it_works', 'key': 'step1_title', 'label': 'Step 1 Title', 'value': 'Search', 'content_type': 'text'},
    {'page': 'home', 'section': 'how_it_works', 'key': 'step1_desc', 'label': 'Step 1 Description', 'value': 'Tell us what you need', 'content_type': 'textarea'},
    {'page': 'home', 'section': 'how_it_works', 'key': 'step2_title', 'label': 'Step 2 Title', 'value': 'Compare', 'content_type': 'text'},
    {'page': 'home', 'section': 'how_it_works', 'key': 'step2_desc', 'label': 'Step 2 Description', 'value': 'Get quotes from verified junkyards', 'content_type': 'textarea'},
    {'page': 'home', 'section': 'how_it_works', 'key': 'step3_title', 'label': 'Step 3 Title', 'value': 'Choose', 'content_type': 'text'},
    {'page': 'home', 'section': 'how_it_works', 'key': 'step3_desc', 'label': 'Step 3 Description', 'value': 'Pick the best price and quality', 'content_type': 'textarea'},
    {'page': 'home', 'section': 'how_it_works', 'key': 'step4_title', 'label': 'Step 4 Title', 'value': 'Save', 'content_type': 'text'},
    {'page': 'home', 'section': 'how_it_works', 'key': 'step4_desc', 'label': 'Step 4 Description', 'value': 'Save up to 80% instantly', 'content_type': 'textarea'},

    # CTA Banner
    {'page': 'home', 'section': 'cta_banner', 'key': 'heading', 'label': 'Heading (supports HTML spans)', 'value': 'Ready to Find Your <span style="background: linear-gradient(135deg, #93c5fd, #bfdbfe); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Perfect Part?</span>', 'content_type': 'textarea'},
    {'page': 'home', 'section': 'cta_banner', 'key': 'subheading', 'label': 'Subheading', 'value': 'Join thousands of mechanics and car owners who save hundreds by using JYNM to source quality used auto parts across all 50 states.', 'content_type': 'textarea'},
    {'page': 'home', 'section': 'cta_banner', 'key': 'button_text', 'label': 'Primary Button Text', 'value': 'Get Free Quote Now', 'content_type': 'text'},
    {'page': 'home', 'section': 'cta_banner', 'key': 'trust_1', 'label': 'Trust Marker 1', 'value': '✓ 6,500+ Trusted Yards', 'content_type': 'text'},
    {'page': 'home', 'section': 'cta_banner', 'key': 'trust_2', 'label': 'Trust Marker 2', 'value': '✓ 50 States', 'content_type': 'text'},
    {'page': 'home', 'section': 'cta_banner', 'key': 'trust_3', 'label': 'Trust Marker 3', 'value': '✓ Free to Use', 'content_type': 'text'},

    # Promo Card
    {'page': 'home', 'section': 'promo_card', 'key': 'logo', 'label': 'Logo URL / Image', 'value': '', 'content_type': 'image'},
    {'page': 'home', 'section': 'promo_card', 'key': 'heading', 'label': 'Heading', 'value': 'QUALITY AUTO PARTS', 'content_type': 'text'},
    {'page': 'home', 'section': 'promo_card', 'key': 'phone', 'label': 'Phone Number', 'value': '1-866-293-3731', 'content_type': 'text'},
    {'page': 'home', 'section': 'promo_card', 'key': 'bullet_1', 'label': 'Bullet 1', 'value': '✔ QUALITY USED AUTO PARTS', 'content_type': 'text'},
    {'page': 'home', 'section': 'promo_card', 'key': 'bullet_2', 'label': 'Bullet 2', 'value': '✔ LOW PRICES', 'content_type': 'text'},
    {'page': 'home', 'section': 'promo_card', 'key': 'bullet_3', 'label': 'Bullet 3', 'value': '✔ WARRANTIED OEM PARTS', 'content_type': 'text'},
    {'page': 'home', 'section': 'promo_card', 'key': 'bullet_4', 'label': 'Bullet 4', 'value': '✔ MILLIONS OF PARTS AVAILABLE', 'content_type': 'text'},
    {'page': 'home', 'section': 'promo_card', 'key': 'button_text', 'label': 'Button Text', 'value': 'Visit Us', 'content_type': 'text'},
    {'page': 'home', 'section': 'promo_card', 'key': 'target_url', 'label': 'Target URL', 'value': 'https://www.qualityautoparts.com/iweb/index.php', 'content_type': 'url'},

    # Vendor CTA
    {'page': 'home', 'section': 'vendor_cta', 'key': 'heading', 'label': 'Heading', 'value': 'Are You A Junkyard Owner?', 'content_type': 'text'},
    {'page': 'home', 'section': 'vendor_cta', 'key': 'subheading', 'label': 'Subheading', 'value': 'Join our network and start getting high-quality leads today.', 'content_type': 'textarea'},
    {'page': 'home', 'section': 'vendor_cta', 'key': 'button_text', 'label': 'Button Text', 'value': 'Become a Vendor', 'content_type': 'text'},

    # Pincode Search
    {'page': 'home', 'section': 'pincode_search', 'key': 'heading', 'label': 'Search By Zip', 'value': 'Or Search Locally By Zip Code', 'content_type': 'text'},

    # ══════════════════════════════════════════════════════════════════
    # ABOUT PAGE
    # ══════════════════════════════════════════════════════════════════
    {'page': 'about', 'section': 'hero', 'key': 'heading', 'label': 'Hero Heading', 'value': 'The Future of', 'content_type': 'text'},
    {'page': 'about', 'section': 'hero', 'key': 'heading_accent', 'label': 'Hero Heading Accent', 'value': 'Auto Salvage', 'content_type': 'text'},
    {'page': 'about', 'section': 'hero', 'key': 'subheading', 'label': 'Hero Subheading', 'value': 'We are transforming the used auto parts industry by connecting buyers directly with verified salvage yards nationwide. Real parts. Real prices. Real people.', 'content_type': 'textarea'},

    # About Stats labels + dynamic values
    {'page': 'about', 'section': 'stats', 'key': 'label_1', 'label': 'Stat 1 Label', 'value': 'Active Junkyards', 'content_type': 'text'},
    {'page': 'about', 'section': 'stats', 'key': 'label_2', 'label': 'Stat 2 Label', 'value': 'States Covered', 'content_type': 'text'},
    {'page': 'about', 'section': 'stats', 'key': 'label_3', 'label': 'Stat 3 Label', 'value': 'Daily Searches', 'content_type': 'text'},
    {'page': 'about', 'section': 'stats', 'key': 'value_3', 'label': 'Stat 3 Value', 'value': '50k+', 'content_type': 'text'},
    {'page': 'about', 'section': 'stats', 'key': 'label_4', 'label': 'Stat 4 Label', 'value': 'Parts Found', 'content_type': 'text'},
    {'page': 'about', 'section': 'stats', 'key': 'value_4', 'label': 'Stat 4 Value', 'value': '1M+', 'content_type': 'text'},

    # Mission section
    {'page': 'about', 'section': 'mission', 'key': 'title', 'label': 'Mission Title', 'value': 'Our Mission is', 'content_type': 'text'},
    {'page': 'about', 'section': 'mission', 'key': 'title_accent', 'label': 'Mission Title Accent', 'value': 'Simple', 'content_type': 'text'},
    {'page': 'about', 'section': 'mission', 'key': 'para_1', 'label': 'Mission Paragraph 1', 'value': "Finding quality used auto parts shouldn't be a hassle. We built Junkyards Near Me to bridge the gap between organized inventory and the people who need it most.", 'content_type': 'textarea'},
    {'page': 'about', 'section': 'mission', 'key': 'para_2', 'label': 'Mission Paragraph 2', 'value': "Whether you're restoring a classic, fixing a daily driver, or running a repair shop, our platform gives you instant access to millions of parts across the country.", 'content_type': 'textarea'},
    {'page': 'about', 'section': 'mission', 'key': 'highlight_title', 'label': 'Highlight Box Title', 'value': 'Did You Know?', 'content_type': 'text'},
    {'page': 'about', 'section': 'mission', 'key': 'highlight_text', 'label': 'Highlight Box Text', 'value': "Americans spend over $70 billion on used auto parts annually. We're making sure you get the best deal every time.", 'content_type': 'textarea'},

    # Features section
    {'page': 'about', 'section': 'features', 'key': 'feature1_title', 'label': 'Feature 1 Title', 'value': 'Nationwide Network', 'content_type': 'text'},
    {'page': 'about', 'section': 'features', 'key': 'feature1_desc', 'label': 'Feature 1 Description', 'value': 'Determine availability across our massive network of over 1,000 verified junkyards in all 50 states.', 'content_type': 'textarea'},
    {'page': 'about', 'section': 'features', 'key': 'feature2_title', 'label': 'Feature 2 Title', 'value': 'Smart Search', 'content_type': 'text'},
    {'page': 'about', 'section': 'features', 'key': 'feature2_desc', 'label': 'Feature 2 Description', 'value': 'Instantly filter by vehicle make, model, year, and part type to find exactly what you need in seconds.', 'content_type': 'textarea'},
    {'page': 'about', 'section': 'features', 'key': 'feature3_title', 'label': 'Feature 3 Title', 'value': 'Price Transparency', 'content_type': 'text'},
    {'page': 'about', 'section': 'features', 'key': 'feature3_desc', 'label': 'Feature 3 Description', 'value': 'Compare prices from multiple vendors and save up to 80% versus dealership pricing.', 'content_type': 'textarea'},
    {'page': 'about', 'section': 'features', 'key': 'feature4_title', 'label': 'Feature 4 Title', 'value': 'Quality Assurance', 'content_type': 'text'},
    {'page': 'about', 'section': 'features', 'key': 'feature4_desc', 'label': 'Feature 4 Description', 'value': 'All parts come graded and verified. We ensure every vendor meets our strict quality standards.', 'content_type': 'textarea'},

    # ══════════════════════════════════════════════════════════════════
    # CONTACT PAGE
    # ══════════════════════════════════════════════════════════════════
    {'page': 'contact', 'section': 'hero', 'key': 'heading', 'label': 'Heading', 'value': 'Get in Touch', 'content_type': 'text'},
    {'page': 'contact', 'section': 'hero', 'key': 'subheading', 'label': 'Subheading', 'value': "We're here to help you find the right part or answer any questions.", 'content_type': 'textarea'},
    {'page': 'contact', 'section': 'info', 'key': 'phone', 'label': 'Phone Number', 'value': '+1 (800) 555-1234', 'content_type': 'text'},
    {'page': 'contact', 'section': 'info', 'key': 'phone_subtext', 'label': 'Phone Subtext', 'value': 'Mon - Sun, 8AM - 8PM', 'content_type': 'text'},
    {'page': 'contact', 'section': 'info', 'key': 'email', 'label': 'Email Address', 'value': 'support@jynm.com', 'content_type': 'text'},
    {'page': 'contact', 'section': 'info', 'key': 'email_subtext', 'label': 'Email Subtext', 'value': 'We reply within 30 mins', 'content_type': 'text'},
    {'page': 'contact', 'section': 'info', 'key': 'address', 'label': 'Address', 'value': '123 Auto Drive, Dallas, TX 75201', 'content_type': 'text'},

    # ══════════════════════════════════════════════════════════════════
    # FAQ PAGE
    # ══════════════════════════════════════════════════════════════════
    {'page': 'faq', 'section': 'hero', 'key': 'heading', 'label': 'Heading (supports HTML spans)', 'value': 'Frequently Asked <span class="text-blue-600">Questions</span>', 'content_type': 'textarea'},
    {'page': 'faq', 'section': 'hero', 'key': 'subheading', 'label': 'Subheading', 'value': 'Everything you need to know about finding and buying used auto parts through our platform.', 'content_type': 'textarea'},

    # ══════════════════════════════════════════════════════════════════
    # HOW IT WORKS PAGE
    # ══════════════════════════════════════════════════════════════════
    {'page': 'how_it_works', 'section': 'hero', 'key': 'heading', 'label': 'Heading (supports HTML spans)', 'value': 'How It <span class="text-blue-600">Works</span>', 'content_type': 'textarea'},
    {'page': 'how_it_works', 'section': 'hero', 'key': 'subheading', 'label': 'Subheading', 'value': 'Finding quality used auto parts has never been easier. We connect you with verified junkyards nationwide.', 'content_type': 'textarea'},
    {'page': 'how_it_works', 'section': 'steps', 'key': 'step1_title', 'label': 'Step 1 Title', 'value': 'Tell Us What You Need', 'content_type': 'text'},
    {'page': 'how_it_works', 'section': 'steps', 'key': 'step1_desc', 'label': 'Step 1 Description', 'value': "Fill out our simple form with your vehicle details (make, model, year) and the specific part you're looking for. Add your contact information and location.", 'content_type': 'textarea'},
    {'page': 'how_it_works', 'section': 'steps', 'key': 'step2_title', 'label': 'Step 2 Title', 'value': 'We Notify Our Network', 'content_type': 'text'},
    {'page': 'how_it_works', 'section': 'steps', 'key': 'step2_desc', 'label': 'Step 2 Description', 'value': 'Your request is instantly sent to our network of verified junkyards and auto salvage yards in your area. No need to call around - we do the work for you.', 'content_type': 'textarea'},
    {'page': 'how_it_works', 'section': 'steps', 'key': 'step3_title', 'label': 'Step 3 Title', 'value': 'Receive Free Quotes', 'content_type': 'text'},
    {'page': 'how_it_works', 'section': 'steps', 'key': 'step3_desc', 'label': 'Step 3 Description', 'value': 'Junkyards with your part in stock will contact you directly with pricing, availability, and shipping options. Compare offers and choose the best deal.', 'content_type': 'textarea'},
    {'page': 'how_it_works', 'section': 'steps', 'key': 'step4_title', 'label': 'Step 4 Title', 'value': 'Order & Save', 'content_type': 'text'},
    {'page': 'how_it_works', 'section': 'steps', 'key': 'step4_desc', 'label': 'Step 4 Description', 'value': 'Purchase directly from the junkyard of your choice. Arrange pickup or shipping, and get your quality used part at a fraction of the cost of new.', 'content_type': 'textarea'},
    {'page': 'how_it_works', 'section': 'cta', 'key': 'heading', 'label': 'CTA Heading', 'value': 'Ready to Find Your Part?', 'content_type': 'text'},
    {'page': 'how_it_works', 'section': 'cta', 'key': 'subtext', 'label': 'CTA Subtext', 'value': "It's 100% free and takes less than 2 minutes to submit your request.", 'content_type': 'text'},
    {'page': 'how_it_works', 'section': 'cta', 'key': 'button_text', 'label': 'CTA Button Text', 'value': 'Submit a Free Request', 'content_type': 'text'},
    {'page': 'how_it_works', 'section': 'cta', 'key': 'button_link', 'label': 'CTA Button Link', 'value': '/', 'content_type': 'url'},

    # ══════════════════════════════════════════════════════════════════
    # BROWSE STATES PAGE
    # ══════════════════════════════════════════════════════════════════
    {'page': 'browse', 'section': 'hero', 'key': 'badge', 'label': 'Badge Text', 'value': 'Interactive Map', 'content_type': 'text'},
    {'page': 'browse', 'section': 'hero', 'key': 'heading', 'label': 'Heading', 'value': 'Browse Junkyards', 'content_type': 'text'},
    {'page': 'browse', 'section': 'hero', 'key': 'heading_accent', 'label': 'Heading Accent (colored)', 'value': 'By State', 'content_type': 'text'},
    {'page': 'browse', 'section': 'hero', 'key': 'subheading', 'label': 'Subheading', 'value': 'Explore our interactive map. Find verified junkyards nationwide.', 'content_type': 'textarea'},
    {'page': 'browse', 'section': 'map', 'key': 'panel_heading', 'label': 'Panel Heading', 'value': 'Find Your State', 'content_type': 'text'},
    {'page': 'browse', 'section': 'map', 'key': 'search_placeholder', 'label': 'Search Placeholder', 'value': 'Search for a state...', 'content_type': 'text'},
    {'page': 'browse', 'section': 'map', 'key': 'click_hint', 'label': 'Map Click Hint Badge', 'value': 'Click a State to Browse', 'content_type': 'text'},
    {'page': 'browse', 'section': 'seo', 'key': 'meta_title', 'label': 'SEO Page Title', 'value': 'Browse Junkyards by State – Interactive USA Map | JunkyardsNearMe', 'content_type': 'text'},
    {'page': 'browse', 'section': 'seo', 'key': 'meta_desc', 'label': 'SEO Meta Description', 'value': 'Explore all 50 states on our interactive map. Find verified junkyards nationwide. Click any state to see local listings.', 'content_type': 'textarea'},

    # ══════════════════════════════════════════════════════════════════
    # VENDORS / JUNKYARDS PAGE
    # ══════════════════════════════════════════════════════════════════
    {'page': 'vendors', 'section': 'hero', 'key': 'badge', 'label': 'Badge Text', 'value': '50 States • Verified Yards', 'content_type': 'text'},
    {'page': 'vendors', 'section': 'hero', 'key': 'heading', 'label': 'Heading', 'value': 'Find Trusted Junkyards', 'content_type': 'text'},
    {'page': 'vendors', 'section': 'hero', 'key': 'heading_accent', 'label': 'Heading Accent (colored)', 'value': 'Near You', 'content_type': 'text'},
    {'page': 'vendors', 'section': 'hero', 'key': 'subheading', 'label': 'Subheading', 'value': 'Connect with verified salvage yards across the U.S. and find the exact auto parts you need — fast.', 'content_type': 'textarea'},
    {'page': 'vendors', 'section': 'hero', 'key': 'search_placeholder', 'label': 'Search Input Placeholder', 'value': 'Search by name, city, or ZIP...', 'content_type': 'text'},
    {'page': 'vendors', 'section': 'hero', 'key': 'search_btn', 'label': 'Search Button Text', 'value': 'Search Yards', 'content_type': 'text'},
    {'page': 'vendors', 'section': 'results', 'key': 'section_heading', 'label': 'Results Section Heading', 'value': 'Top Rated Junkyards', 'content_type': 'text'},
    {'page': 'vendors', 'section': 'seo', 'key': 'meta_title', 'label': 'SEO Page Title', 'value': 'All Junkyards - Browse Auto Salvage Yards Nationwide', 'content_type': 'text'},
    {'page': 'vendors', 'section': 'seo', 'key': 'meta_desc', 'label': 'SEO Meta Description', 'value': 'Browse our complete directory of verified auto salvage yards. Find used auto parts, compare prices, and connect with local junkyards.', 'content_type': 'textarea'},

    # ══════════════════════════════════════════════════════════════════
    # ABOUT PAGE — OUR JOURNEY TIMELINE
    # ══════════════════════════════════════════════════════════════════
    {'page': 'about', 'section': 'journey', 'key': 'heading', 'label': 'Section Heading', 'value': 'Our', 'content_type': 'text'},
    {'page': 'about', 'section': 'journey', 'key': 'heading_accent', 'label': 'Heading Accent (colored)', 'value': 'Journey', 'content_type': 'text'},

    {'page': 'about', 'section': 'journey', 'key': 'milestone1_year', 'label': 'Milestone 1 — Year', 'value': '2020', 'content_type': 'text'},
    {'page': 'about', 'section': 'journey', 'key': 'milestone1_title', 'label': 'Milestone 1 — Title', 'value': 'The Idea', 'content_type': 'text'},
    {'page': 'about', 'section': 'journey', 'key': 'milestone1_desc', 'label': 'Milestone 1 — Description', 'value': 'Started as a local directory connecting a few shops in Texas.', 'content_type': 'textarea'},

    {'page': 'about', 'section': 'journey', 'key': 'milestone2_year', 'label': 'Milestone 2 — Year', 'value': '2022', 'content_type': 'text'},
    {'page': 'about', 'section': 'journey', 'key': 'milestone2_title', 'label': 'Milestone 2 — Title', 'value': 'Going National', 'content_type': 'text'},
    {'page': 'about', 'section': 'journey', 'key': 'milestone2_desc', 'label': 'Milestone 2 — Description', 'value': 'Expanded our database to cover 25 states and 500+ yards.', 'content_type': 'textarea'},

    {'page': 'about', 'section': 'journey', 'key': 'milestone3_year', 'label': 'Milestone 3 — Year', 'value': '2024', 'content_type': 'text'},
    {'page': 'about', 'section': 'journey', 'key': 'milestone3_title', 'label': 'Milestone 3 — Title', 'value': 'AI Integration', 'content_type': 'text'},
    {'page': 'about', 'section': 'journey', 'key': 'milestone3_desc', 'label': 'Milestone 3 — Description', 'value': 'Launched instant quote matching algorithms and verification.', 'content_type': 'textarea'},

    {'page': 'about', 'section': 'journey', 'key': 'milestone4_year', 'label': 'Milestone 4 — Year', 'value': '2026', 'content_type': 'text'},
    {'page': 'about', 'section': 'journey', 'key': 'milestone4_title', 'label': 'Milestone 4 — Title', 'value': 'Market Leader', 'content_type': 'text'},
    {'page': 'about', 'section': 'journey', 'key': 'milestone4_desc', 'label': 'Milestone 4 — Description', 'value': '1,200+ verified yards processing thousands of quotes daily.', 'content_type': 'textarea'},

    # ══════════════════════════════════════════════════════════════════
    # QUOTE REQUEST PAGE
    # ══════════════════════════════════════════════════════════════════
    {'page': 'quote_request', 'section': 'hero', 'key': 'heading', 'label': 'Heading', 'value': 'Request a Free Quote', 'content_type': 'text'},
    {'page': 'quote_request', 'section': 'hero', 'key': 'subheading', 'label': 'Subheading', 'value': 'Fill out the form below to get instant prices from our nationwide network of verified auto salvage yards.', 'content_type': 'textarea'},
    {'page': 'quote_request', 'section': 'hero', 'key': 'trust_text', 'label': 'Trust Text', 'value': 'Secure & Encrypted • 100% Free • No Obligation', 'content_type': 'text'},

    # ══════════════════════════════════════════════════════════════════
    # ADD A YARD PAGE
    # ══════════════════════════════════════════════════════════════════
    {'page': 'add_a_yard', 'section': 'hero', 'key': 'title', 'label': 'Hero Title', 'value': 'Partner With JYNM', 'content_type': 'text'},
    {'page': 'add_a_yard', 'section': 'hero', 'key': 'subtitle', 'label': 'Hero Subtitle', 'value': 'List your yard and connect with thousands of buyers searching for auto parts daily.', 'content_type': 'textarea'},
    
    {'page': 'add_a_yard', 'section': 'success', 'key': 'success_heading', 'label': 'Success Heading', 'value': 'Application Submitted!', 'content_type': 'text'},
    {'page': 'add_a_yard', 'section': 'success', 'key': 'success_message', 'label': 'Success Message', 'value': 'Thank you for joining our platform. Our team will review your application and get back to you shortly. Once approved, you can manage your inventory and ads from the Vendor Portal.', 'content_type': 'textarea'},
    {'page': 'add_a_yard', 'section': 'success', 'key': 'login_btn', 'label': 'Login Button', 'value': 'Go to Vendor Login', 'content_type': 'text'},
    {'page': 'add_a_yard', 'section': 'success', 'key': 'home_btn', 'label': 'Home Button', 'value': 'Back to Home', 'content_type': 'text'},
    
    {'page': 'add_a_yard', 'section': 'steps', 'key': 'step1_title', 'label': 'Step 1 Title', 'value': 'Business Info', 'content_type': 'text'},
    {'page': 'add_a_yard', 'section': 'steps', 'key': 'step1_sub', 'label': 'Step 1 Subtitle', 'value': 'Basic details', 'content_type': 'text'},
    {'page': 'add_a_yard', 'section': 'steps', 'key': 'step2_title', 'label': 'Step 2 Title', 'value': 'Location & Owner', 'content_type': 'text'},
    {'page': 'add_a_yard', 'section': 'steps', 'key': 'step2_sub', 'label': 'Step 2 Subtitle', 'value': 'Where and who', 'content_type': 'text'},
    {'page': 'add_a_yard', 'section': 'steps', 'key': 'step3_title', 'label': 'Step 3 Title', 'value': 'Services & Setup', 'content_type': 'text'},
    {'page': 'add_a_yard', 'section': 'steps', 'key': 'step3_sub', 'label': 'Step 3 Subtitle', 'value': 'What you do', 'content_type': 'text'},
    {'page': 'add_a_yard', 'section': 'steps', 'key': 'step4_title', 'label': 'Step 4 Title', 'value': 'Plan & Review', 'content_type': 'text'},
    {'page': 'add_a_yard', 'section': 'steps', 'key': 'step4_sub', 'label': 'Step 4 Subtitle', 'value': 'Final check', 'content_type': 'text'},

    {'page': 'add_a_yard', 'section': 'form_sec1', 'key': 'sec1_heading', 'label': 'Section 1 Heading', 'value': 'Business Information', 'content_type': 'text'},
    {'page': 'add_a_yard', 'section': 'form_sec1', 'key': 'sec1_subheading', 'label': 'Section 1 Subheading', 'value': "Let's start with your core business details.", 'content_type': 'text'},

    {'page': 'add_a_yard', 'section': 'form_sec2', 'key': 'sec2_heading', 'label': 'Section 2 Heading', 'value': 'Location & Owner', 'content_type': 'text'},
    {'page': 'add_a_yard', 'section': 'form_sec2', 'key': 'sec2_subheading', 'label': 'Section 2 Subheading', 'value': 'Where are you located and who is the main contact?', 'content_type': 'text'},
    {'page': 'add_a_yard', 'section': 'form_sec2', 'key': 'owner_details_title', 'label': 'Owner Details Title', 'value': 'Owner / Manager Details', 'content_type': 'text'},

    {'page': 'add_a_yard', 'section': 'form_sec3', 'key': 'sec3_heading', 'label': 'Section 3 Heading', 'value': 'Services & Setup', 'content_type': 'text'},
    {'page': 'add_a_yard', 'section': 'form_sec3', 'key': 'sec3_subheading', 'label': 'Section 3 Subheading', 'value': "Tell customers what you offer and when you're open.", 'content_type': 'text'},

    {'page': 'add_a_yard', 'section': 'form_sec4', 'key': 'sec4_heading', 'label': 'Section 4 Heading', 'value': 'Choose Plan & Submit', 'content_type': 'text'},
    {'page': 'add_a_yard', 'section': 'form_sec4', 'key': 'sec4_subheading', 'label': 'Section 4 Subheading', 'value': 'Select your listing plan and review your application.', 'content_type': 'text'},
    {'page': 'add_a_yard', 'section': 'form_sec4', 'key': 'plan1_name', 'label': 'Plan 1 Name', 'value': 'Standard Plan', 'content_type': 'text'},
    {'page': 'add_a_yard', 'section': 'form_sec4', 'key': 'plan1_desc', 'label': 'Plan 1 Desc', 'value': 'Basic directory listing', 'content_type': 'text'},
    {'page': 'add_a_yard', 'section': 'form_sec4', 'key': 'plan1_price', 'label': 'Plan 1 Price', 'value': 'Free', 'content_type': 'text'},
    {'page': 'add_a_yard', 'section': 'form_sec4', 'key': 'plan2_name', 'label': 'Plan 2 Name', 'value': 'Premium Plan', 'content_type': 'text'},
    {'page': 'add_a_yard', 'section': 'form_sec4', 'key': 'plan2_desc', 'label': 'Plan 2 Desc', 'value': 'Featured placement & analytics', 'content_type': 'text'},
    {'page': 'add_a_yard', 'section': 'form_sec4', 'key': 'plan2_price', 'label': 'Plan 2 Price', 'value': '$49/mo', 'content_type': 'text'},
    {'page': 'add_a_yard', 'section': 'form_sec4', 'key': 'terms_text', 'label': 'Terms Text', 'value': 'By submitting, you agree to our Terms of Service and Privacy Policy. A representative will contact you shortly after review.', 'content_type': 'textarea'},

    {'page': 'add_a_yard', 'section': 'form_buttons', 'key': 'back_btn', 'label': 'Back Button', 'value': 'Back', 'content_type': 'text'},
    {'page': 'add_a_yard', 'section': 'form_buttons', 'key': 'continue_btn', 'label': 'Continue Button', 'value': 'Continue →', 'content_type': 'text'},
    {'page': 'add_a_yard', 'section': 'form_buttons', 'key': 'submit_btn', 'label': 'Submit Button', 'value': 'Submit Application', 'content_type': 'text'},

    # ══════════════════════════════════════════════════════════════════
    # VENDOR PORTAL - LOGIN & DASHBOARD
    # ══════════════════════════════════════════════════════════════════
    {'page': 'vendor_portal', 'section': 'login', 'key': 'panel_heading', 'label': 'Left Panel Heading', 'value': 'Welcome Back!', 'content_type': 'text'},
    {'page': 'vendor_portal', 'section': 'login', 'key': 'panel_subtext', 'label': 'Left Panel Subtext', 'value': 'Sign in to access your account', 'content_type': 'text'},
    {'page': 'vendor_portal', 'section': 'login', 'key': 'form_heading', 'label': 'Form Heading (supports HTML spans)', 'value': 'Welcome <span class="text-blue-600">Back</span>', 'content_type': 'textarea'},
    {'page': 'vendor_portal', 'section': 'login', 'key': 'form_subtext', 'label': 'Form Subtext', 'value': 'Sign in to your account', 'content_type': 'text'},
    {'page': 'vendor_portal', 'section': 'login', 'key': 'email_label', 'label': 'Email Input Label', 'value': 'Email Address', 'content_type': 'text'},
    {'page': 'vendor_portal', 'section': 'login', 'key': 'password_label', 'label': 'Password Input Label', 'value': 'Password', 'content_type': 'text'},
    {'page': 'vendor_portal', 'section': 'login', 'key': 'forgot_password', 'label': 'Forgot Password Text', 'value': 'Forgot Password?', 'content_type': 'text'},
    {'page': 'vendor_portal', 'section': 'login', 'key': 'submit_btn', 'label': 'Submit Button', 'value': 'Sign In', 'content_type': 'text'},
    {'page': 'vendor_portal', 'section': 'login', 'key': 'signup_text', 'label': 'Signup Prompt', 'value': "Don't have an account?", 'content_type': 'text'},
    {'page': 'vendor_portal', 'section': 'login', 'key': 'signup_link', 'label': 'Signup Link Text', 'value': 'Sign Up', 'content_type': 'text'},

    {'page': 'vendor_portal', 'section': 'dashboard', 'key': 'welcome_heading', 'label': 'Welcome Heading', 'value': 'Welcome Back', 'content_type': 'text'},
    {'page': 'vendor_portal', 'section': 'dashboard', 'key': 'stat1_label', 'label': 'Stat 1 Label', 'value': 'Total Listings', 'content_type': 'text'},
    {'page': 'vendor_portal', 'section': 'dashboard', 'key': 'stat2_label', 'label': 'Stat 2 Label', 'value': 'Active Ads', 'content_type': 'text'},
    {'page': 'vendor_portal', 'section': 'dashboard', 'key': 'stat3_label', 'label': 'Stat 3 Label', 'value': 'Profile Views', 'content_type': 'text'},
    {'page': 'vendor_portal', 'section': 'dashboard', 'key': 'stat4_label', 'label': 'Stat 4 Label', 'value': 'Converted Leads', 'content_type': 'text'},
    {'page': 'vendor_portal', 'section': 'dashboard', 'key': 'system_status', 'label': 'System Status Title', 'value': 'System Status', 'content_type': 'text'},
    {'page': 'vendor_portal', 'section': 'dashboard', 'key': 'requests_heading', 'label': 'Requests Heading', 'value': 'Recent Network Requests', 'content_type': 'text'},
    {'page': 'vendor_portal', 'section': 'dashboard', 'key': 'view_all', 'label': 'View All Text', 'value': 'View All', 'content_type': 'text'},
    {'page': 'vendor_portal', 'section': 'dashboard', 'key': 'no_requests_title', 'label': 'No Requests Title', 'value': 'No active requests found', 'content_type': 'text'},
    {'page': 'vendor_portal', 'section': 'dashboard', 'key': 'no_requests_sub', 'label': 'No Requests Subtitle', 'value': 'Stand by to receive incoming transmissions for your inventory.', 'content_type': 'textarea'},

    {'page': 'vendor_portal', 'section': 'inventory', 'key': 'heading', 'label': 'Inventory Heading', 'value': 'Parts Inventory', 'content_type': 'text'},
    {'page': 'vendor_portal', 'section': 'inventory', 'key': 'subheading', 'label': 'Inventory Subheading', 'value': 'Manage and track your available auto parts inventory.', 'content_type': 'text'},
    {'page': 'vendor_portal', 'section': 'inventory', 'key': 'add_btn', 'label': 'Add Button Text', 'value': 'Add Part', 'content_type': 'text'},

    {'page': 'vendor_portal', 'section': 'ads', 'key': 'header_title', 'label': 'Ads Header Title (supports HTML spans)', 'value': 'Vendor <span class="text-blue-600">Ads</span>', 'content_type': 'textarea'},
    {'page': 'vendor_portal', 'section': 'ads', 'key': 'header_desc', 'label': 'Ads Header Description', 'value': "Boost your yard's visibility and dominate the search results with our premium ad placements.", 'content_type': 'textarea'},
    {'page': 'vendor_portal', 'section': 'ads', 'key': 'active_heading', 'label': 'Active Ads Heading', 'value': 'Your Active Placements', 'content_type': 'text'},

    {'page': 'vendor_portal', 'section': 'leads', 'key': 'heading', 'label': 'Leads Heading', 'value': 'Customer Inquiries', 'content_type': 'text'},
    {'page': 'vendor_portal', 'section': 'leads', 'key': 'subheading', 'label': 'Leads Subheading', 'value': 'Connect with customers looking for parts', 'content_type': 'text'},
    {'page': 'vendor_portal', 'section': 'leads', 'key': 'search_placeholder', 'label': 'Search Placeholder', 'value': 'Search by name, make, model, or part...', 'content_type': 'text'},

    {'page': 'vendor_portal', 'section': 'lead_detail', 'key': 'subheading', 'label': 'Detail Subheading', 'value': 'Review and respond to this customer request', 'content_type': 'text'},

    {'page': 'vendor_portal', 'section': 'profile', 'key': 'heading', 'label': 'Profile Heading', 'value': 'Yard Profile', 'content_type': 'text'},
    {'page': 'vendor_portal', 'section': 'profile', 'key': 'subheading', 'label': 'Profile Subheading', 'value': 'Manage your business details and settings', 'content_type': 'text'},
    
    {'page': 'vendor_portal', 'section': 'notifications', 'key': 'heading', 'label': 'Notifications Heading', 'value': 'Notifications', 'content_type': 'text'},
    {'page': 'vendor_portal', 'section': 'notifications', 'key': 'subheading', 'label': 'Notifications Subheading', 'value': 'Stay updated on leads and system alerts', 'content_type': 'text'},

    {'page': 'vendor_portal', 'section': 'forgot_password', 'key': 'heading', 'label': 'Heading (supports HTML spans)', 'value': 'Recover <span class="text-blue-600">Account</span>', 'content_type': 'textarea'},
    {'page': 'vendor_portal', 'section': 'forgot_password', 'key': 'subtext', 'label': 'Subtext', 'value': "Enter your email to receive a password reset link.", 'content_type': 'text'},
]
