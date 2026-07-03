"""
Blog Seed Script — JYNM
Run: venv/bin/python seed_blog.py
"""
import os, sys, django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.utils import timezone
from apps.blog.models import Author, BlogCategory, BlogTag, BlogPost

print("\n===== JYNM Blog Seeder =====\n")

if BlogPost.objects.count() >= 5:
    print(f"[OK] {BlogPost.objects.count()} posts exist. Skipping.")
    sys.exit(0)

# Author
author, _ = Author.objects.get_or_create(
    name="JYNM Editorial Team",
    defaults={
        "bio": "Expert auto salvage and used parts guides from the Junkyards Near Me team.",
        "designation": "Auto Parts Experts",
        "profile_picture_url": "https://ui-avatars.com/api/?name=JYNM&background=2563eb&color=fff&size=200",
    }
)

# Categories
cats = {}
for name in ["Buying Guides", "How It Works", "Tips & Tricks", "Industry News", "Cost Savings"]:
    c, _ = BlogCategory.objects.get_or_create(name=name)
    cats[name] = c

# Tags
tag_names = ["used auto parts", "junkyard", "salvage yard", "car parts", "save money", "DIY", "recycled parts", "auto salvage"]
tags = {}
for t in tag_names:
    obj, _ = BlogTag.objects.get_or_create(name=t)
    tags[t] = obj

def make_blocks(intro, points, conclusion):
    blocks = [
        {"type": "paragraph", "content": intro},
        {"type": "heading", "level": 2, "content": "Key Takeaways"},
    ]
    for p in points:
        blocks.append({"type": "paragraph", "content": p})
    blocks.append({"type": "paragraph", "content": conclusion})
    return blocks

POSTS = [
    {
        "title": "How to Find Reliable Used Auto Parts at a Junkyard Near You",
        "excerpt": "Discover proven strategies to find quality used auto parts at salvage yards and save up to 80% vs dealership prices.",
        "category": "Buying Guides",
        "tags": ["used auto parts", "junkyard", "save money"],
        "featured": True, "trending": True, "reading_time": 6,
        "cover": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&q=80",
        "blocks": make_blocks(
            "Shopping at a junkyard can save you hundreds — even thousands — of dollars on car repairs. With over 6,500 verified salvage yards in our network, finding the right part has never been easier.",
            [
                "1. Search by part name, make, and model using JYNM's search tool to instantly match vendors near you.",
                "2. Always verify the part number and compatibility before purchasing. Ask the yard staff for help.",
                "3. Inspect the part in person when possible — check for cracks, rust, and wear before committing.",
                "4. Compare prices across at least 3 yards. Prices can vary 30-50% for the same part.",
                "5. Ask about return policies. Many quality yards offer a 30-90 day warranty on used parts.",
            ],
            "With the right approach, junkyards are a goldmine for affordable, reliable auto parts. Use JYNM to search thousands of yards and get quotes in seconds."
        )
    },
    {
        "title": "Top 10 Car Parts You Should Always Buy Used",
        "excerpt": "Not all car parts need to be new. Here are 10 components where buying used is perfectly safe and saves big money.",
        "category": "Buying Guides",
        "tags": ["used auto parts", "save money", "car parts"],
        "featured": True, "trending": False, "reading_time": 5,
        "cover": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80",
        "blocks": make_blocks(
            "Buying used car parts is smart — but knowing WHICH parts to buy used is even smarter. Here are the top 10 components where used is always the right call.",
            [
                "1. Doors and body panels — cosmetic only, no safety concerns with used.",
                "2. Mirrors — direct bolt-on replacements, easy to find at any yard.",
                "3. Interior trim and seats — identical quality at a fraction of new price.",
                "4. Alternators and starters — these last long and test well used.",
                "5. Transmissions — buy from reputable yards with mileage guarantees.",
                "6. Engines — low-mileage used engines often outlast rebuilt units.",
                "7. Wheels and rims — same metal, no wear concerns for structural integrity.",
                "8. Headlight and taillight assemblies — exact OEM fit, major savings.",
                "9. Radiators and cooling components — inspect for leaks, works perfectly used.",
                "10. Hoods and trunk lids — purely structural/cosmetic, ideal used.",
            ],
            "Remember: always verify part compatibility using your VIN number and consult our network of trusted yards for the best prices."
        )
    },
    {
        "title": "What Is a Hollander Interchange Number and Why Does It Matter?",
        "excerpt": "Understanding Hollander interchange numbers helps you find compatible parts faster across different vehicle makes and years.",
        "category": "How It Works",
        "tags": ["used auto parts", "car parts", "junkyard"],
        "featured": False, "trending": True, "reading_time": 4,
        "cover": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
        "blocks": make_blocks(
            "A Hollander interchange number is the universal code used by salvage yards to identify parts that are physically interchangeable across different vehicle years, makes, and models.",
            [
                "Why it matters: One Hollander number might cover 50 different vehicles — dramatically expanding your search for compatible parts.",
                "Example: A transmission with Hollander number 723-01A might fit 1998-2003 Ford F-150, Expedition, and Lincoln Navigator.",
                "How JYNM uses it: When you submit a part request, our system automatically resolves the Hollander number for your vehicle to find every compatible part in our network.",
                "Cross-referencing: Always provide your year, make, model, and trim level to get the most accurate Hollander match.",
            ],
            "With Hollander interchange data built into JYNM's search, you get access to compatible parts across thousands of vehicles — not just exact matches."
        )
    },
    {
        "title": "Junkyard vs. Aftermarket Parts: Which Is Better for Your Car?",
        "excerpt": "Comparing salvage yard parts vs aftermarket options — cost, quality, warranty, and fitment across common repair scenarios.",
        "category": "Cost Savings",
        "tags": ["used auto parts", "save money", "recycled parts"],
        "featured": False, "trending": False, "reading_time": 7,
        "cover": "https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=1200&q=80",
        "blocks": make_blocks(
            "When your car needs a repair, you have choices: dealer new, aftermarket, or junkyard used. Here's how they compare so you can make the smartest decision.",
            [
                "COST: Junkyard parts average 50-80% cheaper than new dealer parts. Aftermarket saves 20-40%. OEM used parts from yards deliver the best value.",
                "QUALITY: OEM junkyard parts are identical to what came in your car. Aftermarket quality varies widely by brand.",
                "FIT: Junkyard OEM parts guarantee exact fitment. Aftermarket parts sometimes require adjustments.",
                "WARRANTY: Quality yards offer 30-90 day warranties. Aftermarket brands offer 1-year or lifetime but fitment issues are common.",
                "AVAILABILITY: Junkyards excel for discontinued parts no longer manufactured. Aftermarket only covers popular vehicles.",
                "BEST FOR JUNKYARD: Body panels, interior parts, electronics, transmissions, engines, suspension components.",
                "BEST FOR AFTERMARKET: Brake pads, filters, belts, hoses — wear items where universal specs apply.",
            ],
            "Bottom line: For structural and major mechanical components, junkyard OEM parts win on value. Use JYNM to find them fast."
        )
    },
    {
        "title": "How to Prepare Before Visiting a Salvage Yard",
        "excerpt": "First time visiting a junkyard? Here is everything you need to bring, know, and check before you go to get the right part.",
        "category": "Tips & Tricks",
        "tags": ["junkyard", "salvage yard", "DIY"],
        "featured": False, "trending": False, "reading_time": 5,
        "cover": "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80",
        "blocks": make_blocks(
            "A little preparation goes a long way at the salvage yard. Walk in prepared and you will walk out with the right part at the right price.",
            [
                "1. Know your VIN — bring it written down. Staff use it to confirm compatibility instantly.",
                "2. Bring your part number if you have it. Check your owner's manual or existing part label.",
                "3. Wear old clothes and bring gloves — it's a working yard, not a showroom.",
                "4. Bring basic tools: screwdrivers, a wrench set, and a flashlight for pull-your-own yards.",
                "5. Call ahead — confirm they have your part before making the trip.",
                "6. Inspect before you buy — test electrical parts if possible, check for cracks and corrosion.",
                "7. Bring cash or check — many smaller yards don't accept cards.",
            ],
            "Use JYNM to call or request quotes from yards before visiting so you know exactly where your part is and what it costs."
        )
    },
    {
        "title": "The Environmental Impact of Buying Recycled Auto Parts",
        "excerpt": "Every used car part you buy prevents tons of steel, aluminum, and plastic from going to landfill. Here is the full environmental story.",
        "category": "Industry News",
        "tags": ["recycled parts", "salvage yard", "auto salvage"],
        "featured": True, "trending": False, "reading_time": 4,
        "cover": "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1200&q=80",
        "blocks": make_blocks(
            "The auto recycling industry is one of America's most important environmental success stories — and every time you buy a used part, you are part of it.",
            [
                "Over 12 million vehicles are recycled in North America every year, making the auto recycling industry the 16th largest in the US.",
                "Recycled auto parts save over 80 million barrels of oil annually that would otherwise be needed to manufacture new parts.",
                "End-of-life vehicles provide 40% of the ferrous scrap supply to US steel mills — reducing mining and manufacturing emissions.",
                "Buying one used engine instead of a new remanufactured unit saves approximately 1,200 lbs of CO2 equivalent.",
                "Salvage yards safely drain and recycle all fluids — oil, coolant, and transmission fluid — preventing ground contamination.",
            ],
            "When you search for parts on JYNM, you're not just saving money — you're choosing sustainability. Our 6,500+ verified yards are certified recyclers committed to responsible practices."
        )
    },
    {
        "title": "5 Signs You Are Paying Too Much for Auto Parts",
        "excerpt": "Are you overpaying for car repairs? These 5 warning signs mean it is time to shop smarter with salvage yard parts.",
        "category": "Cost Savings",
        "tags": ["save money", "used auto parts", "car parts"],
        "featured": False, "trending": True, "reading_time": 3,
        "cover": "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&q=80",
        "blocks": make_blocks(
            "Most car owners dramatically overpay for parts without realizing it. Here are the five biggest warning signs.",
            [
                "1. Your mechanic buys parts and marks them up 30-80%. Always ask for an itemized parts list and shop it yourself.",
                "2. You always buy new when used OEM would be identical — common for body panels, mirrors, interior trim.",
                "3. You only check one source. Part prices vary enormously — always get 3+ quotes.",
                "4. You use the dealership parts department for non-warranty repairs. Dealer markup averages 60% over market.",
                "5. You've never used a salvage yard. Millions of quality parts sit in yards right now for 50-80% less than new.",
            ],
            "Use JYNM to instantly request quotes from multiple verified salvage yards. Most customers save $200-$1,500 per repair compared to buying new."
        )
    },
    {
        "title": "How JYNM Connects You to 6,500+ Verified Junkyards Nationwide",
        "excerpt": "A behind-the-scenes look at how Junkyards Near Me verifies yards, indexes parts, and delivers quotes in seconds.",
        "category": "How It Works",
        "tags": ["junkyard", "auto salvage", "used auto parts"],
        "featured": False, "trending": False, "reading_time": 4,
        "cover": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
        "blocks": make_blocks(
            "JYNM exists to solve one problem: finding the right used auto part, from the right yard, at the right price — fast. Here is how we do it.",
            [
                "Step 1: Search — Enter your vehicle year, make, model, and the part you need. Our system resolves the Hollander interchange number automatically.",
                "Step 2: Match — We instantly cross-reference 6,500+ verified salvage yards to find who has your part in stock.",
                "Step 3: Quote — Submit your request and verified yards respond with pricing, availability, and shipping options.",
                "Step 4: Connect — Choose your yard, contact them directly, and get your part. No middleman markup.",
                "Verification: Every yard in our network is independently verified for licensing, business registration, and customer reviews.",
            ],
            "The result: Most JYNM users find their part in under 60 seconds and save an average of 65% compared to buying new from a dealer."
        )
    },
]

created = 0
for post_data in POSTS:
    cat = cats.get(post_data["category"])
    post_tags = [tags[t] for t in post_data["tags"] if t in tags]

    post = BlogPost.objects.create(
        title=post_data["title"],
        excerpt=post_data["excerpt"],
        blocks=post_data["blocks"],
        cover_image_url=post_data["cover"],
        thumbnail_url=post_data["cover"],
        category=cat,
        author=author,
        status="published",
        is_featured=post_data["featured"],
        is_trending=post_data["trending"],
        reading_time=post_data["reading_time"],
        published_at=timezone.now(),
        seo_description=post_data["excerpt"],
    )
    post.tags.set(post_tags)
    created += 1
    print(f"  Created: {post.title[:60]}")

print(f"\n===== Done! Created {created} blog posts. =====\n")
