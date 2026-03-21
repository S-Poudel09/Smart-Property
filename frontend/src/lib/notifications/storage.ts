import { Notification } from '@/types/notification';

const NOTIFICATIONS_KEY = 'smartproperty_notifications';

export const getAllNotifications = (): Notification[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const getNotificationsByUserId = (userId: string): Notification[] => {
    return getAllNotifications().filter(n => n.userId === userId);
};

export const createNotification = (data: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification => {
    const notifications = getAllNotifications();
    const newNotification: Notification = {
        ...data,
        id: `notif-${Date.now()}`,
        createdAt: new Date().toISOString(),
        read: false,
    };
    notifications.push(newNotification);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));

    // Dispatch a custom event for real-time UI updates
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('smartproperty_new_notification', { detail: newNotification }));
    }

    return newNotification;
};

export const markAsRead = (id: string) => {
    const notifications = getAllNotifications();
    const index = notifications.findIndex(n => n.id === id);
    if (index >= 0) {
        notifications[index].read = true;
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    }
};

export const markAllAsRead = (userId: string) => {
    const notifications = getAllNotifications();
    const updated = notifications.map(n => n.userId === userId ? { ...n, read: true } : n);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
};

export const getUnreadCount = (userId: string): number => {
    return getNotificationsByUserId(userId).filter(n => !n.read).length;
};
