from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from datetime import datetime
from .models import Lead
from .serializers import LeadSerializer
from apps.hollander.models import PartPricing, Make, Model, PartType, HollanderMakeModelRef, HollanderPartRef, HollanderIndex
from django.db.models import Q

class LeadViewSet(viewsets.ModelViewSet):
    """
    API endpoint for lead submissions
    """
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    
    def create(self, request, *args, **kwargs):
        """Create a new lead and send CRM email in exact legacy format"""
        data = request.data
        
        # 0. Basic Validation
        required_fields = ['make', 'model', 'part', 'year', 'name', 'phone', 'email']
        for field in required_fields:
            if not data.get(field):
                 return Response({'error': f'Missing required field: {field}'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Save to DB
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # 2. Send Email Notification using HTML Template
        try:
            from django.template.loader import render_to_string
            from django.core.mail import EmailMultiAlternatives
            from django.utils import timezone
            
            # Prepare context for email template
            context = {
                'lead': serializer.instance,
                'from_email': settings.DEFAULT_FROM_EMAIL,
                'sent_date': timezone.now().strftime('%m/%d/%Y %I:%M %p CST'),
            }
            
            # Render HTML and plain text versions
            html_content = render_to_string('emails/lead_notification.html', context)
            text_content = render_to_string('emails/lead_notification.txt', context)
            
            # Create email with both HTML and plain text
            subject = f"New Lead: {data['year']} {data['make']} {data['model']} - {data['part']}"
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[settings.LEAD_NOTIFICATION_EMAIL],
            )
            email.attach_alternative(html_content, "text/html")
            email.send(fail_silently=False)
            
        except Exception as e:
            # Log error but don't fail the lead creation
            print(f"Email sending failed: {str(e)}")

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


@api_view(['POST'])
def hollander_lookup(request):
    """
    Get Pricing/Hollander Information.
    Unified Logic: Matches get_years/get_parts perfectly.
    """
    data = request.data
    year = data.get('year')
    make_id = data.get('make_id')
    model_id = data.get('model_id')
    part_id = data.get('part_id')
    
    # Text fallbacks
    make_str = data.get('make')
    model_str = data.get('model')
    part_str = data.get('part_type') or data.get('part')

    if not year:
        return Response({'error': 'Year is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Safe Wrapper to catch crashes and return readable error
    try:
        # Import Helper Locally
        from apps.hollander.views import query_catalog_index
        
        # ---------------------------
        # ROBUST ID PARSING (Match get_years)
        # ---------------------------
        if str(make_id) and not str(make_id).isdigit():
            m = Make.objects.filter(make_name__iexact=str(make_id)).first()
            if m: make_id = m.make_id
        if str(model_id) and not str(model_id).isdigit():
            m = Model.objects.filter(model_name__iexact=str(model_id)).first()
            if m: model_id = m.model_id
        
        make_id = int(make_id) if make_id else None
        model_id = int(model_id) if model_id else None
        
        # Resolve Part ID from Name if needed try to find by Name
        if part_str and not part_id:
             p = PartType.objects.filter(part_name__iexact=part_str).first()
             if p: part_id = p.part_id

        # ---------------------------
        # STRATEGY 1: INVENTORY CHECK (Enhanced)
        # ---------------------------
        records = PartPricing.objects.none()

        # A. ID-based Match (Most Precise)
        if make_id and model_id:
            records = PartPricing.objects.filter(
                make_ref__make_id=make_id,
                model_ref__model_id=model_id,
                year_start__lte=year,
                year_end__gte=year
            )
            # Part Filter
            if part_id:
                records = records.filter(part_type_ref__part_id=part_id)
            elif part_str:
                # Try exact first, then contains
                exact_part = records.filter(part_name__iexact=part_str)
                if exact_part.exists():
                    records = exact_part
                else:
                    records = records.filter(part_name__icontains=part_str)

        # B. String Match Fallback (Legacy) - Try Multiple Variations
        if not records.exists() and (make_str or model_str):
            query = Q(year_start__lte=year) & Q(year_end__gte=year)
            if make_str: query &= Q(make__iexact=make_str)
            if model_str: 
                # Try exact first
                exact_model = PartPricing.objects.filter(query, model__iexact=model_str)
                if exact_model.exists():
                    records = exact_model
                else:
                    query &= Q(model__icontains=model_str)
            
            if part_str: 
                # Try exact first
                if records.exists():
                    exact_part = records.filter(part_name__iexact=part_str)
                    if exact_part.exists():
                        records = exact_part
                    else:
                        records = records.filter(part_name__icontains=part_str)
                else:
                    query &= Q(part_name__icontains=part_str)
                    records = PartPricing.objects.filter(query)

        # PROCESS INVENTORY RESULTS (Success Path)
        if records.exists():
            results = []
            seen = set()
            for r in records[:15]:
                if r.hollander_number in seen: continue
                seen.add(r.hollander_number)
                
                options_text = r.get_all_options()
                if not options_text: options_text = "Standard Option"

                results.append({
                    'hollander_number': r.hollander_number,
                    'description': f"{r.year_start}-{r.year_end} {r.model} {r.part_name}",
                    'options': options_text,
                    'source': 'Inventory',
                    'price': float(r.new_price or 0)
                })
            return Response({'count': len(results), 'results': results})

        # ---------------------------
        # STRATEGY 2: CATALOG FALLBACK (Unified Engine)
        # ---------------------------
        catalog_results = []
        
        # 1. Get VALID CODES for this Year/Model
        # This returns the codes that get_parts used to find the names.
        _, valid_codes = query_catalog_index(make_id, model_id, year=year)
        
        if valid_codes and (part_str or part_id):
            # 2. Filter Codes by the User's Selection
            # We need to map the User's Part (Name/ID) -> Catalog Codes
            target_codes = set()
            
            # Get Candidate Names from User Selection
            target_name = part_str
            if not target_name and part_id:
                p = PartType.objects.filter(part_id=part_id).first()
                if p: target_name = p.part_name
            
            if target_name:
                # Reverse Fuzzy Match: Find which HollanderPartRef matches this Name
                
                # A. Exact Name Match in Ref
                exact_refs = HollanderPartRef.objects.filter(part_name__iexact=target_name, part_code__in=valid_codes)
                for r in exact_refs: target_codes.add(r.part_code)
                
                # B. "Part Type" in "Ref Name" (Target in Ref)
                # e.g. Target="Engine" -> Ref="Engine Assembly"
                if not target_codes:
                    contains_refs = HollanderPartRef.objects.filter(part_name__icontains=target_name, part_code__in=valid_codes)
                    for r in contains_refs: target_codes.add(r.part_code)

                # C. "Ref Name" in "Part Type" (Ref in Target) - NEW STRATEGY
                # e.g. Target="Air Cleaner Engine" -> Ref="Air Cleaner"
                if not target_codes:
                    # Filter for substring match
                    potential_refs = HollanderPartRef.objects.filter(part_code__in=valid_codes)
                    for r in potential_refs:
                        if r.part_name and r.part_name.lower() in target_name.lower():
                             target_codes.add(r.part_code)
                    
            # 3. Query Index with Targeted Codes
            if target_codes:
                # Resolve Model Ref logic same as Helper but we need Ref ID
                model_obj = Model.objects.filter(model_id=model_id).first()
                keys_to_try = [model_obj.model_name]
                ref = HollanderMakeModelRef.objects.filter(h_model__iexact=model_obj.model_name).first()
                if not ref: ref = HollanderMakeModelRef.objects.filter(h_model__icontains=model_obj.model_name).first()
                if ref: 
                    keys_to_try.append(str(ref.ref_id))
                    keys_to_try.append(ref.h_model)
                
                for code in target_codes:
                    matches = HollanderIndex.objects.filter(
                        model_nm__in=keys_to_try,
                        part_type_nbr=code,
                        begin_year__lte=year,
                        end_year__gte=year
                    )[:10]  # Get more results
                    
                    for idx in matches:
                        # Try to find actual Hollander number from PartPricing using idx_id
                        # The idx_id might correspond to a Hollander interchange group
                        
                        # Strategy 1: Look for PartPricing with similar part code
                        pricing_match = PartPricing.objects.filter(
                            hollander_number__startswith=f"{code}-"
                        ).first()
                        
                        if pricing_match:
                            # Use real Hollander number from PartPricing
                            hollander_num = pricing_match.hollander_number
                            options_text = pricing_match.get_all_options() or "Standard Option"
                        else:
                            # Generate Hollander-style number from catalog
                            # Format: PartCode-IDXID (e.g., "100-01460")
                            hollander_num = f"{code}-{idx.idx_id}"
                            options_text = "Catalog Item - Call for Compatibility"
                        
                        catalog_results.append({
                            'hollander_number': hollander_num,
                            'description': f"{idx.begin_year}-{idx.end_year} {model_obj.model_name if model_obj else 'Vehicle'}",
                            'options': options_text,
                            'source': 'Catalog (Interchange)' if not pricing_match else 'Inventory (via Catalog)',
                            'message': 'Please call to verify compatibility and availability.',
                            'price': 0
                        })
                        
        if catalog_results:
            return Response({'count': len(catalog_results), 'results': catalog_results})

        return Response({'count': 0, 'results': []})
        
        # ---------------------------
        # ROBUST ID PARSING (Match get_years)
        # ---------------------------
        if str(make_id) and not str(make_id).isdigit():
            m = Make.objects.filter(make_name__iexact=str(make_id)).first()
            if m: make_id = m.make_id
        if str(model_id) and not str(model_id).isdigit():
            m = Model.objects.filter(model_name__iexact=str(model_id)).first()
            if m: model_id = m.model_id
        
        make_id = int(make_id) if make_id else None
        model_id = int(model_id) if model_id else None
        
        # Resolve Part ID from Name if needed try to find by Name
        if part_str and not part_id:
             p = PartType.objects.filter(part_name__iexact=part_str).first()
             if p: part_id = p.part_id
             
        print(f"DEBUG: Resolved IDs - Make:{make_id} Model:{model_id} Part:{part_id}")

        # ---------------------------
        # STRATEGY 1: INVENTORY CHECK
        # ---------------------------
        records = PartPricing.objects.none()

        if make_id and model_id:
            records = PartPricing.objects.filter(
                make_ref__make_id=make_id,
                model_ref__model_id=model_id,
                year_start__lte=year,
                year_end__gte=year
            )
            # Part Filter
            if part_id:
                records = records.filter(part_type_ref__part_id=part_id)
            elif part_str:
                records = records.filter(part_name__icontains=part_str)

        # B. String Match Fallback (Legacy)
        if not records.exists() and (make_str or model_str):
            query = Q(year_start__lte=year) & Q(year_end__gte=year)
            if make_str: query &= Q(make__iexact=make_str)
            if model_str: query &= Q(model__icontains=model_str)
            if part_str: query &= Q(part_name__icontains=part_str)
            records = PartPricing.objects.filter(query)
            
        log_debug(f"DEBUG: Inventory Records Found: {records.count()}")

        # PROCESS INVENTORY RESULTS (Success Path)
        if records.exists():
            results = []
            seen = set()
            for r in records[:15]:
                if r.hollander_number in seen: continue
                seen.add(r.hollander_number)
                
                options_text = r.get_all_options()
                if not options_text: options_text = "Standard Option"

                results.append({
                    'hollander_number': r.hollander_number,
                    'description': f"{r.year_start}-{r.year_end} {r.model} {r.part_name}",
                    'options': options_text,
                    'source': 'Inventory',
                    'price': float(r.new_price or 0)
                })
            return Response({'count': len(results), 'results': results})

        # ---------------------------
        # STRATEGY 2: CATALOG FALLBACK (Unified Engine)
        # ---------------------------
        catalog_results = []
        
        # 1. Get VALID CODES for this Year/Model
        # This returns the codes that get_parts used to find the names.
        _, valid_codes = query_catalog_index(make_id, model_id, year=year)
        log_debug(f"DEBUG: Catalog Valid Codes: {len(valid_codes)}")
        
        if valid_codes and (part_str or part_id):
            # 2. Filter Codes by the User's Selection
            # We need to map the User's Part (Name/ID) -> Catalog Codes
            target_codes = set()
            
            # Get Candidate Names from User Selection
            target_name = part_str
            if not target_name and part_id:
                p = PartType.objects.filter(part_id=part_id).first()
                if p: target_name = p.part_name
            
            log_debug(f"DEBUG: Target Name: {target_name}")
            
            if target_name:
                # Reverse Fuzzy Match: Find which HollanderPartRef matches this Name
                
                # A. Exact Name Match in Ref
                exact_refs = HollanderPartRef.objects.filter(part_name__iexact=target_name, part_code__in=valid_codes)
                for r in exact_refs: target_codes.add(r.part_code)
                log_debug(f"DEBUG: Exact Ref Matches: {exact_refs.count()}")
                
                # B. "Part Type" in "Ref Name" (Target in Ref)
                # e.g. Target="Engine" -> Ref="Engine Assembly"
                if not target_codes:
                    contains_refs = HollanderPartRef.objects.filter(part_name__icontains=target_name, part_code__in=valid_codes)
                    for r in contains_refs: target_codes.add(r.part_code)
                    log_debug(f"DEBUG: Contains Ref Matches: {contains_refs.count()}")

                # C. "Ref Name" in "Part Type" (Ref in Target) - NEW STRATEGY
                # e.g. Target="Air Cleaner Engine" -> Ref="Air Cleaner"
                if not target_codes:
                    # We have to iterate/query carefully. 
                    # querying: Ref.part_name is substring of target_name
                    # Django doesn't natively support "field__in=string" for substring search efficiently without extensions.
                    # But we can reverse it: find all Refs that are substrings of Target.
                    # Or simpler: Iterating Valid Codes and checking names is safer if Set is small.
                    # Or just try to match "Air Cleaner" from "Air Cleaner Engine"
                    
                    # Let's try to match words? "Air Cleaner"
                    # Optimization: Filter Refs that are IN valid_codes first (already done implicitly by logic flow via loop or limited set)
                    # Let's verify valid_codes size. It's usually small (<200).
                    
                    potential_refs = HollanderPartRef.objects.filter(part_code__in=valid_codes)
                    c_count = 0
                    for r in potential_refs:
                        if r.part_name and r.part_name.lower() in target_name.lower():
                             target_codes.add(r.part_code)
                             c_count += 1
                    log_debug(f"DEBUG: Ref-in-Target Matches: {c_count}")
            
            log_debug(f"DEBUG: Target Codes: {target_codes}")
                    
            # 3. Query Index with Targeted Codes
            if target_codes:
                # Resolve Model Ref logic same as Helper but we need Ref ID
                model_obj = Model.objects.filter(model_id=model_id).first()
                keys_to_try = [model_obj.model_name]
                ref = HollanderMakeModelRef.objects.filter(h_model__iexact=model_obj.model_name).first()
                if not ref: ref = HollanderMakeModelRef.objects.filter(h_model__icontains=model_obj.model_name).first()
                if ref: 
                    keys_to_try.append(str(ref.ref_id))
                    keys_to_try.append(ref.h_model)
                
                log_debug(f"DEBUG: Querying Index with Keys: {keys_to_try}")
                
                for code in target_codes:
                    matches = HollanderIndex.objects.filter(
                        model_nm__in=keys_to_try,
                        part_type_nbr=code,
                        begin_year__lte=year,
                        end_year__gte=year
                    )[:5] 
                    
                    log_debug(f"DEBUG: Code {code} Matches: {matches.count()}")
                    
                    for idx in matches:
                        catalog_results.append({
                            'hollander_number': f"{idx.part_type_nbr}-{idx.idx_id}", # Synthetic display
                            'description': f"{idx.begin_year}-{idx.end_year} Catalog Entry",
                            'options': "Check Compatibility (Call for details)",
                            'source': 'Catalog (Interchange)',
                            'message': 'Part available in catalog. Please call for stock.',
                            'price': 0
                        })
                        
        if catalog_results:
            return Response({'count': len(catalog_results), 'results': catalog_results})

        return Response({'count': 0, 'results': []})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({'error': str(e), 'trace': traceback.format_exc()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
