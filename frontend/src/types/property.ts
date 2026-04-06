export type PropertyStatus = 'available' | 'sold' | 'rented' | 'pending' | 'draft' | 'submitted' | 'approved' | 'rejected' | 'published';
export type ListingType = 'sale' | 'rent';
export type PropertyCategory = 'house' | 'flat' | 'bungalow' | 'apartment' | 'commercial' | 'hostel' | 'land';

export interface PropertyImage {
    name: string;
    size: number;
    type: string;
    previewUrl: string;
}

export interface PropertyDocument {
    docType: 'citizenship' | 'landownership' | 'tax' | 'other';
    name: string;
    size: number;
    type: string;
}

export interface Review {
    id: string;
    user: {
        id: string;
        full_name: string;
        email: string;
    };
    rating: number;
    comment: string;
    isVerifiedPurchase: boolean;
    createdAt: string;
}

export interface Property {
    id: string;
    sellerId: string;
    title: string;
    description: string;
    price: number;
    location: string;
    address: string;
    city: string;
    lat?: number;
    lng?: number;
    type: ListingType;
    category: PropertyCategory;
    bedrooms: number;
    bathrooms: number;
    area: number;
    area_ropani?: number;
    area_anna?: number;
    ward?: string;
    municipality?: string;
    district?: string;
    images: string[] | PropertyImage[];
    documents?: PropertyDocument[];
    status: PropertyStatus;
    isVerified: boolean;
    rejectionReason?: string;
    features: string[];
    boundaryCoordinates?: any;
    virtualTourUrl?: string;
    createdAt: string;
    updatedAt: string;
    
    // Additional features
    reviews?: Review[];
    ratingStats?: {
        average: number;
        count: number;
    };
    
    // Hostel Support
    propertyType?: PropertyCategory;
    property_type?: PropertyCategory;
    hostelGender?: 'boys' | 'girls' | 'mixed';
    hostel_gender?: 'boys' | 'girls' | 'mixed';
    foodIncluded?: boolean;
    food_included?: boolean;
    hasWifi?: boolean;
    has_wifi?: boolean;
    hasLaundry?: boolean;
    has_laundry?: boolean;
    bathroomType?: 'attached' | 'shared';
    bathroom_type?: 'attached' | 'shared';
    availableBeds?: number;
    available_beds?: number;
    roomType?: string;
    room_type?: string;
    
    // Dataset compatibility
    beds?: number;
    baths?: number;
    area_sqft?: number;
    
    // Workflow Tracking
    workflowStep?: number;
}
