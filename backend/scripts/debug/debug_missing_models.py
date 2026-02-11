import os
import django
import sys

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import Make, Model, HollanderMakeModelRef, HollanderIndex

print('=== HUMMER ===')
hummer = Make.objects.filter(make_name__icontains='Hummer').first()
if hummer:
    print(f'Found: {hummer.make_name}')
    models = Model.objects.filter(make=hummer)
    print(f'Models: {[m.model_name for m in models]}')
    
    # Search for H1 in refs
    refs = HollanderMakeModelRef.objects.filter(h_model__icontains='H1')[:10].values('h_make', 'h_model')
    print(f'H1 Refs: {list(refs)}')
    
    # Search for Hummer in refs
    hummer_refs = HollanderMakeModelRef.objects.filter(h_make__icontains='Hummer')[:10].values('h_make', 'h_model')
    print(f'Hummer Make Refs: {list(hummer_refs)}')
else:
    print('Hummer make not found')

print('\n=== BERTONE ===')
bertone = Make.objects.filter(make_name__icontains='Bertone').first()
if bertone:
    print(f'Found: {bertone.make_name}')
    models = Model.objects.filter(make=bertone)
    print(f'Models: {[m.model_name for m in models]}')
    
    # Search for X1 in refs
    refs = HollanderMakeModelRef.objects.filter(h_model__icontains='X1')[:10].values('h_make', 'h_model')
    print(f'X1 Refs: {list(refs)}')
    
    # Search for Bertone in refs
    bertone_refs = HollanderMakeModelRef.objects.filter(h_make__icontains='Bertone')[:10].values('h_make', 'h_model')
    print(f'Bertone Make Refs: {list(bertone_refs)}')
    
    # Try Fiat (X1/9 is a Fiat)
    fiat_x1_refs = HollanderMakeModelRef.objects.filter(h_make__icontains='Fiat', h_model__icontains='X1')[:10].values('h_make', 'h_model')
    print(f'Fiat X1 Refs: {list(fiat_x1_refs)}')
else:
    print('Bertone make not found')
