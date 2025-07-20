import { API_BASE, API_ENDPOINTS } from './constants'

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  size: string;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  discount?: number;
  description: string;
  stock: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    name: string;
  }>;
  total: number;
  status: string;
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  provider: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount: number;
  type: "percentage" | "fixed";
  minOrderValue: number;
}

// API client configuration
const apiClient = {
  baseURL: API_BASE,
  
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  },

  // GET request
  async get(endpoint: string, options: RequestInit = {}) {
    return this.request(endpoint, { ...options, method: 'GET' })
  },

  // POST request
  async post(endpoint: string, data?: any, options: RequestInit = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  // PUT request
  async put(endpoint: string, data?: any, options: RequestInit = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  // DELETE request
  async delete(endpoint: string, options: RequestInit = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' })
  },
}

// API functions
export const api = {
  // Health check
  async checkHealth() {
    return apiClient.get(API_ENDPOINTS.HEALTH)
  },

  // Authentication
  auth: {
    async register(userData: any) {
      return apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData)
    },
    
    async login(credentials: any) {
      return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials)
    },
    
    async adminLogin(credentials: any) {
      return apiClient.post(API_ENDPOINTS.AUTH.ADMIN_LOGIN, credentials)
    },
  },

  // Products
  products: {
    async getAll() {
      return apiClient.get(API_ENDPOINTS.PRODUCTS.LIST)
    },
    
    async getById(id: string) {
      return apiClient.get(`${API_ENDPOINTS.PRODUCTS.DETAIL}/${id}`)
    },
    
    async create(productData: any) {
      return apiClient.post(API_ENDPOINTS.PRODUCTS.ADMIN_CREATE, productData)
    },
    
    async update(id: string, productData: any) {
      return apiClient.put(`${API_ENDPOINTS.PRODUCTS.ADMIN_UPDATE}/${id}`, productData)
    },
    
    async delete(id: string) {
      return apiClient.delete(`${API_ENDPOINTS.PRODUCTS.ADMIN_DELETE}/${id}`)
    },
  },

  // Orders
  orders: {
    async create(orderData: any) {
      return apiClient.post(API_ENDPOINTS.ORDERS.CREATE, orderData)
    },
    
    async getById(id: string) {
      return apiClient.get(`${API_ENDPOINTS.ORDERS.DETAIL}/${id}`)
    },
  },

  // Payments
  payments: {
    async process(paymentData: any) {
      return apiClient.post(API_ENDPOINTS.PAYMENTS.PROCESS, paymentData);
    },
  },

  // Coupons
  coupons: {
    async getAll(userId: string) {
      return apiClient.get(`${API_ENDPOINTS.COUPONS.LIST}?userId=${userId}`);
    },
    async apply(code: string, total: number) {
      return apiClient.post(API_ENDPOINTS.COUPONS.APPLY, { code, total });
    },
  },

  // Users
  users: {
    async getAddresses(userId: string) {
      return apiClient.get(`${API_ENDPOINTS.USERS.ADDRESSES}?userId=${userId}`);
    },
  },

  // Shipping
  shipping: {
    async getOptions(pincode: string, weight: number) {
      return apiClient.get(`${API_ENDPOINTS.SHIPPING.OPTIONS}?pincode=${pincode}&weight=${weight}`);
    },
  },

  // Admin
  admin: {
    async getDashboard() {
      return apiClient.get(API_ENDPOINTS.ADMIN.DASHBOARD)
    },
  },
}

// Health check function for compatibility
export async function checkApiHealth() {
  try {
    const response = await api.checkHealth()
    return { success: true, data: response }
  } catch (error) {
    return { success: false, error }
  }
}

export default api
export { apiClient };
