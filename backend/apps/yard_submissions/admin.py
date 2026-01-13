from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from django.utils.text import slugify
from .models import YardSubmission


@admin.register(YardSubmission)
class YardSubmissionAdmin(admin.ModelAdmin):
    list_display = ('business_name', 'contact_name', 'city', 'state', 'status_badge', 'created_at', 'vendor_link')
    list_filter = ('status', 'state', 'created_at')
    search_fields = ('business_name', 'contact_name', 'email', 'city')
    readonly_fields = ('created_at', 'updated_at', 'reviewed_at', 'created_vendor')
    
    fieldsets = (
        ('Business Information', {
            'fields': ('business_name', 'contact_name', 'email', 'phone', 'toll_free', 'fax', 'website')
        }),
        ('Location', {
            'fields': ('address', 'city', 'state', 'zip_code', 'country')
        }),
        ('Business Owner', {
            'fields': ('owner_first_name', 'owner_last_name', 'owner_phone', 'owner_email')
        }),
        ('Payment & Hours', {
            'fields': ('payment_methods', 'business_hours'),
            'classes': ('collapse',)
        }),
        ('Business Details', {
            'fields': ('services', 'brands', 'parts_categories', 'description')
        }),
        ('Subscription Plan', {
            'fields': ('subscription_plan',)
        }),
        ('Media', {
            'fields': ('logo', 'images')
        }),
        ('Status & Review', {
            'fields': ('status', 'admin_notes', 'created_vendor', 'reviewed_by', 'reviewed_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['approve_and_create_vendor', 'reject_submissions']
    
    def status_badge(self, obj):
        """Display status with color badge"""
        colors = {
            'pending': '#FFA500',
            'approved': '#28A745',
            'rejected': '#DC3545'
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-weight: bold;">{}</span>',
            colors.get(obj.status, '#6C757D'),
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def vendor_link(self, obj):
        """Link to created vendor if exists"""
        if obj.created_vendor:
            return format_html(
                '<a href="/admin/vendors/vendor/{}/change/" target="_blank">View Vendor →</a>',
                obj.created_vendor.id
            )
        return '-'
    vendor_link.short_description = 'Vendor'
    
    def approve_and_create_vendor(self, request, queryset):
        """Approve submissions and create vendors"""
        from apps.hollander.models import Vendor
        
        approved_count = 0
        skipped_count = 0
        error_count = 0
        
        for submission in queryset.filter(status='pending'):
            try:
                # Check for duplicate vendors
                existing = Vendor.objects.filter(
                    name__iexact=submission.business_name,
                    city__iexact=submission.city
                ).first()
                
                if existing:
                    self.message_user(
                        request,
                        f'Skipped "{submission.business_name}" - duplicate vendor exists in {submission.city}',
                        level='warning'
                    )
                    skipped_count += 1
                    continue
                
                # Generate unique slug
                base_slug = slugify(submission.business_name)
                slug = base_slug
                counter = 1
                while Vendor.objects.filter(profile_url=f'/vendors/{slug}').exists():
                    slug = f"{base_slug}-{counter}"
                    counter += 1
                
                # Create vendor
                vendor = Vendor.objects.create(
                    name=submission.business_name,
                    address=submission.address,
                    city=submission.city,
                    state=submission.state,
                    zipcode=submission.zip_code,
                    description=submission.description,
                    profile_url=f'/vendors/{slug}',
                    logo=submission.logo.url if submission.logo else '/images/logo-placeholder.png',
                    rating="100%",
                    is_trusted=False,
                    trust_level=0
                )
                
                # Update submission
                submission.status = 'approved'
                submission.reviewed_at = timezone.now()
                submission.reviewed_by = request.user.username
                submission.created_vendor = vendor
                submission.save()
                
                approved_count += 1
                
            except Exception as e:
                self.message_user(
                    request,
                    f'Error approving "{submission.business_name}": {str(e)}',
                    level='error'
                )
                error_count += 1
        
        # Summary message
        if approved_count > 0:
            self.message_user(
                request,
                f'Successfully approved {approved_count} submission(s) and created vendor(s).',
                level='success'
            )
        if skipped_count > 0:
            self.message_user(
                request,
                f'Skipped {skipped_count} submission(s) due to duplicates.',
                level='warning'
            )
        if error_count > 0:
            self.message_user(
                request,
                f'Failed to approve {error_count} submission(s).',
                level='error'
            )
    
    approve_and_create_vendor.short_description = "✓ Approve & Create Vendor"
    
    def reject_submissions(self, request, queryset):
        """Reject submissions"""
        updated = 0
        for submission in queryset.filter(status='pending'):
            submission.status = 'rejected'
            submission.reviewed_at = timezone.now()
            submission.reviewed_by = request.user.username
            submission.save()
            updated += 1
        
        if updated > 0:
            self.message_user(request, f'Rejected {updated} submission(s).', level='success')
        else:
            self.message_user(request, 'No pending submissions to reject.', level='warning')
    
    reject_submissions.short_description = "✗ Reject Submissions"
