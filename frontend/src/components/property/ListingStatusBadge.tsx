import { PropertyStatus } from '@/types/property';

interface ListingStatusBadgeProps {
    status: PropertyStatus;
}

export const ListingStatusBadge = ({ status }: ListingStatusBadgeProps) => {
    const variants: Record<PropertyStatus, string> = {
        draft: 'bg-gray-100 text-gray-600 border-gray-200',
        submitted: 'bg-blue-100 text-blue-700 border-blue-200',
        approved: 'bg-green-100 text-green-700 border-green-200',
        rejected: 'bg-red-100 text-red-700 border-red-200',
        published: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        available: 'bg-green-100 text-green-800 border-green-200',
        sold: 'bg-gray-100 text-gray-800 border-gray-200',
        rented: 'bg-blue-100 text-blue-800 border-blue-200',
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${variants[status] || variants.draft}`}>
            {status}
        </span>
    );
};
