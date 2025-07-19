interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any[];
}

interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin';
  phoneNumber?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  rating?: number;
  reviews?: number;
  size?: string;
  image: string;
  description: string;
  notes?: {
    top: string[];
    middle: string[];
    base: string[];
  };
  discount?: number;
  stock: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: string;
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    name: string;
    image: string;
  }>;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
  addedAt: Date;
  updatedAt: Date;
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  updatedAt: Date;
}

interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  discount: number;
  appliedDiscount?: number;
  description: string;
  minOrderValue: number;
  maxDiscount?: number;
  expiryDate: Date;
  isApplicable?: boolean;
}

interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  addedAt: Date;
  isAvailable: boolean;
  stock: number;
  category: string;
  brand: string;
}

interface Wishlist {
  items: WishlistItem[];
  totalItems: number;
  updatedAt: Date;
}

class BackendApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:10000/api';
    console.log('🔧 New Backend API initialized with URL:', this.baseUrl);

    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('user_token');
      if (this.token) {
        console.log('🔑 User token loaded from localStorage');
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log(`📡 Making API request: ${options.method || 'GET'} ${url}`);

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError);
        throw new Error('Invalid response format from server');
      }

      console.log(`📡 API Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorMessage = data.error || data.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error('❌ API Error:', errorMessage);
        return { success: false, error: errorMessage, details: data.details };
      }

      console.log('✅ API request successful');
      return data;
    } catch (error) {
      console.error('❌ API Request Error:', error);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout - please check your connection',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: 'Unknown error occurred',
      };
    }
  }

  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_token', token);
      console.log('🔑 User token saved to localStorage');
    }
  }

  clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_token');
      console.log('🔑 User token cleared from localStorage');
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Auth Endpoints
  async register(userData: any): Promise<ApiResponse<AuthResponse>> {
    console.log("👤 Attempting user registration");
    const response = await this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
      console.log("✅ Registration successful");
    }

    return response;
  }

  async registerWithFirebaseToken(token: string): Promise<ApiResponse<AuthResponse>> {
    console.log("👤 Attempting user registration with Firebase token");
    const response = await this.request<AuthResponse>("/auth/register-token", {
      method: "POST",
      body: JSON.stringify({ token }),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
      console.log("✅ Firebase token registration successful");
    }

    return response;
  }

  async login(credentials: any): Promise<ApiResponse<AuthResponse>> {
    console.log("🔐 Attempting user login");
    const response = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
      console.log("✅ Login successful");
    }

    return response;
  }

  async loginWithFirebaseToken(token: string): Promise<ApiResponse<AuthResponse>> {
    console.log("🔐 Attempting user login with Firebase token");
    const response = await this.request<AuthResponse>("/auth/login-token", {
      method: "POST",
      body: JSON.stringify({ token }),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
      console.log("✅ Firebase token login successful");
    }

    return response;
  }

  async googleLogin(token: string): Promise<ApiResponse<AuthResponse>> {
    console.log("🔐 Attempting Google login");
    const response = await this.request<AuthResponse>("/auth/google-login", {
      method: "POST",
      body: JSON.stringify({ token }),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
      console.log("✅ Google login successful");
    }

    return response;
  }

  async verifyToken(): Promise<ApiResponse<{ user: User }>> {
    console.log("🔍 Verifying auth token");
    return this.request<{ user: User }>("/auth/verify", {
      method: "POST",
    });
  }

  async logout(): Promise<ApiResponse<any>> {
    console.log("🚪 Logging out");
    const response = await this.request<any>("/auth/logout", {
      method: "POST",
    });
    if (response.success) {
      this.clearToken();
      console.log("✅ Logout successful");
    }
    return response;
  }

  async forgotPassword(email: string): Promise<ApiResponse<any>> {
    console.log("🔑 Requesting password reset");
    return this.request<any>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  // Product Endpoints
  async getProducts(filters?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<{ products: Product[]; pagination: { currentPage: number; totalPages: number; totalProducts: number; hasNextPage: boolean; hasPrevPage: boolean; limit: number; }; }>> {
    console.log("🛍️ Fetching products");
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

    const queryString = params.toString();
    return this.request(`/products${queryString ? `?${queryString}` : ""}`);
  }

  async getProductById(id: string): Promise<ApiResponse<{ product: Product }>> {
    console.log("🛍️ Fetching product:", id);
    return this.request<{ product: Product }>(`/products/${id}`);
  }

  // Order Endpoints
  async createOrder(orderData: {
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
    shippingAddress: any;
    paymentMethod: string;
    couponCode?: string;
    notes?: string;
  }): Promise<ApiResponse<{ orderId: string; orderNumber: string; total: number; status: string; paymentStatus: string; }>> {
    console.log("📦 Creating order");
    return this.request<{ orderId: string; orderNumber: string; total: number; status: string; paymentStatus: string; }>("/orders/create", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(filters?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<{ orders: Order[]; pagination: { currentPage: number; totalPages: number; totalOrders: number; hasNextPage: boolean; hasPrevPage: boolean; limit: number; }; }>> {
    console.log("📦 Fetching user orders");
    const params = new URLSearchParams();
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.status) params.append("status", filters.status);
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

    const queryString = params.toString();
    return this.request<{ orders: Order[]; pagination: { currentPage: number; totalPages: number; totalOrders: number; hasNextPage: boolean; hasPrevPage: boolean; limit: number; }; }>(`/orders/user/all${queryString ? `?${queryString}` : ""}`);
  }

  async getOrderById(id: string): Promise<ApiResponse<{ order: Order }>> {
    console.log("📦 Fetching order:", id);
    return this.request<{ order: Order }>(`/orders/${id}`);
  }

  async cancelOrder(id: string, reason?: string): Promise<ApiResponse<any>> {
    console.log("📦 Cancelling order:", id);
    return this.request<any>(`/orders/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  }

  // Cart Endpoints
  async addToCart(productId: string, quantity: number, size?: string): Promise<ApiResponse<{ cart: Cart }>> {
    console.log("🛒 Adding to cart:", productId);
    return this.request<{ cart: Cart }>("/cart/add", {
      method: "POST",
      body: JSON.stringify({ productId, quantity, size }),
    });
  }

  async getCart(): Promise<ApiResponse<{ cart: Cart }>> {
    console.log("🛒 Fetching cart");
    return this.request<{ cart: Cart }>("/cart/user");
  }

  async updateCartItem(cartId: string, quantity: number): Promise<ApiResponse<{ cart: Cart }>> {
    console.log("🛒 Updating cart item:", cartId);
    return this.request<{ cart: Cart }>(`/cart/update/${cartId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  }

  async removeCartItem(cartId: string): Promise<ApiResponse<any>> {
    console.log("🛒 Removing cart item:", cartId);
    return this.request<any>(`/cart/remove/${cartId}`, {
      method: "DELETE",
    });
  }

  async clearCart(): Promise<ApiResponse<any>> {
    console.log("🛒 Clearing cart");
    return this.request<any>("/cart/clear", {
      method: "DELETE",
    });
  }

  async syncCart(items: any[]): Promise<ApiResponse<{ cart: Cart }>> {
    console.log("🛒 Syncing cart");
    return this.request<{ cart: Cart }>("/cart/sync", {
      method: "POST",
      body: JSON.stringify({ items }),
    });
  }

  // User Endpoints
  async getUserProfile(): Promise<ApiResponse<{ user: User }>> {
    console.log("👤 Fetching user profile");
    return this.request<{ user: User }>("/users/profile");
  }

  async updateUserProfile(profileData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    console.log("👤 Updating user profile");
    return this.request<{ user: User }>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  async getUserAddresses(): Promise<ApiResponse<{ addresses: any[] }>> {
    console.log("🏠 Fetching user addresses");
    return this.request<{ addresses: any[] }>("/users/addresses");
  }

  async addAddress(addressData: any): Promise<ApiResponse<{ address: any }>> {
    console.log("🏠 Adding new address");
    return this.request<{ address: any }>("/users/addresses", {
      method: "POST",
      body: JSON.stringify(addressData),
    });
  }

  async updateAddress(id: string, addressData: any): Promise<ApiResponse<{ address: any }>> {
    console.log("🏠 Updating address:", id);
    return this.request<{ address: any }>(`/users/addresses/${id}`, {
      method: "PUT",
      body: JSON.stringify(addressData),
    });
  }

  async deleteAddress(id: string): Promise<ApiResponse<any>> {
    console.log("🏠 Deleting address:", id);
    return this.request<any>(`/users/addresses/${id}`, {
      method: "DELETE",
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<any>> {
    console.log("🔑 Changing password");
    return this.request<any>("/users/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async deleteAccount(password: string, confirmation: string): Promise<ApiResponse<any>> {
    console.log("🗑️ Deleting account");
    return this.request<any>("/users/account", {
      method: "DELETE",
      body: JSON.stringify({ password, confirmation }),
    });
  }

  // Coupon Endpoints
  async applyCoupon(code: string, orderTotal: number): Promise<ApiResponse<{ coupon: Coupon }>> {
    console.log("🎫 Applying coupon:", code);
    return this.request<{ coupon: Coupon }>("/coupons/apply", {
      method: "POST",
      body: JSON.stringify({ code, orderTotal }),
    });
  }

  async validateCoupon(code: string): Promise<ApiResponse<{ coupon: Coupon; validation: { isValid: boolean; reasons: string[]; } }>> {
    console.log("🎫 Validating coupon:", code);
    return this.request<{ coupon: Coupon; validation: { isValid: boolean; reasons: string[]; } }>("/coupons/validate", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  }

  async getAvailableCoupons(orderTotal?: number): Promise<ApiResponse<{ coupons: Coupon[] }>> {
    console.log("🎫 Fetching available coupons");
    const params = new URLSearchParams();
    if (orderTotal) params.append("orderTotal", orderTotal.toString());
    const queryString = params.toString();
    return this.request<{ coupons: Coupon[] }>(`/coupons/available${queryString ? `?${queryString}` : ""}`);
  }

  async getPublicCoupons(): Promise<ApiResponse<{ coupons: Coupon[] }>> {
    console.log("🎫 Fetching public coupons");
    return this.request<{ coupons: Coupon[] }>("/coupons/public");
  }

  async recordCouponUsage(code: string, orderId: string, discountAmount: number): Promise<ApiResponse<any>> {
    console.log("🎫 Recording coupon usage:", code);
    return this.request<any>("/coupons/use", {
      method: "POST",
      body: JSON.stringify({ code, orderId, discountAmount }),
    });
  }

  // Wishlist Endpoints
  async getWishlist(filters?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<{ wishlist: Wishlist; pagination: { currentPage: number; totalPages: number; totalItems: number; hasNextPage: boolean; hasPrevPage: boolean; limit: number; }; }>> {
    console.log("❤️ Fetching wishlist");
    const params = new URLSearchParams();
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

    const queryString = params.toString();
    return this.request<{ wishlist: Wishlist; pagination: { currentPage: number; totalPages: number; totalItems: number; hasNextPage: boolean; hasPrevPage: boolean; limit: number; }; }>(`/wishlist/user${queryString ? `?${queryString}` : ""}`);
  }

  async addToWishlist(productId: string): Promise<ApiResponse<{ wishlist: Wishlist }>> {
    console.log("❤️ Adding to wishlist:", productId);
    return this.request<{ wishlist: Wishlist }>("/wishlist/add", {
      method: "POST",
      body: JSON.stringify({ productId }),
    });
  }

  async removeFromWishlist(productId: string): Promise<ApiResponse<any>> {
    console.log("❤️ Removing from wishlist:", productId);
    return this.request<any>(`/wishlist/remove/${productId}`, {
      method: "DELETE",
    });
  }

  async clearWishlist(): Promise<ApiResponse<any>> {
    console.log("❤️ Clearing wishlist");
    return this.request<any>("/wishlist/clear", {
      method: "DELETE",
    });
  }

  async moveWishlistItemToCart(productId: string, quantity?: number): Promise<ApiResponse<any>> {
    console.log("❤️ Moving wishlist item to cart:", productId);
    return this.request<any>("/wishlist/move-to-cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async checkWishlist(productId: string): Promise<ApiResponse<{ isInWishlist: boolean; addedAt: Date | null; productId: string; }>> {
    console.log("❤️ Checking wishlist for product:", productId);
    return this.request<{ isInWishlist: boolean; addedAt: Date | null; productId: string; }>("/wishlist/check", {
      method: "POST",
      body: JSON.stringify({ productId }),
    });
  }

  async getWishlistStats(): Promise<ApiResponse<{ stats: any }>> {
    console.log("❤️ Fetching wishlist stats");
    return this.request<{ stats: any }>("/wishlist/stats");
  }

  // Admin Endpoints (Example - you'd likely have a separate admin API client)
  async adminLogin(credentials: any): Promise<ApiResponse<AuthResponse>> {
    console.log("🔐 Attempting admin login");
    const response = await this.request<AuthResponse>("/admin/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data?.token) {
      // Admin token might be stored separately or handled differently
      console.log("✅ Admin login successful");
    }

    return response;
  }

  async adminGetProfile(): Promise<ApiResponse<{ admin: User }>> {
    console.log("👤 Fetching admin profile");
    return this.request<{ admin: User }>("/admin/auth/profile");
  }

  async adminVerifyToken(): Promise<ApiResponse<{ admin: User }>> {
    console.log("🔍 Verifying admin token");
    return this.request<{ admin: User }>("/admin/auth/verify", {
      method: "POST",
    });
  }

  async adminLogout(): Promise<ApiResponse<any>> {
    console.log("🚪 Admin logging out");
    return this.request<any>("/admin/auth/logout", {
      method: "POST",
    });
  }

  async adminRefreshToken(): Promise<ApiResponse<AuthResponse>> {
    console.log("🔄 Refreshing admin token");
    return this.request<AuthResponse>("/admin/auth/refresh", {
      method: "POST",
    });
  }

  async adminUpdateProfile(profileData: Partial<User>): Promise<ApiResponse<{ admin: User }>> {
    console.log("👤 Updating admin profile");
    return this.request<{ admin: User }>("/admin/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  async adminUpdateOrderStatus(id: string, status: string, note?: string, trackingNumber?: string): Promise<ApiResponse<{ order: Order }>> {
    console.log("📦 Admin updating order status for:", id, "to", status);
    return this.request<{ order: Order }>(`/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, note, trackingNumber }),
    });
  }

  async adminGetCouponStats(couponCode: string): Promise<ApiResponse<{ stats: any }>> {
    console.log("🎫 Admin fetching coupon stats for:", couponCode);
    return this.request<{ stats: any }>(`/coupons/stats/${couponCode}`);
  }

}

export const newBackendApi = new BackendApiClient();


