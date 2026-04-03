import os
import django
import uuid
from django.conf import settings

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from properties.models import Property, PropertyImage
from django.contrib.auth import get_user_model

User = get_user_model()

def seed_data():
    # 1. Create a Seller and a Buyer if they don't exist
    seller_email = 'demo_seller@smartproperty.com'
    buyer_email = 'demo_buyer@smartproperty.com'
    
    seller, created = User.objects.get_or_create(
        email=seller_email,
        defaults={
            'username': 'demo_seller',
            'role': 'seller',
            'first_name': 'Nepal',
            'last_name': 'Realty',
            'is_active': True,
        }
    )
    if created:
        seller.set_password('demo1234')
        seller.save()
        print(f"Created demo seller: {seller_email}")

    buyer, created = User.objects.get_or_create(
        email=buyer_email,
        defaults={
            'username': 'demo_buyer',
            'role': 'buyer',
            'first_name': 'Ram',
            'last_name': 'Pradhan',
            'is_active': True,
        }
    )
    if created:
        buyer.set_password('demo1234')
        buyer.save()
        print(f"Created demo buyer: {buyer_email}")

    # 2. Add some Properties
    properties = [
        {
            'title': 'Luxury Villa in Bhaisepati',
            'description': 'Beautiful 2.5 storey house on 5 aana land. South facing with 13ft road access. Near Sainik Awasiya Mahavidyalaya.',
            'location': 'Bhaisepati, Lalitpur',
            'price': 45000000,
            'property_type': 'house',
            'listing_type': 'sale',
            'beds': 5,
            'baths': 4,
            'area_sqft': 2500,
            'latitude': 27.6521,
            'longitude': 85.3054,
            'status': 'PUBLISHED',
            'is_verified': True,
            'workflow_step': 1
        },
        {
            'title': 'Premium Apartment at Central Park',
            'description': 'Furnished 3BHK flat at Central Park Apartments. Modern amenities, gym, and swimming pool access.',
            'location': 'Bishalnagar, Kathmandu',
            'price': 28000000,
            'property_type': 'apartment',
            'listing_type': 'sale',
            'beds': 3,
            'baths': 3,
            'area_sqft': 1800,
            'latitude': 27.7265,
            'longitude': 85.3341,
            'status': 'PUBLISHED',
            'is_verified': True,
            'workflow_step': 1
        },
        {
            'title': 'Cozy Boys Hostel - Pulchowk',
            'description': 'Comfortable hostel for students near Pulchowk Campus. 24/7 electricity, high-speed WiFi, and 3 meals included.',
            'location': 'Gabahal, Lalitpur',
            'price': 12000,
            'property_type': 'hostel',
            'listing_type': 'rent',
            'beds': 20,
            'baths': 5,
            'area_sqft': 3000,
            'latitude': 27.6757,
            'longitude': 85.3168,
            'status': 'PUBLISHED',
            'is_verified': True,
            'hostel_gender': 'boys',
            'room_type': 'Double / Triple',
            'food_included': True,
            'has_wifi': True,
            'has_laundry': True,
            'bathroom_type': 'shared',
            'available_beds': 4,
            'workflow_step': 1
        }
    ]

    for p_data in properties:
        p, created = Property.objects.get_or_create(
            title=p_data['title'],
            defaults={
                'owner': seller,
                **p_data
            }
        )
        if created:
            print(f"Added property: {p_data['title']}")
            # Add a placeholder image if needed
            # PropertyImage.objects.create(property=p, image='properties/demo.jpg', is_primary=True)

if __name__ == '__main__':
    seed_data()
