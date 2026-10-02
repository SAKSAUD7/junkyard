import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CART_KEY = 'jynm_cart';

export const CartContext = createContext({
    cartItems: [],
    addToCart: () => {},
    removeFromCart: () => {},
    clearCart: () => {},
    cartCount: 0,
});

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem(CART_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Persist to localStorage on every change
    useEffect(() => {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
        } catch {
            // quota exceeded or private mode — fail silently
        }
    }, [cartItems]);

    const addToCart = useCallback((item) => {
        // Prevent duplicate items by id
        setCartItems(prev => {
            const exists = prev.some(i => i.id === item.id);
            if (exists) return prev;
            return [{ ...item, addedAt: new Date().toISOString() }, ...prev];
        });
    }, []);

    const removeFromCart = useCallback((id) => {
        setCartItems(prev => prev.filter(i => i.id !== id));
    }, []);

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            clearCart,
            cartCount: cartItems.length,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
