import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, type, value, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1a2e]/60">
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    className={cn(
                        'flex h-14 w-full rounded-2xl border border-royal-silk bg-white px-6 py-4 text-sm text-[#1a1a2e] ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm',
                        error && 'border-red-500 focus-visible:ring-red-500',
                        className
                    )}
                    ref={ref}
                    value={value}
                    {...props}
                />
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
