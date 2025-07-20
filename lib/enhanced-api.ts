// Enhanced API Client matching the backend server routes
import type {
  Product,
  Order,
  User,
  AuthResponse,
  Address,
  Cart,
  CartItem,
  Wishlist,
  WishlistItem,
  Coupon,
  AppliedCoupon,
  ShippingOption,
  Review,
  PaymentData,
} from "./types"
import type { ApiResponse } from "./api-fallback"
import { API_BASE, TIMEOUTS } from "./constants"

interface EnhancedApiConfig {
  baseUrl?: string
  timeout?: number
  retries?: number
  enableOfflineMode?: boolean
  enableSync?: boolean
  enableAuth?: boolean
}

class EnhancedApiClient {
  private config: Required<EnhancedApiConfig>
  private isOnline = typeof navigator !== "undefined" ? navigator.onLine : true
  private baseUrl: string
  private token: string | null = null
  private refreshToken: string | null = null

  constructor(config: EnhancedApiConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || API_BASE,
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      enableOfflineMode: config.enableOfflineMode ?? true,
      enableSync: config.enableSync ?? true,
      enableAuth: config.enableAuth ?? true,
    }

    this.baseUrl = API_BASE
    console.log("🔧 Enhanced API Client initialized with URL:", this.baseUrl)

    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
      this.refreshToken = localStorage.getItem("refresh_token")
      if (this.token) {
        console.log("🔑 Auth token loaded from localStorage")
      }
      this.initializeEventListeners()
    }
  }

  private initializeEventListeners(): void {
    if (typeof window === "undefined") return

    window.addEventListener("online", () => {
      this.isOnline = true
      console.log("🌐 Connection restored")
    })

    window.addEventListener("offline", () => {
      this.isOnline = false
      console.log("📴 Connection lost")
    })
  }

  // Token management
  setTokens(token: string, refreshToken?: string): void {
    this.token = token
    this.refreshToken = refreshToken || null

    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken)
      }
      console.log("🔑 Tokens saved to localStorage")
    }
  }

  clearTokens(): void {
    this.token = null
    this.refreshToken = null

    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("refresh_token")
      console.log("🔑 Tokens cleared from localStorage")
    }
  }

  isAuthenticated(): boolean {
    return !!this.token
  }

  // Generic request method matching backend response format
  private async request<T>(
    endpoint: string,
    options: RequestInit & { timeout?: number; retries?: number } = {},
  ): Promise<ApiResponse<T>> {
    const { timeout = TIMEOUTS.API_REQUEST, retries = 3, ...fetchOptions } = options

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const url = `${this.baseUrl}${endpoint}`
        console.log(`📡 API Request (attempt ${attempt + 1}): ${fetchOptions.method || "GET"} ${url}`)

        const headers: HeadersInit = {
          "Content-Type": "application/json",
          ...fetchOptions.headers,
        }

        if (this.token) {
          headers["Authorization"] = `Bearer ${this.token}`
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(url, {
          ...fetchOptions,
          headers,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        let data: any
        try {
          data = await response.json()
        } catch (parseError) {
          console.error("❌ Failed to parse response as JSON:", parseError)
          return {
            success: false,
            error: "Invalid response format from server",
          }
        }

        console.log(`📡 API Response: ${response.status} ${response.statusText}`)

        if (!response.ok) {
          const errorMessage = data.error || data.message || `HTTP ${response.status}: ${response.statusText}`
          console.error("❌ API Error:", errorMessage)
          return {
            success: false,
            error: errorMessage,
            details: data.details,
          }
        }

        console.log("✅ API request successful")
        return {
          success: true,
          data: data.data || data,
          message: data.message,
        }
      } catch (error) {
        console.error(`❌ API Request Error (attempt ${attempt + 1}):`, error)

        if (attempt === retries) {
          if (error instanceof Error) {
            if (error.name === "AbortError") {
              return {
                success: false,
                error: "Request timeout - please check your connection",
              }
            }
            return {
              success: false,
              error: error.message,
            }
          }

          return {
            success: false,
            error: "Unknown error occurred",
          }
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
      }
    }

    return {
      success: false,
      error: "Max retries exceeded",
    }
  }

  // Health & System
  async healthCheck(): Promise<ApiResponse> {
    return this.request("/api/health")
  }

  async getSystemStatus(): Promise<ApiResponse> {
    return this.request("/")
  }

  // Authentication Methods (matching backend routes)
  async register(userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phoneNumber?: string
  }): Promise<ApiResponse<AuthResponse>> {
    console.log("👤 Attempting user registration")
    const response = await this.request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
      timeout: TIMEOUTS.AUTH_TOKEN_REFRESH,
    })

    if (response.success && response.data?.token) {
      this.setTokens(response.data.token)
      console.log("✅ Registration successful")
    }

    return response
  }

  async login(credentials: {
    email: string
    password: string
  }): Promise<ApiResponse<AuthResponse>> {
    console.log("🔐 Attempting user login")
    const response = await this.request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
      timeout: TIMEOUTS.AUTH_TOKEN_REFRESH,
    })

    if (response.success && response.data?.token) {
      this.setTokens(response.data.token)
      console.log("✅ Login successful")
    }

    return response
  }

  async googleLogin(googleToken: string): Promise<ApiResponse<AuthResponse>> {
    console.log("🔐 Attempting Google login")
    const response = await this.request<AuthResponse>("/api/auth/google-login", {
      method: "POST",
      body: JSON.stringify({ googleToken }),
      timeout: TIMEOUTS.AUTH_TOKEN_REFRESH,
    })

    if (response.success && response.data?.token) {
      this.setTokens(response.data.token)
      console.log("✅ Google login successful")
    }

    return response
  }

  async loginWithFirebaseToken(firebaseToken: string): Promise<ApiResponse<AuthResponse>> {
    console.log("🔐 Attempting Firebase token login")
    const response = await this.request<AuthResponse>("/api/auth/login-token", {
      method: "POST",
      body: JSON.stringify({ firebaseToken }),
      timeout: TIMEOUTS.AUTH_TOKEN_REFRESH,
    })

    if (response.success && response.data?.token) {
      this.setTokens(response.data.token)
      console.log("✅ Firebase token login successful")
    }

    return response
  }

  async registerWithFirebaseToken(firebaseToken: string, userData?: any): Promise<ApiResponse<AuthResponse>> {
    console.log("👤 Attempting Firebase token registration")
    const response = await this.request<AuthResponse>("/api/auth/register-token", {
      method: "POST",
      body: JSON.stringify({ firebaseToken, userData }),
      timeout: TIMEOUTS.AUTH_TOKEN_REFRESH,
    })

    if (response.success && response.data?.token) {
      this.setTokens(response.data.token)
      console.log("✅ Firebase token registration successful")
    }

    return response
  }

  async verifyToken(): Promise<ApiResponse<{ user: User }>> {
    console.log("🔍 Verifying auth token")
    return this.request<{ user: User }>("/api/auth/verify", {
      method: "POST",
      body: JSON.stringify({ token: this.token }),
      timeout: TIMEOUTS.AUTH_TOKEN_REFRESH,
    })
  }

  async logout(): Promise<ApiResponse> {
    console.log("👋 Logging out user")
    const response = await this.request("/api/auth/logout", {
      method: "POST",
      timeout: TIMEOUTS.AUTH_TOKEN_REFRESH,
    })

    this.clearTokens()
    return response
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    console.log("🔑 Requesting password reset")
    return this.request("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      timeout: TIMEOUTS.AUTH_TOKEN_REFRESH,
    })
  }

  // Product Methods (matching backend routes)
  async getProducts(filters?: {
    category?: string
    search?: string
    page?: number
    limit?: number
    sort?: string
    rating?: number
    minPrice?: number
    maxPrice?: number
    brand?: string
  }): Promise<
    ApiResponse<{
      products: Product[]
      pagination: {
        page: number
        limit: number
        total: number
        pages: number
      }
    }>
  > {
    console.log("🛍️ Fetching products")

    const params = new URLSearchParams()
    if (filters?.category) params.append("category", filters.category)
    if (filters?.search) params.append("search", filters.search)
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())
    if (filters?.sort) params.append("sort", filters.sort)
    if (filters?.rating) params.append("rating", filters.rating.toString())
    if (filters?.minPrice) params.append("minPrice", filters.minPrice.toString())
    if (filters?.maxPrice) params.append("maxPrice", filters.maxPrice.toString())
    if (filters?.brand) params.append("brand", filters.brand)

    const queryString = params.toString()
    return this.request(`/api/products${queryString ? `?${queryString}` : ""}`)
  }

  async getProduct(productId: string): Promise<ApiResponse<{ product: Product }>> {
    console.log("🛍️ Fetching product:", productId)
    return this.request<{ product: Product }>(`/api/products/${productId}`)
  }

  // Cart Methods (matching backend routes)
  async getCart(): Promise<ApiResponse<{ cart: Cart }>> {
    console.log("🛒 Fetching cart")
    return this.request<{ cart: Cart }>("/api/cart")
  }

  async addToCart(
    productId: string,
    quantity = 1,
    size?: string,
    variant?: string,
  ): Promise<ApiResponse<{ cartItem: any }>> {
    console.log("🛒 Adding to cart:", productId)
    return this.request<{ cartItem: any }>("/api/cart/items", {
      method: "POST",
      body: JSON.stringify({ productId, quantity, size, variant }),
    })
  }

  async updateCartItem(cartId: string, quantity: number): Promise<ApiResponse<any>> {
    console.log("🛒 Updating cart item:", cartId)
    return this.request(`/api/cart/items/${cartId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    })
  }

  async removeCartItem(cartId: string): Promise<ApiResponse> {
    console.log("🛒 Removing cart item:", cartId)
    return this.request(`/api/cart/items/${cartId}`, {
      method: "DELETE",
    })
  }

  async clearCart(): Promise<ApiResponse> {
    console.log("🛒 Clearing cart")
    return this.request("/api/cart", {
      method: "DELETE",
    })
  }

  async syncCart(items: any[]): Promise<ApiResponse<any>> {
    console.log("🛒 Syncing cart")
    return this.request("/api/cart/sync", {
      method: "POST",
      body: JSON.stringify({ items }),
    })
  }

  // Wishlist Methods (matching backend routes)
  async getWishlist(filters?: {
    page?: number
    limit?: number
  }): Promise<
    ApiResponse<{
      wishlistItems: WishlistItem[]
      pagination: any
      summary: any
    }>
  > {
    console.log("❤️ Fetching wishlist")
    const params = new URLSearchParams()
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())

    const queryString = params.toString()
    return this.request(`/api/wishlist${queryString ? `?${queryString}` : ""}`)
  }

  async addToWishlist(productId: string): Promise<ApiResponse<{ wishlistItem: any }>> {
    console.log("❤️ Adding to wishlist:", productId)
    return this.request<{ wishlistItem: any }>("/api/wishlist/items", {
      method: "POST",
      body: JSON.stringify({ productId }),
    })
  }

  async removeFromWishlist(itemId: string): Promise<ApiResponse> {
    console.log("❤️ Removing from wishlist:", itemId)
    return this.request(`/api/wishlist/items/${itemId}`, {
      method: "DELETE",
    })
  }

  async moveWishlistItemToCart(itemId: string, quantity?: number): Promise<ApiResponse> {
    console.log("❤️ Moving wishlist item to cart:", itemId)
    return this.request(`/api/wishlist/items/${itemId}/move-to-cart`, {
      method: "POST",
      body: JSON.stringify({ quantity }),
    })
  }

  async clearWishlist(): Promise<ApiResponse> {
    console.log("❤️ Clearing wishlist")
    return this.request("/api/wishlist", {
      method: "DELETE",
    })
  }

  async getWishlistStats(): Promise<ApiResponse<any>> {
    console.log("❤️ Fetching wishlist stats")
    return this.request("/api/wishlist/stats")
  }

  async syncWishlist(items: any[]): Promise<ApiResponse<any>> {
    console.log("❤️ Syncing wishlist")
    return this.request("/api/wishlist/sync", {
      method: "POST",
      body: JSON.stringify({ items }),
    })
  }

  // Order Methods (matching backend routes)
  async createOrder(orderData: {
    items: Array<{
      productId: string
      quantity: number
      price: number
    }>
    shippingAddress: Address
    billingAddress?: Address
    paymentMethod: string
  }): Promise<ApiResponse<{ order: Order }>> {
    console.log("📦 Creating order")
    return this.request("/api/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
      timeout: TIMEOUTS.PAYMENT_PROCESS,
    })
  }

  async getOrders(filters?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<
    ApiResponse<{
      orders: Order[]
      pagination: any
    }>
  > {
    console.log("📦 Fetching user orders")
    const params = new URLSearchParams()
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())
    if (filters?.status) params.append("status", filters.status)

    const queryString = params.toString()
    return this.request(`/api/orders${queryString ? `?${queryString}` : ""}`)
  }

  async getOrder(orderId: string): Promise<ApiResponse<{ order: Order }>> {
    console.log("📦 Fetching order:", orderId)
    return this.request<{ order: Order }>(`/api/orders/${orderId}`)
  }

  async cancelOrder(orderId: string): Promise<ApiResponse> {
    console.log("📦 Cancelling order:", orderId)
    return this.request(`/api/orders/${orderId}`, {
      method: "DELETE",
    })
  }

  // User Profile Methods (matching backend routes)
  async getUserProfile(): Promise<ApiResponse<{ user: User }>> {
    console.log("👤 Fetching user profile")
    return this.request<{ user: User }>("/api/users/profile")
  }

  async updateUserProfile(profileData: Partial<User>): Promise<ApiResponse<any>> {
    console.log("👤 Updating user profile")
    return this.request("/api/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    })
  }

  async getUserAddresses(): Promise<ApiResponse<{ addresses: Address[] }>> {
    console.log("🏠 Fetching user addresses")
    return this.request<{ addresses: Address[] }>("/api/users/addresses")
  }

  async addAddress(addressData: Omit<Address, "id">): Promise<ApiResponse<{ address: Address }>> {
    console.log("🏠 Adding new address")
    return this.request<{ address: Address }>("/api/users/addresses", {
      method: "POST",
      body: JSON.stringify(addressData),
    })
  }

  async updateAddress(addressId: string, addressData: Partial<Address>): Promise<ApiResponse<any>> {
    console.log("🏠 Updating address:", addressId)
    return this.request(`/api/users/addresses/${addressId}`, {
      method: "PUT",
      body: JSON.stringify(addressData),
    })
  }

  async deleteAddress(addressId: string): Promise<ApiResponse> {
    console.log("🏠 Deleting address:", addressId)
    return this.request(`/api/users/addresses/${addressId}`, {
      method: "DELETE",
    })
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    console.log("🔑 Changing password")
    return this.request("/api/users/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  }

  async getUserOrderHistory(filters?: {
    page?: number
    limit?: number
  }): Promise<ApiResponse<any>> {
    console.log("📦 Fetching user order history")
    const params = new URLSearchParams()
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())

    const queryString = params.toString()
    return this.request(`/api/users/order-history${queryString ? `?${queryString}` : ""}`)
  }

  // Coupon Methods (matching backend routes)
  async getAvailableCoupons(active = true): Promise<ApiResponse<{ coupons: Coupon[] }>> {
    console.log("🎫 Fetching available coupons")
    const params = new URLSearchParams()
    if (active !== undefined) params.append("active", active.toString())

    const queryString = params.toString()
    return this.request<{ coupons: Coupon[] }>(`/api/coupons${queryString ? `?${queryString}` : ""}`)
  }

  async getPublicCoupons(): Promise<ApiResponse<{ coupons: Coupon[] }>> {
    console.log("🎫 Fetching public coupons")
    return this.request<{ coupons: Coupon[] }>("/api/coupons/public")
  }

  async validateCoupon(code: string, orderValue?: number, items?: any[]): Promise<ApiResponse<any>> {
    console.log("🎫 Validating coupon:", code)
    return this.request("/api/coupons/validate", {
      method: "POST",
      body: JSON.stringify({ code, orderValue, items }),
    })
  }

  async applyCoupon(code: string, orderId: string): Promise<ApiResponse<any>> {
    console.log("🎫 Applying coupon:", code)
    return this.request("/api/coupons/apply", {
      method: "POST",
      body: JSON.stringify({ code, orderId }),
    })
  }

  // Review Methods (matching backend routes)
  async getProductReviews(
    productId?: string,
    filters?: {
      page?: number
      limit?: number
      rating?: number
    },
  ): Promise<
    ApiResponse<{
      reviews: Review[]
      pagination: any
      summary: any
    }>
  > {
    console.log("⭐ Fetching product reviews:", productId)
    const params = new URLSearchParams()
    if (productId) params.append("productId", productId)
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())
    if (filters?.rating) params.append("rating", filters.rating.toString())

    const queryString = params.toString()
    return this.request(`/api/reviews${queryString ? `?${queryString}` : ""}`)
  }

  async createReview(reviewData: {
    productId: string
    rating: number
    title: string
    comment: string
  }): Promise<ApiResponse<{ review: Review }>> {
    console.log("⭐ Creating review")
    return this.request<{ review: Review }>("/api/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    })
  }

  async markReviewHelpful(reviewId: string, helpful = true): Promise<ApiResponse<any>> {
    console.log("⭐ Marking review helpful:", reviewId)
    return this.request(`/api/reviews/${reviewId}/helpful`, {
      method: "PUT",
      body: JSON.stringify({ helpful }),
    })
  }

  async deleteReview(reviewId: string): Promise<ApiResponse> {
    console.log("⭐ Deleting review:", reviewId)
    return this.request(`/api/reviews/${reviewId}`, {
      method: "DELETE",
    })
  }

  // Payment Methods (matching backend routes)
  async processPayment(paymentData: {
    orderId: string
    paymentMethod: string
    amount: number
    paymentDetails?: any
  }): Promise<ApiResponse<{ payment: any }>> {
    console.log("💳 Processing payment")
    return this.request("/api/payments/process", {
      method: "POST",
      body: JSON.stringify(paymentData),
      timeout: TIMEOUTS.PAYMENT_PROCESS,
    })
  }

  async getPaymentStatus(paymentId: string): Promise<ApiResponse<any>> {
    console.log("💳 Getting payment status")
    return this.request(`/api/payments/${paymentId}/status`)
  }

  async processRefund(paymentId: string, amount: number, reason?: string): Promise<ApiResponse<{ refund: any }>> {
    console.log("💳 Processing refund")
    return this.request("/api/payments/refund", {
      method: "POST",
      body: JSON.stringify({ paymentId, amount, reason }),
      timeout: TIMEOUTS.PAYMENT_PROCESS,
    })
  }

  // Admin Methods (matching backend routes)
  async adminLogin(credentials: { email: string; password: string }): Promise<ApiResponse<AuthResponse>> {
    console.log("👑 Attempting admin login")
    const response = await this.request<AuthResponse>("/api/admin/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
      timeout: TIMEOUTS.AUTH_TOKEN_REFRESH,
    })

    if (response.success && response.data?.token) {
      this.setTokens(response.data.token)
      console.log("✅ Admin login successful")
    }

    return response
  }

  async getAdminProfile(): Promise<ApiResponse<{ admin: any }>> {
    console.log("👑 Fetching admin profile")
    return this.request<{ admin: any }>("/api/admin/auth/profile")
  }

  async adminLogout(): Promise<ApiResponse> {
    console.log("👑 Admin logout")
    const response = await this.request("/api/admin/auth/logout", {
      method: "POST",
      timeout: TIMEOUTS.AUTH_TOKEN_REFRESH,
    })

    this.clearTokens()
    return response
  }

  async getAdminDashboard(): Promise<ApiResponse<any>> {
    console.log("👑 Fetching admin dashboard")
    return this.request("/api/admin/dashboard")
  }

  async getAdminUsers(filters?: {
    page?: number
    limit?: number
    search?: string
    status?: string
  }): Promise<ApiResponse<any>> {
    console.log("👑 Fetching admin users")
    const params = new URLSearchParams()
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())
    if (filters?.search) params.append("search", filters.search)
    if (filters?.status) params.append("status", filters.status)

    const queryString = params.toString()
    return this.request(`/api/admin/users${queryString ? `?${queryString}` : ""}`)
  }

  async getAdminOrders(filters?: {
    page?: number
    limit?: number
    status?: string
    search?: string
  }): Promise<ApiResponse<any>> {
    console.log("👑 Fetching admin orders")
    const params = new URLSearchParams()
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())
    if (filters?.status) params.append("status", filters.status)
    if (filters?.search) params.append("search", filters.search)

    const queryString = params.toString()
    return this.request(`/api/admin/orders${queryString ? `?${queryString}` : ""}`)
  }

  async updateOrderStatus(orderId: string, status: string, trackingNumber?: string): Promise<ApiResponse<any>> {
    console.log("👑 Updating order status:", orderId)
    return this.request(`/api/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, trackingNumber }),
    })
  }

  async createProduct(productData: any): Promise<ApiResponse<{ product: Product }>> {
    console.log("👑 Creating product")
    return this.request<{ product: Product }>("/api/products", {
      method: "POST",
      body: JSON.stringify(productData),
    })
  }

  async updateProduct(productId: string, productData: any): Promise<ApiResponse<any>> {
    console.log("👑 Updating product:", productId)
    return this.request(`/api/products/${productId}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    })
  }

  async deleteProduct(productId: string): Promise<ApiResponse> {
    console.log("👑 Deleting product:", productId)
    return this.request(`/api/products/${productId}`, {
      method: "DELETE",
    })
  }

  async createCoupon(couponData: any): Promise<ApiResponse<{ coupon: Coupon }>> {
    console.log("👑 Creating coupon")
    return this.request<{ coupon: Coupon }>("/api/coupons", {
      method: "POST",
      body: JSON.stringify(couponData),
    })
  }

  async getCouponUsage(couponId: string): Promise<ApiResponse<any>> {
    console.log("👑 Fetching coupon usage:", couponId)
    return this.request(`/api/coupons/${couponId}/usage`)
  }

  // Countdown Methods (matching backend routes)
  async getActiveCountdown(): Promise<
    ApiResponse<{
      active: boolean
      endTime: string | null
      title: string
      description: string
    }>
  > {
    console.log("⏰ Fetching active countdown")
    return this.request("/api/countdown/active")
  }

  // Check if product is in wishlist
  async checkWishlist(productId: string): Promise<ApiResponse<{ isInWishlist: boolean; addedAt: Date | null }>> {
    // This would need to be implemented based on wishlist items
    const wishlistResponse = await this.getWishlist()
    if (wishlistResponse.success && wishlistResponse.data?.wishlistItems) {
      const item = wishlistResponse.data.wishlistItems.find((item: any) => item.productId === productId)
      return {
        success: true,
        data: {
          isInWishlist: !!item,
          addedAt: item?.addedAt || null,
        },
      }
    }
    return {
      success: false,
      error: "Failed to check wishlist",
    }
  }

  // Debug method
  async debugStatus(): Promise<void> {
    console.log("🔍 === ENHANCED API CLIENT DEBUG STATUS ===")
    console.log("Configuration:")
    console.log("- Base URL:", this.baseUrl)
    console.log("- Token:", this.token ? "Present" : "Not set")
    console.log("- Refresh Token:", this.refreshToken ? "Present" : "Not set")
    console.log("- Environment:", process.env.NODE_ENV)

    try {
      const healthResponse = await this.healthCheck()
      console.log("Health Check:", healthResponse)
    } catch (error) {
      console.log("Health Check Failed:", error)
    }

    console.log("=== END DEBUG STATUS ===")
  }
}

// Create and export singleton instance
export const enhancedApi = new EnhancedApiClient()

// Debug on initialization in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // Add debug method to window for easy access
  ;(window as any).debugEnhancedApi = () => enhancedApi.debugStatus()
  console.log("🔧 Debug mode: Run debugEnhancedApi() in console for detailed status")
}

export default enhancedApi
export type {
  User,
  Product,
  Order,
  ApiResponse,
  AuthResponse,
  Address,
  Cart,
  CartItem,
  Wishlist,
  WishlistItem,
  Coupon,
  AppliedCoupon,
  ShippingOption,
  Review,
  PaymentData,
}
