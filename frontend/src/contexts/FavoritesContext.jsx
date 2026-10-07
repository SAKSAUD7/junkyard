import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'jynm_favorites';

export const FavoritesContext = createContext({
    favorites: [],
    addFavorite: () => {},
    removeFavorite: () => {},
    isFavorite: () => false,
    favoritesCount: 0,
});

export function FavoritesProvider({ children }) {
    const [favorites, setFavorites] = useState(() => {
        try {
            const saved = localStorage.getItem(FAVORITES_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        } catch {
            // fail silently on quota exceeded etc.
        }
    }, [favorites]);

    const addFavorite = useCallback((item) => {
        setFavorites(prev => {
            if (prev.some(i => i.id === item.id)) return prev;
            return [{ ...item, savedAt: new Date().toISOString() }, ...prev];
        });
    }, []);

    const removeFavorite = useCallback((id) => {
        setFavorites(prev => prev.filter(i => i.id !== id));
    }, []);

    const isFavorite = useCallback((id) => {
        return favorites.some(i => i.id === id);
    }, [favorites]);

    return (
        <FavoritesContext.Provider value={{
            favorites,
            addFavorite,
            removeFavorite,
            isFavorite,
            favoritesCount: favorites.length,
        }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export const useFavorites = () => useContext(FavoritesContext);
