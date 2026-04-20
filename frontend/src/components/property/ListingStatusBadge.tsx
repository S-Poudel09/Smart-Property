import { PropertyStatus } from '@/types/property';

interface ListingStatusBadgeProps {
    status: PropertyStatus;
}

export const ListingStatusBadge = ({ status }: ListingStatusBadgeProps) => {
    const variants: Record<PropertyStatus, string> = {
        draft: 'bg-gray-100 text-gray-600 border-gray-200',
        submitted: 'bg-purple-100 text-purple-700 border-purple-200',
        approved: 'bg-indigo-100 text-indigo-800 border-green-200',
        rejected: 'bg-red-100 text-red-700 border-red-200',
        published: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        available: 'bg-indigo-100 text-indigo-900 border-green-200',
        sold: 'bg-gray-100 text-gray-800 border-gray-200',
        rented: 'bg-purple-100 text-purple-800 border-purple-200',
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${variants[status] || variants.draft}`}>
            {status}
        </span>
    );
};
