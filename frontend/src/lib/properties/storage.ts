import { Property, PropertyStatus } from '@/types/property';
import { createNotification } from '../notifications/storage';

const STORAGE_KEY = 'smartproperty_properties';

export const getAllProperties = (): Property[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const getPropertiesBySeller = (sellerId: string): Property[] => {
    const all = getAllProperties();
    return all.filter(p => p.sellerId === sellerId);
};

export const getPropertiesByStatus = (status: PropertyStatus): Property[] => {
    const all = getAllProperties();
    return all.filter(p => p.status === status);
};

export const getPropertyById = (id: string): Property | undefined => {
    return getAllProperties().find(p => p.id === id);
};

export const upsertProperty = (property: Property): void => {
    const properties = getAllProperties();
    const index = properties.findIndex(p => p.id === property.id);

    if (index >= 0) {
        properties[index] = { ...property, updatedAt: new Date().toISOString() };
    } else {
        properties.push({ ...property, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
};

export const deleteProperty = (id: string): void => {
    const properties = getAllProperties().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
};

export const updatePropertyStatus = (id: string, status: PropertyStatus, extra: Partial<Property> = {}): void => {
    const property = getPropertyById(id);
    if (property) {
        upsertProperty({ ...property, status, ...extra });
    }
};

export const submitProperty = (id: string): void => {
    updatePropertyStatus(id, 'SUBMITTED');
};

export const getPendingProperties = (): Property[] => {
    return getPropertiesByStatus('SUBMITTED');
};

export const adminApproveProperty = (id: string): void => {
    const property = getPropertyById(id);
    updatePropertyStatus(id, 'PUBLISHED', {
        isVerified: true,
        updatedAt: new Date().toISOString()
    });

    if (property) {
        createNotification({
            userId: property.sellerId,
            title: 'Property Approved!',
            message: `Your property "${property.title}" has been approved and is now live.`,
            type: 'SUCCESS',
            link: '/dashboard/seller'
        });
    }
};

export const adminRejectProperty = (id: string, reason: string): void => {
    const property = getPropertyById(id);
    updatePropertyStatus(id, 'REJECTED', {
        isVerified: false,
        rejectionReason: reason,
        updatedAt: new Date().toISOString()
    });

    if (property) {
        createNotification({
            userId: property.sellerId,
            title: 'Property Rejected',
            message: `Your property "${property.title}" was rejected: ${reason}`,
            type: 'ERROR',
            link: '/dashboard/seller'
        });
    }
};
