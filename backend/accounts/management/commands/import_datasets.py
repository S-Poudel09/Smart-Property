"""
Management command for importing seed datasets into the system.

This command loads user, property, transaction, and loan data from CSV
files and optionally attaches dataset images to imported properties.

Primary responsibilities:
- Clear existing seed-related data
- Import users from CSV
- Import properties and related images
- Import transaction records
- Import loan records

This command is mainly intended for development, testing, and demo data setup.
"""
import csv
import os
from django.core.management.base import BaseCommand
from accounts.models import User, OTP
from properties.models import Property, PropertyImage
from transactions.models import Transaction, PaymentProof
from loans.models import Loan
from chat.models import Message, ChatRoom
from services.models import ServiceBooking
from notifications.models import Notification
from django.conf import settings
from decimal import Decimal
import random

class Command(BaseCommand):
    help = 'Import datasets from CSV files into the database'

    def handle(self, *args, **options):
        base_path = os.path.join(settings.BASE_DIR, 'datasets')
        
        self.stdout.write(self.style.WARNING('Clearing existing data for fresh import...'))
        # Order matters for deletion if we don't use CASCADE universally, 
        # but Django's on_delete=models.CASCADE inside the DB handles most.
        # Clearing related models first.
        OTP.objects.all().delete()
        Message.objects.all().delete()
        ChatRoom.objects.all().delete()
        ServiceBooking.objects.all().delete()
        Notification.objects.all().delete()
        PaymentProof.objects.all().delete()
        Transaction.objects.all().delete()
        Loan.objects.all().delete()
        PropertyImage.objects.all().delete()
        Property.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()
        
        self.import_users(os.path.join(base_path, 'users.csv'))
        self.import_properties(os.path.join(base_path, 'properties.csv'))
        self.import_transactions(os.path.join(base_path, 'transactions.csv'))
        self.import_loans(os.path.join(base_path, 'loans.csv'))
        
        self.stdout.write(self.style.SUCCESS('Successfully imported all datasets with imagery'))

    # Normalizes currency-like string values into Decimal objects for safe database storage.
    def clean_decimal(self, value):
        if not value: return Decimal("0.00")
        return Decimal(value.replace('$', '').replace(',', '').strip())

    # Imports user records from the provided CSV dataset.
    def import_users(self, file_path):
        self.stdout.write('Importing users...')
        with open(file_path, mode='r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                csv_id = int(row['id'])
                email = f"user_{csv_id}@smartproperty.com"
                user = User.objects.create(
                    csv_id=csv_id,
                    email=email,
                    username=email,
                    full_name=f"User {csv_id}",
                    role='buyer',
                    is_verified=True,
                    current_age=int(row['current_age']),
                    yearly_income=self.clean_decimal(row['yearly_income']),
                    credit_score=int(row['credit_score']),
                    total_debt=self.clean_decimal(row['total_debt'])
                )
                import uuid
                user.set_password("SecurePassword123!")
                user.save()

    # Imports property records and attaches sample images from dataset folders.
    def import_properties(self, file_path):
        self.stdout.write('Importing properties with integrated images...')
        # Get an existing seller from the DB, fallback to first user if none
        seller = User.objects.filter(role='seller').first()
        if not seller:
            seller = User.objects.first() # Should be the admin we just created or imported user
            if not seller:
                 self.stdout.write(self.style.ERROR('No user found to own properties. Please create a seller first.'))
                 return

        from django.core.files import File
        from properties.models import PropertyImage
        image_base_path = os.path.join(settings.BASE_DIR, 'datasets', 'Image')
        subfolders = ['backyard', 'bathroom', 'bedroom', 'frontyard', 'kitchen', 'livingRoom']

        with open(file_path, mode='r') as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader):
                if i >= 30: break # Increased to 30 for better variety
                prop = Property.objects.create(
                    title=f"Premium Property {i+1}",
                    description="Advanced listing imported from dataset with integrated high-resolution imagery.",
                    price=Decimal(row['price']),
                    area_sqft=float(row['area']),
                    beds=int(row['bedrooms']),
                    baths=int(row['bathrooms']),
                    stories=int(row['stories']),
                    mainroad=row['mainroad'] == 'yes',
                    guestroom=row['guestroom'] == 'yes',
                    basement=row['basement'] == 'yes',
                    hotwaterheating=row['hotwaterheating'] == 'yes',
                    airconditioning=row['airconditioning'] == 'yes',
                    parking_spaces=int(row['parking']),
                    prefarea=row['prefarea'] == 'yes',
                    furnishing_status=row['furnishingstatus'],
                    location="Kathmandu, Nepal",
                    owner=seller,
                    status="submitted",
                    is_verified=True
                )

                # Attach images from dataset folders
                try:
                    selected_folders = random.sample(subfolders, k=min(3, len(subfolders)))
                    for idx, folder in enumerate(selected_folders):
                        folder_path = os.path.join(image_base_path, folder)
                        if os.path.exists(folder_path):
                            images = [img for img in os.listdir(folder_path) if img.lower().endswith(('.jpg', '.jpeg', '.png'))]
                            if images:
                                img_name = random.choice(images)
                                img_path = os.path.join(folder_path, img_name)
                                with open(img_path, 'rb') as img_f:
                                    prop_img = PropertyImage(property=prop, is_primary=(idx == 0))
                                    prop_img.image.save(f"prop_{prop.id}_{idx}.jpg", File(img_f), save=True)
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"Failed to attach images for property {i+1}: {e}"))

    # Imports transaction records and links them to existing users and properties.
    def import_transactions(self, file_path):
        self.stdout.write('Importing transactions...')
        properties = list(Property.objects.all())
        if not properties: return
        
        with open(file_path, mode='r') as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader):
                if i >= 50: break
                try:
                    user = User.objects.get(csv_id=int(row['client_id']))
                    prop = properties[i % len(properties)]
                    Transaction.objects.create(
                        buyer=user,
                        seller=prop.owner,
                        property=prop,
                        total_amount=prop.price,
                        amount_paid=prop.price,
                        status="COMPLETED",
                        card_brand=row['card_brand'],
                        card_type=row['card_type'],
                        card_on_dark_web=row['card_on_dark_web'].lower() == 'yes',
                        has_chip=row['has_chip'].lower() == 'yes'
                    )
                except User.DoesNotExist:
                    continue

# Imports loan records for existing users and properties.
    def import_loans(self, file_path):
        self.stdout.write('Importing loans...')
        users = list(User.objects.filter(role='buyer'))
        properties = list(Property.objects.all())
        if not users or not properties: return
        
        with open(file_path, mode='r') as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader):
                if i >= 30: break
                user = users[i % len(users)]
                prop = properties[i % len(properties)]
                Loan.objects.create(
                    user=user,
                    property=prop,
                    loan_amount=Decimal(row['Loan_Amount']),
                    interest_rate=Decimal("8.5"),
                    status="APPROVED" if row['Loan_Approved'] == '1' else "REJECTED",
                    age=int(row['Age']),
                    credit_score=int(row['Credit_Score']),
                    loan_term_months=int(row['Loan_Term'])
                )
