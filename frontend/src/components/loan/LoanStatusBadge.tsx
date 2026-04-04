'use client';

import { LoanStatus } from '@/types/loan';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface LoanStatusBadgeProps {
    status: LoanStatus;
}

export const LoanStatusBadge = ({ status }: LoanStatusBadgeProps) => {
    const config = {
        SUBMITTED: { label: 'Submitted', color: 'bg-blue-100 text-blue-700 border-blue-200' },
        UNDER_REVIEW: { label: 'Under Review', color: 'bg-amber-100 text-amber-700 border-amber-200' },
        APPROVED: { label: 'Approved', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
        REJECTED: { label: 'Rejected', color: 'bg-rose-100 text-rose-700 border-rose-200' },
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
