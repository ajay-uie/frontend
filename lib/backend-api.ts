// Backend API Client for Fragransia™ Frontend
// Connects to the fragransia-main backend for authentication and data

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  details?: any[]
}

interface User {
  uid: string
  email: string
  firstName: string
  lastName: string
  role: 'customer' | 'admin'
  phoneNumber?: string
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

class BackendApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api'
    
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  // Set authentication token
  setToken(token: string): void {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  // Clear authentication token
  clearToken(): void {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  // Generic API request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      }

      // Add authorization header if token exists
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`
      }

      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API Request Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // Authentication Methods

  async register(userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phoneNumber?: string
  }): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })

    if (response.success && response.data?.token) {
      this.setToken(response.data.token)
    }

    return response
  }

  async login(credentials: {
    email: string
    password: string
  }): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    if (response.success && response.data?.token) {
      this.setToken(response.data.token)
    }

    return response
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    const response = await this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    })

    this.clearToken()
    return response
  }

  async verifyToken(): Promise<ApiResponse<{ user: User }>> {
    if (!this.token) {
      return {
        success: false,
        error: 'No token available'
      }
    }

    const response = await this.request<{ user: User }>('/auth/verify', {
      method: 'POST',
    })

    if (!response.success) {
      this.clearToken()
    }

    return response
  }

  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  // Product Methods

  async getProducts(params: {
    limit?: number
    category?: string
    search?: string
    page?: number
  } = {}): Promise<ApiResponse<{ products: Product[]; total: number }>> {
    const queryString = new URLSearchParams(params as any).toString()
    return this.request(`/products${queryString ? `?${queryString}` : ''}`)
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.request(`/products/${id}`)
  }

  // Order Methods

  async createOrder(orderData: {
    items: Array<{ productId: string; quantity: number }>
    shippingAddress: Order['shippingAddress']
    paymentMethod: string
  }): Promise<ApiResponse<Order>> {
    return this.request('/orders/create', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
  }

  async getOrders(): Promise<ApiResponse<Order[]>> {
    return this.request('/orders')
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    return this.request(`/orders/${id}`)
  }

  // User Profile Methods

  async getUserProfile(): Promise<ApiResponse<User>> {
    return this.request('/users/profile')
  }

  async updateUserProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  // Payment Methods

  async createPaymentOrder(amount: number, currency: string = 'INR'): Promise<ApiResponse<any>> {
    return this.request('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount, currency }),
    })
  }

  async verifyPayment(paymentData: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
  }): Promise<ApiResponse<{ message: string }>> {
    return this.request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    })
  }

  // Admin Methods (require admin role)

  async getAdminDashboard(): Promise<ApiResponse<any>> {
    return this.request('/admin/dashboard')
  }

  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Product>> {
    return this.request('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    })
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<ApiResponse<Product>> {
    return this.request(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    })
  }

  async deleteProduct(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/admin/products/${id}`, {
      method: 'DELETE',
    })
  }

  async getAdminOrders(): Promise<ApiResponse<Order[]>> {
    return this.request('/admin/orders')
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<ApiResponse<Order>> {
    return this.request(`/admin/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  // Utility Methods

  isAuthenticated(): boolean {
    return !!this.token
  }

  getToken(): string | null {
    return this.token
  }

  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request('/health')
  }
}

// Export singleton instance
export const backendApi = new BackendApiClient()

// Export types
export type { User, Product, Order, AuthResponse, ApiResponse }

// Export class for custom instances
export { BackendApiClient }

