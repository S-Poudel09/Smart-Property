'use client';

import { Message } from '@/types/chat';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
}

export const MessageBubble = ({ message, isOwn }: MessageBubbleProps) => {
    return (
        <div className={cn(
            "flex w-full mb-3",
            isOwn ? "justify-end" : "justify-start"
        )}>
            <div className={cn(
                "relative max-w-[70%] rounded-2xl px-3.5 py-2 shadow-sm transition-all text-[15px] font-medium leading-relaxed tracking-wide",
                isOwn ?
                    "bg-[#E7F8CB] text-gray-800 rounded-br-sm border border-[#D1EEA8]" :
                    "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
            )}>
                <p className="whitespace-pre-wrap">{message.text}</p>
                <div className={cn(
                    "mt-1 text-[10px] uppercase font-bold opacity-60",
                    isOwn ? "text-right text-gray-500" : "text-left text-gray-400"
                )}>
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
};
