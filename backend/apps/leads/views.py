import csv
from django.http import HttpResponse  # type: ignore
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, permissions
from .models import Lead, VendorLead
from .serializers import LeadSerializer, VendorLeadSerializer


import logging

logger = logging.getLogger(__name__)
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import api_view

from rest_framework.throttling import ScopedRateThrottle

class VendorLeadViewSet(viewsets.ModelViewSet):
    throttle_scope = 'lead_submit'

    """
    API endpoint for vendor leads management.
    - POST (create): Public access (anyone can submit a vendor lead)
    - GET, PUT, PATCH, DELETE: Admin only access
    """
    queryset = VendorLead.objects.all().order_by('-created_at')  # type: ignore
    serializer_class = VendorLeadSerializer
    authentication_classes = [JWTAuthentication] # Explicitly add JWT Auth
    
    def get_permissions(self):
        """
        Allow public POST (create vendor lead), require admin for everything else
        """
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_throttles(self):
        """
        Only throttle the public 'create' endpoint to prevent spam.
        """
        if self.action == 'create':
            return [ScopedRateThrottle()]
        return []

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error listing Vendor Leads: {str(e)}", exc_info=True)
            return Response({"error": str(e)}, status=500)
    
    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """
        Export vendor leads to CSV file.
        """
        # Get filtered queryset
        queryset = self.get_queryset()
        
        # Apply search filter if provided
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                name__icontains=search
            ) | queryset.filter(
                email__icontains=search
            ) | queryset.filter(
                make__icontains=search
            )
        
        # Create CSV response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="vendor_leads_export.csv"'
        
        writer = csv.writer(response)
        
        # Write header
        writer.writerow([
            'ID',
            'Date Created',
            'Customer Name',
            'Email',
            'Phone',
            'State',
            'ZIP Code',
            'Year',
            'Make',
            'Model',
            'Inquiry Type'
        ])
        
        # Write data rows
        for lead in queryset:
            writer.writerow([
                lead.id,
                lead.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                lead.name,
                lead.email,
                lead.phone,
                lead.state or '',
                lead.zip or '',
                lead.year,
                lead.make,
                lead.model,
                getattr(lead, 'inquiry_type', 'General Vendor Inquiry')
            ])
        
        return response



class LeadViewSet(viewsets.ModelViewSet):
    throttle_scope = 'lead_submit'

    """
    API endpoint for leads management.
    - POST (create): Public access (anyone can submit a lead)
    - GET, PUT, PATCH, DELETE: Admin only access
    """
    queryset = Lead.objects.all().order_by('-created_at')  # type: ignore
    serializer_class = LeadSerializer
    authentication_classes = [JWTAuthentication] # Explicitly add JWT Auth
    
    def get_permissions(self):
        """
        Allow public POST (create lead), require admin for everything else
        """
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_throttles(self):
        """
        Only throttle the public 'create' endpoint to prevent spam.
        """
        if self.action == 'create':
            return [ScopedRateThrottle()]
        return []

    def perform_create(self, serializer):
        # 1. Save the initial lead (includes the frontend-supplied hollander_number)
        lead = serializer.save()
        logger.info(f"Saved Lead ID {lead.id} with Hollander '{lead.hollander_number}' | make={lead.make} part={lead.part} year={lead.year}")

        # 2. If hollander_number or options is missing/empty, resolve it server-side
        needs_hollander = not lead.hollander_number or lead.hollander_number in ('', 'Not Found', 'N/A', 'not found')
        needs_options = not lead.options or lead.options in ('', 'N/A')
        
        if needs_hollander or needs_options:
            try:
                from apps.hollander.models import HollanderInterchange, PartPricing, Make, PartType
                from django.db.models import Q  # type: ignore

                year = int(lead.year) if lead.year else 0
                make_name = (lead.make or '').strip()
                model_name = (lead.model or '').strip()
                part_name = (lead.part or '').strip()
                hollander = None
                options = None

                # Strategy 0: If frontend provided a hollander number, use it to get exact options
                if not needs_hollander:
                    pp = PartPricing.objects.filter(hollander_number__iexact=lead.hollander_number).first()  # type: ignore[attr-defined]
                    if pp:
                        hollander = pp.hollander_number
                        raw_opts = [
                            pp.option1, pp.option2, pp.option3, pp.option4, pp.option5,
                            pp.option6, pp.option7, pp.option8, pp.option9, pp.option10,
                            getattr(pp, 'option11', None)
                        ]
                        options = ', '.join(o for o in raw_opts if o and o.strip())

                # Strategy 1: PartPricing — match make name + model name + part name + year
                if not options and make_name and model_name and part_name and year:
                    # Clean up model name for search (e.g. "Silverado 1500" -> "1500", or just use icontains)
                    model_search = model_name
                    if ' ' in model_name:
                        model_search = model_name.split(' ')[-1] # Use last part of model name as it's usually the most specific (e.g. "1500" in "Silverado 1500")

                    pp = PartPricing.objects.filter(  # type: ignore[attr-defined]
                        make_ref__make_name__iexact=make_name,
                        model_ref__model_name__icontains=model_search,
                        part_type_ref__part_name__icontains=part_name.split(' - ')[0],
                        year_start__lte=year,
                        year_end__gte=year
                    ).first()

                    if pp and pp.hollander_number:
                        hollander = pp.hollander_number
                        # Collect all non-empty options from PartPricing
                        raw_opts = [
                            pp.option1, pp.option2, pp.option3, pp.option4, pp.option5,
                            pp.option6, pp.option7, pp.option8, pp.option9, pp.option10,
                            getattr(pp, 'option11', None)
                        ]
                        options = ', '.join(o for o in raw_opts if o and o.strip())

                # Strategy 2: HollanderInterchange — exact match
                if not hollander and make_name and part_name and year:
                    hi = HollanderInterchange.objects.filter(  # type: ignore[attr-defined]
                        make__iexact=make_name,
                        part_type__iexact=part_name,
                        year_start__lte=year,
                        year_end__gte=year
                    ).first()
                    if not hi:
                        hi = HollanderInterchange.objects.filter(  # type: ignore[attr-defined]
                            make__iexact=make_name,
                            part_type__icontains=part_name.split(' - ')[0],
                            year_start__lte=year,
                            year_end__gte=year
                        ).first()
                    if not hi:
                        hi = HollanderInterchange.objects.filter(  # type: ignore[attr-defined]
                            make__icontains=make_name.split()[0],
                            part_type__icontains=part_name.split(' - ')[0],
                            year_start__lte=year,
                            year_end__gte=year
                        ).first()
                    if hi and hi.hollander_number:
                        hollander = hi.hollander_number
                        options = hi.options or ''

                # Strategy 3: HollanderIndex — use idx_id directly
                if not hollander and year:
                    from apps.hollander.models import HollanderIndex
                    model_name_for_search = (lead.model or '').strip().upper()
                    make_name_for_search = make_name.upper().replace(' ', '-')
                    candidates = [
                        f"{make_name_for_search} {model_name_for_search}",
                        model_name_for_search,
                    ]
                    for candidate in candidates:
                        hi_idx = HollanderIndex.objects.filter(  # type: ignore[attr-defined]
                            model_nm__iexact=candidate,
                            begin_year__lte=year,
                            end_year__gte=year
                        ).first()
                        if hi_idx and hi_idx.idx_id:
                            hollander = hi_idx.idx_id
                            break

                # Persist resolved Hollander + options
                fields_to_update = []
                if hollander and needs_hollander:
                    lead.hollander_number = hollander
                    fields_to_update.append('hollander_number')
                    logger.info(f"Backend resolved Hollander for Lead {lead.id}: {hollander}")
                elif not lead.hollander_number:
                    logger.info(f"No Hollander found for Lead {lead.id}: make='{make_name}' part='{part_name}' year={year}")

                # Also update options if we need to and we found them
                if options and needs_options:
                    lead.options = options
                    fields_to_update.append('options')

                if fields_to_update:
                    lead.save(update_fields=fields_to_update)

            except Exception as e:
                logger.error(f"Backend Hollander resolution failed for lead {lead.id}: {e}")




        # 2. Send out SendGrid Email Notifications
        try:
            from django.core.mail import send_mail  # type: ignore
            from django.conf import settings  # type: ignore
            
            sender_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@junkyardsnearme.net')
            admin_email = getattr(settings, 'LEAD_NOTIFICATION_EMAIL', 'leads@junkyardsnearme.net')
            
            # --- EMAIL 1: Notify the JYNM Client/Admin ---
            admin_subject = f"NEW LEAD: {lead.year} {lead.make} {lead.model} - {lead.part}"
            admin_msg = f"New Lead # {lead.id} received!\n\n" \
                        f"Customer: {lead.name} ({lead.email})\n" \
                        f"Phone: {lead.phone}\nLocation: {lead.state} {lead.zip}\n\n" \
                        f"Vehicle: {lead.year} {lead.make} {lead.model}\nPart: {lead.part}\n" \
                        f"Hollander Assigned: {lead.hollander_number or 'None'}\n\n" \
                        f"Please login to the admin to action this lead."
            
            send_mail(
                subject=admin_subject,
                message=admin_msg,
                from_email=sender_email,
                recipient_list=[admin_email],
                fail_silently=True
            )

            # --- EMAIL 2: Confirmation Auto-Reply to the End-User ---
            user_subject = f"We've Received Your Part Request - {lead.year} {lead.make} {lead.model}!"
            user_msg = f"Hi {lead.name},\n\n" \
                       f"Thanks for using JYNM!\n" \
                       f"We have successfully received your request for a {lead.part} for your {lead.year} {lead.make} {lead.model}.\n\n" \
                       f"Our network of trusted salvage yards is currently reviewing your request. We will reach back out to you shortly with pricing and availability if a match is found.\n\n" \
                       f"Best Regards,\nThe JYNM Auto Parts Team"
            
            if lead.email:
                send_mail(
                    subject=user_subject,
                    message=user_msg,
                    from_email=sender_email,
                    recipient_list=[lead.email],
                    fail_silently=True
                )
            
            lead.notification_sent = True
            lead.save(update_fields=['notification_sent'])
            logger.info(f"Emails sent successfully for Lead ID {lead.id}")
            
        except Exception as e:
            logger.error(f"SendGrid email failure for lead {lead.id}: {str(e)}")

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error listing Leads: {str(e)}", exc_info=True)
            return Response({"error": str(e)}, status=500)
    
    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """
        Export leads to CSV file.
        """
        # Get filtered queryset
        queryset = self.get_queryset()
        
        # Apply search filter if provided
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                name__icontains=search
            ) | queryset.filter(
                email__icontains=search
            ) | queryset.filter(
                make__icontains=search
            )
        
        # Create CSV response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="leads_export.csv"'
        
        writer = csv.writer(response)
        
        # Write header
        writer.writerow([
            'ID',
            'Date Created',
            'Customer Name',
            'Email',
            'Phone',
            'Zipcode',
            'Year',
            'Make',
            'Model',
            'VIN',
            'Part Needed',
            'Options',
            'Hollander Number',
            'Condition',
            'Notes'
        ])
        
        # Write data rows
        for lead in queryset:
            writer.writerow([
                lead.id,
                lead.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                lead.name,
                lead.email,
                lead.phone,
                lead.zip or '',
                lead.year,
                lead.make,
                lead.model,
                getattr(lead, 'vin', '') or '',
                lead.part,
                getattr(lead, 'options', '') or '',
                getattr(lead, 'hollander_number', '') or '',
                getattr(lead, 'condition', '') or '',
                getattr(lead, 'notes', '') or ''
            ])
        
        return response


from django.http import JsonResponse  # type: ignore
from django.views.decorators.http import require_http_methods  # type: ignore
from django.views.decorators.csrf import csrf_exempt  # type: ignore
from apps.hollander.models import HollanderInterchange

@api_view(['POST'])
def resolve_hollander_questions(request):
    """
    Progressive Hollander Number disambiguation engine.
    
    Takes a vehicle/part selection + list of user answers so far,
    returns either:
      - The next question to ask (slot, type, values)
      - The resolved Hollander Number (if 1 candidate remains)
      - All remaining candidates (if no more questions possible)
    
    Algorithm:
    1. Fetch all PartPricing candidates for make+model+part+year
    2. Apply each user answer to filter candidates
    3. Analyze remaining candidates per option slot:
       - CONSTANT (1 unique value) → skip
       - PAIRED (X + "Without X") → YES/NO question
       - STANDALONE (N values, no Without pair) → multiple choice
    4. Return first unanswered question OR resolution
    """
    import json
    try:
        data = request.data
        make = (data.get('make') or '').strip()
        model = (data.get('model') or '').strip()
        part_name = (data.get('part_name') or '').strip()
        year = int(data.get('year') or 0)
        answers = data.get('answers') or []  # [{slot: int, value: str}, ...]

        if not (make and model and part_name and year):
            return Response({'error': 'make, model, part_name, year are required'}, status=400)

        from apps.hollander.models import PartPricing

        # Step 1: Fetch all candidates
        candidates = list(
            PartPricing.objects.filter(  # type: ignore[attr-defined]
                make=make, model=model, part_name=part_name,
                year_start__lte=year, year_end__gte=year
            )
        )

        if not candidates:
            # Try case-insensitive fallback
            candidates = list(
                PartPricing.objects.filter(  # type: ignore[attr-defined]
                    make__iexact=make,
                    model__iexact=model,
                    part_name__iexact=part_name,
                    year_start__lte=year, year_end__gte=year
                )
            )

        total_candidates = len(candidates)

        # Step 2: Apply each user answer to progressively filter
        answered_slots = set()
        for ans in answers:
            slot = int(ans.get('slot', 0))
            value = (ans.get('value') or '').strip()
            if slot and value:
                candidates = [
                    c for c in candidates
                    if getattr(c, f'option{slot}', '').strip() == value
                ]
                answered_slots.add(slot)

        remaining_hns = list(set(c.hollander_number for c in candidates))

        # Step 3: Build next question from remaining candidates
        def build_next_question(candidates, answered_slots):
            for j in range(1, 12):
                if j in answered_slots:
                    continue
                vals = [getattr(c, f'option{j}', '').strip() for c in candidates]
                unique_vals = sorted(set(v for v in vals if v))

                if not unique_vals or len(unique_vals) == 1:
                    continue  # Constant — skip

                # Detect Without-pairs
                paired = set()
                pairs = []
                standalone = []

                for v in unique_vals:
                    if v in paired:
                        continue
                    without_v = f'Without {v}'
                    if without_v in unique_vals:
                        pairs.append({'pos': v, 'neg': without_v})
                        paired.add(v)
                        paired.add(without_v)
                    elif not v.startswith('Without ') and v not in paired:
                        standalone.append(v)

                # Return the first meaningful question found
                if pairs:
                    pair = pairs[0]
                    # Build human-friendly question label
                    feature = pair['pos']
                    return {
                        'slot': j,
                        'type': 'yesno',
                        'feature': feature,
                        'question': f'Does your vehicle have {feature}?',
                        'yes_value': pair['pos'],
                        'no_value': pair['neg'],
                        'values': [pair['pos'], pair['neg']],
                        'all_pairs': pairs,   # expose all pairs for this slot
                    }
                if standalone:
                    return {
                        'slot': j,
                        'type': 'choice',
                        'feature': f'option{j}',
                        'question': 'Which of these applies to your vehicle?',
                        'values': standalone,
                    }
            return None

        next_q = build_next_question(candidates, answered_slots)

        # Build best-guess HN (first candidate after filtering)
        best_hn = candidates[0].hollander_number if candidates else ''
        best_options = ''
        if candidates:
            best_options = ', '.join(
                filter(None, [
                    getattr(candidates[0], f'option{j}', '').strip()
                    for j in range(1, 12)
                ])
            )

        return Response({
            'total_candidates': total_candidates,
            'candidates_count': len(remaining_hns),
            'resolved': remaining_hns[0] if len(remaining_hns) == 1 else None,
            'current_best_hn': best_hn,
            'current_best_options': best_options,
            'all_candidates': remaining_hns,
            'next_question': next_q,
            'answered_slots': list(answered_slots),
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET", "POST"])
def hollander_lookup(request):
    """
    Lookup Hollander interchange number based on vehicle details.
    Queries the HollanderInterchange table for matching records.
    Accepts: year, make, model, part_type (and their IDs)
    """
    # Handle both GET and POST requests
    if request.method == 'POST':
        import json
        try:
            data = json.loads(request.body)
            year = data.get('year', '')
            make = data.get('make', '')
            model = data.get('model', '')
            part_type = data.get('part_type', '')
        except:
            year = make = model = part_type = ''
    else:
        year = request.GET.get('year', '')
        make = request.GET.get('make', '')
        model = request.GET.get('model', '')
        part_type = request.GET.get('part_type', '')
    
    # Query the Hollander database
    try:
        year_int = int(year) if year else 0
        
        # Build query - match year range, make, model, and part type
        queryset = HollanderInterchange.objects.filter(  # type: ignore
            year_start__lte=year_int,
            year_end__gte=year_int,
            make__iexact=make,
            model__iexact=model,
            part_type__iexact=part_type
        )
        
        # Get first matching result
        result = queryset.first()
        
        if result:
            return JsonResponse({
                'results': [{
                    'hollander_number': result.hollander_number,
                    'options': result.options or '',
                    'year_start': result.year_start,
                    'year_end': result.year_end,
                    'make': result.make,
                    'model': result.model,
                    'part_type': result.part_type,
                    'notes': result.notes or ''
                }]
            })
        else:
            # No match found
            return JsonResponse({
                'results': [],
                'message': f'No Hollander number found for {year} {make} {model} - {part_type}'
            })
            
    except Exception as e:
        # Error during lookup
        return JsonResponse({
            'results': [],
            'error': str(e),
            'message': 'Error looking up Hollander number'
        })

