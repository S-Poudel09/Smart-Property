class PropertyPricePredictor:
    """
    A rule-based price prediction engine for SmartProperty.
    Calculates estimated property value based on historical factors and property characteristics.
    """
    
    BASE_PRICE_PER_SQFT = 5000  # Base price in NPR per sqft
    
    # Weight factors for different property types
    TYPE_WEIGHTS = {
        'house': 1.2,
        'flat': 1.0,
        'bungalow': 1.8,
        'apartment': 1.5,
        'commercial': 2.5,
        'hostel': 1.1,
        'land': 0.8  # Price for land only
    }
    
    # Weight factors for locations (simplified for MVP)
    LOCATION_WEIGHTS = {
        'kathmandu': 1.8,
        'lalitpur': 1.6,
        'bhaktapur': 1.3,
        'pokhara': 1.5,
        'chitwan': 1.1,
        'butwal': 1.0,
        'dharan': 1.0
    }

    @classmethod
    def predict(cls, data):
        """
        Predict price based on input data.
        Expected keys: area_sqft, bedrooms, bathrooms, property_type, location, stories
        """
        area = float(data.get('area_sqft', 0))
        beds = int(data.get('bedrooms', 1))
        baths = int(data.get('bathrooms', 1))
        p_type = str(data.get('property_type', 'house')).lower()
        location = str(data.get('location', '')).lower()
        stories = int(data.get('stories', 1))
        
        if area <= 0:
            return 0
            
        # 1. Base Calculation
        price = area * cls.BASE_PRICE_PER_SQFT
        
        # 2. Type Multiplier
        type_mult = cls.TYPE_WEIGHTS.get(p_type, 1.0)
        price *= type_mult
        
        # 3. Location Multiplier
        # Try finding a match in our location weights
        loc_mult = 1.0
        for loc, weight in cls.LOCATION_WEIGHTS.items():
            if loc in location:
                loc_mult = weight
                break
        price *= loc_mult
        
        # 4. Amenities Factors
        price += (beds * 500000) # 5 Lakh per bedroom
        price += (baths * 200000) # 2 Lakh per bathroom
        
        # 5. Structure Factor
        if stories > 1:
            price *= (1 + (stories * 0.05)) # 5% increase per story
            
        # 6. Detailed Feature Multipliers (if available)
        if data.get('mainroad'): price *= 1.15
        if data.get('airconditioning'): price *= 1.1
        if data.get('parking_spaces', 0) > 0: price += (int(data.get('parking_spaces')) * 300000)
        
        return round(price, -3) # Round to nearest thousand

