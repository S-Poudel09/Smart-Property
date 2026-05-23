import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from properties.models import Property

props = Property.objects.all()
for p in props:
    p.latitude = 27.7172 if not p.latitude else p.latitude
    p.longitude = 85.3240 if not p.longitude else p.longitude
    p.virtual_tour_url = "https://my.matterport.com/show/?m=12345" if not p.virtual_tour_url else p.virtual_tour_url
    p.model_3d_url = "/models/house.glb"
    p.tour_360_url = "https://my.matterport.com/show/?m=JGPuSuihtZ9"
    p.save()

print(f"Updated {props.count()} properties with coords and 3D tours.")
