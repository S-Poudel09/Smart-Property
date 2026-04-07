"""
Management command for testing outbound email delivery.

This command sends a trial email to a specified recipient in order to verify
that the configured SMTP backend is working correctly.

Usage:
    python manage.py test_email <recipient_email>
"""
import os
from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings

class Command(BaseCommand):
    help = 'Test the Imperial SMTP Herald by dispatching a trial signal.'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='The recipient of the test signal')

    def handle(self, *args, **options):
        recipient = options['email']
        self.stdout.write(self.style.NOTICE(f"Initiating trial signal to {recipient}..."))
        self.stdout.write(f"Registry Settings - Backend: {settings.EMAIL_BACKEND}")
        self.stdout.write(f"Registry Settings - Host: {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
        self.stdout.write(f"Registry Settings - User: {settings.EMAIL_HOST_USER}")

        try:
            sent = send_mail(
                subject="SmartProperty - Imperial SMTP Trial | परीक्षण इमेल",
                message=(
                    "The Imperial Herald has successfully established a bridge with the SMTP realms.\n\n"
                    "If you received this message, the SmartProperty communication tapestry is fully operational.\n\n"
                    "— Realm of SmartProperty"
                ),
                from_email=None,
                recipient_list=[recipient],
                fail_silently=False,
            )
            if sent > 0:
                self.stdout.write(self.style.SUCCESS(f"✓ The trial signal has successfully crossed the bridge to {recipient}."))
            else:
                self.stdout.write(self.style.ERROR("⚠ The signal was dispatched but no one heard it. Check your SMTP configurations."))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"✖ The Herald has failed the trial: {str(e)}"))
