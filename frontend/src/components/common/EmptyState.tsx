import { ReactNode } from 'react';
import { Search } from 'lucide-react';

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
}

const EmptyState = ({
    title,
    description,
    icon = <Search className="h-12 w-12 text-gray-400" />,
    action,
    className,
}: EmptyStateProps) => {
    return (
        <div className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center ${className}`}>
            <div className="mb-4">{icon}</div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
};

export { EmptyState };
