export type ServiceCategory = 'inspection' | 'legal' | 'valuation' | 'moving' | 'renovation';

export interface ServiceProvider {
    id: string;
    name: string;
    category: ServiceCategory;
    phone: string;
    email: string;
    city: string;
    priceRange: string;
    rating: number;
    verified: boolean;
    description: string;
}

export type BookingStatus = 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface ServiceBooking {
    id: string;
    buyerId: string;
    providerId: string;
    propertyId?: string;
    bookingDate: string;
    note?: string;
    status: BookingStatus;
    createdAt: string;
}
