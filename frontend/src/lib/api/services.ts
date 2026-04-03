import api from './http';

export interface Service {
    id: string;
    name: string;
    category: string;
    description: string;
    base_price: string;
    icon: string;
}

export interface ServiceBooking {
    id: string;
    service: string;
    service_details: Service;
    status: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
    scheduled_date?: string;
    notes?: string;
    created_at: string;
}

export const getServices = async (): Promise<Service[]> => {
    const response = await api.get('services/');
    return response.data;
};

export const getServiceBookings = async (): Promise<ServiceBooking[]> => {
    const response = await api.get('services/bookings/');
    return response.data;
};

export const bookService = async (serviceId: string, notes: string = '', scheduledDate?: string) => {
    const response = await api.post('services/bookings/', {
        service: serviceId,
        notes,
        scheduled_date: scheduledDate
    });
    return response.data;
};
