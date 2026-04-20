'use client';

import { BookingStatus } from '@/types/service';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BookingStatusBadgeProps {
    status: BookingStatus;
}

export const BookingStatusBadge = ({ status }: BookingStatusBadgeProps) => {
    const config = {
        REQUESTED: { label: 'Requested', color: 'bg-purple-100 text-purple-700 border-purple-200' },
        CONFIRMED: { label: 'Confirmed', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
        COMPLETED: { label: 'Completed', color: 'bg-gray-100 text-gray-700 border-gray-200' },
        CANCELLED: { label: 'Cancelled', color: 'bg-rose-100 text-rose-700 border-rose-200' },
    };

    const { label, color } = config[status];

    return (
        <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
            color
        )}>
            {label}
        </span>
    );
};
