// Enhanced Frontend API Configuration (api/config.ts)

const IS_DEV = process.env.NODE_ENV === 'development'
const IS_PROD = process.env.NODE_ENV === 'production'

// API Base URL with fallback logic
export const API_BASE = (() => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL
  }
  
  if (IS_DEV) {
    return 'http://localhost:10000'
  }
  
  return 'https://backend-8npy.onrender.com'
})()

// Socket.IO URL (separate from REST API)
export const SOCKET_BASE = API_BASE.replace('/api', '')

export const API_ENDPOINTS = {
  // Health & System
  HEALTH: '/api/health',

  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    VERIFY_EMAIL: '/api/auth/verify-email',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    PROFILE: '/api/auth/profile',
  },

  // Enhanced Authentication
  AUTH_ENHANCED: {
    SOCIAL_LOGIN: '/api/auth-enhanced/social',
    TWO_FACTOR: '/api/auth-enhanced/2fa',
    VERIFY_2FA: '/api/auth-enhanced/verify-2fa',
  },

  // Admin Authentication
  ADMIN_AUTH: {
    LOGIN: '/api/admin/auth/login',
    LOGOUT: '/api/admin/auth/logout',
    VERIFY_TOKEN: '/api/admin/auth/verify',
  },

  // Users
  USERS: {
    PROFILE: '/api/users/profile',
    ADDRESSES: '/api/users/addresses',
    ADDRESS_DETAIL: (id: string) => `/api/users/addresses/${id}`,
    UPDATE_PROFILE: '/api/users/profile',
    CHANGE_PASSWORD: '/api/users/change-password',
    DELETE_ACCOUNT: '/api/users/delete-account',
  },

  // Products
  PRODUCTS: {
    LIST: '/api/products',
    SEARCH: '/api/products/search',
    CATEGORIES: '/api/products/categories',
    FEATURED: '/api/products/featured',
    DETAIL: (id: string) => `/api/products/${id}`,
    RELATED: (id: string) => `/api/products/${id}/related`,
    REVIEWS: (id: string) => `/api/products/${id}/reviews`,
  },

  // Admin Products
  ADMIN_PRODUCTS: {
    LIST: '/api/admin/products',
    CREATE: '/api/admin/products',
    UPDATE: (id: string) => `/api/admin/products/${id}`,
    DELETE: (id: string) => `/api/admin/products/${id}`,
    BULK_UPDATE: '/api/admin/products/bulk',
    UPLOAD_IMAGE: '/api/admin/products/upload-image',
  },

  // Shopping Cart
  CART: {
    GET: '/api/cart',
    ADD_ITEM: '/api/cart/add',
    UPDATE_ITEM: '/api/cart/update',
    REMOVE_ITEM: '/api/cart/remove',
    CLEAR: '/api/cart/clear',
    SYNC: '/api/cart/sync',
  },

  // Orders
  ORDERS: {
    LIST: '/api/orders',
    CREATE: '/api/orders/create',
    DETAIL: (id: string) => `/api/orders/${id}`,
    CANCEL: (id: string) => `/api/orders/${id}/cancel`,
    TRACK: (id: string) => `/api/orders/${id}/track`,
    HISTORY: '/api/orders/history',
  },

  // Admin Orders
  ADMIN_ORDERS: {
    LIST: '/api/admin/orders',
    UPDATE_STATUS: (id: string) => `/api/admin/orders/${id}/status`,
    DETAILS: (id: string) => `/api/admin/orders/${id}`,
  },

  // Payments
  PAYMENTS: {
    CREATE_INTENT: '/api/payments/create-intent',
    VERIFY: '/api/payments/verify',
    REFUND: '/api/payments/refund',
    PAYMENT_METHODS: '/api/payments/methods',
  },

  // Payment API (separate endpoint structure)
  PAYMENTS_API: {
    PROCESS: '/api/payments-api/process',
    WEBHOOK: '/api/payments-api/webhook',
  },

  // Wishlist
  WISHLIST: {
    GET: '/api/wishlist',
    ADD: '/api/wishlist/add',
    REMOVE: '/api/wishlist/remove',
    CLEAR: '/api/wishlist/clear',
  },

  // Reviews
  REVIEWS: {
    LIST: (productId: string) => `/api/reviews/product/${productId}`,
    CREATE: '/api/reviews',
    UPDATE: (id: string) => `/api/reviews/${id}`,
    DELETE: (id: string) => `/api/reviews/${id}`,
    USER_REVIEWS: '/api/reviews/user',
  },

  // Coupons
  COUPONS: {
    LIST: '/api/coupons',
    APPLY: '/api/coupons/apply',
    VALIDATE: '/api/coupons/validate',
    USER_COUPONS: '/api/coupons/user',
  },

  // Admin Coupons
  ADMIN_COUPONS: {
    LIST: '/api/admin/coupons',
    CREATE: '/api/admin/coupons',
    UPDATE: (id: string) => `/api/admin/coupons/${id}`,
    DELETE: (id: string) => `/api/admin/coupons/${id}`,
  },

  // Webhooks
  WEBHOOKS: {
    STRIPE: '/api/webhooks/stripe',
    PAYPAL: '/api/webhooks/paypal',
  },

  // Admin Dashboard
  ADMIN: {
    DASHBOARD: '/api/admin/dashboard',
    ANALYTICS: '/api/admin/analytics',
    USERS: '/api/admin/users',
    SETTINGS: '/api/admin/settings',
  },

  // Real-time endpoints
  REALTIME: {
    HEALTH: '/api/realtime/health',
    DASHBOARD_STATS: '/api/realtime/dashboard-stats',
    WEBSITE_DATA: '/api/realtime/website-data',
    CLIENTS_INFO: '/api/realtime/clients-info',
    TRIGGER_UPDATE: '/api/realtime/trigger-update',
  },

  // Test Data (development only)
  TEST_DATA: {
    GENERATE_PRODUCTS: '/api/test-data/products',
    GENERATE_ORDERS: '/api/test-data/orders',
    RESET_DATA: '/api/test-data/reset',
  },
}

// Utility functions
export const getApiUrl = (endpoint: string): string => {
  // Handle both absolute and relative endpoints
  if (endpoint.startsWith('http')) {
    return endpoint
  }
  
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  
  return `${API_BASE}/${cleanEndpoint}`
}

export const getSocketUrl = (): string => {
  return SOCKET_BASE
}

// API request configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Request headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // HTTP status codes
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
} as const

// Environment checks
export const ENV_FLAGS = {
  IS_DEV,
  IS_PROD,
  IS_CLIENT: typeof window !== 'undefined',
  IS_SERVER: typeof window === 'undefined',
} as const

// API endpoint validation (development only)
if (IS_DEV && ENV_FLAGS.IS_CLIENT) {
  console.log('🔗 API Base URL:', API_BASE)
  console.log('🔌 Socket URL:', SOCKET_BASE)
  
  // Validate that required environment variables are set
  if (!API_BASE) {
    console.warn('⚠️ API_BASE is not configured properly')
  }
}