import { useState, useEffect, useCallback } from 'react';
import { newBackendApi } from './new-backend-api';

// Generic hook for API calls with loading and error states
export function useApiCall<T>(
  apiCall: () => Promise<any>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || 'An error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Authentication hooks
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const verifyToken = useCallback(async () => {
    if (!newBackendApi.isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      const response = await newBackendApi.verifyToken();
      if (response.success) {
        setUser(response.data?.user || null);
      } else {
        newBackendApi.clearToken();
        setUser(null);
      }
    } catch (err) {
      newBackendApi.clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  const login = async (credentials: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await newBackendApi.login(credentials);
      if (response.success) {
        setUser(response.data?.user || null);
        return response;
      } else {
        setError(response.error || 'Login failed');
        return response;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await newBackendApi.register(userData);
      if (response.success) {
        setUser(response.data?.user || null);
        return response;
      } else {
        setError(response.error || 'Registration failed');
        return response;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await newBackendApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      newBackendApi.clearToken();
    }
  };

  const loginWithFirebase = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await newBackendApi.loginWithFirebaseToken(token);
      if (response.success) {
        setUser(response.data?.user || null);
        return response;
      } else {
        setError(response.error || 'Firebase login failed');
        return response;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Firebase login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await newBackendApi.googleLogin(token);
      if (response.success) {
        setUser(response.data?.user || null);
        return response;
      } else {
        setError(response.error || 'Google login failed');
        return response;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    loginWithFirebase,
    googleLogin,
    isAuthenticated: !!user,
    refetch: verifyToken
  };
}

// Products hooks
export function useProducts(filters?: any) {
  return useApiCall(
    () => newBackendApi.getProducts(filters),
    [JSON.stringify(filters)]
  );
}

export function useProduct(id: string) {
  return useApiCall(
    () => newBackendApi.getProductById(id),
    [id]
  );
}

// Cart hooks
export function useCart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await newBackendApi.getCart();
      
      if (response.success) {
        setCart(response.data?.cart || null);
      } else {
        setError(response.error || 'Failed to fetch cart');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (newBackendApi.isAuthenticated()) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [fetchCart]);

  const addToCart = async (productId: string, quantity: number, size?: string) => {
    try {
      const response = await newBackendApi.addToCart(productId, quantity, size);
      if (response.success) {
        setCart(response.data?.cart || null);
      }
      return response;
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to add to cart' };
    }
  };

  const updateCartItem = async (cartId: string, quantity: number) => {
    try {
      const response = await newBackendApi.updateCartItem(cartId, quantity);
      if (response.success) {
        setCart(response.data?.cart || null);
      }
      return response;
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update cart' };
    }
  };

  const removeCartItem = async (cartId: string) => {
    try {
      const response = await newBackendApi.removeCartItem(cartId);
      if (response.success) {
        await fetchCart(); // Refresh cart after removal
      }
      return response;
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to remove item' };
    }
  };

  const clearCart = async () => {
    try {
      const response = await newBackendApi.clearCart();
      if (response.success) {
        setCart(null);
      }
      return response;
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to clear cart' };
    }
  };

  return {
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    refetch: fetchCart
  };
}

// Orders hooks
export function useOrders(filters?: any) {
  return useApiCall(
    () => newBackendApi.getOrders(filters),
    [JSON.stringify(filters)]
  );
}

export function useOrder(id: string) {
  return useApiCall(
    () => newBackendApi.getOrderById(id),
    [id]
  );
}

export function useCreateOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = async (orderData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await newBackendApi.createOrder(orderData);
      if (!response.success) {
        setError(response.error || 'Failed to create order');
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { createOrder, loading, error };
}

// Wishlist hooks
export function useWishlist(filters?: any) {
  return useApiCall(
    () => newBackendApi.getWishlist(filters),
    [JSON.stringify(filters)]
  );
}

export function useWishlistActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addToWishlist = async (productId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await newBackendApi.addToWishlist(productId);
      if (!response.success) {
        setError(response.error || 'Failed to add to wishlist');
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add to wishlist';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await newBackendApi.removeFromWishlist(productId);
      if (!response.success) {
        setError(response.error || 'Failed to remove from wishlist');
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove from wishlist';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const moveToCart = async (productId: string, quantity?: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await newBackendApi.moveWishlistItemToCart(productId, quantity);
      if (!response.success) {
        setError(response.error || 'Failed to move to cart');
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to move to cart';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { addToWishlist, removeFromWishlist, moveToCart, loading, error };
}

// Coupons hooks
export function useAvailableCoupons(orderTotal?: number) {
  return useApiCall(
    () => newBackendApi.getAvailableCoupons(orderTotal),
    [orderTotal]
  );
}

export function usePublicCoupons() {
  return useApiCall(
    () => newBackendApi.getPublicCoupons(),
    []
  );
}

export function useCouponActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyCoupon = async (code: string, orderTotal: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await newBackendApi.applyCoupon(code, orderTotal);
      if (!response.success) {
        setError(response.error || 'Failed to apply coupon');
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply coupon';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const validateCoupon = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await newBackendApi.validateCoupon(code);
      if (!response.success) {
        setError(response.error || 'Failed to validate coupon');
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate coupon';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { applyCoupon, validateCoupon, loading, error };
}

// User profile hooks
export function useUserProfile() {
  return useApiCall(
    () => newBackendApi.getUserProfile(),
    []
  );
}

export function useUserAddresses() {
  return useApiCall(
    () => newBackendApi.getUserAddresses(),
    []
  );
}

export function useUserActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (profileData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await newBackendApi.updateUserProfile(profileData);
      if (!response.success) {
        setError(response.error || 'Failed to update profile');
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (addressData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await newBackendApi.addAddress(addressData);
      if (!response.success) {
        setError(response.error || 'Failed to add address');
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add address';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = async (id: string, addressData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await newBackendApi.updateAddress(id, addressData);
      if (!response.success) {
        setError(response.error || 'Failed to update address');
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update address';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await newBackendApi.deleteAddress(id);
      if (!response.success) {
        setError(response.error || 'Failed to delete address');
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete address';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { updateProfile, addAddress, updateAddress, deleteAddress, loading, error };
}

// Generic mutation hook for actions that don't need to return data
export function useMutation<T = any>(
  mutationFn: (...args: any[]) => Promise<any>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const mutate = async (...args: any[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await mutationFn(...args);
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || 'Operation failed');
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Operation failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error, data };
}

