/**
 * NPR Currency Formatting Utility
 * Formats numbers in Nepali Rupee style: Rs 50,00,000
 * Nepali grouping: first 3 digits, then groups of 2
 */

export function formatNPR(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return 'Rs 0';

    const isNegative = num < 0;
    const absNum = Math.abs(num);
    const [intPart, decPart] = absNum.toFixed(0).split('.');

    // Nepali grouping: last 3 digits, then groups of 2
    let formatted = '';
    if (intPart.length <= 3) {
        formatted = intPart;
    } else {
        const lastThree = intPart.slice(-3);
        const remaining = intPart.slice(0, -3);
        // Group remaining digits in pairs from right
        const pairs = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
        formatted = pairs + ',' + lastThree;
    }

    const result = decPart ? `${formatted}.${decPart}` : formatted;
    return `${isNegative ? '-' : ''}Rs ${result}`;
}

/**
 * Short format for large amounts
 * Rs 50 Lakh, Rs 2 Crore
 */
export function formatNPRShort(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return 'Rs 0';

    if (num >= 10000000) {
        return `Rs ${(num / 10000000).toFixed(1)} Crore`;
    }
    if (num >= 100000) {
        return `Rs ${(num / 100000).toFixed(1)} Lakh`;
    }
    if (num >= 1000) {
        return `Rs ${(num / 1000).toFixed(1)}K`;
    }
    return formatNPR(num);
}

/**
 * Area formatting for Nepali land measurements
 */
export function formatArea(sqft: number | string, unit: 'sqft' | 'ropani' = 'sqft'): string {
    const num = typeof sqft === 'string' ? parseFloat(sqft) : sqft;
    if (isNaN(num)) return '0 sq.ft.';

    if (unit === 'ropani') {
        // 1 Ropani = 5,476 sq ft
        const ropani = Math.floor(num / 5476);
        const remaining = num % 5476;
        const aana = Math.floor(remaining / 342.25);
        if (ropani > 0 && aana > 0) return `${ropani} Ropani ${aana} Aana`;
        if (ropani > 0) return `${ropani} Ropani`;
        return `${aana} Aana`;
    }
    return `${num.toLocaleString()} sq.ft.`;
}

// Nepali districts for location filtering
export const NEPAL_DISTRICTS = [
    'Kathmandu', 'Lalitpur', 'Bhaktapur',
    'Pokhara', 'Biratnagar', 'Birgunj',
    'Dharan', 'Butwal', 'Hetauda',
    'Janakpur', 'Nepalgunj', 'Itahari',
    'Bharatpur', 'Dhulikhel', 'Damak',
] as const;

// Property categories for Nepal
export const NEPAL_PROPERTY_CATEGORIES = [
    { value: 'all', label: 'All Categories' },
    { value: 'house', label: 'House / Ghar' },
    { value: 'flat', label: 'Flat' },
    { value: 'bungalow', label: 'Bungalow' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'commercial', label: 'Commercial Building' },
    { value: 'hostel', label: 'Hostel / PG' },
    { value: 'land', label: 'Land / Jagga' },
] as const;

// Nepali amenities / nearby facilities
export const NEPAL_AMENITIES = [
    'Parking', 'Garden', 'Temple Nearby', 'Bus Station',
    'School', 'Hospital', 'Market', 'Bank',
    'Water Tank', 'Solar Panel', 'CCTV',
] as const;

// Nepali payment methods
export const PAYMENT_METHODS = [
    { id: 'esewa', name: 'eSewa', icon: '💳' },
    { id: 'khalti', name: 'Khalti', icon: '🟣' },
    { id: 'imepay', name: 'IME Pay', icon: '📱' },
    { id: 'connectips', name: 'ConnectIPS', icon: '🏦' },
    { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏛️' },
] as const;
