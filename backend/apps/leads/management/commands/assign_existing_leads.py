"""
Management command to assign existing leads to vendors
"""

from django.core.management.base import BaseCommand
from apps.leads.models import Lead
from apps.leads.utils import assign_lead_to_vendors


class Command(BaseCommand):
    help = 'Assign all existing leads to active vendors'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without making changes',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        # Get all leads without vendor assignments
        unassigned_leads = Lead.objects.filter(assigned_vendors__isnull=True)
        total_leads = unassigned_leads.count()
        
        if total_leads == 0:
            self.stdout.write(self.style.SUCCESS('No unassigned leads found.'))
            return
        
        self.stdout.write(f'Found {total_leads} unassigned leads.')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN - No changes will be made'))
        
        assigned_count = 0
        for lead in unassigned_leads:
            if not dry_run:
                vendor_count = assign_lead_to_vendors(lead)
                self.stdout.write(
                    f'  ✓ Assigned lead #{lead.id} ({lead.year} {lead.make} {lead.model}) '
                    f'to {vendor_count} vendor(s)'
                )
                assigned_count += 1
            else:
                self.stdout.write(
                    f'  Would assign lead #{lead.id} ({lead.year} {lead.make} {lead.model})'
                )
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(f'\nDRY RUN: Would assign {total_leads} leads')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'\n✓ Successfully assigned {assigned_count} leads to vendors')
            )
