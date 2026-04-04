'use client';

import { Check, MessageSquare, CreditCard, ShieldCheck, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface TransactionStepperProps {
    currentStep: number; // 1 to 5
}

const steps = [
    { title: 'Contact', icon: MessageSquare, description: 'Register Interest' },
    { title: 'Chat', icon: MessageSquare, description: 'Negotiate Terms' },
    { title: 'Secure', icon: CreditCard, description: 'Khalti Deposit' },
    { title: 'Legal', icon: ShieldCheck, description: 'Due Diligence' },
    { title: 'Finish', icon: Star, description: 'Handover' },
];

export const TransactionStepper = ({ currentStep }: TransactionStepperProps) => {
    return (
        <div className="w-full bg-white p-10 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative">
                {/* Connection Line */}
                <div className="hidden md:block absolute top-[28px] left-[50px] right-[50px] h-1 bg-gray-50 z-0 overflow-hidden rounded-full shadow-inner">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                        className="h-full bg-gradient-to-r from-primary/80 to-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)] transition-all"
                    />
                </div>

                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber <= currentStep;
                    const isCompleted = stepNumber < currentStep;

                    return (
                        <div key={step.title} className="flex flex-row md:flex-col items-center gap-5 relative z-10 flex-1">
                            <div className="pointer-events-none cursor-default group relative">
                                <motion.div 
                                    initial={false}
                                    animate={{ 
                                        backgroundColor: isActive ? 'var(--primary)' : '#FFFFFF',
                                        color: isActive ? '#FFFFFF' : '#D1D5DB',
                                        scale: isActive ? 1.1 : 1,
                                        borderColor: isActive ? 'var(--primary)' : '#E5E7EB'
                                    }}
                                    className="h-14 w-14 rounded-2xl flex items-center justify-center border-2 shadow-sm transition-shadow group-hover:shadow-md"
                                >
                                    {isCompleted ? (
                                        <Check className="h-6 w-6 stroke-[3px]" />
                                    ) : (
                                        <step.icon className={`h-6 w-6 ${isActive ? 'animate-pulse' : ''}`} />
                                    )}
                                </motion.div>
                            </div>
                            
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
