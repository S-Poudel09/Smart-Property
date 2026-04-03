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
        <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-6 border-b">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    Messages
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto">
                {threads.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                        {threads.map((thread) => {
                            let prop = getPropertyById(thread.propertyId);

                            const isActive = thread.id === activeThreadId;

                            return (
                                <Link
                                    key={thread.id}
                                    href={`${baseUrl}/${thread.id}`}
                                    className={cn(
                                        "flex items-center gap-4 p-4 transition-all hover:bg-gray-50 group",
                                        isActive ? "bg-blue-50/50 border-l-4 border-l-blue-600" : "border-l-4 border-l-transparent"
                                    )}
                                >
                                    <div className={cn(
                                        "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                                        isActive ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600"
                                    )}>
                                        <Building2 className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={cn(
                                            "text-sm font-bold truncate transition-colors",
                                            isActive ? "text-blue-600" : "text-gray-900"
                                        )}>
                                            {prop?.title || 'Unknown Property'}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-1 truncate">
                                            Last msg: {new Date(thread.lastMessageAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <ChevronRight className={cn(
                                        "h-4 w-4 transition-all",
                                        isActive ? "text-blue-600 translate-x-0" : "text-gray-300 group-hover:text-blue-400 -translate-x-1 group-hover:translate-x-0"
                                    )} />
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-20 text-center px-6">
                        <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mx-auto mb-4">
                            <MessageSquare className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">No conversations yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
