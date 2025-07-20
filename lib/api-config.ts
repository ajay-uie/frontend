import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-8npy.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    profile: '/user/profile',
    addresses: '/user/addresses',
  },
  admin: {
    dashboard: '/admin/dashboard',
    countdownSettings: '/admin/countdown-settings',
  },
  health: '/health',
};

export default api;


