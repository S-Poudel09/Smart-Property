from django.contrib import admin
from .models import Property, PropertyImage, PropertyDocument

class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1

class PropertyDocumentInline(admin.TabularInline):
    model = PropertyDocument
    extra = 1

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'price', 'status', 'is_verified', 'created_at')
    list_filter = ('status', 'is_verified', 'property_type', 'listing_type')
    search_fields = ('title', 'location', 'owner__email')
    inlines = [PropertyImageInline, PropertyDocumentInline]
    actions = ['approve_properties', 'reject_properties']

    def approve_properties(self, request, queryset):
        queryset.update(status='PUBLISHED', is_verified=True)
    approve_properties.short_description = "Approve and Publish selected properties"

    def reject_properties(self, request, queryset):
        queryset.update(status='REJECTED')
    reject_properties.short_description = "Reject selected properties"
