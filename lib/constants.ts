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
  HEALTH: '/health',

  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    PROFILE: '/auth/profile',
  },

  // Enhanced Authentication
  AUTH_ENHANCED: {
    SOCIAL_LOGIN: '/auth-enhanced/social',
    TWO_FACTOR: '/auth-enhanced/2fa',
    VERIFY_2FA: '/auth-enhanced/verify-2fa',
  },

  // Admin Authentication
  ADMIN_AUTH: {
    LOGIN: '/admin/auth/login',
    LOGOUT: '/admin/auth/logout',
    VERIFY_TOKEN: '/admin/auth/verify',
  },

  // Users
  USERS: {
    PROFILE: '/users/profile',
    ADDRESSES: '/users/addresses',
    ADDRESS_DETAIL: (id: string) => `/users/addresses/${id}`,
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    DELETE_ACCOUNT: '/users/delete-account',
  },

  // Products
  PRODUCTS: {
    LIST: '/products',
    SEARCH: '/products/search',
    CATEGORIES: '/products/categories',
    FEATURED: '/products/featured',
    DETAIL: (id: string) => `/products/${id}`,
    RELATED: (id: string) => `/products/${id}/related`,
    REVIEWS: (id: string) => `/products/${id}/reviews`,
  },

  // Admin Products
  ADMIN_PRODUCTS: {
    LIST: '/admin/products',
    CREATE: '/admin/products',
    UPDATE: (id: string) => `/admin/products/${id}`,
    DELETE: (id: string) => `/admin/products/${id}`,
    BULK_UPDATE: '/admin/products/bulk',
    UPLOAD_IMAGE: '/admin/products/upload-image',
  },

  // Shopping Cart
  CART: {
    GET: '/cart',
    ADD_ITEM: '/cart/add',
    UPDATE_ITEM: '/cart/update',
    REMOVE_ITEM: '/cart/remove',
    CLEAR: '/cart/clear',
    SYNC: '/cart/sync',
  },

  // Orders
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders/create',
    DETAIL: (id: string) => `/orders/${id}`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
    TRACK: (id: string) => `/orders/${id}/track`,
    HISTORY: '/orders/history',
  },

  // Admin Orders
  ADMIN_ORDERS: {
    LIST: '/admin/orders',
    UPDATE_STATUS: (id: string) => `/admin/orders/${id}/status`,
    DETAILS: (id: string) => `/admin/orders/${id}`,
  },

  // Payments
  PAYMENTS: {
    CREATE_INTENT: '/payments/create-intent',
    VERIFY: '/payments/verify',
    REFUND: 'payments/refund',
    PAYMENT_METHODS: '/payments/methods',
  },

  // Payment API (separate endpoint structure)
  PAYMENTS_API: {
    PROCESS: '/payments-api/process',
    WEBHOOK: '/payments-api/webhook',
  },

  // Wishlist
  WISHLIST: {
    GET: '/wishlist',
    ADD: '/wishlist/add',
    REMOVE: '/wishlist/remove',
    CLEAR: '/wishlist/clear',
  },

  // Reviews
  REVIEWS: {
    LIST: (productId: string) => `/reviews/product/${productId}`,
    CREATE: '/reviews',
    UPDATE: (id: string) => `/reviews/${id}`,
    DELETE: (id: string) => `/reviews/${id}`,
    USER_REVIEWS: '/reviews/user',
  },

  // Coupons
  COUPONS: {
    LIST: '/coupons',
    APPLY: '/coupons/apply',
    VALIDATE: '/coupons/validate',
    USER_COUPONS: '/coupons/user',
  },

  // Admin Coupons
  ADMIN_COUPONS: {
    LIST: '/admin/coupons',
    CREATE: '/admin/coupons',
    UPDATE: (id: string) => `/admin/coupons/${id}`,
    DELETE: (id: string) => `/admin/coupons/${id}`,
  },

  // Webhooks
  WEBHOOKS: {
    STRIPE: '/webhooks/stripe',
    PAYPAL: '/webhooks/paypal',
  },

  // Admin Dashboard
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    ANALYTICS: '/admin/analytics',
    USERS: '/admin/users',
    SETTINGS: '/admin/settings',
  },

  // Real-time endpoints
  REALTIME: {
    HEALTH: '/realtime/health',
    DASHBOARD_STATS: '/realtime/dashboard-stats',
    WEBSITE_DATA: '/realtime/website-data',
    CLIENTS_INFO: '/realtime/clients-info',
    TRIGGER_UPDATE: '/realtime/trigger-update',
  },

  // Test Data (development only)
  TEST_DATA: {
    GENERATE_PRODUCTS: '/test-data/products',
    GENERATE_ORDERS: '/test-data/orders',
    RESET_DATA: '/test-data/reset',
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