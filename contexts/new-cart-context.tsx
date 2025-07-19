'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { newBackendApi } from '@/lib/new-backend-api';
import { Cart, CartItem } from '@/lib/api-types';
import { useAuth } from './new-auth-context';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  
  // Cart actions
  addToCart: (productId: string, quantity: number, size?: string) => Promise<{ success: boolean; error?: string }>;
  updateCartItem: (cartId: string, quantity: number) => Promise<{ success: boolean; error?: string }>;
  removeCartItem: (cartId: string) => Promise<{ success: boolean; error?: string }>;
  clearCart: () => Promise<{ success: boolean; error?: string }>;
  syncCart: (items: any[]) => Promise<{ success: boolean; error?: string }>;
  
  // Cart utilities
  getCartItemCount: () => number;
  getCartSubtotal: () => number;
  isInCart: (productId: string, size?: string) => boolean;
  getCartItem: (productId: string, size?: string) => CartItem | undefined;
  refreshCart: () => Promise<void>;
  clearError: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  // Initialize cart when user authentication changes
  useEffect(() => {
    const initializeCart = async () => {
      if (isAuthenticated && user) {
        await fetchCart();
      } else {
        // Clear cart when user logs out
        setCart(null);
        setError(null);
      }
    };

    initializeCart();
  }, [isAuthenticated, user]);

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // Fetch cart from backend
  const fetchCart = async (): Promise<void> => {
    if (!isAuthenticated) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🛒 Fetching cart...');
      const response = await newBackendApi.getCart();

      if (response.success) {
        setCart(response.data?.cart || null);
        console.log('✅ Cart fetched successfully');
      } else {
        const errorMessage = response.error || 'Failed to fetch cart';
        setError(errorMessage);
        console.log('❌ Failed to fetch cart:', errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cart';
      setError(errorMessage);
      console.error('❌ Cart fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (
    productId: string,
    quantity: number,
    size?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isAuthenticated) {
      return { success: false, error: 'Please sign in to add items to cart' };
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🛒 Adding to cart:', { productId, quantity, size });
      const response = await newBackendApi.addToCart(productId, quantity, size);

      if (response.success && response.data?.cart) {
        setCart(response.data.cart);
        console.log('✅ Item added to cart successfully');
        return { success: true };
      } else {
        const errorMessage = response.error || 'Failed to add item to cart';
        setError(errorMessage);
        console.log('❌ Failed to add to cart:', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item to cart';
      setError(errorMessage);
      console.error('❌ Add to cart error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update cart item quantity
  const updateCartItem = async (
    cartId: string,
    quantity: number
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isAuthenticated) {
      return { success: false, error: 'Please sign in to update cart' };
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🛒 Updating cart item:', { cartId, quantity });
      const response = await newBackendApi.updateCartItem(cartId, quantity);

      if (response.success && response.data?.cart) {
        setCart(response.data.cart);
        console.log('✅ Cart item updated successfully');
        return { success: true };
      } else {
        const errorMessage = response.error || 'Failed to update cart item';
        setError(errorMessage);
        console.log('❌ Failed to update cart item:', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update cart item';
      setError(errorMessage);
      console.error('❌ Update cart item error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeCartItem = async (cartId: string): Promise<{ success: boolean; error?: string }> => {
    if (!isAuthenticated) {
      return { success: false, error: 'Please sign in to remove items from cart' };
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🛒 Removing cart item:', cartId);
      const response = await newBackendApi.removeCartItem(cartId);

      if (response.success) {
        // Refresh cart after removal
        await fetchCart();
        console.log('✅ Cart item removed successfully');
        return { success: true };
      } else {
        const errorMessage = response.error || 'Failed to remove cart item';
        setError(errorMessage);
        console.log('❌ Failed to remove cart item:', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove cart item';
      setError(errorMessage);
      console.error('❌ Remove cart item error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async (): Promise<{ success: boolean; error?: string }> => {
    if (!isAuthenticated) {
      return { success: false, error: 'Please sign in to clear cart' };
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🛒 Clearing cart...');
      const response = await newBackendApi.clearCart();

      if (response.success) {
        setCart(null);
        console.log('✅ Cart cleared successfully');
        return { success: true };
      } else {
        const errorMessage = response.error || 'Failed to clear cart';
        setError(errorMessage);
        console.log('❌ Failed to clear cart:', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear cart';
      setError(errorMessage);
      console.error('❌ Clear cart error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Sync cart with local data
  const syncCart = async (items: any[]): Promise<{ success: boolean; error?: string }> => {
    if (!isAuthenticated) {
      return { success: false, error: 'Please sign in to sync cart' };
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🛒 Syncing cart...');
      const response = await newBackendApi.syncCart(items);

      if (response.success && response.data?.cart) {
        setCart(response.data.cart);
        console.log('✅ Cart synced successfully');
        return { success: true };
      } else {
        const errorMessage = response.error || 'Failed to sync cart';
        setError(errorMessage);
        console.log('❌ Failed to sync cart:', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync cart';
      setError(errorMessage);
      console.error('❌ Sync cart error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Get total number of items in cart
  const getCartItemCount = (): number => {
    if (!cart || !cart.items) {
      return 0;
    }
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  // Get cart subtotal
  const getCartSubtotal = (): number => {
    if (!cart || !cart.items) {
      return 0;
    }
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Check if product is in cart
  const isInCart = (productId: string, size?: string): boolean => {
    if (!cart || !cart.items) {
      return false;
    }
    return cart.items.some(item => 
      item.productId === productId && 
      (size ? item.size === size : !item.size || item.size === '')
    );
  };

  // Get specific cart item
  const getCartItem = (productId: string, size?: string): CartItem | undefined => {
    if (!cart || !cart.items) {
      return undefined;
    }
    return cart.items.find(item => 
      item.productId === productId && 
      (size ? item.size === size : !item.size || item.size === '')
    );
  };

  // Refresh cart data
  const refreshCart = async (): Promise<void> => {
    await fetchCart();
  };

  const contextValue: CartContextType = {
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    syncCart,
    getCartItemCount,
    getCartSubtotal,
    isInCart,
    getCartItem,
    refreshCart,
    clearError,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use the cart context
export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// Export the context for advanced usage
export { CartContext };

