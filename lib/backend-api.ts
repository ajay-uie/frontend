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

class BackendApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    // Use environment variable first, then fallback to development/production URLs
    this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api'
    
    console.log('🔧 Backend API initialized with URL:', this.baseUrl)
    
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('admin_token')
      if (this.token) {
        console.log('🔑 Admin token loaded from localStorage')
      }
    }
  }

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

  // Set authentication token
  setToken(token: string): void {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_token', token)
      console.log('🔑 Admin token saved to localStorage')
    }
  }

  // Clear authentication token
  clearToken(): void {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token')
      console.log('🔑 Admin token cleared from localStorage')
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token
  }
  // Auth Endpoints
  async register(userData: any): Promise<ApiResponse<AuthResponse>> {
    console.log("👤 Attempting user registration")
    const response = await this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })

    if (response.success && response.data?.token) {
      this.setToken(response.data.token)
      console.log("✅ Registration successful")
    }

    return response
  }

  async login(credentials: any): Promise<ApiResponse<AuthResponse>> {
    console.log("🔐 Attempting user login")
    const response = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })

    if (response.success && response.data?.token) {
      this.setToken(response.data.token)
      console.log("✅ Login successful")
    }

    return response
  }

  async verifyToken(): Promise<ApiResponse<{ user: User }>> {
    console.log("🔍 Verifying auth token")
    return this.request<{ user: User }>("/auth/verify", {
      method: "POST",
    })
  }

  // Product Endpoints
  async getProducts(filters?: {
    category?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<{ products: Product[]; total: number; page: number; totalPages: number }>> {
    console.log("🛍️ Fetching products")
    
    const params = new URLSearchParams()
    if (filters?.category) params.append("category", filters.category)
    if (filters?.search) params.append("search", filters.search)
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())

    const queryString = params.toString()
    return this.request(`/products${queryString ? `?${queryString}` : ""}`)
  }

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    console.log("🛍️ Fetching product:", id)
    return this.request<Product>(`/products/${id}`)
  }

  // Admin Product Endpoints
  async createProduct(productData: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Product>> {
    console.log("🛍️ Creating product")
    return this.request<Product>("/admin/products", {
      method: "POST",
      body: JSON.stringify(productData),
    })
  }

  async updateProduct(id: string, productData: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Product>> {
    console.log("🛍️ Updating product:", id)
    return this.request<Product>(`/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
      requireAuth: true,
    })
  }

  async deleteProduct(id: string): Promise<ApiResponse<any>> {
    console.log("🗑️ Deleting product:", id)
    return this.request(`/admin/products/${id}`, {
      method: "DELETE",
      requireAuth: true,
    })
  }

  // Order Endpoints
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
    console.log("📦 Creating order")
    return this.request<Order>("/orders/create", {
      method: "POST",
      body: JSON.stringify(orderData),
      requireAuth: true,
    })
  }

  async getOrders(): Promise<ApiResponse<Order[]>> {
    console.log("📦 Fetching user orders")
    return this.request<Order[]>("/orders/user", { requireAuth: true })
  }

  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    console.log("📦 Fetching order:", id)
    return this.request<Order>(`/orders/${id}`, { requireAuth: true })
  }

  // Admin Order Endpoints
  async updateOrderStatus(id: string, status: string): Promise<ApiResponse<Order>> {
    console.log("📦 Updating order status for:", id, "to", status)
    return this.request<Order>(`/admin/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
      requireAuth: true,
    })
  }

  // Countdown Settings
  async getCountdownSettings(): Promise<ApiResponse<any>> {
    console.log("⏰ Fetching countdown settings")
    return this.request("/admin/countdown-settings", { requireAuth: true })
  }
}

export const backendApi = new BackendApiClient()
