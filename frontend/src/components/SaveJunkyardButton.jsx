import { useContext } from 'react';
import { useFavorites } from '../contexts/FavoritesContext';
import { AuthContext } from '../contexts/AuthContext';
import { getLogoUrl } from '../utils/imageUrl';

export default function SaveJunkyardButton({ vendor, className = '' }) {
    const { isFavorite, addFavorite, removeFavorite } = useFavorites();
    const { isAuthenticated } = useContext(AuthContext);
    const isFav = isFavorite(vendor.id);
    const logoUrl = getLogoUrl(vendor.logo);

    const handleFavoriteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Auth guard: prompt login for unauthenticated users
        if (!isAuthenticated) {
            window.dispatchEvent(new CustomEvent('jynm:open-login'));
            return;
        }

        if (isFav) {
            removeFavorite(vendor.id);
        } else {
            addFavorite({
                id: vendor.id,
                business_name: vendor.name,
                city: vendor.city,
                state: vendor.state,
                contact_phone: vendor.phone,
                slug: vendor.slug,
                image: logoUrl
            });
        }
    };

    return (
        <button
            onClick={handleFavoriteClick}
            className={`group/fav flex items-center justify-center gap-1.5 backdrop-blur-md transition-all duration-300 active:scale-95 ${className} ${
                isFav
                    ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100 hover:border-rose-300'
                    : 'bg-white/90 border-slate-200 text-slate-500 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50'
            }`}
            aria-label={isFav ? 'Remove from saved junkyards' : 'Save this junkyard'}
            title={isAuthenticated ? (isFav ? 'Remove from Saved Junkyards' : 'Save Junkyard') : 'Sign in to save junkyards'}
        >
            <svg
                className={`w-4 h-4 transition-transform ${isFav ? 'scale-110 fill-current text-rose-500' : 'stroke-current'}`}
                fill={isFav ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={isFav ? 0 : 2}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <span className={`text-[11px] font-bold tracking-wide ${isFav ? 'text-rose-600' : 'text-slate-600 group-hover/fav:text-rose-600'}`}>
                {isFav ? 'Saved' : 'Save Junkyard'}
            </span>
        </button>
    );
}
