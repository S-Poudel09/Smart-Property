import { CheckCircle2, Clock, Upload, XCircle, ShieldCheck } from 'lucide-react';
import { TransactionStatus } from '@/types/transaction';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface TransactionTimelineProps {
    status: TransactionStatus;
    className?: string;
}

export const TransactionTimeline = ({ status, className }: TransactionTimelineProps) => {
    const steps = [
        { id: 'PENDING', label: 'Request Sent', icon: Clock },
        { id: 'AWAITING_PROOF', label: 'Payment Pending', icon: ShieldCheck },
        { id: 'PROOF_UPLOADED', label: 'Proof Submitted', icon: Upload },
        { id: 'CONFIRMED', label: 'Completed', icon: CheckCircle2 },
    ];

    if (status === 'CANCELLED') {
        return (
            <div className={cn("flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700", className)}>
                <XCircle className="h-5 w-5" />
                <span className="font-bold">Transaction Cancelled</span>
            </div>
        );
    }

    const currentStepIndex = steps.findIndex(s => s.id === status);
    // If not found (e.g. status used is slightly different or at start), default logic
    const activeIndex = currentStepIndex >= 0 ? currentStepIndex : (status === 'AWAITING_PROOF' ? 1 : 0);

    return (
        <div className={cn("space-y-8", className)}>
            <div className="relative flex justify-between">
                {/* Connector Line */}
                <div className="absolute top-5 left-0 h-0.5 w-full bg-gray-200 -z-10" />
                <div
                    className="absolute top-5 left-0 h-0.5 bg-purple-600 transition-all duration-500 -z-10"
                    style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, idx) => {
                    const isActive = idx <= activeIndex;
                    const isCurrent = idx === activeIndex;
                    const Icon = step.icon;

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-3 bg-white px-2">
                            <div className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                                isCurrent ? "border-purple-600 bg-purple-600 text-white scale-110 shadow-lg" :
                                    isActive ? "border-purple-600 bg-purple-50 text-purple-600" :
                                        "border-gray-200 bg-white text-gray-400"
                            )}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider text-center max-w-[80px]",
                                isCurrent ? "text-purple-600" : isActive ? "text-gray-900" : "text-gray-400"
                            )}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
