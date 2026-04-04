'use client';

import { ChatThread } from '@/types/chat';
import { Property } from '@/types/property';

import { getPropertyById } from '@/lib/properties/storage';
import { Building2, ChevronRight, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ChatThreadListProps {
    threads: ChatThread[];
    activeThreadId?: string;
    baseUrl: string;
}

export const ChatThreadList = ({ threads, activeThreadId, baseUrl }: ChatThreadListProps) => {
    return (
        <div className="flex flex-col h-full bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 bg-white">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-indigo-500" />
                    Encrypted Portal
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pt-4">
                {threads.length > 0 ? (
                    <div className="space-y-2 pb-4">
                        {threads.map((thread) => {
                            let prop = getPropertyById(thread.propertyId);
                            const isActive = thread.id === activeThreadId;

                            return (
                                <Link
                                    key={thread.id}
                                    href={`${baseUrl}/${thread.id}`}
                                    className={cn(
                                        "flex items-center gap-4 p-4 rounded-2xl transition-all group border",
                                        isActive 
                                            ? "bg-indigo-50 border-indigo-100 shadow-sm" 
                                            : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-100"
                                    )}
                                >
                                    <div className={cn(
                                        "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all shadow-inner",
                                        isActive ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-indigo-500"
                                    )}>
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={cn(
                                            "font-outfit text-base font-bold truncate transition-colors leading-tight mb-1",
                                            isActive ? "text-slate-900" : "text-slate-700"
                                        )}>
                                            {prop?.title || (thread.propertyId ? `Property: ${thread.propertyId.slice(0, 8)}` : 'Inquiry')}
                                        </h4>
                                        <div className="flex items-center justify-between">
                                            <p className={cn(
                                                "text-[9px] font-black uppercase tracking-widest truncate",
                                                isActive ? "text-indigo-600" : "text-slate-400"
                                            )}>
                                                {isActive ? 'Ongoing Session' : `Last Activity: ${new Date(thread.lastMessageAt).toLocaleDateString()}`}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-20 text-center px-6">
                        <div className="h-16 w-16 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300 mx-auto mb-6 shadow-inner">
                            <MessageSquare className="h-6 w-6" />
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Silent Canvas</p>
                        <p className="text-xs text-gray-400 italic mt-2">"No active decrees found."</p>
                    </div>
                )}
            </div>
        </div>
    );
};
