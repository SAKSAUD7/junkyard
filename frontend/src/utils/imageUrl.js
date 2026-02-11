import { BASE_URL } from '../services/api';

export const getLogoUrl = (logoPath) => {
    if (!logoPath) return '/images/logo-placeholder.png';
    if (logoPath.startsWith('http')) return logoPath;
    if (logoPath === '/images/logo-placeholder.png') return logoPath;

    // If it looks like a relative backend path (e.g. vendor_logos/...)
    // Or just a filename without leading slash
    if (logoPath.includes('vendor_logos/') || !logoPath.startsWith('/')) {
        return `${BASE_URL}/media/${logoPath}`;
    }

    return logoPath;
};
