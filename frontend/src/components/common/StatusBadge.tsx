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
    const key = (status || '').toUpperCase();

    const styles: Record<string, string> = {
        PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
        APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        PUBLISHED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        REJECTED: 'bg-red-50 text-red-700 border-red-200',
        SUBMITTED: 'bg-blue-50 text-blue-700 border-blue-200',
        DRAFT: 'bg-slate-50 text-slate-600 border-slate-200',
        PARTIAL: 'bg-orange-50 text-orange-700 border-orange-200',
        COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        FAILED: 'bg-red-50 text-red-700 border-red-200',
        PAID: 'bg-blue-50 text-blue-700 border-blue-200',
        VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        REFUNDED: 'bg-slate-50 text-slate-700 border-slate-200',
        AWAITING_PROOF: 'bg-orange-50 text-orange-700 border-orange-200',
        PROOF_UPLOADED: 'bg-blue-50 text-blue-700 border-blue-200',
        CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        CANCELLED: 'bg-red-50 text-red-700 border-red-200',
        UNDER_REVIEW: 'bg-purple-50 text-purple-700 border-purple-200',
        AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        SOLD: 'bg-slate-50 text-slate-600 border-slate-200',
        RENTED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };

    const resolvedStyle = styles[key] || 'bg-slate-50 text-slate-600 border-slate-200';
    const isSuccess = ['APPROVED', 'COMPLETED', 'CONFIRMED', 'VERIFIED', 'PUBLISHED', 'AVAILABLE'].includes(key);

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-lg border px-3 py-1 text-[9px] font-bold uppercase tracking-[0.1em] transition-all duration-300',
                resolvedStyle,
                className
            )}
        >
            <span className={cn('mr-1.5 h-1 w-1 rounded-full', isSuccess ? 'bg-emerald-500' : 'bg-current')} />
            {(status || '').replace(/_/g, ' ')}
        </span>
    );
};

export { StatusBadge };
