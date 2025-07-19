// Enhanced API Client with Integrated Fallback Systems
import { Product } from './api'
import { localDB, LocalUser, LocalOrder } from './local-db'
import { apiFallback, ApiResponse } from './api-fallback'
import { syncEngine } from './sync-engine'
import { authSimulation, AuthSession } from './auth-simulation'
import { API_BASE } from './constants'

interface EnhancedApiConfig {
  baseUrl?: string
  timeout?: number
  retries?: number
  enableOfflineMode?: boolean
  enableSync?: boolean
  enableAuth?: boolean
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  timeout?: number
  requireAuth?: boolean
  priority?: 'low' | 'medium' | 'high'
  cache?: boolean
  offline?: boolean
}

class EnhancedApiClient {
  private config: Required<EnhancedApiConfig>
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true

  constructor(config: EnhancedApiConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || API_BASE + '/api',
      timeout: config.timeout || 10000,
      retries: config.retries || 3,
      enableOfflineMode: config.enableOfflineMode ?? true,
      enableSync: config.enableSync ?? true,
      enableAuth: config.enableAuth ?? true
    }

    if (typeof window !== 'undefined') {
      this.initializeEventListeners()
    }
  }

  private initializeEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true
      if (this.config.enableSync) {
        syncEngine.syncAll()
      }
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.config.timeout,
      requireAuth = false,
      priority = 'medium',
      cache = true,
      offline = false
    } = options

    try {
      if (requireAuth && this.config.enableAuth) {
        const session = await authSimulation.getCurrentSession()
        if (!session) {
          return { success: false, error: 'Authentication required' }
        }
        headers['Authorization'] = `Bearer ${session.token}`
      }

      if (offline || (!this.isOnline && this.config.enableOfflineMode)) {
        return await this.handleOfflineRequest<T>(endpoint, { method, headers, body })
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      try {
        const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        const data = await response.json()

        if (response.ok) {
          if (cache && method === 'GET') {
            await this.cacheResponse(endpoint, data)
          }
          return data
        } else {
          throw new Error(data.message || `HTTP ${response.status}`)
        }
      } catch (error) {
        clearTimeout(timeoutId)

        if (this.config.enableOfflineMode) {
          console.warn(`Online request failed, trying offline fallback:`, error)
          return await this.handleOfflineRequest<T>(endpoint, { method, headers, body })
        }

        throw error
      }
    } catch (error) {
      if (this.config.enableSync && method !== 'GET') {
        const syncId = syncEngine.queueApiCall(endpoint, method, body, { priority, headers })
        return {
          success: true,
          data: { syncId, queued: true } as any,
          message: 'Request queued for sync when online'
        }
      }

      return { success: false, error: error.message || 'Request failed' }
    }
  }

  private async handleOfflineRequest<T>(
    endpoint: string,
    options: { method: string; headers: Record<string, string>; body?: any }
  ): Promise<ApiResponse<T>> {
    const { method, body } = options

    return await apiFallback.apiCall<ApiResponse<T>>(
      endpoint,
      {
        method: method as any,
        headers: options.headers,
        body: body ? JSON.stringify(body) : undefined
      },
      async () => {
        return await this.getCustomFallback<T>(endpoint, options)
      }
    )
  }

  private async getCustomFallback<T>(
    endpoint: string,
    options: { method: string; headers: Record<string, string>; body?: any }
  ): Promise<ApiResponse<T>> {
    const { method, body } = options

    if (endpoint.startsWith('/products')) {
      if (method === 'GET') {
        if (endpoint === '/products') {
          const products = await localDB.getProducts()
          return { success: true, data: { products, total: products.length } as any }
        } else {
          const productId = endpoint.split('/').pop()
          if (productId) {
            const product = await localDB.getProduct(productId)
            return product
              ? { success: true, data: product as any }
              : { success: false, error: 'Product not found' }
          }
        }
      }
    }

    if (endpoint.startsWith('/orders')) {
      if (method === 'GET') {
        const session = await authSimulation.getCurrentSession()
        const orders = await localDB.getOrders(session?.user.id)
        return { success: true, data: orders as any }
      } else if (method === 'POST') {
        const session = await authSimulation.getCurrentSession()
        if (!session) {
          return { success: false, error: 'Authentication required' }
        }

        const order: LocalOrder = {
          id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: session.user.id,
          items: body.items || [],
          total: body.total || 0,
          status: 'pending',
          shippingAddress: body.shippingAddress,
          paymentMethod: body.paymentMethod,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        await localDB.saveOrder(order)

        if (this.config.enableSync) {
          syncEngine.queueApiCall('/orders', 'POST', body, { priority: 'high' })
        }

        return { success: true, data: order as any, message: 'Order created offline and queued for sync' }
      }
    }

    if (endpoint.startsWith('/auth')) {
      if (endpoint === '/auth/signin' && method === 'POST') {
        return await authSimulation.signIn(body) as any
      } else if (endpoint === '/auth/signup' && method === 'POST') {
        return await authSimulation.signUp(body) as any
      } else if (endpoint === '/auth/signout' && method === 'POST') {
        await authSimulation.signOut()
        return { success: true, message: 'Signed out successfully' } as any
      }
    }

    if (endpoint.startsWith('/users/profile')) {
      if (method === 'GET') {
        const session = await authSimulation.getCurrentSession()
        return session
          ? { success: true, data: session.user as any }
          : { success: false, error: 'Not authenticated' }
      } else if (method === 'PUT') {
        const result = await authSimulation.updateProfile(body)
        return result as any
      }
    }

    if (endpoint === '/newsletter/subscribe' && method === 'POST') {
      await localDB.savePendingAction({
        type: 'newsletter_signup',
        data: body,
        timestamp: new Date().toISOString(),
        retryCount: 0
      })

      return {
        success: true,
        message: 'Newsletter subscription saved and will be synced when online'
      } as any
    }

    return { success: false, error: 'Endpoint not available offline' }
  }

  private async cacheResponse(endpoint: string, data: any): Promise<void> {
    try {
      if (endpoint.startsWith('/products')) {
        if (Array.isArray(data.data?.products)) {
          await localDB.saveProducts(data.data.products)
        } else if (data.data && typeof data.data === 'object') {
          await localDB.saveProducts([data.data])
        }
      }
    } catch (error) {
      console.warn('Failed to cache response:', error)
    }
  }

  // Convenience API methods

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

  async createOrder(orderData: {
    items: Array<{ productId: string; quantity: number }>
    shippingAddress: any
    paymentMethod: string
  }): Promise<ApiResponse<LocalOrder>> {
    return this.request('/orders', {
      method: 'POST',
      body: orderData,
      requireAuth: true,
      priority: 'high'
    })
  }

  async getOrders(): Promise<ApiResponse<LocalOrder[]>> {
    return this.request('/orders', { requireAuth: true })
  }

  async getOrder(id: string): Promise<ApiResponse<LocalOrder>> {
    return this.request(`/orders/${id}`, { requireAuth: true })
  }

  async signIn(email: string, password: string): Promise<ApiResponse<AuthSession>> {
    return this.request('/auth/signin', {
      method: 'POST',
      body: { email, password }
    })
  }

  async signUp(email: string, password: string, name: string): Promise<ApiResponse<AuthSession>> {
    return this.request('/auth/signup', {
      method: 'POST',
      body: { email, password, name }
    })
  }

  async signOut(): Promise<ApiResponse<{ message: string }>> {
    return this.request('/auth/signout', {
      method: 'POST',
      requireAuth: true
    })
  }

  async getCurrentUser(): Promise<ApiResponse<LocalUser>> {
    return this.request('/users/profile', { requireAuth: true })
  }

  async updateProfile(updates: Partial<LocalUser>): Promise<ApiResponse<LocalUser>> {
    return this.request('/users/profile', {
      method: 'PUT',
      body: updates,
      requireAuth: true
    })
  }

  async subscribeNewsletter(email: string): Promise<ApiResponse<{ message: string }>> {
    return this.request('/newsletter/subscribe', {
      method: 'POST',
      body: { email }
    })
  }

  async addToCart(productId: string, quantity: number = 1): Promise<{ success: boolean }> {
    try {
      localDB.addToCart(productId, quantity)
      return { success: true }
    } catch {
      return { success: false }
    }
  }

  async removeFromCart(productId: string): Promise<{ success: boolean }> {
    try {
      localDB.removeFromCart(productId)
      return { success: true }
    } catch {
      return { success: false }
    }
  }

  async getCart(): Promise<{ items: any[]; total: number }> {
    try {
      const cartItems = localDB.getCart()
      const items = await Promise.all(
        cartItems.map(async (item) => {
          const product = await localDB.getProduct(item.productId)
          return {
            ...item,
            product,
            subtotal: product ? product.price * item.quantity : 0
          }
        })
      )
      const total = items.reduce((sum, item) => sum + item.subtotal, 0)
      return { items, total }
    } catch {
      return { items: [], total: 0 }
    }
  }

  async clearCart(): Promise<{ success: boolean }> {
    try {
      localDB.clearCart()
      return { success: true }
    } catch {
      return { success: false }
    }
  }

  async addToWishlist(productId: string): Promise<{ success: boolean }> {
    try {
      localDB.addToWishlist(productId)
      return { success: true }
    } catch {
      return { success: false }
    }
  }

  async removeFromWishlist(productId: string): Promise<{ success: boolean }> {
    try {
      localDB.removeFromWishlist(productId)
      return { success: true }
    } catch {
      return { success: false }
    }
  }

  async getWishlist(): Promise<{ items: any[] }> {
    try {
      const wishlistItems = localDB.getWishlist()
      const items = await Promise.all(
        wishlistItems.map(async (item) => {
          const product = await localDB.getProduct(item.productId)
          return { ...item, product }
        })
      )
      return { items }
    } catch {
      return { items: [] }
    }
  }

  async isOnlineMode(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/health`, {
        method: 'GET',
        timeout: 3000
      } as any)
      return response.ok
    } catch {
      return false
    }
  }

  async getSyncStatus() {
    return syncEngine.getQueueStatus()
  }

  async forceSyncAll(): Promise<void> {
    if (this.config.enableSync) {
      await syncEngine.syncAll()
    }
  }

  async clearOfflineData(): Promise<void> {
    await localDB.clearAllData()
    syncEngine.clearAll()
  }
}

// Export singleton instance
export const enhancedApi = new EnhancedApiClient()

// Export for custom configurations
export { EnhancedApiClient }
export type { EnhancedApiConfig, RequestOptions }