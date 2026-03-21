import { ChatThread, Message } from '@/types/chat';

const THREADS_KEY = 'smartproperty_threads';
const MESSAGES_KEY = 'smartproperty_messages';

export const getAllThreads = (): ChatThread[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(THREADS_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const getThreadsForBuyer = (buyerId: string): ChatThread[] => {
    return getAllThreads().filter(t => t.buyerId === buyerId);
};

export const getThreadsForSeller = (sellerId: string): ChatThread[] => {
    return getAllThreads().filter(t => t.sellerId === sellerId);
};

export const getThreadById = (id: string): ChatThread | undefined => {
    return getAllThreads().find(t => t.id === id);
};

export const findOrCreateThread = (data: {
    propertyId: string;
    buyerId: string;
    sellerId: string;
}): ChatThread => {
    const threads = getAllThreads();
    const existing = threads.find(
        t => t.propertyId === data.propertyId &&
            t.buyerId === data.buyerId &&
            t.sellerId === data.sellerId
    );

    if (existing) return existing;

    const newThread: ChatThread = {
        id: `thread-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
    };

    threads.push(newThread);
    localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
    return newThread;
};

export const getMessages = (threadId: string): Message[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(MESSAGES_KEY);
    const allMessages: Message[] = stored ? JSON.parse(stored) : [];
    return allMessages.filter(m => m.threadId === threadId);
};

export const sendMessage = (data: {
    threadId: string;
    senderId: string;
    text: string;
}): Message => {
    const stored = localStorage.getItem(MESSAGES_KEY);
    const allMessages: Message[] = stored ? JSON.parse(stored) : [];

    const newMessage: Message = {
        id: `msg-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
    };

    allMessages.push(newMessage);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(allMessages));

    // Update thread lastMessageAt
    const threads = getAllThreads();
    const threadIndex = threads.findIndex(t => t.id === data.threadId);
    if (threadIndex >= 0) {
        threads[threadIndex].lastMessageAt = newMessage.createdAt;
        localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
    }

    return newMessage;
};

export const markThreadUpdated = (threadId: string): void => {
    const threads = getAllThreads();
    const threadIndex = threads.findIndex(t => t.id === threadId);
    if (threadIndex >= 0) {
        threads[threadIndex].lastMessageAt = new Date().toISOString();
        localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
    }
};
