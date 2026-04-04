import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from properties.models import Property

props = Property.objects.all()
for p in props:
    p.lat = 27.7172 if not p.lat else p.lat
    p.lng = 85.3240 if not p.lng else p.lng
    p.virtual_tour_url = "https://my.matterport.com/show/?m=12345" if not p.virtual_tour_url else p.virtual_tour_url
    p.save()

print(f"Updated {props.count()} properties with coords and 3D tours.")
