import csv
import os
import secrets
import string
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from apps.users.models import User, CustomerProfile


class Command(BaseCommand):
    help = "Generates 100 development test user accounts with verified status and exports credentials to CSV."

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=100,
            help="Number of test users to generate (default: 100)",
        )
        parser.add_argument(
            "--delete",
            action="store_true",
            help="Delete previously generated test accounts",
        )
        parser.add_argument(
            "--force",
            action="store_true",
            help="Allow execution even if DEBUG is False (use with caution)",
        )
        parser.add_argument(
            "--output",
            type=str,
            default=os.path.join(settings.BASE_DIR, "test_users_jynm.csv"),
            help="Path to export CSV file (default: backend/test_users_jynm.csv)",
        )

    def generate_password(self, length=12):
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        # Ensure at least 1 uppercase, 1 lowercase, 1 digit, 1 special
        pwd = [
            secrets.choice(string.ascii_uppercase),
            secrets.choice(string.ascii_lowercase),
            secrets.choice(string.digits),
            secrets.choice("!@#$%^&*"),
        ]
        pwd += [secrets.choice(alphabet) for _ in range(length - 4)]
        secrets.SystemRandom().shuffle(pwd)
        return "".join(pwd)

    def handle(self, *args, **options):
        # Safety guard: prevent accidental execution in production
        if not settings.DEBUG and not options["force"]:
            raise CommandError(
                "SAFETY CHECK FAILED: create_test_users can only be run when DEBUG=True. "
                "Use --force if you intentionally need this in a non-DEBUG environment."
            )

        if options["delete"]:
            self.stdout.write(self.style.WARNING("Deleting all @example.com test users..."))
            deleted_count, _ = User.objects.filter(email__endswith="@example.com").delete()
            self.stdout.write(self.style.SUCCESS(f"Successfully deleted {deleted_count} test user records."))
            return

        count = options["count"]
        output_csv = options["output"]

        self.stdout.write(self.style.NOTICE(f"Generating {count} test users..."))

        users_created = []
        csv_rows = []

        # Role breakdown:
        # First 5 = Admin
        # Next 25 = Vendor
        # Remaining = Customer
        from django.contrib.auth.hashers import make_password
        default_pwd = "TestPass!2026"
        hashed_pwd = make_password(default_pwd)

        with transaction.atomic():
            for i in range(1, count + 1):
                idx_str = f"{i:03d}"
                email = f"testuser{idx_str}@example.com"
                username = f"testuser{idx_str}"
                password = default_pwd

                if i <= 5:
                    user_type = "admin"
                    is_staff = True
                    is_superuser = True
                elif i <= 30:
                    user_type = "vendor"
                    is_staff = False
                    is_superuser = False
                else:
                    user_type = "customer"
                    is_staff = False
                    is_superuser = False

                user, created = User.objects.get_or_create(
                    email=email,
                    defaults={
                        "username": username,
                        "first_name": f"Test{idx_str}",
                        "last_name": f"User",
                        "user_type": user_type,
                        "email_verified": True,
                        "is_staff": is_staff,
                        "is_superuser": is_superuser,
                        "is_active": True,
                        "password": hashed_pwd,
                    },
                )

                if created:
                    users_created.append(user)
                    if user_type == "customer":
                        CustomerProfile.objects.get_or_create(
                            user=user,
                            defaults={
                                "security_user_type": "individual",
                                "security_purpose": "buy_parts",
                            },
                        )
                else:
                    user.password = hashed_pwd
                    user.email_verified = True
                    user.user_type = user_type
                    user.save(update_fields=["password", "email_verified", "user_type"])

                csv_rows.append({
                    "id": user.id,
                    "email": email,
                    "username": username,
                    "password": password,
                    "user_type": user_type,
                    "email_verified": True,
                    "is_staff": is_staff,
                })

                if i % 20 == 0 or i == count:
                    self.stdout.write(f"Processed {i}/{count} accounts...")

        # Export CSV
        os.makedirs(os.path.dirname(output_csv), exist_ok=True)
        with open(output_csv, mode="w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(
                f,
                fieldnames=["id", "email", "username", "password", "user_type", "email_verified", "is_staff"],
            )
            writer.writeheader()
            writer.writerows(csv_rows)

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully prepared {len(csv_rows)} test accounts ({len(users_created)} newly created).\n"
                f"Exported credentials to: {output_csv}\n"
                f"Role summary: 5 Admins, 25 Vendors, 70 Customers."
            )
        )
