"""
Utility functions for lead assignment to vendors
"""

from apps.hollander.models import Vendor


def assign_lead_to_vendors(lead):
    """
    Auto-assign lead to relevant vendors.
    
    For now: assigns to all active vendors
    TODO: Implement smart matching based on:
    - Location (state/zip proximity)
    - Inventory match (make/model/part availability)
    - Vendor preferences
    """
    active_vendors = Vendor.objects.filter(is_active=True)
    lead.assigned_vendors.set(active_vendors)
    
    return active_vendors.count()


def assign_lead_by_location(lead):
    """
    Assign lead to vendors in the same state
    """
    if not lead.state:
        return assign_lead_to_vendors(lead)
    
    vendors = Vendor.objects.filter(
        is_active=True,
        state=lead.state
    )
    
    if vendors.exists():
        lead.assigned_vendors.set(vendors)
        return vendors.count()
    else:
        # Fallback to all active vendors if no state match
        return assign_lead_to_vendors(lead)


def assign_lead_by_inventory(lead):
    """
    Assign lead to vendors with matching inventory
    """
    from apps.vendor_portal.models import VendorInventory
    
    # Find vendors with matching make/model
    matching_inventory = VendorInventory.objects.filter(
        make__iexact=lead.make,
        model__iexact=lead.model,
        is_available=True
    ).values_list('vendor_id', flat=True).distinct()
    
    if matching_inventory:
        vendors = Vendor.objects.filter(
            id__in=matching_inventory,
            is_active=True
        )
        lead.assigned_vendors.set(vendors)
        return vendors.count()
    else:
        # Fallback to location-based assignment
        return assign_lead_by_location(lead)
