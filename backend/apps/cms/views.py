import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from .permissions import IsAdminOrStaff
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import SiteContent, MediaAsset
from .serializers import (
    SiteContentSerializer,
    SiteContentPublicSerializer,
    BulkUpdateSerializer,
    MediaAssetSerializer,
)

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# PUBLIC — read-only, no auth required
# GET /api/cms/content/?page=home  →  flat {section.key: value} map
# ─────────────────────────────────────────────────────────────────────────────
class PublicCMSView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = []  # Public read-only — exempt from rate limiting

    def get(self, request):
        # NOTE: we use 'cms_page' to avoid collision with DRF PageNumberPagination's '?page=' param
        page = request.query_params.get('cms_page', '') or request.query_params.get('page', '')
        if not page:
            return Response({'error': 'cms_page query param required'}, status=400)

        qs = SiteContent.objects.filter(page=page, is_active=True)
        # Return as nested dict: { section: { key: value } }
        result = {}
        for item in qs:
            section_data = result.setdefault(item.section, {})
            section_data[item.key] = item.value
        return Response(result)


# ─────────────────────────────────────────────────────────────────────────────
# ADMIN — full CRUD + bulk update
# ─────────────────────────────────────────────────────────────────────────────
class AdminCMSViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for all site content — admin only.
      GET    /api/cms/admin/content/            → list all
      POST   /api/cms/admin/content/            → create single entry
      GET    /api/cms/admin/content/{id}/       → retrieve
      PATCH  /api/cms/admin/content/{id}/       → update value
      DELETE /api/cms/admin/content/{id}/       → delete
      POST   /api/cms/admin/content/bulk/       → bulk update {updates: [{id, value}]}
      GET    /api/cms/admin/content/pages/      → list distinct pages
    """
    queryset = SiteContent.objects.all().order_by('page', 'section', 'key')
    serializer_class = SiteContentSerializer
    permission_classes = [IsAdminOrStaff]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        qs = super().get_queryset()
        # Use 'cms_page' to avoid collision with DRF's built-in '?page=' pagination param
        page = self.request.query_params.get('cms_page') or self.request.query_params.get('page')
        section = self.request.query_params.get('section')
        if page:
            qs = qs.filter(page=page)
        if section:
            qs = qs.filter(section=section)
        return qs

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=False, methods=['post'], url_path='bulk')
    def bulk_update(self, request):
        """Update multiple content fields in one request."""
        serializer = BulkUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        updates = serializer.validated_data['updates']
        updated_ids = []
        errors = []

        for update in updates:
            content_id = update.get('id')
            value = update.get('value', '')
            is_active = update.get('is_active', None)

            try:
                item = SiteContent.objects.get(pk=content_id)
                item.value = value
                if is_active is not None:
                    item.is_active = is_active
                item.updated_by = request.user
                item.save()
                updated_ids.append(content_id)
            except SiteContent.DoesNotExist:
                errors.append({'id': content_id, 'error': 'Not found'})

        return Response({
            'updated': len(updated_ids),
            'errors': errors,
            'updated_ids': updated_ids
        })

    @action(detail=False, methods=['get'], url_path='pages')
    def list_pages(self, request):
        """Return list of all distinct pages that have content entries."""
        pages = SiteContent.objects.values_list('page', flat=True).distinct()
        return Response(sorted(set(pages)))

    @action(detail=False, methods=['post'], url_path='seed')
    def seed_defaults(self, request):
        """
        Seed default CMS content for all pages.
        Safe to call multiple times — uses get_or_create.
        """
        from .default_content import DEFAULT_CMS_CONTENT
        created_count = 0
        for entry in DEFAULT_CMS_CONTENT:
            _, created = SiteContent.objects.get_or_create(
                page=entry['page'],
                section=entry['section'],
                key=entry['key'],
                defaults={
                    'value': entry.get('value', ''),
                    'content_type': entry.get('content_type', 'text'),
                    'label': entry.get('label', ''),
                }
            )
            if created:
                created_count += 1
        return Response({'seeded': created_count, 'message': f'Created {created_count} new entries'})


# ─────────────────────────────────────────────────────────────────────────────
# MEDIA MANAGER
# ─────────────────────────────────────────────────────────────────────────────
class AdminMediaViewSet(viewsets.ModelViewSet):
    """
    Upload + manage media assets for the CMS.
      GET    /api/cms/admin/media/          → list all
      POST   /api/cms/admin/media/          → upload new
      DELETE /api/cms/admin/media/{id}/     → delete
    """
    queryset = MediaAsset.objects.all()
    serializer_class = MediaAssetSerializer
    permission_classes = [IsAdminOrStaff]
    authentication_classes = [JWTAuthentication]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
