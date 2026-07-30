"""
Management command: seed_zipcodes
Downloads the free public US ZIP code CSV and bulk-inserts records into the Zipcode table.
Safe to run multiple times — uses update_or_create to prevent duplicates.

Usage:
    python manage.py seed_zipcodes
    python manage.py seed_zipcodes --limit 500   (seed only first 500 rows, for testing)
"""
import csv
import io
import urllib.request
from django.core.management.base import BaseCommand
from apps.hollander.models import Zipcode


CSV_URL = (
    "https://raw.githubusercontent.com/midwire/free_zipcode_data/"
    "master/all_us_zipcodes.csv"
)

# Two-letter abbreviation → full state name lookup
STATE_NAMES = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas",
    "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware",
    "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho",
    "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas",
    "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
    "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi",
    "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada",
    "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York",
    "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma",
    "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
    "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah",
    "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia",
    "WI": "Wisconsin", "WY": "Wyoming", "DC": "District of Columbia",
    "PR": "Puerto Rico", "GU": "Guam", "VI": "Virgin Islands",
}


class Command(BaseCommand):
    help = "Seed the Zipcode table from the free public US ZIP code CSV dataset."

    def add_arguments(self, parser):
        parser.add_argument(
            "--limit",
            type=int,
            default=0,
            help="Limit number of rows imported (0 = all rows).",
        )
        parser.add_argument(
            "--batch-size",
            type=int,
            default=500,
            help="Bulk-create batch size (default: 500).",
        )

    def handle(self, *args, **options):
        limit      = options["limit"]
        batch_size = options["batch_size"]

        self.stdout.write(f"Downloading ZIP code dataset from:\n  {CSV_URL}")
        req = urllib.request.Request(CSV_URL, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read().decode("utf-8", errors="ignore")

        self.stdout.write(f"Downloaded {len(raw):,} bytes. Parsing CSV…")

        reader = csv.DictReader(io.StringIO(raw))
        # Expected columns: code, city, state, county, area_code, lat, lon

        to_create = []
        seen_codes = set()
        count = 0

        for row in reader:
            postal_code = (row.get("code") or "").strip().zfill(5)
            city_name   = (row.get("city") or "").strip().title()
            state_abbr  = (row.get("state") or "").strip().upper()
            county      = (row.get("county") or "").strip()

            # Skip non-US-state entries and malformed rows
            if not postal_code or not city_name or not state_abbr:
                continue
            if state_abbr not in STATE_NAMES:
                continue
            if postal_code in seen_codes:
                continue

            seen_codes.add(postal_code)
            to_create.append(
                Zipcode(
                    zipcode_id  = count,      # required unique IntegerField
                    postal_code = postal_code,
                    city_name   = city_name,
                    state_abbr  = state_abbr,
                    county_name = county,
                )
            )
            count += 1

            if limit and count >= limit:
                break

        self.stdout.write(f"Parsed {count:,} unique US ZIP records. Bulk-inserting…")

        # Bulk insert in batches, ignoring conflicts (idempotent)
        inserted = 0
        for i in range(0, len(to_create), batch_size):
            chunk = to_create[i : i + batch_size]
            result = Zipcode.objects.bulk_create(chunk, ignore_conflicts=True)
            inserted += len(result)
            self.stdout.write(
                f"  {min(i + batch_size, count):,} / {count:,} processed…",
                ending="\r",
            )

        self.stdout.write("")  # newline after \r progress
        self.stdout.write(
            self.style.SUCCESS(
                f"Done! {inserted:,} rows inserted / {count - inserted:,} already existed."
            )
        )
        total = Zipcode.objects.count()
        self.stdout.write(f"Zipcode table now contains {total:,} records.")
