'use client';

import { Check, MessageSquare, CreditCard, ShieldCheck, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface TransactionStepperProps {
    currentStep: number; // 1 to 5
}

const steps = [
    { title: 'Contact', icon: MessageSquare, description: 'Reach out to the owner' },
    { title: 'Chat', icon: MessageSquare, description: 'Discuss terms & details' },
    { title: 'Payment', icon: CreditCard, description: 'Secure Khalti payment' },
    { title: 'Verify', icon: ShieldCheck, description: 'Admin verification' },
    { title: 'Deal', icon: Star, description: 'Handover complete' },
];

export const TransactionStepper = ({ currentStep }: TransactionStepperProps) => {
    return (
        <div className="w-full bg-white p-10 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative">
                {/* Connection Line */}
                <div className="hidden md:block absolute top-[28px] left-[50px] right-[50px] h-[2px] bg-gray-100 z-0">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                        className="h-full bg-primary"
                    />
                </div>

                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber <= currentStep;
                    const isCompleted = stepNumber < currentStep;

                    return (
                        <div key={step.title} className="flex flex-row md:flex-col items-center gap-5 relative z-10 flex-1">
                            <motion.div 
                                initial={false}
                                animate={{ 
                                    backgroundColor: isActive ? 'var(--primary)' : '#F9FAFB',
                                    color: isActive ? '#FFFFFF' : '#9CA3AF',
                                    scale: isActive ? 1.05 : 1
                                }}
                                className={`h-12 w-12 rounded-xl flex items-center justify-center border ${
                                    isActive ? 'border-primary' : 'border-gray-100'
                                } shadow-sm`}
                            >
                                {isCompleted ? (
                                    <Check className="h-6 w-6" />
                                ) : (
                                    <step.icon className="h-6 w-6" />
                                )}
                            </motion.div>
                            
                            <div className="text-left md:text-center">
                                <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${
                                    isActive ? 'text-primary' : 'text-gray-400'
                                }`}>
                                    Step {stepNumber}
                                </p>
                                <p className={`text-sm font-bold ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {step.title}
                                </p>
                                <p className="hidden md:block text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-2 max-w-[120px]">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
