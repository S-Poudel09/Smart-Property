'use client';

import { Building2, User } from 'lucide-react';

interface ChatHeaderProps {
    title: string;
    subtitle: string;
    onBack?: () => void;
}

export const ChatHeader = ({ title, subtitle }: ChatHeaderProps) => {
    return (
        <div className="flex items-center gap-4 border-b bg-white p-4">
            <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                <Building2 className="h-6 w-6" />
            </div>
            <div className="flex-1 overflow-hidden">
                <h3 className="text-sm font-bold text-gray-900 truncate">{title}</h3>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <User className="h-3 w-3" />
                    <span className="truncate">{subtitle}</span>
                </div>
            </div>
        </div>
    );
};
