'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../common/Button';

interface MessageInputProps {
    onSendMessage: (text: string) => void;
    isLoading?: boolean;
}

export const MessageInput = ({ onSendMessage, isLoading }: MessageInputProps) => {
    const [text, setText] = useState('');

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (text.trim()) {
            onSendMessage(text);
            setText('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative flex items-end gap-3 p-4 bg-gray-50/50 border-t border-gray-100 z-10">
            <div className="flex-1 bg-white border border-gray-200 rounded-[2rem] shadow-sm flex items-end p-1 pr-2 transition-all focus-within:ring-2 ring-[#25D366]/20 focus-within:border-[#25D366]/50">
                <textarea
                    className="w-full min-h-[44px] max-h-32 bg-transparent px-4 py-3 text-sm focus:outline-none transition-all resize-none border-none ring-0 font-medium"
                    placeholder="Type your message..."
                    rows={1}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                />
            </div>
            <Button
                type="submit"
                disabled={!text.trim() || isLoading}
                className="h-12 w-12 rounded-full p-0 flex items-center justify-center flex-shrink-0 bg-[#25D366] hover:bg-[#1fa952] text-white shadow-lg shadow-[#25D366]/20 transition-all active:scale-95"
            >
                <Send className="h-5 w-5" />
            </Button>
        </form>
    );
};
