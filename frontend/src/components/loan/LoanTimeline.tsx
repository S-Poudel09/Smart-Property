'use client';

import { LoanStatus } from '@/types/loan';
import { CheckCircle2, Clock, ShieldCheck, XCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface LoanTimelineProps {
    status: LoanStatus;
    updatedAt: string;
}

export const LoanTimeline = ({ status, updatedAt }: LoanTimelineProps) => {
    const steps = [
        { id: 'SUBMITTED', label: 'Application Submitted', icon: Clock },
        { id: 'UNDER_REVIEW', label: 'Under Review', icon: ShieldCheck },
        { id: 'FINAL', label: status === 'REJECTED' ? 'Rejected' : 'Approved', icon: status === 'REJECTED' ? XCircle : CheckCircle2 },
    ];

    const getCurrentStep = () => {
        if (status === 'SUBMITTED') return 0;
        if (status === 'UNDER_REVIEW') return 1;
        return 2;
    };

    const currentStep = getCurrentStep();

    return (
        <div className="relative">
            <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-100" />
            <div className="space-y-8">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isActive = index === currentStep;
                    const Icon = step.icon;

                    return (
                        <div key={step.id} className="relative flex items-start gap-4">
                            <div className={cn(
                                "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                                isCompleted ? "bg-emerald-500 border-emerald-500 text-white" :
                                    isActive ? (status === 'REJECTED' ? "bg-rose-500 border-rose-500 text-white" : "bg-blue-600 border-blue-600 text-white") :
                                        "bg-white border-gray-200 text-gray-400"
                            )}>
                                <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className={cn(
                                    "text-sm font-bold transition-colors",
                                    isActive ? "text-gray-900" : "text-gray-500"
                                )}>
                                    {step.label}
                                </span>
                                {isActive && (
                                    <span className="text-xs text-gray-400 mt-1">
                                        Last update: {new Date(updatedAt).toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
