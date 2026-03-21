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
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 p-4 bg-white border-t">
            <textarea
                className="w-full min-h-[44px] max-h-32 rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500 transition-all resize-none"
                placeholder="Type your message..."
                rows={1}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
            />
            <Button
                type="submit"
                disabled={!text.trim() || isLoading}
                className="h-11 w-11 rounded-full p-0 flex items-center justify-center flex-shrink-0 bg-blue-600 hover:bg-blue-700"
            >
                <Send className="h-5 w-5" />
            </Button>
        </form>
    );
};
