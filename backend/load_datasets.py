import pandas as pd
import os
import django
from decimal import Decimal
from django.utils import timezone

print("Starting dataset loading...")

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from accounts.models import User
from properties.models import Property
from loans.models import Loan
from transactions.models import Transaction


# ---------------- USERS ---------------- #

def load_users():
    print("Loading users...")

    users = []

    for i in range(50):
        users.append(
            User(
                username=f"user{i}",
                email=f"user{i}@example.com",
                password="password123"
            )
        )

    User.objects.bulk_create(users)

    print("Users loaded")


# ---------------- PROPERTIES ---------------- #

def load_properties():

    print("Loading properties...")

    df = pd.read_csv("datasets/properties.csv")

    owner = User.objects.first()

    properties = []

    for _, row in df.head(100).iterrows():

        properties.append(
            Property(
                title="Sample Property",
                description="Dataset property",
                location="Unknown",
                latitude=27.7172,
                longitude=85.3240,
                price=Decimal(row["price"]),
                property_type="house",
                owner=owner,
                listing_type="sale",
                beds=int(row["bedrooms"]),
                baths=int(row["bathrooms"]),
                area_sqft=float(row["area"]),
                city="Kathmandu",
                images=[],
                documents=[],
                status="approved",
                is_verified=True,
                rejection_reason="",
                created_at=timezone.now(),
                updated_at=timezone.now()
            )
        )

    Property.objects.bulk_create(properties)

    print("Properties loaded")


# ---------------- LOANS ---------------- #

def load_loans():

    print("Loading loans...")

    users = list(User.objects.all())
    properties = list(Property.objects.all())

    loans = []

    for i in range(100):

        loans.append(
            Loan(
                user=users[i % len(users)],
                property=properties[i % len(properties)],
                loan_amount=Decimal(100000),
                interest_rate=Decimal(5.5),
                status="approved",
                application_date=timezone.now(),
                approval_date=timezone.now(),
                message="Loan approved",
                income=Decimal(50000),
                employment_status="employed",
                rejection_reason="",
                updated_at=timezone.now()
            )
        )

    Loan.objects.bulk_create(loans)

    print("Loans loaded")


# ---------------- TRANSACTIONS ---------------- #

def load_transactions():

    print("Loading transactions...")

    users = list(User.objects.all())
    loans = list(Loan.objects.all())
    properties = list(Property.objects.all())

    transactions = []

    for i in range(100):

        transactions.append(
            Transaction(
                user=users[i % len(users)],
                loan=loans[i % len(loans)],
                property=properties[i % len(properties)],
                amount=Decimal(5000),
                payment_method="bank_transfer",
                payment_date=timezone.now(),
                status="completed",
                payment_proof_url="",
                updated_at=timezone.now()
            )
        )

    Transaction.objects.bulk_create(transactions)

    print("Transactions loaded")


# ---------------- MAIN ---------------- #

if __name__ == "__main__":

    load_users()
    load_properties()
    load_loans()
    load_transactions()

    print("All datasets loaded successfully!")