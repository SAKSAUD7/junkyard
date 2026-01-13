import json
import os
from django.core.management.base import BaseCommand
from apps.common.models import Make, Model, Part, State, City
from apps.vendors.models import Vendor


class Command(BaseCommand):
    help = 'Import data from JSON files into the database'

    def handle(self, *args, **options):
        # Path to JSON data files
        data_dir = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', '..', 'frontend', 'public', 'data')
        
        self.stdout.write(self.style.SUCCESS(f'Loading data from: {data_dir}'))
        
        # Import Makes
        self.stdout.write('Importing makes...')
        with open(os.path.join(data_dir, 'data_makes.json'), 'r', encoding='utf-8') as f:
            makes_data = json.load(f)
            for item in makes_data:
                Make.objects.update_or_create(
                    make_id=item['makeID'],
                    defaults={'make_name': item['makeName']}
                )
        self.stdout.write(self.style.SUCCESS(f'✓ Imported {Make.objects.count()} makes'))
        
        # Import Models
        self.stdout.write('Importing models...')
        with open(os.path.join(data_dir, 'data_models.json'), 'r', encoding='utf-8') as f:
            models_data = json.load(f)
            for item in models_data:
                try:
                    make = Make.objects.get(make_id=item['makeID'])
                    Model.objects.update_or_create(
                        model_id=item['modelID'],
                        defaults={
                            'model_name': item['modelName'],
                            'make': make
                        }
                    )
                except Make.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f'Make ID {item["makeID"]} not found for model {item["modelName"]}'))
        self.stdout.write(self.style.SUCCESS(f'✓ Imported {Model.objects.count()} models'))
        
        # Import Parts
        self.stdout.write('Importing parts...')
        with open(os.path.join(data_dir, 'data_parts.json'), 'r', encoding='utf-8') as f:
            parts_data = json.load(f)
            for item in parts_data:
                Part.objects.update_or_create(
                    part_id=item['partID'],
                    defaults={'part_name': item['partName']}
                )
        self.stdout.write(self.style.SUCCESS(f'✓ Imported {Part.objects.count()} parts'))
        
        # Import States
        self.stdout.write('Importing states...')
        with open(os.path.join(data_dir, 'data_states.json'), 'r', encoding='utf-8') as f:
            states_data = json.load(f)
            for idx, item in enumerate(states_data, start=1):
                State.objects.update_or_create(
                    state_id=idx,
                    defaults={
                        'state_name': item['stateName'],
                        'state_code': item['stateAbbr']
                    }
                )
        self.stdout.write(self.style.SUCCESS(f'✓ Imported {State.objects.count()} states'))

        # Import Cities
        self.stdout.write('Importing cities...')
        with open(os.path.join(data_dir, 'data_cities.json'), 'r', encoding='utf-8') as f:
            cities_data = json.load(f)
            for idx, item in enumerate(cities_data, start=1):
                City.objects.update_or_create(
                    city_id=idx,
                    defaults={
                        'city_name': item['cityName'],
                        'state': item['state']
                    }
                )
        self.stdout.write(self.style.SUCCESS(f'✓ Imported {City.objects.count()} cities'))

        # Import Vendors/Junkyards
        self.stdout.write('Importing vendors...')
        with open(os.path.join(data_dir, 'data_junkyards.json'), 'r', encoding='utf-8') as f:
            vendors_data = json.load(f)
            for idx, item in enumerate(vendors_data):
                # Parse rating
                rating_str = item.get('rating', '100%').strip('%')
                try:
                    rating_pct = int(rating_str)
                except ValueError:
                    rating_pct = 0
                
                # Calculate stars
                rating_stars = round((rating_pct / 100) * 5)
                if rating_stars < 1: rating_stars = 1

                # Determine flags
                is_top_rated = rating_pct >= 90
                # Mark first 24 as featured for demo purposes, plus any really good ones
                is_featured = idx < 24 or (rating_pct == 100 and idx % 5 == 0)
                is_trusted = is_top_rated

                Vendor.objects.update_or_create(
                    id=item['id'],
                    defaults={
                        'name': item['name'],
                        'address': item['address'],
                        'city': item['city'],
                        'state': item['state'],
                        'zipcode': item['zipcode'],
                        'description': item.get('description', ''),
                        'review_snippet': item.get('reviewSnippet', ''),
                        'rating': item.get('rating', '100%'),
                        'rating_percentage': rating_pct,
                        'rating_stars': rating_stars,
                        'is_top_rated': is_top_rated,
                        'is_featured': is_featured,
                        'is_trusted': is_trusted,
                        'profile_url': item.get('profileUrl', ''),
                        'logo': item.get('logo', '/images/logo-placeholder.png')
                    }
                )
        self.stdout.write(self.style.SUCCESS(f'✓ Imported {Vendor.objects.count()} vendors'))
        
        self.stdout.write(self.style.SUCCESS('\n🎉 All data imported successfully!'))
