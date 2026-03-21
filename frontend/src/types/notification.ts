export type NotificationType = 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR';

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    createdAt: string;
    read: boolean;
    type: NotificationType;
    link?: string;
}
