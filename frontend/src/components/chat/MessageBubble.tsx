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
            "flex w-full mb-4",
            isOwn ? "justify-end" : "justify-start"
        )}>
            <div className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm transition-all",
                isOwn ?
                    "bg-blue-600 text-white rounded-br-none" :
                    "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
            )}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                <div className={cn(
                    "mt-1 text-[10px] font-medium opacity-70",
                    isOwn ? "text-right" : "text-left"
                )}>
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
};
