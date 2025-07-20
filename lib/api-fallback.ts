// Mocked API Routes with Fallback Functionality
import { Product } from "./api"

// Mock data for fallback
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface GetProductsParams {
  limit?: number
  category?: string
  search?: string
  page?: number
}

interface CreateOrderParams {
  items: Array<{
    productId: string
    quantity: number
  }>
  shippingAddress: any
  paymentMethod: string
}

class ApiFallback {
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://fragransia.onrender.com/api'

  constructor() {
    if (typeof window !== 'undefined') {
      // Listen for online/offline events
      window.addEventListener('online', () => {
        this.isOnline = true
        this.syncPendingActions()
      })
      
      window.addEventListener('offline', () => {
        this.isOnline = false
      })
    }
  }

  // Generic API call with fallback
  async apiCall<T>(
    endpoint: string,
    options: RequestInit = {},
    fallbackHandler?: () => Promise<T>
  ): Promise<T> {
    try {
      // Try real API first
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.warn(`API call to ${endpoint} failed, using fallback:`, error)
      
      if (fallbackHandler) {
        return await fallbackHandler()
      }
      
      throw error
    }
  }

  // Products API
  async getProducts(params: GetProductsParams = {}): Promise<ApiResponse<{ products: Product[]; total: number }>> {
    return this.apiCall(
      `/products?${new URLSearchParams(params as any).toString()}`,
      { method: 'GET' }
    )
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.apiCall(
      `/products/${id}`,
      { method: 'GET' }
    )
  }

  // Orders API
  async createOrder(params: CreateOrderParams): Promise<ApiResponse<LocalOrder>> {
    return this.apiCall(
      '/orders',
      {
        method: 'POST',
        body: JSON.stringify(params),
      }
    )
  }

  async getOrders(userId?: string): Promise<ApiResponse<LocalOrder[]>> {
    return this.apiCall(
      `/orders${userId ? `?userId=${userId}` : ''}`,
      { method: 'GET' }
    )
  }

  async getOrder(id: string): Promise<ApiResponse<LocalOrder>> {
    return this.apiCall(
      `/orders/${id}`,
      { method: 'GET' }
    )
  }

  // User Authentication API
  async signIn(email: string, password: string): Promise<ApiResponse<{ user: LocalUser; token: string }>> {
    return this.apiCall(
      '/auth/signin',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    )
  }

  async signUp(email: string, password: string, name: string): Promise<ApiResponse<{ user: LocalUser; token: string }>> {
    return this.apiCall(
      '/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      }
    )
  }

  // Newsletter API
  async subscribeNewsletter(email: string): Promise<ApiResponse<{ message: string }>> {
    return this.apiCall(
      '/newsletter/subscribe',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      }
    )
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, { 
        method: 'GET',
        timeout: 5000 
      } as any)
      return response.ok
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const apiFallback = new ApiFallback()

export type { ApiResponse, GetProductsParams, CreateOrderParams }
