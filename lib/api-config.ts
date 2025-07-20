import axios from 'axios'

const IS_DEV = process.env.NODE_ENV === 'development'

export const API_BASE = (() => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '')
  }

  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/api$/, '')
  }

  if (IS_DEV) {
    return 'http://localhost:10000'
  }

  return 'https://backend-8npy.onrender.com'
})()

// ✅ Axios Instance
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const API_ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    googleLogin: '/auth/google-login',
    loginToken: '/auth/login-token',
    verify: '/auth/verify',
    logout: '/auth/logout',
    forgotPassword: '/auth/forgot-password',
    adminLogin: '/admin/auth/login',
    adminProfile: '/admin/auth/profile',
    adminVerify: '/admin/auth/verify',
    adminLogout: '/admin/auth/logout',
    adminRefresh: '/admin/auth/refresh',
  },
  products: {
    list: '/products',
    detail: (id: string) => `/products/${id}`,
    create: '/products',
    update: (id: string) => `/products/${id}`,
    delete: (id: string) => `/products/${id}`,
  },
  orders: {
    create: '/orders/create',
    detail: (id: string) => `/orders/${id}`,
    userOrders: '/orders/user',
    updateStatus: (id: string) => `/admin/orders/${id}/status`,
  },
  payments: {
    verify: '/payments/verify',
  },
  coupons: {
    apply: '/coupons/apply',
    public: '/coupons/public',
  },
  users: {
    profile: '/users/profile',
    addresses: '/users/addresses',
  },
  admin: {
    dashboard: '/admin/dashboard',
    countdownSettings: '/admin/countdown-settings',
  },
  health: '/health',
}

// ✅ Export axios instance
export default api