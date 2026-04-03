import { getAuthFromStorage } from '@/lib/auth/storage';

export const getWebSocketUrl = (path: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_WS_BASE_URL || 'ws://127.0.0.1:8000';
    const { accessToken } = getAuthFromStorage();
    
    // We append the token as a query parameter because standard WebSocket API doesn't support custom headers
    // The backend will need a custom middleware to extract this token
    return `${baseUrl}/${path.replace(/^\//, '')}${accessToken ? `?token=${accessToken}` : ''}`;
};

export class WebSocketClient {
    private socket: WebSocket | null = null;
    private path: string;
    private onMessage: (data: any) => void;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    constructor(path: string, onMessage: (data: any) => void) {
        this.path = path;
        this.onMessage = onMessage;
    }

    connect() {
        try {
            const url = getWebSocketUrl(this.path);
            this.socket = new WebSocket(url);

            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.onMessage(data);
            };

            this.socket.onopen = () => {
                console.log(`WebSocket connected to ${this.path}`);
                this.reconnectAttempts = 0;
            };

            this.socket.onclose = (e) => {
                console.log(`WebSocket closed: ${e.reason}`);
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
                }
            };

            this.socket.onerror = (err) => {
                console.error('WebSocket error:', err);
            };
        } catch (error) {
            console.error('WebSocket connection error:', error);
        }
    }

    send(data: any) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket not connected');
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    }
}
