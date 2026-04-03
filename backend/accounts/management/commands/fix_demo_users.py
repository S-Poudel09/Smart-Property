from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = "Fix demo users: forces re-hash of passwords, sets is_verified=True, and ensures consistent username mapping."

    def add_arguments(self, parser):
        parser.add_argument('--password', type=str, default='password123', help='Standardized password for demo users')
        parser.add_argument('--verify', action='store_true', default=True, help='Automatically set is_verified=True for demo users')

    def handle(self, *args, **options):
        User = get_user_model()
        new_password = options['password']
        should_verify = options['verify']
        
        # We can target known demo users, or just all users for a pure testing environment.
        # Let's target the exact list of users imported by the seed_demo_data command
        demo_emails = [
            "admin@smartproperty.np",
            "ram.sharma@gmail.com",
            "shyam.kc@yahoo.com",
            "sita.gurung@hotmail.com",
            "hari.nepali@gmail.com",
            "rita.thapa@gmail.com"
        ]
        
        users_fixed = 0
        for email in demo_emails:
            user = User.objects.filter(email=email).first()
            if not user:
                continue
                
            # 1. Ensure username aligns with email, as AbstractUser requires a unique username
            expected_username = email.split('@')[0]
            if user.username != expected_username:
                user.username = expected_username
            
            # 2. Assign standard verified status
            if should_verify:
                user.is_verified = True
                
            # 3. Always set the proper pbkdf2 hashed password exclusively using set_password()
            user.set_password(new_password)
            user.save()
            users_fixed += 1
            self.stdout.write(self.style.SUCCESS(f"Successfully fixed & verified {email}"))
            
        self.stdout.write(self.style.SUCCESS(f"\nCompleted fixing {users_fixed} demo users. Their password is now '{new_password}'."))
