import csv
import os
from django.core.management.base import BaseCommand
from accounts.models import User
from properties.models import Property
from transactions.models import Transaction, PaymentProof
from loans.models import Loan
from django.conf import settings
from decimal import Decimal
import random

class Command(BaseCommand):
    help = 'Import datasets from CSV files into the database'

    def handle(self, *args, **options):
        base_path = os.path.join(settings.BASE_DIR, 'datasets')
        
        self.import_users(os.path.join(base_path, 'users.csv'))
        self.import_properties(os.path.join(base_path, 'properties.csv'))
        self.import_transactions(os.path.join(base_path, 'transactions.csv'))
        self.import_loans(os.path.join(base_path, 'loans.csv'))
        
        self.stdout.write(self.style.SUCCESS('Successfully imported all datasets'))

    def clean_decimal(self, value):
        if not value: return Decimal("0.00")
        return Decimal(value.replace('$', '').replace(',', '').strip())

    def import_users(self, file_path):
        self.stdout.write('Importing users...')
        with open(file_path, mode='r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                csv_id = int(row['id'])
                email = f"user_{csv_id}@smartproperty.com"
                user, created = User.objects.get_or_create(
                    csv_id=csv_id,
                    defaults={
                        'email': email,
                        'username': email,
                        'full_name': f"User {csv_id}",
                        'role': 'buyer',
                        'is_verified': True,
                        'current_age': int(row['current_age']),
                        'yearly_income': self.clean_decimal(row['yearly_income']),
                        'credit_score': int(row['credit_score']),
                        'total_debt': self.clean_decimal(row['total_debt'])
                    }
                )
                if created:
                    user.set_password('password123')
                    user.save()

    def import_properties(self, file_path):
        self.stdout.write('Importing properties...')
        seller = User.objects.filter(role='seller').first()
        if not seller:
            seller = User.objects.create_user(
                email='seller_dataset@smartproperty.com',
                username='seller_dataset@smartproperty.com',
                password='password123',
                full_name='System Seller',
                role='seller',
                is_verified=True
            )

        with open(file_path, mode='r') as f:
            reader = csv.DictReader(f)
            # Limit to 20 for performance
            for i, row in enumerate(reader):
                if i >= 20: break
                Property.objects.create(
                    title=f"Premium Property {i+1}",
                    description="Advanced listing imported from dataset.",
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
                    status="PUBLISHED",
                    is_verified=True
                )

    def import_transactions(self, file_path):
        self.stdout.write('Importing transactions...')
        properties = list(Property.objects.all())
        with open(file_path, mode='r') as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader):
                if i >= 50: break
                try:
                    user = User.objects.get(csv_id=int(row['client_id']))
                    prop = random.choice(properties)
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

    def import_loans(self, file_path):
        self.stdout.write('Importing loans...')
        users = list(User.objects.filter(role='buyer'))
        properties = list(Property.objects.all())
        with open(file_path, mode='r') as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader):
                if i >= 30: break
                user = random.choice(users)
                prop = random.choice(properties)
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
