// 🌐 Enhanced Frontend API Configuration (api/config.ts)

const IS_DEV = process.env.NODE_ENV === 'development';
const IS_PROD = process.env.NODE_ENV === 'production';

// ✅ API Base URL with fallback logic
export const API_BASE = (() => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (process.env.NEXT_PUBLIC_BACKEND_URL) return process.env.NEXT_PUBLIC_BACKEND_URL;
  if (IS_DEV) return 'http://localhost:10000';
  return 'https://backend-8npy.onrender.com';
})();

// ✅ Socket.IO URL (separate from REST API)
export const SOCKET_BASE = API_BASE.replace('/api', '');

// ✅ API Endpoints – All prefixed with `/api`
export const API_ENDPOINTS = {
  HEALTH: '/api/health',

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

  AUTH_ENHANCED: {
    SOCIAL_LOGIN: '/api/auth-enhanced/social',
    TWO_FACTOR: '/api/auth-enhanced/2fa',
    VERIFY_2FA: '/api/auth-enhanced/verify-2fa',
  },

  ADMIN_AUTH: {
    LOGIN: '/api/admin/auth/login',
    LOGOUT: '/api/admin/auth/logout',
    VERIFY_TOKEN: '/api/admin/auth/verify',
  },

  USERS: {
    PROFILE: '/api/users/profile',
    ADDRESSES: '/api/users/addresses',
    ADDRESS_DETAIL: (id: string) => `/api/users/addresses/${id}`,
    UPDATE_PROFILE: '/api/users/profile',
    CHANGE_PASSWORD: '/api/users/change-password',
    DELETE_ACCOUNT: '/api/users/delete-account',
  },

  PRODUCTS: {
    LIST: '/api/products',
    SEARCH: '/api/products/search',
    CATEGORIES: '/api/products/categories',
    FEATURED: '/api/products/featured',
    DETAIL: (id: string) => `/api/products/${id}`,
    RELATED: (id: string) => `/api/products/${id}/related`,
    REVIEWS: (id: string) => `/api/products/${id}/reviews`,
  },

  ADMIN_PRODUCTS: {
    LIST: '/api/admin/products',
    CREATE: '/api/admin/products',
    UPDATE: (id: string) => `/api/admin/products/${id}`,
    DELETE: (id: string) => `/api/admin/products/${id}`,
    BULK_UPDATE: '/api/admin/products/bulk',
    UPLOAD_IMAGE: '/api/admin/products/upload-image',
  },

  CART: {
    GET: '/api/cart',
    ADD_ITEM: '/api/cart/add',
    UPDATE_ITEM: '/api/cart/update',
    REMOVE_ITEM: '/api/cart/remove',
    CLEAR: '/api/cart/clear',
    SYNC: '/api/cart/sync',
  },

  ORDERS: {
    LIST: '/api/orders',
    CREATE: '/api/orders/create',
    DETAIL: (id: string) => `/api/orders/${id}`,
    CANCEL: (id: string) => `/api/orders/${id}/cancel`,
    TRACK: (id: string) => `/api/orders/${id}/track`,
    HISTORY: '/api/orders/history',
  },

  ADMIN_ORDERS: {
    LIST: '/api/admin/orders',
    UPDATE_STATUS: (id: string) => `/api/admin/orders/${id}/status`,
    DETAILS: (id: string) => `/api/admin/orders/${id}`,
  },

  PAYMENTS: {
    CREATE_INTENT: '/api/payments/create-intent',
    VERIFY: '/api/payments/verify',
    REFUND: '/api/payments/refund',
    PAYMENT_METHODS: '/api/payments/methods',
  },

  PAYMENTS_API: {
    PROCESS: '/api/payments-api/process',
    WEBHOOK: '/api/payments-api/webhook',
  },

  WISHLIST: {
    GET: '/api/wishlist',
    ADD: '/api/wishlist/add',
    REMOVE: '/api/wishlist/remove',
    CLEAR: '/api/wishlist/clear',
  },

  REVIEWS: {
    LIST: (productId: string) => `/api/reviews/product/${productId}`,
    CREATE: '/api/reviews',
    UPDATE: (id: string) => `/api/reviews/${id}`,
    DELETE: (id: string) => `/api/reviews/${id}`,
    USER_REVIEWS: '/api/reviews/user',
  },

  COUPONS: {
    LIST: '/api/coupons',
    APPLY: '/api/coupons/apply',
    VALIDATE: '/api/coupons/validate',
    USER_COUPONS: '/api/coupons/user',
  },

  ADMIN_COUPONS: {
    LIST: '/api/admin/coupons',
    CREATE: '/api/admin/coupons',
    UPDATE: (id: string) => `/api/admin/coupons/${id}`,
    DELETE: (id: string) => `/api/admin/coupons/${id}`,
  },

  WEBHOOKS: {
    STRIPE: '/api/webhooks/stripe',
    PAYPAL: '/api/webhooks/paypal',
  },

  ADMIN: {
    DASHBOARD: '/api/admin/dashboard',
    ANALYTICS: '/api/admin/analytics',
    USERS: '/api/admin/users',
    SETTINGS: '/api/admin/settings',
  },

  REALTIME: {
    HEALTH: '/api/realtime/health',
    DASHBOARD_STATS: '/api/realtime/dashboard-stats',
    WEBSITE_DATA: '/api/realtime/website-data',
    CLIENTS_INFO: '/api/realtime/clients-info',
    TRIGGER_UPDATE: '/api/realtime/trigger-update',
  },

  TEST_DATA: {
    GENERATE_PRODUCTS: '/api/test-data/products',
    GENERATE_ORDERS: '/api/test-data/orders',
    RESET_DATA: '/api/test-data/reset',
  },
};

// ✅ Utility: Construct full API URL
export const getApiUrl = (endpoint: string): string => {
  if (endpoint.startsWith('http')) return endpoint;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE}/${cleanEndpoint}`;
};

// ✅ Utility: Get socket URL
export const getSocketUrl = (): string => SOCKET_BASE;

// ✅ Config
export const API_CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,

  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },

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
} as const;

// ✅ Environment Flags
export const ENV_FLAGS = {
  IS_DEV,
  IS_PROD,
  IS_CLIENT: typeof window !== 'undefined',
  IS_SERVER: typeof window === 'undefined',
} as const;

// ✅ Dev-only Console Logs
if (IS_DEV && ENV_FLAGS.IS_CLIENT) {
  console.log('🔗 API Base URL:', API_BASE);
  console.log('🔌 Socket URL:', SOCKET_BASE);

  if (!API_BASE) console.warn('⚠️ API_BASE is not configured properly');
}