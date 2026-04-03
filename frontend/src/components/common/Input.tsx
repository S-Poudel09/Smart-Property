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
            <div className="space-y-2 w-full">
                {label && (
                    <label className="block text-xs font-bold text-muted uppercase tracking-[0.1em] ml-1">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    <input
                        className={cn(
                            "form-input-clean shadow-sm",
                            error && "border-danger ring-danger/10",
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                    <div className="absolute inset-0 rounded-xl border border-primary/0 group-focus-within:border-primary/10 pointer-events-none transition-all duration-300 ring-4 ring-primary/0 group-focus-within:ring-primary/5" />
                </div>
                {error && (
                    <p className="text-[11px] font-bold text-danger flex items-center gap-1.5 ml-1 animate-slide-up">
                        <span className="h-1 w-1 rounded-full bg-danger" /> {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
