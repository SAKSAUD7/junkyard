#!/usr/bin/env python3
"""
Populate States Table from Vendor Data
This script extracts unique states from the vendors table and populates the State table
"""

import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.vendors.models import Vendor
from apps.hollander.models import State

# US State mapping - code to name
US_STATES = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
    'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
    'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
    'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
    'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
    'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
    'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
    'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
    'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
    'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
    'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia'
}

def populate_states():
    """Populate State table from vendor data"""
    
    print("🚀 Starting state population...")
    
    # Get unique states from vendors
    vendor_states = Vendor.objects.exclude(state='').exclude(state__isnull=True).values_list('state', flat=True).distinct()
    vendor_states = set(vendor_states)
    
    print(f"📊 Found {len(vendor_states)} unique states in vendor data: {sorted(vendor_states)}")
    
    # Clear existing states
    existing_count = State.objects.count()
    if existing_count > 0:
        print(f"🗑️  Deleting {existing_count} existing states...")
        State.objects.all().delete()
    
    # Create states
    states_created = 0
    for state_code in sorted(vendor_states):
        state_name = US_STATES.get(state_code, state_code)  # Fallback to code if not in mapping
        
        state, created = State.objects.get_or_create(
            state_code=state_code,
            defaults={'name': state_name, 'country_id': 1}
        )
        
        if created:
            states_created += 1
            # Count vendors in this state
            vendor_count = Vendor.objects.filter(state=state_code).count()
            print(f"✅ Created: {state_name} ({state_code}) - {vendor_count} vendors")
    
    print(f"\n✨ Successfully created {states_created} states!")
    print(f"📍 Total states in database: {State.objects.count()}")
    
    # Show top 10 states by vendor count
    from django.db.models import Count
    print("\n🏆 Top 10 states by vendor count:")
    for state_code in sorted(vendor_states):
        vendor_count = Vendor.objects.filter(state=state_code).count()
        state_name = US_STATES.get(state_code, state_code)
        print(f"   {state_name} ({state_code}): {vendor_count} vendors")

if __name__ == '__main__':
    populate_states()
