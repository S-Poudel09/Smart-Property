import { PropertyStatus } from '@/types/property';
import { TransactionStatus } from '@/types/transaction';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface StatusBadgeProps {
    status: string;
    className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
    const styles: Record<string, string> = {
        available: 'bg-green-100 text-green-800 border-green-200',
        sold: 'bg-gray-100 text-gray-800 border-gray-200',
        rented: 'bg-blue-100 text-blue-800 border-blue-200',
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        DRAFT: 'bg-gray-100 text-gray-600 border-gray-200',
        SUBMITTED: 'bg-blue-50 text-blue-700 border-blue-100',
        APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        REJECTED: 'bg-red-50 text-red-700 border-red-100',
        PUBLISHED: 'bg-green-100 text-green-800 border-green-200',
        // Transaction Statuses (from API)
        PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-100',
        PARTIAL: 'bg-orange-50 text-orange-700 border-orange-100',
        COMPLETED: 'bg-green-50 text-green-700 border-green-100',
        FAILED: 'bg-red-50 text-red-700 border-red-100',
        REFUNDED: 'bg-purple-50 text-purple-700 border-purple-100',
        AWAITING_PROOF: 'bg-orange-50 text-orange-700 border-orange-100',
        PROOF_UPLOADED: 'bg-blue-50 text-blue-700 border-blue-100',
        CONFIRMED: 'bg-green-50 text-green-700 border-green-100',
        CANCELLED: 'bg-red-50 text-red-700 border-red-100',
    };

    const statusLabel = styles[status] ? status : 'pending';

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-tight transition-colors',
                styles[statusLabel],
                className
            )}
        >
            {status.replace('_', ' ')}
        </span>
    );
};

export { StatusBadge };
