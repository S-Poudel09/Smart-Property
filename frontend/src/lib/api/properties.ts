import api from './http';
import { Property } from '@/types/property';

interface BackendProperty {
    id: string;
    seller_id: string;
    title: string;
    description?: string;
    price: string;
    city?: string;
    address?: string;
    lat?: number;
    lng?: number;
    listing_type: string;
    property_type: string;
    beds?: number;
    baths?: number;
    area_sqft?: number;
    images?: string[];
    documents?: string[];
    status: string;
    is_verified: boolean;
    rejection_reason?: string;
    boundary_coordinates?: any;
    virtual_tour_url?: string;
    created_at: string;
    updated_at: string;
}

let propertiesCache: { data: Property[], timestamp: number } | null = null;
const CACHE_DURATION = 30000; // 30 seconds

export const getProperties = async (sellerOnly = false): Promise<Property[]> => {
    const now = Date.now();
    // Only use cache for public repository, not for personal seller listings
    if (!sellerOnly && propertiesCache && (now - propertiesCache.timestamp < CACHE_DURATION)) {
        return propertiesCache.data;
    }

    const endpoint = sellerOnly ? 'properties/?seller=me' : 'properties/';
    const response = await api.get(endpoint);
    const data = response.data?.results ?? response.data ?? [];

    // Map backend snake_case to frontend camelCase
    const mappedData = data.map((item: any, index: number) => ({
        id: item.id || item.PropertyID,
        sellerId: item.seller_id || item.owner?.id,
        title: item.title,
        description: item.description || '',
        price: parseFloat(item.price || '0'),
        location: item.location || `${item.city || ''}, ${item.address || ''}`,
        address: item.address,
        city: item.city,
        lat: item.lat || item.latitude || (index % 2 === 0 ? 27.7172 : 27.700769),
        lng: item.lng || item.longitude || (index % 2 === 0 ? 85.3240 : 85.300140),
        type: item.listing_type || 'sale',
        category: item.property_type || 'house',
        bedrooms: item.beds || 0,
        bathrooms: item.baths || 0,
        area: item.area_sqft || 0,
        area_ropani: item.area_ropani,
        area_anna: item.area_anna,
        ward: item.ward,
        municipality: item.municipality,
        district: item.district,
        images: (item.property_images?.map((img: any) => {
            const path = typeof img === 'string' ? img : img.image;
            const { getFullImageUrl } = require('@/lib/utils/images');
            return getFullImageUrl(path);
        })) || item.images?.map((url: string) => {
            const { getFullImageUrl } = require('@/lib/utils/images');
            return getFullImageUrl(url);
        }) || [],
        documents: item.property_documents?.map((doc: any) => ({
            ...doc,
            document: require('@/lib/utils/images').getFullImageUrl(doc.document)
        })) || [],
        status: item.status,
        isVerified: item.is_verified,
        rejectionReason: item.rejection_reason,
        boundaryCoordinates: item.boundary_coordinates,
        virtualTourUrl: item.virtual_tour_url || item.tour_360_url || '',
        modelUrl: item.model_3d_url || item.modelUrl || '',
        features: item.features || [],
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        hostelGender: item.hostel_gender,
        foodIncluded: item.food_included,
        availableBeds: item.available_beds,
        bathroomType: item.bathroom_type,
        hasWifi: item.has_wifi,
        hasLaundry: item.has_laundry,
        roomType: item.room_type,
    }));

    propertiesCache = { data: mappedData, timestamp: now };
    return mappedData;
};

export const createProperty = async (data: FormData | Record<string, unknown>) => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await api.post('properties/', data, { headers });
    return response.data;
};

export const updateProperty = async (id: string, data: FormData | Record<string, unknown>) => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await api.patch(`properties/${id}/`, data, { headers });
    return response.data;
};

export const submitProperty = async (id: string) => {
    const response = await api.post(`properties/${id}/submit/`);
    return response.data;
};

export const approveProperty = async (id: string) => {
    const response = await api.post(`properties/${id}/approve/`);
    return response.data;
};

export const rejectProperty = async (id: string, reason: string) => {
    const response = await api.post(`properties/${id}/reject/`, { rejection_reason: reason });
    return response.data;
};

export const getProperty = async (id: string): Promise<Property | null> => {
    if (!id || id === 'undefined' || id.includes('[id]')) {
        console.warn('Aborting getProperty call for invalid ID:', id);
        return null;
    }
    const response = await api.get(`properties/${id}/`);
    const item = response.data;
    
    return {
        id: item.id || item.PropertyID,
        sellerId: item.seller_id || item.owner?.id,
        title: item.title,
        description: item.description || '',
        price: parseFloat(item.price || item.total_amount || '0'),
        location: item.location || `${item.city || ''}, ${item.address || ''}`,
        address: item.address,
        city: item.city,
        lat: item.lat || item.latitude || (27.7000 + (parseInt(item.id?.substring(0, 8) || '0', 16) % 1000) / 10000),
        lng: item.lng || item.longitude || (85.3000 + (parseInt(item.id?.substring(8, 16) || '0', 16) % 1000) / 10000),
        type: item.listing_type || 'sale',
        category: item.property_type || 'house',
        bedrooms: item.beds || 0,
        bathrooms: item.baths || 0,
        area: item.area_sqft || 0,
        area_ropani: item.area_ropani,
        area_anna: item.area_anna,
        ward: item.ward,
        municipality: item.municipality,
        district: item.district,
        images: (item.property_images?.map((img: any) => {
            const path = typeof img === 'string' ? img : img.image;
            const { getFullImageUrl } = require('@/lib/utils/images');
            return getFullImageUrl(path);
        })) || item.images?.map((url: string) => {
            const { getFullImageUrl } = require('@/lib/utils/images');
            return getFullImageUrl(url);
        }) || [],
        documents: item.property_documents?.map((doc: any) => ({
            ...doc,
            document: require('@/lib/utils/images').getFullImageUrl(doc.document)
        })) || [],
        status: item.status,
        isVerified: item.is_verified,
        rejectionReason: item.rejection_reason,
        boundaryCoordinates: item.boundary_coordinates,
        virtualTourUrl: item.virtual_tour_url || item.tour_360_url || '',
        modelUrl: item.model_3d_url || item.modelUrl || '',
        features: item.features || [],
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        hostelGender: item.hostel_gender,
        foodIncluded: item.food_included,
        availableBeds: item.available_beds,
        bathroomType: item.bathroom_type,
        hasWifi: item.has_wifi,
        hasLaundry: item.has_laundry,
        roomType: item.room_type,
    };
};

export const verifyDocument = async (propertyId: string, docId: string) => {
    const response = await api.post(`properties/${propertyId}/verify-document/${docId}/`);
    return response.data;
};

export const predictPrice = async (id: string, customData?: any) => {
    const response = await api.post(`properties/${id}/predict-price/`, customData || {});
    return response.data;
};
