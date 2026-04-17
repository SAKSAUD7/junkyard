from django.db import models
from django.conf import settings


class StaffRole(models.Model):
    """
    A named role with a granular permission set for the admin portal.
    Three defaults are seeded: Admin, Manager, Employee.
    """
    name = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=255, blank=True)
    color = models.CharField(max_length=20, default='#6366f1', help_text='Hex color for UI badge')

    # ── Module permissions ──────────────────────────────────────
    can_manage_cms = models.BooleanField(default=False, help_text='Create/edit all CMS content')
    can_manage_vendors = models.BooleanField(default=False, help_text='View/edit vendor profiles')
    can_manage_leads = models.BooleanField(default=False, help_text='View/manage customer leads')
    can_manage_ads = models.BooleanField(default=False, help_text='Create/manage ad campaigns')
    can_manage_blog = models.BooleanField(default=False, help_text='Write/publish blog posts')
    can_manage_messages = models.BooleanField(default=False, help_text='Read/respond to messages')
    can_manage_yard_submissions = models.BooleanField(default=False, help_text='Review yard submissions')
    can_manage_settings = models.BooleanField(default=False, help_text='Change site-wide settings')
    can_manage_roles = models.BooleanField(default=False, help_text='Create roles, invite staff — Admin only')
    can_view_only = models.BooleanField(default=False, help_text='Read-only across all permitted modules')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rbac_staff_roles'
        ordering = ['name']

    def __str__(self):
        return self.name

    def to_permissions_dict(self):
        return {
            'can_manage_cms': self.can_manage_cms,
            'can_manage_vendors': self.can_manage_vendors,
            'can_manage_leads': self.can_manage_leads,
            'can_manage_ads': self.can_manage_ads,
            'can_manage_blog': self.can_manage_blog,
            'can_manage_messages': self.can_manage_messages,
            'can_manage_yard_submissions': self.can_manage_yard_submissions,
            'can_manage_settings': self.can_manage_settings,
            'can_manage_roles': self.can_manage_roles,
            'can_view_only': self.can_view_only,
        }


class StaffMember(models.Model):
    """
    Links an existing User to a StaffRole for admin portal access.
    Superusers bypass all RBAC checks — they always have full access.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='staff_profile'
    )
    role = models.ForeignKey(
        StaffRole,
        on_delete=models.PROTECT,
        related_name='members'
    )
    is_active = models.BooleanField(default=True)
    notes = models.CharField(max_length=255, blank=True)
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='invited_staff'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rbac_staff_members'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} [{self.role.name}]"

    @property
    def permissions(self):
        """Convenience: return the role's permission dict."""
        return self.role.to_permissions_dict()
