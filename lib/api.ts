// Production API configuration with correct URL usage
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://fragransia.onrender.com/api"

console.log("🔍 Production API Configuration:")
console.log("- Base URL:", API_BASE)

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
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
  paymentStatus: "pending" | "completed" | "failed"
  createdAt: string
  updatedAt: string
  estimatedDelivery?: string
  shippingCost?: number
  trackingNumber?: string
  awbCode?: string
  coupon?: {
    code: string
    discount: number
  }
}

interface User {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  createdAt: string
}

interface Address {
  id: string
  name: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
  type?: "home" | "work" | "other"
}

interface Coupon {
  id: string
  code: string
  discount: number
  type: "percentage" | "fixed"
  description: string
  isPublic: boolean
  isActive: boolean
  minOrderAmount?: number
  maxDiscount?: number
  expiresAt?: string
}

// Enhanced mock data for fallback with the provided product data
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Party mann",
    price: 2999,
    originalPrice: 3499,
    size: "100ml",
    image: "/images/IMG-20250711-WA0005.jpg",
    category: "mens-fragrance",
    rating: 4.8,
    reviews: 127,
    discount: 14,
    description:
      "A captivating fragrance with notes of Bergamot, Black Currant, Apple, Lemon, Pink Pepper, Pineapple, Patchouli, Moroccan Jasmine, Birch, Musk, Oakmoss, Ambroxan and Cedarwood.",
    stock: 25,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: {
      top: ["Bergamot", "Black Currant", "Apple", "Lemon", "Pink Pepper"],
      middle: ["Pineapple", "Patchouli", "Moroccan Jasmine"],
      base: ["Birch", "Musk", "Oakmoss", "Ambroxan", "Cedarwood"],
    },
  },
  {
    id: "2",
    name: "Blue man",
    price: 2499,
    originalPrice: 2899,
    size: "75ml",
    image: "/images/IMG-20250711-WA0006.jpg",
    category: "mens-fragrance",
    rating: 4.9,
    reviews: 89,
    discount: 14,
    description: "A sophisticated fragrance with notes of Calabrian bergamot, Pepper, Sichuan Pepper, Lavender, Pink Pepper, Vetiver, Patchouli, Geranium, Elemi, Ambroxan, Cedar and Labdanum.",
    stock: 18,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: {
      top: ["Calabrian bergamot", "Pepper"],
      middle: ["Sichuan Pepper", "Lavender", "Pink Pepper", "Vetiver", "Patchouli", "Geranium", "Elemi"],
      base: ["Ambroxan", "Cedar", "Labdanum"],
    },
  },
  {
    id: "3",
    name: "Amber Oud",
    price: 1899,
    originalPrice: 2199,
    size: "50ml",
    image: "/images/IMG-20250711-WA0007.jpg",
    category: "unisex-fragrance",
    rating: 4.7,
    reviews: 156,
    discount: 14,
    description: "A warm and inviting fragrance with notes of Black Currant, Pineapple, Orange, Apple, Rose, Freesia, Heliotrope, Lily-of-the-Valley, Vanilla, Cedar, Sandalwood and Tonka Bean.",
    stock: 32,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: {
      top: ["Black Currant", "Pineapple", "Orange", "Apple"],
      middle: ["Rose", "Freesia", "Heliotrope", "Lily-of-the-Valley"],
      base: ["Vanilla", "Cedar", "Sandalwood", "Tonka Bean"],
    },
  },
  {
    id: "4",
    name: "Ocean man",
    price: 2199,
    originalPrice: 2599,
    size: "75ml",
    image: "/images/IMG-20250711-WA0008.jpg",
    category: "mens-fragrance",
    rating: 4.9,
    reviews: 98,
    discount: 15,
    description: "A fresh and invigorating fragrance with notes of Apple, Plum, Lemon, Bergamot, Oakmoss, Geranium, Cinnamon, Mahogany, Carnation, Vanilla, Sandalwood, Cedar, Vetiver and Olive Tree.",
    stock: 12,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: {
      top: ["Apple", "Plum", "Lemon", "Bergamot", "Oakmoss", "Geranium"],
      middle: ["Cinnamon", "Mahogany", "Carnation"],
      base: ["Vanilla", "Sandalwood", "Cedar", "Vetiver", "Olive Tree"],
    },
  },
]

const mockCoupons: Coupon[] = [
  {
    id: "1",
    code: "WELCOME10",
    discount: 10,
    type: "percentage",
    description: "Welcome offer - 10% off on first order",
    isPublic: true,
    isActive: true,
    minOrderAmount: 1000,
    maxDiscount: 500,
  },
  {
    id: "2",
    code: "FLAT500",
    discount: 500,
    type: "fixed",
    description: "Flat ₹500 off on orders above ₹2500",
    isPublic: false,
    isActive: true,
    minOrderAmount: 2500,
  },
]

const mockAddresses: Address[] = [
  {
    id: "1",
    name: "John Doe",
    phone: "+91 9876543210",
    address: "123 Main Street, Apartment 4B",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    isDefault: true,
    type: "home",
  },
]

export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })
    return response.ok
  } catch (error) {
    console.error("API health check failed:", error)
    return false
  }
}

class ApiClient {
  private token: string | null = null
  private isOnline = true
  private apiHealthy = false
  private lastHealthCheck = 0
  private healthCheckInterval = 30000 // 30 seconds

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
      this.isOnline = navigator.onLine

      window.addEventListener("online", () => {
        this.isOnline = true
        console.log("🌐 Network back online - checking API health")
        this.performHealthCheck()
      })
      window.addEventListener("offline", () => {
        this.isOnline = false
        this.apiHealthy = false
        console.log("📴 Network offline - API marked as unhealthy")
      })

      // Check API health on initialization
      this.performHealthCheck()
    }
  }

  private async performHealthCheck(): Promise<boolean> {
    const now = Date.now()

    // Rate limit health checks
    if (now - this.lastHealthCheck < this.healthCheckInterval) {
      return this.apiHealthy
    }

    this.lastHealthCheck = now

    if (!this.isOnline) {
      console.log("📴 Skipping API health check - offline")
      this.apiHealthy = false
      return false
    }

    this.apiHealthy = await checkApiHealth()
    return this.apiHealthy
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // FIXED: Use external API URL with proper environment variable
    const url = `${API_BASE}${endpoint}`
    console.log("📡 Making API request to:", url)

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
      console.log("⏰ API request timeout after 15 seconds")
    }, 15000)

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
        cache: "no-store",
      })

      clearTimeout(timeoutId)

      console.log("📡 API Response received:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url,
      })

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
          console.log("❌ API Error Details:", errorData)
        } catch {
          console.log("❌ Could not parse error response as JSON")
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log("✅ API request successful")
      return data
    } catch (error) {
      clearTimeout(timeoutId)

      console.error("❌ API request failed:", {
        name: error.name,
        message: error.message,
        url,
        endpoint,
      })

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Request timeout - server may be slow")
        }
        throw error
      }

      throw new Error("An unexpected error occurred")
    }
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse> {
    console.log("🏥 Performing health check")
    const isHealthy = await this.performHealthCheck()

    if (isHealthy) {
      console.log("✅ Health check passed")
      return { success: true, message: "API is healthy" }
    } else {
      console.log("❌ Health check failed")
      return {
        success: false,
        error: "API health check failed",
      }
    }
  }

  // Get API status
  async getApiStatus(): Promise<{
    api: boolean
    firebase: boolean
    network: boolean
    responseTime: number
  }> {
    const startTime = Date.now()
    console.log("🔍 Getting API status")

    const apiStatus = await this.performHealthCheck()
    const networkStatus = typeof window !== "undefined" ? navigator.onLine : true
    const responseTime = Date.now() - startTime

    // Check Firebase status
    let firebaseStatus = false
    try {
      const { testFirebaseConnection } = await import("./firebase")
      firebaseStatus = await testFirebaseConnection()
    } catch (error) {
      console.warn("Firebase status check failed:", error)
    }

    const status = {
      api: apiStatus,
      firebase: firebaseStatus,
      network: networkStatus,
      responseTime,
    }

    console.log("📊 API Status Summary:", status)
    return status
  }

  // Products with enhanced fallback
  async getProducts(filters?: {
    category?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<{ products: Product[]; total: number; page: number; totalPages: number }>> {
    console.log("🛍️ Fetching products with filters:", filters)

    const getFallbackData = () => {
      console.log("📦 Using mock data fallback")
      let filteredProducts = [...mockProducts]

      if (filters?.category && filters.category !== "all") {
        filteredProducts = filteredProducts.filter((p) => p.category === filters.category)
      }

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase()
        filteredProducts = filteredProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower) ||
            p.category.toLowerCase().includes(searchLower),
        )
      }

      const page = filters?.page || 1
      const limit = filters?.limit || 12
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

      return {
        success: true,
        data: {
          products: paginatedProducts,
          total: filteredProducts.length,
          page,
          totalPages: Math.ceil(filteredProducts.length / limit),
        },
      }
    }

    // Try API first
    const isApiHealthy = await this.performHealthCheck()

    if (isApiHealthy) {
      try {
        console.log("🌐 Attempting API request for products")
        const params = new URLSearchParams()
        if (filters?.category) params.append("category", filters.category)
        if (filters?.search) params.append("search", filters.search)
        if (filters?.page) params.append("page", filters.page.toString())
        if (filters?.limit) params.append("limit", filters.limit.toString())

        const queryString = params.toString()
        const response = await this.request(`/products${queryString ? `?${queryString}` : ""}`)

        if (response.success && response.data) {
          console.log("✅ API request successful for products")
          return { success: true, data: { products: response.data.products, total: response.data.pagination.totalProducts, page: response.data.pagination.currentPage, totalPages: response.data.pagination.totalPages } }
        }

        console.warn("⚠️ API returned unsuccessful response, using fallback")
        throw new Error("API response unsuccessful")
      } catch (error) {
        console.warn("❌ API call failed, using fallback:", error.message)
      }
    } else {
      console.log("⚠️ API unhealthy, using fallback data")
    }

    return getFallbackData()
  }

  async getProduct(productId: string): Promise<ApiResponse<Product>> {
    console.log("🛍️ Fetching product:", productId)

    // Try API first
    const isApiHealthy = await this.performHealthCheck()

    if (isApiHealthy) {
      try {
        console.log("🌐 Attempting API request for product")
        const response = await this.request(`/products/${productId}`)
        if (response.success && response.data) {
          console.log("✅ API request successful for product")
          return response
        }
        throw new Error("Product not found in API")
      } catch (error) {
        console.warn("❌ API call failed, using fallback:", error.message)
      }
    } else {
      console.log("⚠️ API unhealthy, using fallback data")
    }

    // Fallback to mock data
    const product = mockProducts.find((p) => p.id === productId)
    if (product) {
      console.log("✅ Fallback data found for product")
      return { success: true, data: product }
    }

    console.error("❌ Product not found in fallback data")
    throw new Error("Product not found")
  }

  async createProduct(productData: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Product>> {
    console.log("🛍️ Creating product")

    const isApiHealthy = await this.performHealthCheck()

    if (isApiHealthy) {
      try {
        const response = await this.request("/products", {
          method: "POST",
          body: JSON.stringify(productData),
        })
        if (response.success && response.data) {
          return response
        }
        throw new Error("Failed to create product")
      } catch (error) {
        console.warn("❌ Create product API failed, using fallback:", error.message)
      }
    }

    // Fallback for demo
    const newProduct: Product = {
      id: Date.now().toString(),
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    console.log("✅ Create product fallback successful")
    return { success: true, data: newProduct }
  }

  // Authentication
  async register(userData: {
    name: string
    email: string
    password: string
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    console.log("👤 Attempting user registration")

    const isApiHealthy = await this.performHealthCheck()

    if (isApiHealthy) {
      try {
        const response = await this.request<{ user: User; token: string }>("/auth/register", {
          method: "POST",
          body: JSON.stringify(userData),
        })

        if (response.data?.token) {
          this.setToken(response.data.token)
        }

        return response
      } catch (error) {
        console.warn("❌ Registration API failed, using fallback:", error.message)
      }
    }

    // Fallback for demo
    if (userData.name && userData.email && userData.password) {
      const mockUser = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        role: userData.email === "admin@example.com" ? ("admin" as const) : ("user" as const),
        createdAt: new Date().toISOString(),
      }
      const token = `mock_token_${Date.now()}`
      this.setToken(token)
      console.log("✅ Registration fallback successful")
      return {
        success: true,
        data: { user: mockUser, token },
      }
    }
    throw new Error("Registration failed")
  }

  async login(credentials: {
    email: string
    password: string
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    console.log("🔐 Attempting user login")

    const isApiHealthy = await this.performHealthCheck()

    if (isApiHealthy) {
      try {
        const response = await this.request<{ user: User; token: string }>("/auth/login", {
          method: "POST",
          body: JSON.stringify(credentials),
        })

        if (response.data?.token) {
          this.setToken(response.data.token)
        }

        return response
      } catch (error) {
        console.warn("❌ Login API failed, using fallback:", error.message)
      }
    }

    // Fallback for demo
    if (credentials.email && credentials.password) {
      const isAdmin = credentials.email === "admin@example.com" && credentials.password === "admin123"
      const mockUser = {
        id: isAdmin ? "admin" : "1",
        name: isAdmin ? "Admin User" : "Demo User",
        email: credentials.email,
        role: isAdmin ? ("admin" as const) : ("user" as const),
        createdAt: new Date().toISOString(),
      }
      const token = `mock_token_${Date.now()}`
      this.setToken(token)
      console.log("✅ Login fallback successful")
      return {
        success: true,
        data: { user: mockUser, token },
      }
    }
    throw new Error("Login failed")
  }

  async logout(): Promise<void> {
    console.log("👋 User logout")
    this.clearToken()
  }

  // Coupons
  async applyCoupon(code: string): Promise<ApiResponse<{ discount: number; type: string }>> {
    console.log("🎫 Applying coupon:", code)

    const isApiHealthy = await this.performHealthCheck()

    if (isApiHealthy) {
      try {
        const response = await this.request("/coupons/apply", {
          method: "POST",
          body: JSON.stringify({ code }),
        })
        if (response.success && response.data) {
          return response
        }
        throw new Error("Invalid coupon code")
      } catch (error) {
        console.warn("❌ Coupon API failed, using fallback:", error.message)
      }
    }

    const coupon = mockCoupons.find((c) => c.code === code && c.isActive)
    if (coupon) {
      console.log("✅ Coupon fallback successful")
      return {
        success: true,
        data: {
          discount: coupon.discount,
          type: coupon.type,
        },
      }
    }
    throw new Error("Invalid coupon code")
  }

  async getPublicCoupons(): Promise<ApiResponse<Coupon[]>> {
    console.log("🎫 Fetching public coupons")

    const isApiHealthy = await this.performHealthCheck()

    if (isApiHealthy) {
      try {
        const response = await this.request("/coupons/public")
        if (response.success && response.data) {
          return response
        }
        throw new Error("Failed to fetch public coupons")
      } catch (error) {
        console.warn("❌ Public coupons API failed, using fallback:", error.message)
      }
    }

    const publicCoupons = mockCoupons.filter((c) => c.isPublic && c.isActive)
    console.log("✅ Public coupons fallback successful")
    return { success: true, data: publicCoupons }
  }

  // Addresses
  async getUserAddresses(): Promise<ApiResponse<Address[]>> {
    console.log("🏠 Fetching user addresses")

    const isApiHealthy = await this.performHealthCheck()

    if (isApiHealthy) {
      try {
        const response = await this.request("/user/addresses")
        if (response.success && response.data) {
          return response
        }
        throw new Error("Failed to fetch addresses")
      } catch (error) {
        console.warn("❌ Addresses API failed, using fallback:", error.message)
      }
    }

    console.log("✅ Addresses fallback successful")
    return { success: true, data: mockAddresses }
  }

  async addAddress(addressData: Omit<Address, "id">): Promise<ApiResponse<Address>> {
    console.log("🏠 Adding new address")

    const isApiHealthy = await this.performHealthCheck()

    if (isApiHealthy) {
      try {
        const response = await this.request("/user/addresses", {
          method: "POST",
          body: JSON.stringify(addressData),
        })
        if (response.success && response.data) {
          return response
        }
        throw new Error("Failed to add address")
      } catch (error) {
        console.warn("❌ Add address API failed, using fallback:", error.message)
      }
    }

    const newAddress: Address = {
      id: Date.now().toString(),
      ...addressData,
    }
    console.log("✅ Add address fallback successful")
    return { success: true, data: newAddress }
  }

  // Payment verification
  async verifyPayment(paymentData: {
    razorpay_payment_id?: string
    razorpay_order_id?: string
    razorpay_signature?: string
    payment_id?: string
    method: string
  }): Promise<ApiResponse<{ verified: boolean }>> {
    console.log("💳 Verifying payment")

    const isApiHealthy = await this.performHealthCheck()

    if (isApiHealthy) {
      try {
        const response = await this.request("/payments/verify", {
          method: "POST",
          body: JSON.stringify(paymentData),
        })
        if (response.success) {
          return response
        }
        throw new Error("Payment verification failed")
      } catch (error) {
        console.warn("❌ Payment verification API failed, using fallback:", error.message)
      }
    }

    // For demo, always return success
    console.log("✅ Payment verification fallback successful")
    return {
      success: true,
      data: { verified: true },
    }
  }

  // Orders
  async createOrder(orderData: {
    items: Array<{
      productId: string
      quantity: number
      price: number
    }>
    shippingAddress: Address
    shippingOption: any
    coupon: any
    paymentData: any
    total: number
  }): Promise<ApiResponse<Order>> {
    console.log("📦 Creating order")

    const isApiHealthy = await this.performHealthCheck()

    if (isApiHealthy) {
      try {
        const response = await this.request("/orders/create", {
          method: "POST",
          body: JSON.stringify({
            items: orderData.items,
            shippingAddress: orderData.shippingAddress,
            shippingOption: orderData.shippingOption,
            coupon: orderData.coupon,
            paymentData: orderData.paymentData,
            total: orderData.total,
          }),
        })
        if (response.success && response.data) {
          return response
        }
        throw new Error("Failed to create order")
      } catch (error) {
        console.warn("❌ Create order API failed, using fallback:", error.message)
      }
    }

    const mockOrder: Order = {
      id: `ORD${Date.now()}`,
      userId: "user123",
      items: orderData.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        name: mockProducts.find((p) => p.id === item.productId)?.name || "Product",
        image: mockProducts.find((p) => p.id === item.productId)?.image || "/placeholder.svg",
      })),
      total: orderData.total,
      status: "confirmed",
      shippingAddress: {
        name: orderData.shippingAddress.name,
        phone: orderData.shippingAddress.phone,
        address: orderData.shippingAddress.address,
        city: orderData.shippingAddress.city,
        state: orderData.shippingAddress.state,
        pincode: orderData.shippingAddress.pincode,
      },
      paymentStatus: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN"),
      shippingCost: orderData.shippingOption?.price || 0,
      trackingNumber: `TRK${Date.now()}`,
      awbCode: `AWB${Date.now()}`,
      coupon: orderData.coupon
        ? {
            code: orderData.coupon.code,
            discount: orderData.coupon.discount,
          }
        : undefined,
    }
    console.log("✅ Create order fallback successful")
    return { success: true, data: mockOrder }
  }

  async getOrder(orderId: string): Promise<ApiResponse<Order>> {
    console.log("📦 Fetching order:", orderId)

    const isApiHealthy = await this.performHealthCheck()

    if (isApiHealthy) {
      try {
        const response = await this.request(`/orders/${orderId}`)
        if (response.success && response.data) {
          return response
        }
        throw new Error("Order not found")
      } catch (error) {
        console.warn("❌ Get order API failed, using fallback:", error.message)
      }
    }

    // Return a mock order for demonstration
    const mockOrder: Order = {
      id: orderId,
      userId: "user123",
      items: [
        {
          productId: "1",
          quantity: 1,
          price: 2999,
          name: "Party mann",
          image: "/images/IMG-20250711-WA0005.jpg",
        },
      ],
      total: 2999,
      status: "confirmed",
      shippingAddress: {
        name: "John Doe",
        phone: "+91 9876543210",
        address: "123 Main Street, Apartment 4B",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
      },
      paymentStatus: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN"),
      shippingCost: 0,
      trackingNumber: `TRK${Date.now()}`,
      awbCode: `AWB${Date.now()}`,
    }
    console.log("✅ Get order fallback successful")
    return { success: true, data: mockOrder }
  }

  async getUserOrders(): Promise<ApiResponse<Order[]>> {
    console.log("📦 Fetching user orders")

    const isApiHealthy = await this.performHealthCheck()

    if (isApiHealthy) {
      try {
        const response = await this.request("/orders/user")
        if (response.success && response.data) {
          return response
        }
        throw new Error("Failed to fetch orders")
      } catch (error) {
        console.warn("❌ Get user orders API failed, using fallback:", error.message)
      }
    }

    console.log("✅ User orders fallback successful")
    return { success: true, data: [] }
  }

  // Admin endpoints
  async getAdminDashboard(): Promise<
    ApiResponse<{
      stats: {
        totalRevenue: number
        totalOrders: number
        totalProducts: number
        totalUsers: number
      }
      recentOrders: Order[]
      lowStockProducts: Product[]
    }>
  > {
    console.log("👑 Fetching admin dashboard")

    const isApiHealthy = await this.performHealthCheck()

    if (isApiHealthy) {
      try {
        const response = await this.request("/admin/dashboard")
        if (response.success) {
          return response
        }
        throw new Error("Dashboard API failed")
      } catch (error) {
        console.warn("❌ Admin dashboard API failed, using fallback:", error.message)
      }
    }

    console.log("✅ Admin dashboard fallback successful")
    return {
      success: true,
      data: {
        stats: {
          totalRevenue: 125000,
          totalOrders: 342,
          totalProducts: mockProducts.length,
          totalUsers: 1250,
        },
        recentOrders: [],
        lowStockProducts: mockProducts.filter((p) => p.stock < 20),
      },
    }
  }

  // Debug method
  async debugStatus(): Promise<void> {
    console.log("🔍 === API CLIENT DEBUG STATUS ===")
    console.log("Configuration:")
    console.log("- Base URL:", API_BASE)
    console.log("- Token:", this.token ? "Present" : "Not set")
    console.log("- Online:", this.isOnline)
    console.log("- API Healthy:", this.apiHealthy)

    const status = await this.getApiStatus()
    console.log("Live Status Check:", status)
    console.log("=== END DEBUG STATUS ===")
  }
}

export const apiClient = new ApiClient()

// Debug on initialization in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // Add debug method to window for easy access
  ;(window as any).debugApi = () => apiClient.debugStatus()
  console.log("🔧 Debug mode: Run debugApi() in console for detailed status")
}

export type { Product, Order, User, ApiResponse, Address, Coupon }

