import sys
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = "Repairs all users with plaintext passwords and misaligned usernames."

    def add_arguments(self, parser):
        parser.add_argument('--default-password', type=str, default='password123', help='Default pass if missing')

    def handle(self, *args, **options):
        User = get_user_model()
        default_pass = options['default_password']
        
        users = User.objects.all()
        repaired_passwords = 0
        repaired_usernames = 0

        self.stdout.write("Starting user audit...")

        for user in users:
            changed = False
            
            # 1. Check if password is plaintext (doesn't start with 'pbkdf2_')
            if user.password and not user.password.startswith('pbkdf2_') and not user.password.startswith('argon2'):
                self.stdout.write(self.style.WARNING(f"Found plaintext password for {user.email}! Repairing..."))
                user.set_password(user.password if len(user.password) >= 3 else default_pass)
                changed = True
                repaired_passwords += 1
            elif not user.password:
                self.stdout.write(self.style.WARNING(f"No password found for {user.email}. Setting default."))
                user.set_password(default_pass)
                changed = True
                repaired_passwords += 1

            # 2. Check username alignment
            expected_username = user.email.split('@')[0]
            if user.username != expected_username and user.username != user.email:
                self.stdout.write(self.style.WARNING(f"Fixing username for {user.email} (was {user.username})"))
                user.username = expected_username
                changed = True
                repaired_usernames += 1
                
            # 3. Mark admin/demo as verified
            if 'admin' in user.email or user.role in ['admin', 'seller', 'buyer']:
                if not user.is_verified:
                    user.is_verified = True
                    changed = True

            if changed:
                user.save()

        self.stdout.write(self.style.SUCCESS(f"Audit Complete! Repaired {repaired_passwords} passwords and {repaired_usernames} usernames."))
