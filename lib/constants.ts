// Environment Configuration
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || "https://backend-8npy.onrender.com",
  API_VERSION: process.env.NEXT_PUBLIC_API_VERSION || "v1",
} as const

// API Configuration
export const API_CONFIG = {
  BASE_URL: `${ENV.BACKEND_URL}/api/${ENV.API_VERSION}`,
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const

// API Endpoints - Complete mapping to your backend
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    VERIFY_TOKEN: "/auth/verify-token",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    GOOGLE_LOGIN: "/auth/google",
    FIREBASE_LOGIN: "/auth/firebase",
    VERIFY_EMAIL: "/auth/verify-email",
    RESEND_VERIFICATION: "/auth/resend-verification",
  },

  // User Management
  USER: {
    PROFILE: "/user/profile",
    UPDATE_PROFILE: "/user/profile",
    CHANGE_PASSWORD: "/user/change-password",
    DELETE_ACCOUNT: "/user/delete-account",
    ADDRESSES: "/user/addresses",
    ADD_ADDRESS: "/user/addresses",
    UPDATE_ADDRESS: "/user/addresses",
    DELETE_ADDRESS: "/user/addresses",
    PREFERENCES: "/user/preferences",
  },

  // Products
  PRODUCTS: {
    LIST: "/products",
    DETAILS: "/products",
    SEARCH: "/products/search",
    CATEGORIES: "/products/categories",
    BRANDS: "/products/brands",
    FEATURED: "/products/featured",
    TRENDING: "/products/trending",
    RECOMMENDATIONS: "/products/recommendations",
    REVIEWS: "/products/reviews",
    ADD_REVIEW: "/products/reviews",
  },

  // Cart Management
  CART: {
    GET: "/cart",
    ADD: "/cart/add",
    UPDATE: "/cart/update",
    REMOVE: "/cart/remove",
    CLEAR: "/cart/clear",
    SYNC: "/cart/sync",
    APPLY_COUPON: "/cart/coupon",
    REMOVE_COUPON: "/cart/coupon",
  },

  // Wishlist
  WISHLIST: {
    GET: "/wishlist",
    ADD: "/wishlist/add",
    REMOVE: "/wishlist/remove",
    CLEAR: "/wishlist/clear",
    SYNC: "/wishlist/sync",
  },

  // Orders
  ORDERS: {
    CREATE: "/orders",
    LIST: "/orders",
    DETAILS: "/orders",
    CANCEL: "/orders/cancel",
    TRACK: "/orders/track",
    HISTORY: "/orders/history",
    INVOICE: "/orders/invoice",
    RETURN: "/orders/return",
  },

  // Payments
  PAYMENTS: {
    CREATE_ORDER: "/payments/create-order",
    VERIFY: "/payments/verify",
    WEBHOOK: "/payments/webhook",
    METHODS: "/payments/methods",
    REFUND: "/payments/refund",
    STATUS: "/payments/status",
  },

  // Coupons & Discounts
  COUPONS: {
    LIST: "/coupons",
    VALIDATE: "/coupons/validate",
    APPLY: "/coupons/apply",
  },

  // Shipping
  SHIPPING: {
    CALCULATE: "/shipping/calculate",
    METHODS: "/shipping/methods",
    TRACK: "/shipping/track",
  },

  // Admin (if needed)
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    PRODUCTS: "/admin/products",
    ORDERS: "/admin/orders",
    USERS: "/admin/users",
    ANALYTICS: "/admin/analytics",
    SETTINGS: "/admin/settings",
  },

  // Miscellaneous
  MISC: {
    HEALTH: "/health",
    CONTACT: "/contact",
    NEWSLETTER: "/newsletter",
    FEEDBACK: "/feedback",
    UPLOAD: "/upload",
  },
} as const

// Payment Configuration
export const PAYMENT_CONFIG = {
  RAZORPAY: {
    KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
    CURRENCY: "INR",
    THEME_COLOR: "#000000",
  },
  PROCESSING_FEES: {
    CARD: 2.5, // 2.5%
    UPI: 0, // Free
    NET_BANKING: 1.5, // 1.5%
    WALLET: 1.0, // 1.0%
    COD: 50, // ₹50 flat
  },
  LIMITS: {
    MIN_ORDER: 299,
    MAX_ORDER: 100000,
    COD_LIMIT: 5000,
  },
} as const

// Socket Configuration
export const SOCKET_CONFIG = {
  URL: ENV.BACKEND_URL,
  OPTIONS: {
    transports: ["websocket", "polling"],
    timeout: 20000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  },
} as const

// Socket Events
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",
  RECONNECT: "reconnect",

  // Authentication
  AUTHENTICATE: "authenticate",
  AUTHENTICATED: "authenticated",
  UNAUTHORIZED: "unauthorized",

  // Real-time Updates
  ORDER_UPDATE: "order_update",
  CART_UPDATE: "cart_update",
  PRODUCT_UPDATE: "product_update",
  STOCK_UPDATE: "stock_update",
  PRICE_UPDATE: "price_update",

  // Notifications
  NOTIFICATION: "notification",
  SYSTEM_ALERT: "system_alert",
  ADMIN_MESSAGE: "admin_message",

  // Chat/Support
  CHAT_MESSAGE: "chat_message",
  SUPPORT_REQUEST: "support_request",

  // Monitoring
  PING: "ping",
  PONG: "pong",
  HEARTBEAT: "heartbeat",
} as const

// Application Constants
export const APP_CONFIG = {
  NAME: "Fragransia™",
  DESCRIPTION: "Premium Fragrances & Perfumes",
  VERSION: "1.0.0",
  SUPPORT_EMAIL: "support@fragransia.com",
  SUPPORT_PHONE: "+91-9876543210",
  COMPANY_ADDRESS: "Mumbai, Maharashtra, India",
} as const

// Feature Flags
export const FEATURES = {
  REAL_TIME_UPDATES: true,
  PUSH_NOTIFICATIONS: true,
  OFFLINE_MODE: true,
  ANALYTICS: true,
  A_B_TESTING: false,
  BETA_FEATURES: process.env.NODE_ENV === "development",
} as const

// Cache Configuration
export const CACHE_CONFIG = {
  PRODUCTS: 5 * 60 * 1000, // 5 minutes
  USER_PROFILE: 10 * 60 * 1000, // 10 minutes
  CART: 2 * 60 * 1000, // 2 minutes
  WISHLIST: 5 * 60 * 1000, // 5 minutes
  CATEGORIES: 30 * 60 * 1000, // 30 minutes
} as const

// Timeouts
export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 seconds
  FILE_UPLOAD: 60000, // 1 minute
  SOCKET_CONNECT: 10000, // 10 seconds
  PAYMENT_PROCESS: 300000, // 5 minutes
} as const

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  SERVER_ERROR: "Server error. Please try again later.",
  UNAUTHORIZED: "Please log in to continue.",
  FORBIDDEN: "You do not have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_ERROR: "Please check your input and try again.",
  PAYMENT_FAILED: "Payment failed. Please try again.",
  OUT_OF_STOCK: "This item is currently out of stock.",
  CART_EMPTY: "Your cart is empty.",
  GENERIC_ERROR: "Something went wrong. Please try again.",
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Successfully logged in!",
  REGISTER_SUCCESS: "Account created successfully!",
  LOGOUT_SUCCESS: "Successfully logged out!",
  PROFILE_UPDATED: "Profile updated successfully!",
  CART_UPDATED: "Cart updated successfully!",
  ORDER_PLACED: "Order placed successfully!",
  PAYMENT_SUCCESS: "Payment completed successfully!",
  REVIEW_ADDED: "Review added successfully!",
  WISHLIST_UPDATED: "Wishlist updated successfully!",
  EMAIL_SENT: "Email sent successfully!",
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "fragransia_auth_token",
  REFRESH_TOKEN: "fragransia_refresh_token",
  USER_PREFERENCES: "fragransia_user_preferences",
  CART_DATA: "fragransia_cart",
  WISHLIST_DATA: "fragransia_wishlist",
  RECENT_SEARCHES: "fragransia_recent_searches",
  THEME: "fragransia_theme",
  LANGUAGE: "fragransia_language",
} as const

// Default export with all constants
export default {
  ENV,
  API_CONFIG,
  API_ENDPOINTS,
  PAYMENT_CONFIG,
  SOCKET_CONFIG,
  SOCKET_EVENTS,
  APP_CONFIG,
  FEATURES,
  CACHE_CONFIG,
  TIMEOUTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
}
