import { ReactNode } from 'react';

interface ContainerProps {
    children: ReactNode;
    className?: string;
    fluid?: boolean;
}

const Container = ({ children, className = '', fluid = false }: ContainerProps) => {
    return (
        <div
            className={`mx-auto px-4 sm:px-6 lg:px-8 ${fluid ? 'w-full' : 'max-w-7xl'
                } ${className}`}
        >
            {children}
        </div>
    );
};

export default Container;
