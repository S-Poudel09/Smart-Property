interface LoaderProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const Loader = ({ size = 'md', className }: LoaderProps) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div
                className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-blue-600 border-t-transparent`}
            ></div>
        </div>
    );
};

export { Loader };
