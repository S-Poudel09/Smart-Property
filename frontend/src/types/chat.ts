export interface ChatThread {
    id: string;
    propertyId: string;
    buyerId: string;
    sellerId: string;
    createdAt: string;
    lastMessageAt: string;
}

export interface Message {
    id: string;
    threadId: string;
    senderId: string;
    text: string;
    createdAt: string;
}
