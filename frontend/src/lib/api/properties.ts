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

export const getProperties = async (): Promise<Property[]> => {
    const response = await api.get('properties/');

    // Map backend snake_case to frontend camelCase
    return response.data.map((item: any) => ({
        id: item.id || item.PropertyID,
        sellerId: item.seller_id || item.owner?.id,
        title: item.title,
        description: item.description || '',
        price: parseFloat(item.price || '0'),
        location: item.location || `${item.city || ''}, ${item.address || ''}`,
        address: item.address,
        city: item.city,
        lat: item.lat || item.latitude,
        lng: item.lng || item.longitude,
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
        virtualTourUrl: item.virtual_tour_url,
        features: item.features || [],
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        hostelGender: item.hostel_gender,
        foodIncluded: item.food_included,
    }));
};

export const createProperty = async (data: FormData | Record<string, unknown>) => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await api.post('properties/', data, { headers });
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

export const getProperty = async (id: string): Promise<Property> => {
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
        lat: item.lat || item.latitude,
        lng: item.lng || item.longitude,
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
        virtualTourUrl: item.virtual_tour_url,
        features: item.features || [],
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        hostelGender: item.hostel_gender,
        foodIncluded: item.food_included,
    };
};

export const verifyDocument = async (propertyId: string, docId: string) => {
    const response = await api.post(`properties/${propertyId}/verify-document/${docId}/`);
    return response.data;
};
