// Mocked API Routes with Fallback Functionality
import { Product } from "./api"
import { localDB, LocalUser, LocalOrder } from "./local-db"

// Mock data for fallback
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Party mann",
    price: 4740,
    originalPrice: 4990,
    size: "100ml",
    image: "/placeholder.svg?height=400&width=300",
    category: "woody",
    rating: 4.8,
    reviews: 127,
    discount: 5,
    description: "Top notes :- Bergamot, Black Currant, Apple, Lemon and Pink Pepper\nMiddle notes :- Pineapple, Patchouli and Moroccan Jasmine\nBase notes :- Birch, Musk, oak moss, Ambroxan and Cedarwood.",
    stock: 25,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Blue man",
    price: 3670,
    originalPrice: 4200,
    size: "100ml",
    image: "/placeholder.svg?height=400&width=300",
    category: "oriental",
    rating: 4.6,
    reviews: 89,
    discount: 13,
    description: "Top notes :- Calabrian bergamot and Pepper \nMiddle notes :- Sichuan Pepper, Lavender, Pink Pepper, Vetiver, Patchouli, Geranium and elemi \nBase notes are Ambroxan, Cedar and Labdanum.",
    stock: 18,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Amber Oud",
    price: 3790,
    originalPrice: 4500,
    size: "100ml",
    image: "/placeholder.svg?height=400&width=300",
    category: "fresh",
    rating: 4.7,
    reviews: 156,
    discount: 16,
    description: "Top notes :- Black Currant, Pineapple, Orange and Apple\nMiddle notes :- Rose, Freesia, Heliotrope and Lily-of-the-Valley \nBase notes :- Vanilla, Cedar, Sandalwood and Tonka Bean.",
    stock: 32,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Ocean man",
    price: 9975,
    originalPrice: 9975,
    size: "100ml",
    image: "/placeholder.svg?height=400&width=300",
    category: "floral",
    rating: 4.9,
    reviews: 98,
    discount: 0,
    description: "Top notes :- Apple, Plum, Lemon, Bergamot, Oakmoss and Geranium\nMiddle notes :- Cinnamon, Mahogany and Carnation\nBase notes :- Vanilla, Sandalwood, Cedar, Vetiver and Olive Tree.",
    stock: 15,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    name: "VENETIAN NIGHTS",
    price: 5200,
    originalPrice: 5800,
    size: "100ml",
    image: "/placeholder.svg?height=400&width=300",
    category: "oriental",
    rating: 4.5,
    reviews: 203,
    discount: 10,
    description: "A mysterious oriental fragrance evoking the magic of Venice at night.",
    stock: 22,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "6",
    name: "TUSCAN BREEZE",
    price: 4100,
    originalPrice: 4600,
    size: "100ml",
    image: "/placeholder.svg?height=400&width=300",
    category: "citrus",
    rating: 4.4,
    reviews: 174,
    discount: 11,
    description: "A refreshing citrus fragrance inspired by Tuscan countryside.",
    stock: 28,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "7",
    name: "FLORENTINE GOLD",
    price: 6800,
    originalPrice: 7500,
    size: "100ml",
    image: "/placeholder.svg?height=400&width=300",
    category: "woody",
    rating: 4.6,
    reviews: 142,
    discount: 9,
    description: "A luxurious woody fragrance with golden accents and rich depth.",
    stock: 19,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "8",
    name: "MEDITERRANEAN ESCAPE",
    price: 3950,
    originalPrice: 4400,
    size: "100ml",
    image: "/placeholder.svg?height=400&width=300",
    category: "fresh",
    rating: 4.3,
    reviews: 188,
    discount: 10,
    description: "An invigorating fresh fragrance capturing Mediterranean coastal vibes.",
    stock: 35,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
]

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

      // Initialize mock data in local storage
      this.initializeMockData()
    }
  }

  private async initializeMockData(): Promise<void> {
    try {
      const existingProducts = await localDB.getProducts()
      if (existingProducts.length === 0) {
        await localDB.saveProducts(mockProducts)
      }
    } catch (error) {
      console.error('Failed to initialize mock data:', error)
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
      { method: 'GET' },
      async () => {
        const products = await localDB.getProducts()
        let filteredProducts = products.length > 0 ? products : mockProducts

        // Apply filters
        if (params.category) {
          filteredProducts = filteredProducts.filter(p => p.category === params.category)
        }

        if (params.search) {
          const searchLower = params.search.toLowerCase()
          filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower)
          )
        }

        // Apply pagination
        const limit = params.limit || 12
        const page = params.page || 1
        const startIndex = (page - 1) * limit
        const paginatedProducts = filteredProducts.slice(startIndex, startIndex + limit)

        return {
          success: true,
          data: {
            products: paginatedProducts,
            total: filteredProducts.length
          }
        }
      }
    )
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.apiCall(
      `/products/${id}`,
      { method: 'GET' },
      async () => {
        const product = await localDB.getProduct(id)
        if (product) {
          return { success: true, data: product }
        }

        // Fallback to mock data
        const mockProduct = mockProducts.find(p => p.id === id)
        if (mockProduct) {
          return { success: true, data: mockProduct }
        }

        return { success: false, error: 'Product not found' }
      }
    )
  }

  // Orders API
  async createOrder(params: CreateOrderParams): Promise<ApiResponse<LocalOrder>> {
    return this.apiCall(
      '/orders',
      {
        method: 'POST',
        body: JSON.stringify(params),
      },
      async () => {
        // Create order locally
        const session = localDB.getUserSession()
        const userId = session?.user.id || 'guest'

        const order: LocalOrder = {
          id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          items: await Promise.all(params.items.map(async (item) => {
            const product = await localDB.getProduct(item.productId)
            return {
              productId: item.productId,
              quantity: item.quantity,
              price: product?.price || 0,
              name: product?.name || 'Unknown Product'
            }
          })),
          total: 0, // Will be calculated below
          status: 'pending',
          shippingAddress: params.shippingAddress,
          paymentMethod: params.paymentMethod,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        // Calculate total
        order.total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

        // Save order locally
        await localDB.saveOrder(order)

        // Save as pending action for sync
        await localDB.savePendingAction({
          type: 'create_order',
          data: params,
          timestamp: new Date().toISOString(),
          retryCount: 0
        })

        return { success: true, data: order }
      }
    )
  }

  async getOrders(userId?: string): Promise<ApiResponse<LocalOrder[]>> {
    return this.apiCall(
      `/orders${userId ? `?userId=${userId}` : ''}`,
      { method: 'GET' },
      async () => {
        const orders = await localDB.getOrders(userId)
        return { success: true, data: orders }
      }
    )
  }

  async getOrder(id: string): Promise<ApiResponse<LocalOrder>> {
    return this.apiCall(
      `/orders/${id}`,
      { method: 'GET' },
      async () => {
        const orders = await localDB.getOrders()
        const order = orders.find(o => o.id === id)
        
        if (order) {
          return { success: true, data: order }
        }

        return { success: false, error: 'Order not found' }
      }
    )
  }

  // User Authentication API
  async signIn(email: string, password: string): Promise<ApiResponse<{ user: LocalUser; token: string }>> {
    return this.apiCall(
      '/auth/signin',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      async () => {
        // Simulate authentication
        const user: LocalUser = {
          id: `user_${Date.now()}`,
          email,
          name: email.split('@')[0],
          isEmailVerified: true,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        }

        const token = `fake_jwt_${user.id}_${Date.now()}`
        
        // Save user session
        localDB.saveUserSession(user, token)
        await localDB.saveUser(user)

        return {
          success: true,
          data: { user, token }
        }
      }
    )
  }

  async signUp(email: string, password: string, name: string): Promise<ApiResponse<{ user: LocalUser; token: string }>> {
    return this.apiCall(
      '/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      },
      async () => {
        // Simulate user creation
        const user: LocalUser = {
          id: `user_${Date.now()}`,
          email,
          name,
          isEmailVerified: false,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        }

        const token = `fake_jwt_${user.id}_${Date.now()}`
        
        // Save user session
        localDB.saveUserSession(user, token)
        await localDB.saveUser(user)

        return {
          success: true,
          data: { user, token }
        }
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
      },
      async () => {
        // Save as pending action
        await localDB.savePendingAction({
          type: 'newsletter_signup',
          data: { email },
          timestamp: new Date().toISOString(),
          retryCount: 0
        })

        return {
          success: true,
          data: { message: 'Subscription saved locally and will be synced when online' }
        }
      }
    )
  }

  // Data Sync Engine
  async syncPendingActions(): Promise<void> {
    if (!this.isOnline) return

    try {
      const pendingActions = await localDB.getPendingActions()
      
      for (const action of pendingActions) {
        try {
          let success = false

          switch (action.type) {
            case 'create_order':
              const orderResult = await fetch(`${this.baseUrl}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(action.data)
              })
              success = orderResult.ok
              break

            case 'newsletter_signup':
              const newsletterResult = await fetch(`${this.baseUrl}/newsletter/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(action.data)
              })
              success = newsletterResult.ok
              break

            case 'update_profile':
              const profileResult = await fetch(`${this.baseUrl}/users/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(action.data)
              })
              success = profileResult.ok
              break
          }

          if (success) {
            await localDB.deletePendingAction(action.id)
            console.log(`Synced pending action: ${action.type}`)
          } else if (action.retryCount < 3) {
            // Increment retry count
            action.retryCount++
            await localDB.savePendingAction(action)
          }
        } catch (error) {
          console.error(`Failed to sync action ${action.id}:`, error)
        }
      }
    } catch (error) {
      console.error('Failed to sync pending actions:', error)
    }
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

// Auto-sync every 30 seconds when online
if (typeof window !== 'undefined') {
  setInterval(() => {
    if (navigator.onLine) {
      apiFallback.syncPendingActions()
    }
  }, 30000)
}

export type { ApiResponse, GetProductsParams, CreateOrderParams }



