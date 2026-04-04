import os
import django
import sys

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from services.models import Service

# Clear existing simple data
Service.objects.all().delete()

services = [
    {
        "name": "Legal Document Verification",
        "category": "legal",
        "base_price": "25000.00",
        "icon": "FileText",
        "description": "Comprehensive legal audit and verification of property ownership deeds (Lalpurja), tax clearances, and encumbrance certificates.",
    },
    {
        "name": "Professional Property Inspection",
        "category": "construction",
        "base_price": "18000.00",
        "icon": "Search",
        "description": "Thorough structural, electrical, and plumbing inspection by certified engineers to identify hidden defects before purchase.",
    },
    {
        "name": "Valuation & Appraisal",
        "category": "finance",
        "base_price": "35000.00",
        "icon": "TrendingUp",
        "description": "Certified bank-approved property valuation to accurately determine current market value for sales and loan applications.",
    },
    {
        "name": "Home Loan Consultation",
        "category": "finance",
        "base_price": "8000.00",
        "icon": "ShieldCheck",
        "description": "Expert financial mediation connecting you with top-tier banking partners to secure the lowest interest rates for home financing.",
    },
    {
        "name": "Premium Interior Design",
        "category": "construction",
        "base_price": "85000.00",
        "icon": "Sparkles",
        "description": "High-end 3D spatial planning, interior architecture, and smart-home integration design packages tailored to your canvas.",
    },
    {
        "name": "Renovation & Repair Crew",
        "category": "construction",
        "base_price": "120000.00",
        "icon": "Wrench",
        "description": "Deploy a dedicated crew of elite artisans for complete structural upgrades, facade makeovers, and deep property repairs.",
    },
    {
        "name": "Aerial Photography & Media",
        "category": "marketing",
        "base_price": "30000.00",
        "icon": "Camera",
        "description": "Drone footage, 360-degree virtual tours, and hyper-realistic HDR photography to massively boost buyer engagement.",
    },
    {
        "name": "Elite Moving & Relocation",
        "category": "marketing",
        "base_price": "20000.00",
        "icon": "Navigation",
        "description": "White-glove packing, transportation, and setup services. Your assets are tracked, insured, and handled with extreme care.",
    },
    {
        "name": "Deep Cleaning & Maintenance",
        "category": "construction",
        "base_price": "15000.00",
        "icon": "Crown",
        "description": "Complete pre-sale industrial hygiene operations. Includes exterior pressure washing and deep interior sterilizations.",
    },
    {
        "name": "Land Surveying & Mapping",
        "category": "legal",
        "base_price": "40000.00",
        "icon": "MapPin",
        "description": "Official topographic mapping and precise boundary dispute resolutions verified by state-licensed municipal surveyors."
    }
]

for s in services:
    Service.objects.create(**s)

print(f"Successfully seeded {len(services)} high-end premium services!")
