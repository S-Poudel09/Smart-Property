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
        PENDING: 'bg-amber-50 text-amber-700 border-amber-200/50',
        APPROVED: 'bg-success/10 text-success border-success/20',
        REJECTED: 'bg-danger/10 text-danger border-danger/20',
        SUBMITTED: 'bg-blue-50 text-blue-700 border-blue-200/50',
        PARTIAL: 'bg-orange-50 text-orange-700 border-orange-200/50',
        COMPLETED: 'bg-success/10 text-success border-success/20 shadow-sm shadow-success/10',
        FAILED: 'bg-danger/10 text-danger border-danger/20',
        PAID: 'bg-blue-50 text-blue-700 border-blue-200/50',
        VERIFIED: 'bg-success/10 text-success border-success/20',
        REFUNDED: 'bg-slate-50 text-slate-700 border-slate-200/50',
        AWAITING_PROOF: 'bg-orange-50 text-orange-700 border-orange-200/50',
        PROOF_UPLOADED: 'bg-blue-50 text-blue-700 border-blue-200/50',
        CONFIRMED: 'bg-success/10 text-success border-success/20 shadow-sm shadow-success/10',
        CANCELLED: 'bg-danger/10 text-danger border-danger/20',
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
            <span className={cn("mr-1.5 h-1 w-1 rounded-full", (statusLabel === 'APPROVED' || statusLabel === 'COMPLETED' || statusLabel === 'CONFIRMED') ? 'bg-indigo-500' : 'bg-current')} />
            {status.replace('_', ' ')}
        </span>
    );
};

export { StatusBadge };
