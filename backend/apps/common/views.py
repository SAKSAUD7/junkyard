from rest_framework import viewsets, permissions, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.hollander.models import Make, Model, PartType, State
from .models import ContactMessage, Feedback
from .serializers import (
    MakeSerializer, ModelSerializer, PartSerializer,
    StateSerializer, ContactMessageSerializer, FeedbackSerializer
)


class MakeViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for vehicle makes"""
    queryset = Make.objects.all()  # type: ignore[attr-defined]
    serializer_class = MakeSerializer


class ModelViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for vehicle models"""
    queryset = Model.objects.all()  # type: ignore[attr-defined]
    serializer_class = ModelSerializer

    def get_queryset(self):
        queryset = Model.objects.all()  # type: ignore[attr-defined]
        
        # Filter by makeID if provided (frontend uses camelCase)
        make_id = self.request.query_params.get('makeID', None) or self.request.query_params.get('make_id', None)  # type: ignore[union-attr]
        if make_id:
            queryset = queryset.filter(make__make_id=make_id)
        
        return queryset


class PartViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for auto parts"""
    queryset = PartType.objects.all()  # type: ignore[attr-defined]
    serializer_class = PartSerializer


class StateViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for states"""
    queryset = State.objects.all()  # type: ignore[attr-defined]
    serializer_class = StateSerializer


class ContactMessageViewSet(viewsets.ModelViewSet):
    """
    API endpoint for contact messages.
    POST: Public (AllowAny)
    GET/PUT/DELETE: Admin only (IsAdminUser)
    """
    queryset = ContactMessage.objects.all()  # type: ignore[attr-defined]
    serializer_class = ContactMessageSerializer
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'create':
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]
    
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark a message as read"""
        message = self.get_object()
        message.is_read = True
        message.save()
        return Response({'status': 'Message marked as read'})
    
    @action(detail=True, methods=['post'])
    def mark_as_unread(self, request, pk=None):
        """Mark a message as unread"""
        message = self.get_object()
        message.is_read = False
        message.save()
        return Response({'status': 'Message marked as unread'})
    
    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """Delete multiple messages"""
        ids = request.data.get('ids', [])
        if not ids:
            return Response({'error': 'No IDs provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        deleted_count = ContactMessage.objects.filter(id__in=ids).delete()[0]  # type: ignore[attr-defined]
        return Response({'status': f'{deleted_count} messages deleted'})


class FeedbackViewSet(viewsets.ModelViewSet):
    """
    API endpoint for global feedback.
    POST: Public (AllowAny)
    GET/PUT/DELETE: Admin only (IsAdminUser)
    """
    queryset = Feedback.objects.all()  # type: ignore[attr-defined]
    serializer_class = FeedbackSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(status='unread')



from rest_framework.response import Response
from rest_framework.views import APIView
from apps.leads.models import Lead
from apps.hollander.models import Vendor
from apps.ads.models import Advertisement

class SiteStatsView(APIView):
    """
    Public endpoint for homepage stats.
    Returns live counts: vendors, states covered, parts listed.
    Results are cached for 5 minutes to avoid repeated DB hits.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = []  # Public cached read-only — exempt from rate limiting

    def get(self, request):
        from django.core.cache import cache
        from apps.hollander.models import Vendor, YardPart

        cache_key = 'site_stats_public'
        stats = None
        try:
            stats = cache.get(cache_key)
        except Exception:
            pass

        if stats is None:
            active_vendors = Vendor.objects.filter(is_active=True).count()  # type: ignore[attr-defined]

            # Count distinct states that have at least one active vendor
            states_covered = (
                Vendor.objects.filter(is_active=True)  # type: ignore[attr-defined]
                .values('state')
                .exclude(state__isnull=True)
                .exclude(state__exact='')
                .distinct()
                .count()
            )

            # Total parts listed across all yards
            try:
                parts_listed = YardPart.objects.count()  # type: ignore[attr-defined]
            except Exception:
                parts_listed = 0

            stats = {
                'vendors_count': active_vendors,
                'states_covered': states_covered,
                'parts_listed': parts_listed,
                # Savings % is a fixed marketing metric, not data-driven
                'savings_percent': 80,
            }
            try:
                cache.set(cache_key, stats, 300)  # cache for 5 minutes
            except Exception:
                pass

        return Response(stats)
        
class CityListView(APIView):
    """
    Returns a distinct list of cities where active vendors are located.
    Optionally filter by ?state=XX to get cities in a specific state.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from apps.hollander.models import Vendor
        state = request.query_params.get('state', None)
        cities = (
            Vendor.objects.filter(is_active=True)  # type: ignore[attr-defined]
            .values_list('city', flat=True)
            .exclude(city__isnull=True)
            .exclude(city__exact='')
        )
        if state:
            cities = cities.filter(state__iexact=state)
        cities = cities.distinct().order_by('city')
        return Response(list(cities))



class AdminStatsView(APIView):

    """
    Returns statistics for the admin dashboard.
    Only accessible by admins.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from django.db.models import Count
        from datetime import datetime, timedelta
        from django.core.cache import cache
        
        # Basic stats with optimized queries
        total_leads = Lead.objects.count()  # type: ignore[attr-defined]
        new_leads = Lead.objects.filter(status='new').count()  # type: ignore[attr-defined]
        
        # Cache total vendor count for 5 minutes to avoid repeated full table scans
        # Wrap in try-except in case cache backend is not configured
        total_vendors = None
        try:
            total_vendors = cache.get('total_vendors_count')
        except Exception as e:
            print(f"Cache get failed: {e}")
            
        if total_vendors is None:
            total_vendors = Vendor.objects.count()  # type: ignore[attr-defined]
            try:
                cache.set('total_vendors_count', total_vendors, 300)  # 5 minutes
            except Exception as e:
                print(f"Cache set failed: {e}")
        
        active_vendors = Vendor.objects.filter(is_active=True).count()  # type: ignore[attr-defined]
        total_ads = Advertisement.objects.count()  # type: ignore[attr-defined]
        active_ads = Advertisement.objects.filter(is_active=True).count()  # type: ignore[attr-defined]
        unread_messages = ContactMessage.objects.filter(is_read=False).count()  # type: ignore[attr-defined]
        
        # Vendor distribution by state (top 10) - use only active vendors
        vendor_distribution = (
            Vendor.objects.filter(is_active=True)  # type: ignore[attr-defined]
            .values('state')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )
        
        # Recent leads trend - dynamic days
        try:
            days = int(request.query_params.get('days', 7))
            if days <= 0 or days > 90:
                days = 7
        except ValueError:
            days = 7
            
        start_date = datetime.now() - timedelta(days=days)
        recent_leads_qs = (
            Lead.objects.filter(created_at__gte=start_date)  # type: ignore[attr-defined]
            .values('created_at__date')
            .annotate(count=Count('id'))
            .order_by('created_at__date')
        )
        
        # Format recent leads for chart — real daily counts
        leads_trend = []
        for i in range(days):
            date = (datetime.now() - timedelta(days=(days - 1)-i)).date()
            count = next((item['count'] for item in recent_leads_qs if item['created_at__date'] == date), 0)
            leads_trend.append({
                'date': date.strftime('%Y-%m-%d'),
                'name': date.strftime('%b %d'),  # Jun 24, Jun 25, etc.
                'leads': count
            })
        
        # Recent activity — last 5 leads with full contact fields
        recent_activity = list(
            Lead.objects.order_by('-created_at')[:5].values(  # type: ignore[attr-defined]
                'id', 'name', 'email', 'make', 'model', 'year', 'part', 'lead_type', 'created_at', 'status'
            )
        )

        # Top vendors by number of leads assigned to them
        top_vendors_by_leads = list(
            Vendor.objects  # type: ignore[attr-defined]
            .filter(is_active=True, leads__isnull=False)
            .annotate(lead_count=Count('leads'))
            .order_by('-lead_count')
            .values('id', 'name', 'city', 'state', 'lead_count')[:5]
        )

        # Lead type distribution — real breakdown for donut chart
        lead_type_dist = (
            Lead.objects  # type: ignore[attr-defined]
            .values('lead_type')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        lead_type_distribution = [
            {'name': item['lead_type'].replace('_', ' ').title(), 'value': item['count']}
            for item in lead_type_dist
        ]
        
        return Response({
            "total_leads": total_leads,
            "new_leads": new_leads,
            "active_vendors": active_vendors,
            "total_vendors": total_vendors,
            "total_ads": total_ads,
            "active_ads": active_ads,
            "unread_messages": unread_messages,
            "vendor_distribution": list(vendor_distribution),
            "leads_trend": leads_trend,
            "recent_activity": recent_activity,
            "top_vendors_by_leads": top_vendors_by_leads,
            "lead_type_distribution": lead_type_distribution,
        })




# ==========================================
# MIGRATION UTILITY VIEW
# ==========================================

class UploadAndMigrateLeadDataView(APIView):
    """
    Endpoint to upload db.sqlite3 and migrate lead data (Make, Model, Part, State)
    to the current active database (Azure SQL).
    """
    permission_classes = [permissions.AllowAny]
    parser_classes = [parsers.MultiPartParser]

    def post(self, request, format=None):
        from django.conf import settings
        
        import os
        MIGRATION_SECRET = os.environ.get('MIGRATION_SECRET', '')
        if not MIGRATION_SECRET:
            return Response({'error': 'Migration not configured'}, status=403)
            
        secret = request.headers.get('X-Migration-Secret')
        if secret != MIGRATION_SECRET:
            return Response({'error': 'Unauthorized'}, status=403)

        import sqlite3
        import os
        import tempfile
        from apps.hollander.models import Make, Model, PartType, State
        
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file provided'}, status=400)
            
        # Save uploaded file to temp (handle .gz)
        is_gz = file_obj.name.endswith('.gz')
        suffix = '.gz' if is_gz else '.sqlite3'
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
            for chunk in file_obj.chunks():
                tmp_file.write(chunk)
            tmp_path = tmp_file.name
            
        final_db_path = tmp_path
        
        try:
            # Decompress if needed
            if is_gz:
                import gzip
                import shutil
                with gzip.open(tmp_path, 'rb') as f_in:
                    with tempfile.NamedTemporaryFile(delete=False, suffix='.sqlite3') as tmp_out:
                        shutil.copyfileobj(f_in, tmp_out)
                        final_db_path = tmp_out.name
                os.remove(tmp_path) # Remove gz file

            conn = sqlite3.connect(final_db_path)
            cursor = conn.cursor()
            
            stats = {
                'makes': {'found': 0, 'created': 0},
                'models': {'found': 0, 'created': 0},
                'parts': {'found': 0, 'created': 0},
                'states': {'found': 0, 'created': 0},
            }
            
            # 1. Migrate Makes
            try:
                cursor.execute("SELECT make_id, make_name FROM hollander_make")
                rows = cursor.fetchall()
                stats['makes']['found'] = len(rows)
                
                for row in rows:
                    _, created = Make.objects.get_or_create(  # type: ignore[attr-defined]
                        make_id=row[0],
                        defaults={'make_name': row[1]}
                    )
                    if created: stats['makes']['created'] += 1
            except Exception as e:
                print(f"Make migration error: {e}")

            # 2. Migrate States (Prerequisite for zipcodes/filtering)
            try:
                cursor.execute("SELECT state_code, name, country_id FROM hollander_state")
                rows = cursor.fetchall()
                stats['states']['found'] = len(rows)
                
                for row in rows:
                    _, created = State.objects.get_or_create(  # type: ignore[attr-defined]
                        state_code=row[0],
                        defaults={
                            'name': row[1],
                            'country_id': row[2] if len(row) > 2 else 1
                        }
                    )
                    if created: stats['states']['created'] += 1
            except Exception as e:
                print(f"State migration error: {e}")

            # 3. Migrate Part Types
            try:
                cursor.execute("SELECT part_id, part_name FROM hollander_part_type")
                rows = cursor.fetchall()
                stats['parts']['found'] = len(rows)
                
                for row in rows:
                    _, created = PartType.objects.get_or_create(  # type: ignore[attr-defined]
                        part_id=row[0],
                        defaults={'part_name': row[1]}
                    )
                    if created: stats['parts']['created'] += 1
            except Exception as e:
                print(f"Part migration error: {e}")

            # 4. Migrate Models (Batching for performance)
            try:
                cursor.execute("SELECT model_id, make_id, model_name FROM hollander_model")
                rows = cursor.fetchall()
                stats['models']['found'] = len(rows)
                
                batch_size = 500
                objs = []
                existing_ids = set(Model.objects.values_list('model_id', flat=True))  # type: ignore[attr-defined]
                
                for row in rows:
                    m_id = row[0]
                    if m_id not in existing_ids:
                        objs.append(Model(
                            model_id=m_id,
                            make_id=row[1],
                            model_name=row[2]
                        ))
                        
                        if len(objs) >= batch_size:
                            Model.objects.bulk_create(objs)  # type: ignore[attr-defined]
                            objs = []
                
                if objs:
                    Model.objects.bulk_create(objs)  # type: ignore[attr-defined]
                    
                # Re-count to get created approximate (or just check count diff)
                stats['models']['created'] = Model.objects.count() - len(existing_ids)  # type: ignore[attr-defined]
                
            except Exception as e:
                print(f"Model migration error: {e}")
                
            conn.close()
            os.remove(tmp_path)
            
            return Response({'status': 'Migration Complete', 'stats': stats})
            
        except Exception as e:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
            return Response({'error': str(e)}, status=500)

# ==========================================
# SEO & SITEMAP UTILITY VIEW
# ==========================================

from django.http import HttpResponse

class SitemapView(APIView):
    """
    Dynamically generates the sitemap.xml for SEO indexing.
    Returns valid XML containing static routes, state browse pages,
    dynamic Vendor profiles, and published blog posts.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = []  # Exempt — Googlebot must never get rate-limited on sitemap

    def get(self, request):
        from apps.hollander.models import Vendor
        import xml.etree.ElementTree as ET
        from datetime import datetime, timezone

        urlset = ET.Element('urlset', xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")

        base_url = 'https://junkyardsnearme.com'
        today = datetime.now(timezone.utc).strftime('%Y-%m-%d')

        def add_url(path, priority='0.8', changefreq='weekly', lastmod=None):
            url_node = ET.SubElement(urlset, 'url')
            ET.SubElement(url_node, 'loc').text = f"{base_url}{path}"
            ET.SubElement(url_node, 'changefreq').text = changefreq
            ET.SubElement(url_node, 'priority').text = priority
            ET.SubElement(url_node, 'lastmod').text = lastmod or today

        # ── Static pages ──────────────────────────────────────────────────────
        add_url('/', priority='1.0', changefreq='daily')
        add_url('/browse', priority='0.9', changefreq='daily')
        add_url('/search', priority='0.8', changefreq='weekly')
        add_url('/faq', priority='0.7', changefreq='monthly')
        add_url('/about', priority='0.6', changefreq='monthly')
        add_url('/contact', priority='0.6', changefreq='monthly')
        add_url('/how-it-works', priority='0.6', changefreq='monthly')
        add_url('/terms', priority='0.4', changefreq='yearly')
        add_url('/privacy', priority='0.4', changefreq='yearly')
        add_url('/add-a-yard', priority='0.6', changefreq='monthly')
        add_url('/blog', priority='0.8', changefreq='daily')

        # ── State browse pages (high-value local search traffic) ──────────────
        US_STATES = [
            'al', 'ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga',
            'hi', 'id', 'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md',
            'ma', 'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj',
            'nm', 'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc',
            'sd', 'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy',
            'dc'
        ]
        for state in US_STATES:
            add_url(f'/browse/{state}', priority='0.9', changefreq='weekly')

        # ── Active Vendor / Junkyard profile pages ────────────────────────────
        try:
            active_vendors = Vendor.objects.filter(is_active=True).values('id', 'updated_at')  # type: ignore[attr-defined]
            for vendor in active_vendors:
                lastmod = vendor.get('updated_at')
                lastmod_str = lastmod.strftime('%Y-%m-%d') if lastmod else today
                add_url(f"/junkyard/{vendor['id']}", priority='0.7', changefreq='monthly', lastmod=lastmod_str)
        except Exception as e:
            print(f"Sitemap vendor resolution error: {e}")

        # ── Published blog posts ──────────────────────────────────────────────
        try:
            from apps.blog.models import BlogPost
            published_posts = BlogPost.objects.filter(status='published').values('slug', 'updated_at', 'published_at')  # type: ignore[attr-defined]
            for post in published_posts:
                lastmod = post.get('updated_at') or post.get('published_at')
                lastmod_str = lastmod.strftime('%Y-%m-%d') if lastmod else today
                add_url(f"/blog/{post['slug']}", priority='0.7', changefreq='weekly', lastmod=lastmod_str)
        except Exception as e:
            print(f"Sitemap blog resolution error: {e}")

        # Generate XML
        xml_str = ET.tostring(urlset, encoding='utf-8', method='xml')
        xml_declaration = b'<?xml version="1.0" encoding="UTF-8"?>\n'

        return HttpResponse(xml_declaration + xml_str, content_type='application/xml')


