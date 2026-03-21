const PROPERTY_IMAGES = [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1580587771525-78b9bed3b928?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1200',
];

export const getVibrantImage = (idOrIndex: string | number): string => {
    let index = 0;
    if (typeof idOrIndex === 'number') {
        index = idOrIndex % PROPERTY_IMAGES.length;
    } else {
        // Simple hash for string ID
        let hash = 0;
        if (idOrIndex) {
            for (let i = 0; i < idOrIndex.length; i++) {
                hash = idOrIndex.charCodeAt(i) + ((hash << 5) - hash);
            }
        }
        index = Math.abs(hash) % PROPERTY_IMAGES.length;
    }
    return PROPERTY_IMAGES[index];
};
