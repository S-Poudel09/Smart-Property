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

export interface Property {
    id: string;
    sellerId: string;
    title: string;
    description: string;
    price: number;
    location: string; // Keep for backward compatibility/simplified display
    address: string;
    city: string;
    lat?: number;
    lng?: number;
    type: ListingType;
    category: PropertyCategory;
    bedrooms: number;
    bathrooms: number;
    area: number; // sqft
    area_ropani?: number;
    area_anna?: number;
    ward?: string;
    municipality?: string;
    district?: string;
    images: string[] | PropertyImage[]; // Keep string[] for initial mock, PropertyImage[] for new ones
    documents?: PropertyDocument[];
    status: PropertyStatus;
    isVerified: boolean;
    rejectionReason?: string;
    features: string[];
    boundaryCoordinates?: any; // Polygon coordinates for GIS
    virtualTourUrl?: string; // 360-degree virtual tour link
    createdAt: string;
    updatedAt: string;
    
    // Hostel Support
    propertyType?: PropertyCategory;
    hostelGender?: 'boys' | 'girls' | 'mixed';
    room_type?: string;
    foodIncluded?: boolean;
    hasWifi?: boolean;
    hasLaundry?: boolean;
    bathroomType?: 'attached' | 'shared';
    availableBeds?: number;
    
    // Workflow Tracking
    workflowStep?: number;
}
