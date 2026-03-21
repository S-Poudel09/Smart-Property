export interface DecodedUser {
    user_id: string;
    email: string;
    role?: string;
    name?: string;
}

export const getUser = (): DecodedUser | null => {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem('smartproperty_token');
    if (!token) return null;

    try {
        const parts = token.split('.');
        if (parts.length < 2) return null;

        // JWT is Base64URL, not standard Base64. 
        // We need to replace characters and pad before using atob.
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        
        return {
            user_id: payload.user_id || payload.sub,
            email: payload.email,
            role: payload.role,
            name: payload.name || payload.full_name || (payload.email ? payload.email.split('@')[0] : 'User'),
        };
    } catch {
        // Only log in development or keep it silent to avoid console noise
        return null;
    }
};
