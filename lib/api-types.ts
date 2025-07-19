// Core API Response Interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any[];
}

// Pagination Interface
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  totalProducts?: number;
  totalOrders?: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

// User Interfaces
export interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin';
  phoneNumber?: string;
  dateOfBirth?: Date;
  preferences?: {
    notifications: boolean;
    marketing: boolean;
    theme: 'light' | 'dark';
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Product Interfaces
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand?: string;
  sku?: string;
  images: string[];
  rating?: number;
  reviewCount?: number;
  stock: number;
  isActive: boolean;
  isFeatured?: boolean;
  tags?: string[];
  specifications?: Record<string, any>;
  notes?: {
    top: string[];
    middle: string[];
    base: string[];
  };
  discount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'createdAt' | 'rating' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
  filters: {
    sortBy: string;
    sortOrder: string;
  };
}

// Cart Interfaces
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  image: string;
  addedAt: Date;
  updatedAt: Date;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  updatedAt: Date;
}

// Order Interfaces
export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  image: string;
  sku?: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderPricing {
  subtotal: number;
  discount: number;
  shippingCost: number;
  gst: number;
  processingFee: number;
  total: number;
}

export interface OrderStatusHistory {
  status: string;
  timestamp: Date;
  note: string;
  updatedBy?: string;
}

export interface Order {
  id: string;
  orderId: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  pricing: OrderPricing;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  statusHistory: OrderStatusHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OrdersResponse {
  orders: Order[];
  pagination: Pagination;
}

export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  couponCode?: string;
  notes?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
}

// Coupon Interfaces
export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  discount: number;
  appliedDiscount?: number;
  description: string;
  minOrderValue: number;
  maxDiscount?: number;
  expiryDate: Date;
  isApplicable?: boolean;
  isActive: boolean;
  isPublic?: boolean;
  usageLimit?: number;
  userUsageLimit?: number;
  usedCount?: number;
}

export interface CouponValidation {
  isValid: boolean;
  reasons: string[];
}

export interface CouponValidationResponse {
  coupon: Coupon;
  validation: CouponValidation;
}

// Wishlist Interfaces
export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  addedAt: Date;
  isAvailable: boolean;
  stock: number;
  category: string;
  brand: string;
}

export interface Wishlist {
  items: WishlistItem[];
  totalItems: number;
  updatedAt: Date;
}

export interface WishlistFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface WishlistResponse {
  wishlist: Wishlist;
  pagination: Pagination;
}

export interface WishlistStats {
  totalItems: number;
  totalValue: number;
  availableItems: number;
  unavailableItems: number;
  categories: Record<string, number>;
  brands: Record<string, number>;
}

// Admin Interfaces
export interface Admin {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: 'admin';
  permissions: {
    manageProducts: boolean;
    manageOrders: boolean;
    manageUsers: boolean;
    manageCoupons: boolean;
    viewAnalytics: boolean;
    manageSettings: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface AdminAuthResponse {
  admin: Admin;
  token: string;
}

// Error Interfaces
export interface ApiError {
  success: false;
  error: string;
  details?: any[];
  statusCode?: number;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Request/Response Types for specific endpoints
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface FirebaseTokenRequest {
  token: string;
}

export interface GoogleLoginRequest {
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  preferences?: User['preferences'];
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
  size?: string;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface SyncCartRequest {
  items: Array<{
    productId: string;
    quantity: number;
    size?: string;
  }>;
}

export interface ApplyCouponRequest {
  code: string;
  orderTotal: number;
}

export interface ValidateCouponRequest {
  code: string;
}

export interface AddAddressRequest {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  type?: 'home' | 'work' | 'other';
  isDefault?: boolean;
}

export interface UpdateAddressRequest extends Partial<AddAddressRequest> {}

export interface AddToWishlistRequest {
  productId: string;
}

export interface MoveToCartRequest {
  productId: string;
  quantity?: number;
}

export interface CheckWishlistRequest {
  productId: string;
}

export interface CheckWishlistResponse {
  isInWishlist: boolean;
  addedAt: Date | null;
  productId: string;
}

// Utility Types
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiRequestConfig {
  method?: ApiMethod;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  requireAuth?: boolean;
}

// Hook Return Types
export interface UseApiCallResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseMutationResult<T> {
  mutate: (...args: any[]) => Promise<ApiResponse<T>>;
  loading: boolean;
  error: string | null;
  data: T | null;
}

export interface UseAuthResult {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<ApiResponse<AuthResponse>>;
  register: (userData: RegisterRequest) => Promise<ApiResponse<AuthResponse>>;
  logout: () => Promise<void>;
  loginWithFirebase: (token: string) => Promise<ApiResponse<AuthResponse>>;
  googleLogin: (token: string) => Promise<ApiResponse<AuthResponse>>;
  isAuthenticated: boolean;
  refetch: () => Promise<void>;
}

export interface UseCartResult {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addToCart: (productId: string, quantity: number, size?: string) => Promise<ApiResponse<{ cart: Cart }>>;
  updateCartItem: (cartId: string, quantity: number) => Promise<ApiResponse<{ cart: Cart }>>;
  removeCartItem: (cartId: string) => Promise<ApiResponse<any>>;
  clearCart: () => Promise<ApiResponse<any>>;
  refetch: () => Promise<void>;
}

