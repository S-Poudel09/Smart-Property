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
                "relative max-w-[70%] rounded-[1.25rem] px-5 py-3 shadow-md transition-all text-sm font-medium leading-relaxed",
                isOwn ?
                    "bg-indigo-500 text-white rounded-br-none shadow-indigo-500/10" :
                    "bg-white text-slate-800 border border-slate-100 rounded-bl-none shadow-slate-200/50"
            )}>
                <p className="whitespace-pre-wrap">{message.text}</p>
                <div className={cn(
                    "mt-1.5 text-[9px] font-black uppercase tracking-widest",
                    isOwn ? "text-indigo-100/80 text-right" : "text-slate-400 text-left"
                )}>
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
};
