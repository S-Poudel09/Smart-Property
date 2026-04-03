export const getVibrantImage = (idOrIndex: string | number): string => {
    return 'https://placehold.co/800x600/FDFBF8/1A1A1A?font=inter&text=Property+Image+Unavailable';
};

export const getFullImageUrl = (url: string | null | undefined): string => {
    if (!url) return getVibrantImage('placeholder');
    
    // If it's already a full clear URL, return it
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    
    // Catch cases like /media/https:/images.unsplash.com/...
    // and extract the valid URL part.
    const urlMatch = url.match(/(https?:\/?\/?[^\s]+)/);
    if (urlMatch) {
       let normalizedUrl = urlMatch[1];
       // Fix singular slash if it happened: https:/ -> https://
       if (normalizedUrl.startsWith('https:/') && !normalizedUrl.startsWith('https://')) {
           normalizedUrl = normalizedUrl.replace('https:/', 'https://');
       } else if (normalizedUrl.startsWith('http:/') && !normalizedUrl.startsWith('http://')) {
           normalizedUrl = normalizedUrl.replace('http:/', 'http://');
       }
       return normalizedUrl;
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    // Ensure no double slashes
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    
    return `${cleanBase}${cleanPath}`;
};
