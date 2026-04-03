import api from './http';

export interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    link?: string;
}

export const getNotifications = async (): Promise<Notification[]> => {
    try {
        const response = await api.get('notifications/');
        return response.data;
    } catch (error) {
        console.error("Error fetching notifications:", error);
        throw new Error("Failed to fetch notifications.");
    }
};

export const markAsRead = async (id: string) => {
    try {
        const response = await api.patch(`notifications/${id}/mark-read/`);
        return response.data;
    } catch (error) {
        console.error(`Error marking notification ${id} as read:`, error);
        throw new Error("Failed to mark notification as read.");
    }
};

export const markAllAsRead = async () => {
    try {
        const response = await api.post('notifications/mark-all-read/');
        return response.data;
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        throw new Error("Failed to mark all notifications as read.");
    }
};
