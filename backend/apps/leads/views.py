from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from datetime import datetime
from .models import Lead
from .serializers import LeadSerializer


class LeadViewSet(viewsets.ModelViewSet):
    """
    API endpoint for lead submissions
    """
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    
    def create(self, request, *args, **kwargs):
        """Create a new lead and send CRM email in exact legacy format"""
        data = request.data
        
        # Extract data
        name = data.get('name', '')
        email = data.get('email', '')
        phone = data.get('phone', '')
        state = data.get('state', '')
        zip_code = data.get('zip', '')
        year = data.get('year', '')
        make = data.get('make', '')
        model = data.get('model', '')
        part = data.get('part', '')
        options = data.get('options', '')
        hollander_number = data.get('hollander_number', '')
        
        # Save lead to database
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Generate email in EXACT legacy format
        email_subject = "QAJ Lead"
        
        # Match exact format from legacy system
        email_body = f"""Requested InformationMail Sent on:Mail Sent on {datetime.now().strftime('%m/%d/%Y %I:%M %p')} CST
Name:{name}
Email Address:{email}
Phone:{phone}
State:{state}
Zip:{zip_code}
Year:{year}
Make:{make}
Model:{model}
Part:{part}
Options: {options}
Hollander#: {hollander_number}"""
        
        # Send email to CRM
        try:
            send_mail(
                subject=email_subject,
                message=email_body,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'sales@qualityautoparts.com'),
                recipient_list=[getattr(settings, 'CRM_EMAIL', 'admin@example.com')],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Email sending error: {e}")
            # Continue even if email fails
        
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )


@api_view(['POST'])
def hollander_lookup(request):
    """
    Look up Hollander number based on vehicle and part
    
    Robust lookup strategy:
    1. Try exact match (Year, Make, Model, Part ID/Name)
    2. Try fuzzy match (Tokenized Part Name)
    3. Return real data or nothing (No Mock Data)
    """
    from apps.hollander.models import HollanderInterchange, PartPricing
    from django.db.models import Q
    
    data = request.data
    year = data.get('year')
    make = data.get('make', '')
    model = data.get('model', '')
    part_type = data.get('part_type', '')
    
    # IDs from frontend (if available)
    part_id = data.get('part_id')
    make_id = data.get('make_id')
    
    if not year or not make or not model:
        return Response({'count': 0, 'results': []}, status=status.HTTP_200_OK)

    # Base Query: Year range + Make + Model
    # We use Q objects for flexibility
    # Note: Make matching is usually robust via iexact
    # Model matching uses icontains because 'A8' matches 'A8 Quattro' etc.
    base_query = Q(
        year_start__lte=year, 
        year_end__gte=year, 
        make__iexact=make,
        model__icontains=model
    )
    
    records = HollanderInterchange.objects.none()
    
    # STRATEGY 1: Part ID Match (Most Robust)
    if part_id:
        # HollanderInterchange 'part_type_number' stores the ID
        # Convert to string just in case
        id_query = base_query & Q(part_type_number=str(part_id))
        records = HollanderInterchange.objects.filter(id_query).order_by('hollander_number')
        
    # STRATEGY 2: Exact Name Match (If ID failed or not provided)
    if not records.exists() and part_type:
        name_query = base_query & Q(part_type__iexact=part_type)
        records = HollanderInterchange.objects.filter(name_query).order_by('hollander_number')
        
    # STRATEGY 3: Fuzzy Token Match (splitting words)
    if not records.exists() and part_type:
        # Split "Air Injection Pump" -> ["Air", "Injection", "Pump"]
        tokens = [t for t in part_type.split() if len(t) > 2] # Ignore short words
        if tokens:
            fuzzy_query = base_query
            for token in tokens:
                fuzzy_query &= Q(part_type__icontains=token)
            
            records = HollanderInterchange.objects.filter(fuzzy_query).order_by('hollander_number')

    # Limit results
    hollander_records = records[:10]
    
    if hollander_records.exists():
        results = []
        for record in hollander_records:
            # Look up pricing/options data
            options_text = ''
            try:
                pricing = PartPricing.objects.filter(hollander_number=record.hollander_number).first()
                if not pricing:
                     # Try alternative formats (e.g. remove dashes)
                     clean_num = record.hollander_number.replace('-', '')
                     if clean_num != record.hollander_number:
                         pricing = PartPricing.objects.filter(hollander_number=clean_num).first()
                         
                if pricing:
                    options_text = pricing.get_all_options()
            except Exception:
                pass
            
            # If no options in pricing, check the record itself
            if not options_text:
                options_text = record.options

            results.append({
                'hollander_number': record.hollander_number,
                'options': options_text,
                'part_type': record.part_type,
                'year_start': record.year_start,
                'year_end': record.year_end,
                'make': record.make,
                'model': record.model
            })
        
        return Response({
            'count': len(results),
            'results': results
        }, status=status.HTTP_200_OK)
    
    else:
        # RETURN EMPTY if not found (No Mock Data)
        return Response({
            'count': 0,
            'results': []
        }, status=status.HTTP_200_OK)

