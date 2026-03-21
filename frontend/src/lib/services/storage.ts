import { ServiceProvider, ServiceBooking, BookingStatus } from '@/types/service';

const PROVIDERS_KEY = 'smartproperty_services';
const BOOKINGS_KEY = 'smartproperty_service_bookings';

const DEFAULT_PROVIDERS: ServiceProvider[] = [
    {
        id: 'prov-1',
        name: 'Lalpurja Verification Experts',
        category: 'legal',
        phone: '+977 1 4412345',
        email: 'info@lalpurja.com.np',
        city: 'Kathmandu',
        priceRange: 'Rs 5,000 - Rs 25,000',
        rating: 4.8,
        verified: true,
        description: 'Comprehensive legal verification of land ownership documents (Lalpurja), title deeds, and official land records from Malpot.'
    },
    {
        id: 'prov-2',
        name: 'Nepal Land Surveyors (Napi)',
        category: 'inspection',
        phone: '+977 9841234567',
        email: 'contact@nepalsurvey.com',
        city: 'Pokhara',
        priceRange: 'Rs 10,000 - Rs 50,000',
        rating: 4.9,
        verified: true,
        description: 'Professional land surveying, area measurement, and boundary verification (Napi) services for residential and commercial properties.'
    },
    {
        id: 'prov-3',
        name: 'Everest Relocation & Movers',
        category: 'moving',
        phone: '+977 1 5512345',
        email: 'hello@everestmovers.com',
        city: 'Kathmandu',
        priceRange: 'Rs 8,000 - Rs 20,000',
        rating: 4.6,
        verified: false,
        description: 'Safe and hassle-free packing and moving services across all major cities of Nepal with specialized staff.'
    },
    {
        id: 'prov-4',
        name: 'Himalayan Interior & Renovation',
        category: 'renovation',
        phone: '+977 9801234567',
        email: 'design@himalayan.com.np',
        city: 'Lalitpur',
        priceRange: 'Rs 50,000+',
        rating: 4.7,
        verified: true,
        description: 'Modern Nepali interior design and complete home renovation services with professional architects and engineers.'
    }
];

export const getAllProviders = (): ServiceProvider[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(PROVIDERS_KEY);
    if (!stored) {
        seedDefaultProviders();
        return DEFAULT_PROVIDERS;
    }
    return JSON.parse(stored);
};

export const seedDefaultProviders = () => {
    if (typeof window !== 'undefined' && !localStorage.getItem(PROVIDERS_KEY)) {
        localStorage.setItem(PROVIDERS_KEY, JSON.stringify(DEFAULT_PROVIDERS));
    }
};

export const getProviderById = (id: string): ServiceProvider | undefined => {
    return getAllProviders().find(p => p.id === id);
};

export const updateProviderVerified = (id: string, verified: boolean) => {
    const providers = getAllProviders();
    const index = providers.findIndex(p => p.id === id);
    if (index >= 0) {
        providers[index].verified = verified;
        localStorage.setItem(PROVIDERS_KEY, JSON.stringify(providers));
    }
};

// Bookings
export const getAllBookings = (): ServiceBooking[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(BOOKINGS_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const createBooking = (data: Omit<ServiceBooking, 'id' | 'status' | 'createdAt'>): ServiceBooking => {
    const bookings = getAllBookings();
    const newBooking: ServiceBooking = {
        ...data,
        id: `book-${Date.now()}`,
        status: 'REQUESTED',
        createdAt: new Date().toISOString()
    };
    bookings.push(newBooking);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    return newBooking;
};

export const getBookingsByBuyer = (buyerId: string): ServiceBooking[] => {
    return getAllBookings().filter(b => b.buyerId === buyerId);
};

export const updateBookingStatus = (id: string, status: BookingStatus) => {
    const bookings = getAllBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index >= 0) {
        bookings[index].status = status;
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    }
};
