// Enhanced Backend API Client for Fragransia™ Frontend
// Connects to the fragransia-main backend for authentication and data

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  details?: any[]
}

interface User {
  id: string
  uid: string
  email: string
  name?: string
  firstName: string
  lastName: string
  role: 'customer' | 'admin'
  phoneNumber?: string
  emailVerified?: boolean
}

interface AuthResponse {
  user: User
  token: string
}

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  category: string
  rating?: number
  reviews?: number
  size?: string
  image: string
  description: string
  notes?: {
    top: string[]
    middle: string[]
    base: string[]
  }
  discount?: number
  stock: number
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

interface Order {
  id: string
  userId: string
  items: Array<{
    productId: string
    quantity: number
    price: number
    name: string
    image: string
  }>
  total: number
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  shippingAddress: {
    name: string
    phone: string
    address: string
    city: string
    state: string
    pincode: string
  }
  paymentMethod: string
  createdAt: string
  updatedAt: string
}

export interface Address {
  id: string
  name: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
  country?: string; // Added country
  type?: "home" | "office" | "other"; // Added type
}

class BackendApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    // Use environment variable first, then fallback to development/production URLs
    this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 
                   (process.env.NODE_ENV === 'development' 
                     ? 'http://localhost:5000/api' 
                     : 'https://backend-8npy.onrender.com/api')
    
    console.log('🔧 Backend API initialized with URL:', this.baseUrl)
    
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
      if (this.token) {
        console.log('🔑 Auth token loaded from localStorage')
      }
    }
  }

  // Set authentication token
  setToken(token: string): void {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
      console.log('🔑 Auth token saved to localStorage')
    }
  }

  // Clear authentication token
  clearToken(): void {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      console.log('🔑 Auth token cleared from localStorage')
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token
  }

  // Generic API request method with enhanced error handling
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      console.log(`📡 Making API request: ${options.method || 'GET'} ${url}`)
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      }

      // Add authorization header if token exists
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      let data: any
      try {
        data = await response.json()
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError)
        throw new Error('Invalid response format from server')
      }

      console.log(`📡 API Response: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        const errorMessage = data.error || data.message || `HTTP ${response.status}: ${response.statusText}`
        console.error('❌ API Error:', errorMessage)
        throw new Error(errorMessage)
      }

      console.log('✅ API request successful')
      return data
    } catch (error) {
      console.error('❌ API Request Error:', error)
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout - please check your connection'
          }
        }
        return {
          success: false,
          error: error.message
        }
      }
      
      return {
        success: false,
        error: 'Unknown error occurred'
      }
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/health')
  }

  // Authentication Methods

  async register(userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phoneNumber?: string
  }): Promise<ApiResponse<AuthResponse>> {
    console.log('👤 Attempting user registration')
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })

    if (response.success && response.data?.token) {
      this.setToken(response.data.token)
      console.log('✅ Registration successful')
    }

    return response
  }

  async login(credentials: {
    email: string
    password: string
  }): Promise<ApiResponse<AuthResponse>> {
    console.log('🔐 Attempting user login')
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    if (response.success && response.data?.token) {
      this.setToken(response.data.token)
      console.log('✅ Login successful')
    }

    return response
  }

  async googleLogin(idToken: string): Promise<ApiResponse<AuthResponse>> {
    console.log('🔐 Attempting Google login')
    const response = await this.request<AuthResponse>('/auth/google-login', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    })

    if (response.success && response.data?.token) {
      this.setToken(response.data.token)
      console.log('✅ Google login successful')
    }

    return response
  }

  async loginWithFirebaseToken(idToken: string): Promise<ApiResponse<AuthResponse>> {
    console.log("🔐 Attempting Firebase token login")
    const response = await this.request<AuthResponse>("/auth/login-token", {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    })

    if (response.success && response.data?.token) {
      this.setToken(response.data.token)
      console.log('✅ Firebase token login successful')
    }

    return response
  }

  async verifyToken(): Promise<ApiResponse<{ user: User }>> {
    console.log('🔍 Verifying auth token')
    return this.request<{ user: User }>('/auth/verify', {
      method: 'POST',
    })
  }

  async logout(): Promise<ApiResponse> {
    console.log('👋 Logging out user')
    const response = await this.request('/auth/logout', {
      method: 'POST',
    })
    
    this.clearToken()
    return response
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    console.log('🔑 Requesting password reset')
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async updateUserProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    console.log('👤 Updating user profile')
    return this.request<User>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async getUserAddresses(): Promise<ApiResponse<Address[]>> {
    console.log('🏠 Fetching user addresses')
    return this.request<Address[]>('/user/addresses')
  }

  // Product Methods

  async getProducts(filters?: {
    category?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<{ products: Product[]; total: number; page: number; totalPages: number }>> {
    console.log('🛍️ Fetching products')
    
    const params = new URLSearchParams()
    if (filters?.category) params.append('category', filters.category)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const queryString = params.toString()
    return this.request(`/products${queryString ? `?${queryString}` : ''}`)
  }

  async getProduct(productId: string): Promise<ApiResponse<Product>> {
    console.log('🛍️ Fetching product:', productId)
    return this.request<Product>(`/products/${productId}`)
  }

  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Product>> {
    console.log('🛍️ Creating product')
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    })
  }

  // Order Methods

  async createOrder(orderData: {
    items: Array<{
      productId: string
      quantity: number
      price: number
    }>
    shippingAddress: any
    shippingOption: any
    coupon: any
    paymentData: any
    total: number
  }): Promise<ApiResponse<Order>> {
    console.log('📦 Creating order')
    return this.request<Order>('/orders/create', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
  }

  async getOrder(orderId: string): Promise<ApiResponse<Order>> {
    console.log('📦 Fetching order:', orderId)
    return this.request<Order>(`/orders/${orderId}`)
  }

  async getUserOrders(): Promise<ApiResponse<Order[]>> {
    console.log('📦 Fetching user orders')
    return this.request<Order[]>('/orders/user')
  }

  // Payment Methods

  async verifyPayment(paymentData: {
    razorpay_payment_id?: string
    razorpay_order_id?: string
    razorpay_signature?: string
    payment_id?: string
    method: string
  }): Promise<ApiResponse<{ verified: boolean }>> {
    console.log('💳 Verifying payment')
    return this.request<{ verified: boolean }>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    })
  }

  async applyCoupon(code: string): Promise<ApiResponse<{ discount: number; type: string }>> {
    console.log('🎫 Applying coupon:', code)
    return this.request<{ discount: number; type: string }>('/coupons/apply', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  }

  async getPublicCoupons(): Promise<ApiResponse<any[]>> {
    console.log("🎫 Fetching public coupons")
    return this.request<any[]>("/coupons/public")
  }

  async getCountdownSettings(): Promise<ApiResponse<any>> {
    console.log("⏰ Fetching countdown settings")
    return this.request<any>("/countdown/active")
  }

  // Admin Methods

  async getAdminDashboard(): Promise<ApiResponse<any>> {
    console.log('👑 Fetching admin dashboard')
    return this.request('/admin/dashboard')
  }

  // Debug method
  async debugStatus(): Promise<void> {
    console.log('🔍 === BACKEND API CLIENT DEBUG STATUS ===')
    console.log('Configuration:')
    console.log('- Base URL:', this.baseUrl)
    console.log('- Token:', this.token ? 'Present' : 'Not set')
    console.log('- Environment:', process.env.NODE_ENV)
    
    try {
      const healthResponse = await this.healthCheck()
      console.log('Health Check:', healthResponse)
    } catch (error) {
      console.log('Health Check Failed:', error)
    }
    
    console.log('=== END DEBUG STATUS ===')
  }
}

// Create and export singleton instance
export const backendApi = new BackendApiClient()

// Debug on initialization in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Add debug method to window for easy access
  ;(window as any).debugBackendApi = () => backendApi.debugStatus()
  console.log('🔧 Debug mode: Run debugBackendApi() in console for detailed status')
}

export type { User, Product, Order, ApiResponse, AuthResponse, Address }

