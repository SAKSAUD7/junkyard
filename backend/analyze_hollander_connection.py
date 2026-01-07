"""
Analyze HollanderIndex and PartPricing Relationship
====================================================
Understanding how to connect idx_id to hollander_number
"""
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.hollander.models import (
    PartPricing, HollanderIndex, HollanderMakeModelRef, 
    HollanderPartRef, Make, Model, PartType
)

print("\n=== ANALYZING HOLLANDER DATA STRUCTURE ===\n")

# 1. Check PartPricing structure
print("1. PartPricing Sample (has hollander_number in format 100-01460A):")
pricing_sample = PartPricing.objects.exclude(hollander_number='').first()
if pricing_sample:
    print(f"   Hollander Number: {pricing_sample.hollander_number}")
    print(f"   Make: {pricing_sample.make}")
    print(f"   Model: {pricing_sample.model}")
    print(f"   Part: {pricing_sample.part_name}")
    print(f"   Year: {pricing_sample.year_start}-{pricing_sample.year_end}")
    print(f"   Options: {pricing_sample.get_all_options()[:100]}")

print("\n" + "="*60 + "\n")

# 2. Check HollanderIndex structure
print("2. HollanderIndex Sample (has idx_id):")
index_sample = HollanderIndex.objects.first()
if index_sample:
    print(f"   IDX ID: {index_sample.idx_id}")
    print(f"   Model Code: {index_sample.model_nm}")
    print(f"   Part Type Code: {index_sample.part_type_nbr}")
    print(f"   MFR Code: {index_sample.mfr_cd}")
    print(f"   Years: {index_sample.begin_year}-{index_sample.end_year}")

print("\n" + "="*60 + "\n")

# 3. Check if there's a connection
print("3. Testing Connection:")
print(f"   Looking for Ford TAURUS 2019 Assembly...")

# Find Make/Model/Part IDs
make = Make.objects.filter(make_name__iexact='Ford').first()
model = Model.objects.filter(model_name__icontains='TAURUS', make=make).first() if make else None
part = PartType.objects.filter(part_name__icontains='Assembly').first()

if make and model and part:
    print(f"   Make ID: {make.make_id} ({make.make_name})")
    print(f"   Model ID: {model.model_id} ({model.model_name})")
    print(f"   Part ID: {part.part_id} ({part.part_name})")
    
    # Check PartPricing
    pricing = PartPricing.objects.filter(
        make__iexact='Ford',
        model__icontains='TAURUS',
        part_name__icontains='Assembly',
        year_start__lte=2019,
        year_end__gte=2019
    ).first()
    
    if pricing:
        print(f"\n   ✅ Found in PartPricing:")
        print(f"      Hollander #: {pricing.hollander_number}")
        print(f"      Options: {pricing.get_all_options()[:100]}")
    
    # Check HollanderIndex using refs
    model_ref = HollanderMakeModelRef.objects.filter(h_model__icontains='TAURUS').first()
    part_ref = HollanderPartRef.objects.filter(part_name__icontains='Assembly').first()
    
    if model_ref and part_ref:
        print(f"\n   Model Ref: {model_ref.ref_id} ({model_ref.h_model})")
        print(f"   Part Ref: {part_ref.part_code} ({part_ref.part_name})")
        
        index = HollanderIndex.objects.filter(
            model_nm=str(model_ref.ref_id),
            part_type_nbr=str(part_ref.part_code),
            begin_year__lte=2019,
            end_year__gte=2019
        ).first()
        
        if index:
            print(f"\n   ✅ Found in HollanderIndex:")
            print(f"      IDX ID: {index.idx_id}")
            print(f"      Years: {index.begin_year}-{index.end_year}")
            
            # NOW THE KEY QUESTION: How to get from idx_id to hollander_number?
            print(f"\n   🔍 KEY QUESTION: How to map idx_id '{index.idx_id}' to hollander_number format?")

print("\n" + "="*60 + "\n")

# 4. Check the actual format relationship
print("4. Checking Format Relationship:")
print("   PartPricing hollander_number examples:")
for p in PartPricing.objects.exclude(hollander_number='')[:5]:
    print(f"   - {p.hollander_number}")

print("\n   HollanderIndex idx_id examples:")
for idx in HollanderIndex.objects.all()[:5]:
    print(f"   - {idx.idx_id}")

print("\n" + "="*60)
print("\n💡 INSIGHT: PartPricing already has the formatted Hollander numbers!")
print("   The lookup should use PartPricing directly, not HollanderIndex.")
print("   HollanderIndex is for finding compatible parts, not the number format.")
