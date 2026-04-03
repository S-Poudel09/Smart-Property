import os
import django
from decimal import Decimal
from django.utils import timezone
from django.contrib.auth.hashers import make_password

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from accounts.models import User
from properties.models import Property, PropertyImage
# from loans.models import Loan
# from transactions.models import Transaction

def seed_data():
    print("Clearing old data...")
    Property.objects.all().delete()
    User.objects.exclude(is_superuser=True).delete()

    print("Creating realistic users...")
    # Admin is already there (superuser)
    
    # Seller
    seller = User.objects.create(
        email="seller@smartproperty.com",
        username="seller_nepal",
        password=make_password("nepal123"),
        role="seller",
        full_name="Rajesh Hamal",
        phone_number="9841234567"
    )

    # Buyer
    buyer = User.objects.create(
        email="buyer@smartproperty.com",
        username="buyer_nepal",
        password=make_password("nepal123"),
        role="buyer",
        full_name="Sita Devi",
        phone_number="9801234567"
    )

    print("Creating realistic properties...")
    properties_data = [
        {
            "title": "Modern Villa in Bhaisepati",
            "description": "Luxurious 5BHK villa with a beautiful garden and parking for 3 cars. Located in the elite neighborhood of Bhaisepati, Lalitpur.",
            "location": "Bhaisepati, Lalitpur",
            "price": 45000000,
            "property_type": "house",
            "beds": 5,
            "baths": 4,
            "area_sqft": 3200,
            "latitude": 27.6433,
            "longitude": 85.3011,
            "city": "Lalitpur",
            "status": "published",
            "is_verified": True
        },
        {
            "title": "Apartment at Central Park, Bishalnagar",
            "description": "3 Bedroom flat with all modern amenities. 24/7 security, swimming pool, and gym access.",
            "location": "Bishalnagar, Kathmandu",
            "price": 28000000,
            "property_type": "apartment",
            "beds": 3,
            "baths": 3,
            "area_sqft": 1800,
            "latitude": 27.7225,
            "longitude": 85.3340,
            "city": "Kathmandu",
            "status": "published",
            "is_verified": True
        },
        {
            "title": "Commercial Land in Lake Side",
            "description": "Prime commercial land perfect for hotel or restaurant. 10 minutes walk from the lake.",
            "location": "Lake Side, Pokhara",
            "price": 65000000,
            "property_type": "land",
            "beds": 0,
            "baths": 0,
            "area_sqft": 4500,
            "latitude": 28.2095,
            "longitude": 83.9585,
            "city": "Pokhara",
            "status": "published",
            "is_verified": True
        },
        {
            "title": "Cozy Bungalow in Budhanilkantha",
            "description": "Standard 4BHK bungalow with peaceful surroundings and fresh air. Near the Budhanilkantha Temple.",
            "location": "Budhanilkantha, Kathmandu",
            "price": 35000000,
            "property_type": "house",
            "beds": 4,
            "baths": 3,
            "area_sqft": 2500,
            "latitude": 27.7785,
            "longitude": 85.3615,
            "city": "Kathmandu",
            "status": "published",
            "is_verified": True
        }
    ]

    for p_data in properties_data:
        p = Property.objects.create(
            owner=seller,
            title=p_data['title'],
            description=p_data['description'],
            location=p_data['location'],
            price=Decimal(p_data['price']),
            property_type=p_data['property_type'],
            listing_type="sale",
            beds=p_data['beds'],
            baths=p_data['baths'],
            area_sqft=p_data['area_sqft'],
            city=p_data['city'],
            latitude=p_data['latitude'],
            longitude=p_data['longitude'],
            status=p_data['status'],
            is_verified=p_data['is_verified']
        )
        
        # Add a placeholder image from Unsplash for each
        if p_data['property_type'] == 'house':
            img_url = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800"
        elif p_data['property_type'] == 'apartment':
            img_url = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800"
        else:
            img_url = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800"
            
        PropertyImage.objects.create(property=p, image=img_url)

    print("Seeding complete!")

if __name__ == "__main__":
    seed_data()
