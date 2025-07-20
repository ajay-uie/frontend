import { API_ENDPOINTS } from './api-config';
import api from './api-config';

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
  // Health check
  async checkHealth() {
    return api.get(API_ENDPOINTS.health);
  },

  // Authentication
  auth: {
    async register(userData: any) {
      return api.post(API_ENDPOINTS.auth.register, userData);
    },
    
    async login(credentials: any) {
      return api.post(API_ENDPOINTS.auth.login, credentials);
    },
    
    async adminLogin(credentials: any) {
      return api.post(API_ENDPOINTS.auth.adminLogin, credentials);
    },
  },

  // Products
  products: {
    async getAll() {
      return api.get(API_ENDPOINTS.products.list);
    },
    
    async getById(id: string) {
      return api.get(API_ENDPOINTS.products.detail(id));
    },
    
    async create(productData: any) {
      return api.post(API_ENDPOINTS.products.create, productData);
    },
    
    async update(id: string, productData: any) {
      return api.put(API_ENDPOINTS.products.update(id), productData);
    },
    
    async delete(id: string) {
      return api.delete(API_ENDPOINTS.products.delete(id));
    },
  },

  // Orders
  orders: {
    async create(orderData: any) {
      return api.post(API_ENDPOINTS.orders.create, orderData);
    },
    
    async getById(id: string) {
      return api.get(API_ENDPOINTS.orders.detail(id));
    },
  },

  // Payments
  payments: {
    async process(paymentData: any) {
      return api.post(API_ENDPOINTS.payments.verify, paymentData);
    },
  },

  // Coupons
  coupons: {
    async getAll(userId: string) {
      return api.get(`${API_ENDPOINTS.coupons.list}?userId=${userId}`);
    },
    async apply(code: string, total: number) {
      return api.post(API_ENDPOINTS.coupons.apply, { code, total });
    },
  },

  // Users
  users: {
    async getAddresses(userId: string) {
      return api.get(`${API_ENDPOINTS.users.addresses}?userId=${userId}`);
    },
  },

  // Shipping
  shipping: {
    async getOptions(pincode: string, weight: number) {
      // This endpoint is not in the provided API_ENDPOINTS, assuming it's a direct call to Shiprocket or similar
      // For now, leaving it as is, but ideally it should be part of API_ENDPOINTS if it's a backend API
      return api.get(`/api/shipping/options?pincode=${pincode}&weight=${weight}`);
    },
  },

  // Admin
  admin: {
    async getDashboard() {
      return api.get(API_ENDPOINTS.admin.dashboard);
    },
  },
}

// Health check function for compatibility
export async function checkApiHealth() {
  try {
    const response = await apiClient.checkHealth();
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error };
  }
}

export default apiClient;
export { api as axiosClient };


