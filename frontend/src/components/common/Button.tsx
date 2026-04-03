import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
        const variants = {
            primary: 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30 active:scale-[0.98]',
            secondary: 'bg-white text-primary border border-primary/20 hover:bg-primary/5 hover:border-primary/30 active:scale-[0.98]',
            outline: 'bg-transparent text-foreground border border-border hover:bg-gray-50 hover:border-muted active:scale-[0.98]',
            ghost: 'bg-transparent text-muted hover:bg-gray-100 hover:text-foreground active:scale-[0.98]',
            danger: 'bg-danger text-white shadow-lg shadow-danger/20 hover:bg-danger/90 hover:shadow-danger/30 active:scale-[0.98]',
            success: 'bg-success text-white shadow-lg shadow-success/20 hover:bg-success/90 hover:shadow-success/30 active:scale-[0.98]',
        };

        const sizes = {
            sm: 'h-9 px-4 text-xs font-semibold',
            md: 'h-11 px-6 text-sm font-bold',
            lg: 'h-14 px-8 text-base font-bold',
            icon: 'h-11 w-11 flex items-center justify-center',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-xl font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] text-xs uppercase tracking-widest',
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={isLoading || disabled}
                {...props}
            >
                {isLoading ? (
                    <svg
                        className="mr-2 h-4 w-4 animate-spin text-current"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                ) : null}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
