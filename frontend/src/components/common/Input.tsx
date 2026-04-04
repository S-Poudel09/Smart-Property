import { useState, InputHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Eye, EyeOff } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, type, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === 'password';
        const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

        return (
            <div className="space-y-2.5 w-full group">
                {label && (
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1 transition-colors group-focus-within:text-accent">
                        {label}
                    </label>
                )}
                <div className="relative flex items-center">
                    <input
                        type={inputType}
                        autoComplete={type === 'password' ? 'current-password' : 'email'}
                        className={cn(
                            "w-full h-14 px-6 rounded-2xl bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-800",
                            "placeholder:text-slate-400 placeholder:italic placeholder:font-medium",
                            "focus:bg-white focus:border-accent/40 focus:ring-4 focus:ring-accent/5 outline-none transition-all duration-300",
                            isPassword && "pr-14",
                            error && "border-danger ring-danger/10",
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-5 flex items-center justify-center p-1.5 text-slate-400 hover:text-accent transition-colors focus:outline-none focus:text-accent"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    )}
                </div>
                {error && (
                    <p className="text-[10px] font-black uppercase tracking-widest text-danger flex items-center gap-2 ml-1 animate-in">
                        <span className="h-1 w-1 rounded-full bg-danger" /> {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
