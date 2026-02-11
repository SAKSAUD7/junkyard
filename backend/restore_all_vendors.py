import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import Vendor

print("Expanding vendor dataset to 850+ vendors...")

# More comprehensive state-city combinations including additional cities
states_cities = {
    "AL": ["Birmingham", "Montgomery", "Mobile", "Huntsville", "Tuscaloosa", "Hoover", "Dothan", "Auburn", "Decatur", "Madison"],
    "AK": ["Anchorage", "Fairbanks", "Juneau", "Sitka", "Ketchikan", "Wasilla"],
    "AZ": ["Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale", "Glendale", "Gilbert", "Tempe", "Peoria", "Surprise"],
    "AR": ["Little Rock", "Fort Smith", "Fayetteville", "Springdale", "Jonesboro", "North Little Rock", "Conway"],
    "CA": ["Los Angeles", "San Diego", "San Jose", "San Francisco", "Fresno", "Sacramento", "Long Beach", "Oakland", "Bakersfield", "Anaheim", 
           "Santa Ana", "Riverside", "Stockton", "Irvine", "Chula Vista", "Fremont", "San Bernardino", "Modesto", "Fontana", "Oxnard"],
    "CO": ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Lakewood", "Thornton", "Arvada", "Westminster", "Pueblo"],
    "CT": ["Bridgeport", "New Haven", "Hartford", "Stamford", "Waterbury", "Norwalk", "Danbury"],
    "DE": ["Wilmington", "Dover", "Newark", "Middletown", "Smyrna"],
    "FL": ["Jacksonville", "Miami", "Tampa", "Orlando", "St. Petersburg", "Hialeah", "Tallahassee", "Fort Lauderdale", "Port St. Lucie", 
           "Cape Coral", "Pembroke Pines", "Hollywood", "Miramar", "Coral Springs", "Clearwater"],
    "GA": ["Atlanta", "Columbus", "Augusta", "Macon", "Savannah", "Athens", "Sandy Springs", "Roswell", "Albany"],
    "HI": ["Honolulu", "Pearl City", "Hilo", "Kailua", "Waipahu"],
    "ID": ["Boise", "Meridian", "Nampa", "Idaho Falls", "Pocatello", "Caldwell"],
    "IL": ["Chicago", "Aurora", "Rockford", "Joliet", "Naperville", "Springfield", "Peoria", "Elgin", "Waukegan", "Cicero"],
    "IN": ["Indianapolis", "Fort Wayne", "Evansville", "South Bend", "Carmel", "Fishers", "Bloomington"],
    "IA": ["Des Moines", "Cedar Rapids", "Davenport", "Sioux City", "Iowa City"],
    "KS": ["Wichita", "Overland Park", "Kansas City", "Olathe", "Topeka", "Lawrence"],
    "KY": ["Louisville", "Lexington", "Bowling Green", "Owensboro", "Covington"],
    "LA": ["New Orleans", "Baton Rouge", "Shreveport", "Lafayette", "Lake Charles", "Kenner", "Bossier City"],
    "ME": ["Portland", "Lewiston", "Bangor", "South Portland", "Auburn"],
    "MD": ["Baltimore", "Frederick", "Rockville", "Gaithersburg", "Bowie", "Hagerstown", "Ann Annapolis"],
    "MA": ["Boston", "Worcester", "Springfield", "Cambridge", "Lowell", "Brockton", "Quincy", "Lynn"],
    "MI": ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Ann Arbor", "Lansing", "Flint", "Dearborn"],
    "MN": ["Minneapolis", "St. Paul", "Rochester", "Duluth", "Bloomington", "Brooklyn Park", "Plymouth"],
    "MS": ["Jackson", "Gulfport", "Southaven", "Biloxi", "Hattiesburg", "Meridian"],
    "MO": ["Kansas City", "St. Louis", "Springfield", "Columbia", "Independence", "Lee's Summit"],
    "MT": ["Billings", "Missoula", "Great Falls", "Bozeman", "Butte"],
    "NE": ["Omaha", "Lincoln", "Bellevue", "Grand Island"],
    "NV": ["Las Vegas", "Henderson", "Reno", "North Las Vegas", "Sparks", "Carson City"],
    "NH": ["Manchester", "Nashua", "Concord", "Derry", "Rochester"],
    "NJ": ["Newark", "Jersey City", "Paterson", "Elizabeth", "Edison", "Woodbridge", "Lakewood", "Toms River"],
    "NM": ["Albuquerque", "Las Cruces", "Rio Rancho", "Santa Fe", "Roswell"],
    "NY": ["New York", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany", "New Rochelle", "Mount Vernon"],
    "NC": ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem", "Fayetteville", "Cary", "Wilmington"],
    "ND": ["Fargo", "Bismarck", "Grand Forks", "Minot"],
    "OH": ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "Dayton", "Parma", "Canton"],
    "OK": ["Oklahoma City", "Tulsa", "Norman", "Broken Arrow", "Lawton"],
    "OR": ["Portland", "Salem", "Eugene", "Gresham", "Hillsboro", "Beaverton"],
    "PA": ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading", "Scranton", "Bethlehem"],
    "RI": ["Providence", "Warwick", "Cranston", "Pawtucket"],
    "SC": ["Columbia", "Charleston", "North Charleston", "Mount Pleasant", "Rock Hill"],
    "SD": ["Sioux Falls", "Rapid City", "Aberdeen", "Brookings"],
    "TN": ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Clarksville", "Murfreesboro"],
    "TX": ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso", "Arlington", "Corpus Christi", "Plano", "Laredo",
           "Lubbock", "Garland", "Irving", "Amarillo", "Grand Prairie", "McKinney", "Frisco"],
    "UT": ["Salt Lake City", "West Valley City", "Provo", "West Jordan", "Orem", "Sandy"],
    "VT": ["Burlington", "South Burlington", "Rutland", "Barre"],
    "VA": ["Virginia Beach", "Norfolk", "Chesapeake", "Richmond", "Newport News", "Alexandria", "Hampton"],
    "WA": ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue", "Kent", "Everett", "Renton"],
    "WV": ["Charleston", "Huntington", "Morgantown", "Parkersburg", "Wheeling"],
    "WI": ["Milwaukee", "Madison", "Green Bay", "Kenosha", "Racine", "Appleton"],
    "WY": ["Cheyenne", "Casper", "Laramie", "Gillette"],
}

# Expanded vendor name templates
vendor_templates = [
    "{city} Auto Salvage",
    "{city} Auto Parts",
    "{city} Junkyard",
    "{state} Auto Recyclers",
    "{state} Salvage Yard",
    "Quality Auto Parts - {city}",
    "Discount Auto Salvage - {city}",
    "Premier Auto Recycling - {city}",
    "All American Auto Parts - {city}",
    "{city} Used Auto Parts",
    "Budget Auto Parts - {city}",
    "Green Auto Recyclers - {city}",
    "Economy Auto Salvage - {city}",
    "Metro Auto Parts - {city}",
    "{city} Premium Parts",
    "Ace Auto Salvage - {city}",
    "{state} Quality Auto Parts",
    "Best Price Auto Parts - {city}",
    "{city} Auto Wrecking",
    "Reliable Auto Parts - {city}",
]

current_count = Vendor.objects.count()
print(f"Current vendor count: {current_count}")
print(f"Target: 850+ vendors")

yard_id = 3000  # Start from 3000 to avoid conflicts
created_count = 0
target = 850 - current_count

for state, cities in states_cities.items():
    for city in cities:
        # Create multiple vendors per city
        for template in vendor_templates[:5]:  # Use first 5 templates per city
            if created_count >= target:
                break
                
            name = template.replace("{city}", city).replace("{state}", state)
            
            # Create vendor
            try:
                vendorvendor, created = Vendor.objects.get_or_create(
                    yard_id=yard_id,
                    defaults={
                        "name": name,
                        "address": f"{100 + (yard_id % 900)} Auto Parts Drive",
                        "city": city,
                        "state": state,
                        "zip_code": f"{(yard_id % 90000) + 10000}",
                        "phone": f"({yard_id % 900 + 100:03d}) 555-{yard_id % 10000:04d}",
                        "email": f"info@{name.lower().replace(' ', '').replace('-', '')[:25]}.com",
                        "website": f"https://www.{name.lower().replace(' ', '').replace('-', '')[:25]}.com",
                        "description": f"Trusted auto salvage and recycling in {city}, {state}. Quality used parts at great prices.",
                        "is_featured": (yard_id % 12 == 0),
                        "is_top_rated": (yard_id % 8 == 0),
                        "is_trusted": (yard_id % 20 == 0),
                        "rating_stars": 4 + (yard_id % 2),
                        "rating_percentage": 90 + (yard_id % 11),
                    }
                )
                if created:
                    created_count += 1
                    if created_count % 100 == 0:
                        print(f"Created {created_count} new vendors... (Total: {current_count + created_count})")
                yard_id += 1
            except Exception as e:
                print(f"Error creating vendor {yard_id}: {e}")
                yard_id += 1
        
        if created_count >= target:
            break
    
    if created_count >= target:
        break

total = Vendor.objects.count()
print(f"\n{'='*60}")
print(f"VENDOR DATA EXPANSION COMPLETE!")
print(f"{'='*60}")
print(f"New vendors created: {created_count}")
print(f"Total vendors in database: {total}")
print(f"{'='*60}")
