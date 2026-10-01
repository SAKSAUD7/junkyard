from rest_framework import serializers
from .models import Lead, VendorLead, VehicleSubmission, LeadDistribution


class VendorLeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorLead
        fields = [
            'id', 'make', 'model', 'year',
            'name', 'email', 'phone', 'state', 'zip', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'status']


class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = [
            'id', 'make', 'model', 'part', 'year',
            'name', 'email', 'phone',
            'state', 'zip', 'location',
            'options', 'hollander_number',
            'lead_type', 'vendor', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'status']


class VehicleSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleSubmission
        fields = [
            'id', 'vin', 'year', 'make', 'model', 'trim', 'mileage',
            'drivable', 'starts', 'transportation_required', 'has_title',
            'has_keys', 'has_all_tires', 'body_damage', 'engine_issue',
            'transmission_issue', 'name', 'email', 'phone', 'zip_code',
            'state', 'city', 'description', 'status', 'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'status']


# ── Lead Distribution Serializers ─────────────────────────────────────────────

class LeadSummarySerializer(serializers.ModelSerializer):
    """
    Contact-less lead summary returned to vendors before they unlock the lead.
    Hides name, email, phone — only shows vehicle/part/ZIP info.
    """
    zip_preview = serializers.SerializerMethodField()

    class Meta:
        model = Lead
        fields = ['id', 'make', 'model', 'year', 'part', 'options', 'state', 'zip_preview', 'created_at']

    def get_zip_preview(self, obj):
        """Only show first 3 digits of ZIP code for privacy."""
        return (obj.zip or '')[:3] + '**' if obj.zip else ''


class LeadDistributionSerializer(serializers.ModelSerializer):
    """
    Used by the vendor portal — strips contact info unless is_unlocked == True.
    """
    lead_summary = LeadSummarySerializer(source='lead', read_only=True)
    lead_contact = serializers.SerializerMethodField()
    vendor_name = serializers.SerializerMethodField()

    class Meta:
        model = LeadDistribution
        fields = [
            'id',
            'lead', 'lead_summary', 'lead_contact',
            'vendor', 'vendor_name',
            'is_unlocked', 'unlocked_at', 'price_paid',
            'teaser_email_sent', 'teaser_email_sent_at',
            'assigned_at', 'assigned_by',
        ]
        read_only_fields = ['id', 'assigned_at', 'lead_summary', 'lead_contact', 'vendor_name']

    def get_lead_contact(self, obj):
        if obj.is_unlocked:
            return {
                'name': obj.lead.name,
                'email': obj.lead.email,
                'phone': obj.lead.phone,
                'zip': obj.lead.zip,
                'state': obj.lead.state,
            }
        return None

    def get_vendor_name(self, obj):
        return getattr(obj.vendor, 'name', '') or ''


class LeadDistributionAdminSerializer(LeadDistributionSerializer):
    """Admin view — includes full lead contact regardless of unlock state."""
    lead_full = LeadSerializer(source='lead', read_only=True)
    lead_contact = serializers.SerializerMethodField()

    class Meta(LeadDistributionSerializer.Meta):
        fields = LeadDistributionSerializer.Meta.fields + ['lead_full']

    def get_lead_contact(self, obj):
        # Admin always sees everything
        return {
            'name': obj.lead.name,
            'email': obj.lead.email,
            'phone': obj.lead.phone,
            'zip': obj.lead.zip,
            'state': obj.lead.state,
        }
