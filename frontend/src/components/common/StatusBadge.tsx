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
        PENDING: 'bg-amber-50 text-amber-700 border-amber-100/50',
        APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-100/50',
        REJECTED: 'bg-rose-50 text-rose-700 border-rose-100/50',
        SUBMITTED: 'bg-indigo-50 text-indigo-700 border-indigo-100/50',
        PARTIAL: 'bg-orange-50 text-orange-700 border-orange-100/50',
        COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-100/50 shadow-sm shadow-emerald-100/20',
        FAILED: 'bg-rose-50 text-rose-700 border-rose-100/50',
        REFUNDED: 'bg-indigo-50 text-indigo-700 border-indigo-100/50',
        AWAITING_PROOF: 'bg-orange-50 text-orange-700 border-orange-100/50',
        PROOF_UPLOADED: 'bg-blue-50 text-blue-700 border-blue-100/50',
        CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-100/50 shadow-sm shadow-emerald-100/20',
        CANCELLED: 'bg-rose-50 text-rose-700 border-rose-100/50',
    };

    const statusLabel = styles[status] ? status : 'PENDING';

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-lg border px-3 py-1 text-[9px] font-bold uppercase tracking-[0.1em] transition-all duration-300',
                styles[statusLabel],
                className
            )}
        >
            <span className={cn("mr-1.5 h-1 w-1 rounded-full", (statusLabel === 'APPROVED' || statusLabel === 'COMPLETED' || statusLabel === 'CONFIRMED') ? 'bg-emerald-500' : 'bg-current')} />
            {status.replace('_', ' ')}
        </span>
    );
};

export { StatusBadge };
