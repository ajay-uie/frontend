"use client"

// Base Types
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

// User Types
export interface User extends BaseEntity {
  email: string
  firstName: string
  lastName: string
  phone?: string
  avatar?: string
  dateOfBirth?: string
  gender?: "male" | "female" | "other"
  isEmailVerified: boolean
  isPhoneVerified: boolean
  role: "user" | "admin" | "moderator"
  status: "active" | "inactive" | "suspended"
  preferences: UserPreferences
  addresses: Address[]
  lastLoginAt?: string
}

export interface UserPreferences {
  newsletter: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  emailNotifications: boolean
  language: string
  currency: string
  theme: "light" | "dark" | "system"
}

export interface Address extends BaseEntity {
  userId: string
  type: "home" | "work" | "other"
  firstName: string
  lastName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

// Authentication Types
export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  acceptTerms: boolean
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordReset {
  token: string
  password: string
  confirmPassword: string
}

export interface PhoneVerification {
  phone: string
  otp: string
}

// Product Types
export interface Product extends BaseEntity {
  name: string
  description: string
  shortDescription?: string
  sku: string
  price: number
  comparePrice?: number
  cost?: number
  trackQuantity: boolean
  quantity: number
  allowBackorder: boolean
  weight?: number
  dimensions?: ProductDimensions
  category: Category
  brand: Brand
  tags: string[]
  images: ProductImage[]
  variants: ProductVariant[]
  attributes: ProductAttribute[]
  seo: ProductSEO
  status: "active" | "draft" | "archived"
  featured: boolean
  trending: boolean
  rating: number
  reviewCount: number
  soldCount: number
  viewCount: number
}

export interface ProductDimensions {
  length: number
  width: number
  height: number
  unit: "cm" | "in"
}

export interface ProductImage {
  id: string
  url: string
  alt: string
  position: number
  isMain: boolean
}

export interface ProductVariant extends BaseEntity {
  productId: string
  name: string
  sku: string
  price: number
  comparePrice?: number
  quantity: number
  weight?: number
  image?: string
  attributes: { [key: string]: string }
  available: boolean
}

export interface ProductAttribute {
  name: string
  value: string
  type: "text" | "number" | "boolean" | "select"
  options?: string[]
}

export interface ProductSEO {
  title?: string
  description?: string
  keywords?: string[]
  slug: string
}

export interface Category extends BaseEntity {
  name: string
  description?: string
  slug: string
  image?: string
  parentId?: string
  children?: Category[]
  productCount: number
  status: "active" | "inactive"
  sortOrder: number
  seo: CategorySEO
}

export interface CategorySEO {
  title?: string
  description?: string
  keywords?: string[]
}

export interface Brand extends BaseEntity {
  name: string
  description?: string
  slug: string
  logo?: string
  website?: string
  productCount: number
  status: "active" | "inactive"
  featured: boolean
}

// Cart Types
export interface Cart {
  id: string
  userId?: string
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  currency: string
  couponCode?: string
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  id: string
  productId: string
  variantId?: string
  quantity: number
  price: number
  total: number
  product: Product
  variant?: ProductVariant
}

// Wishlist Types
export interface Wishlist {
  id: string
  userId: string
  items: WishlistItem[]
  createdAt: string
  updatedAt: string
}

export interface WishlistItem {
  id: string
  productId: string
  variantId?: string
  product: Product
  variant?: ProductVariant
  addedAt: string
}

// Order Types
export interface Order extends BaseEntity {
  orderNumber: string
  userId: string
  user: User
  status: OrderStatus
  paymentStatus: PaymentStatus
  fulfillmentStatus: FulfillmentStatus
  items: OrderItem[]
  shippingAddress: Address
  billingAddress: Address
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  currency: string
  couponCode?: string
  paymentMethod: string
  paymentId?: string
  shippingMethod: string
  trackingNumber?: string
  notes?: string
  cancelReason?: string
  cancelledAt?: string
  shippedAt?: string
  deliveredAt?: string
}

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "partially_refunded"

export type FulfillmentStatus = "unfulfilled" | "partial" | "fulfilled" | "shipped" | "delivered"

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  variantId?: string
  quantity: number
  price: number
  total: number
  product: Product
  variant?: ProductVariant
}

// Review Types
export interface Review extends BaseEntity {
  productId: string
  userId: string
  user: User
  rating: number
  title: string
  content: string
  images?: string[]
  verified: boolean
  helpful: number
  reported: number
  status: "pending" | "approved" | "rejected"
}

// Coupon Types
export interface Coupon extends BaseEntity {
  code: string
  name: string
  description?: string
  type: "percentage" | "fixed" | "free_shipping"
  value: number
  minimumAmount?: number
  maximumDiscount?: number
  usageLimit?: number
  usageCount: number
  userLimit?: number
  startsAt?: string
  expiresAt?: string
  status: "active" | "inactive" | "expired"
  applicableProducts?: string[]
  applicableCategories?: string[]
}

// Notification Types
export interface Notification extends BaseEntity {
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: any
  read: boolean
  readAt?: string
  actionUrl?: string
}

export type NotificationType =
  | "order_update"
  | "payment_success"
  | "payment_failed"
  | "shipping_update"
  | "product_back_in_stock"
  | "price_drop"
  | "review_reminder"
  | "newsletter"
  | "system"

// Payment Types
export interface PaymentMethod {
  id: string
  type: "card" | "upi" | "netbanking" | "wallet" | "cod"
  name: string
  details: any
  isDefault: boolean
}

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: string
  clientSecret?: string
  paymentMethod?: string
}

// Shipping Types
export interface ShippingOption {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: string
  available: boolean
}

export interface ShippingRate {
  id: string
  name: string
  price: number
  currency: string
  deliveryTime: string
  description?: string
}

// Analytics Types
export interface AnalyticsEvent {
  event: string
  properties: Record<string, any>
  userId?: string
  sessionId: string
  timestamp: string
}

export interface PageView {
  url: string
  title: string
  referrer?: string
  userId?: string
  sessionId: string
  timestamp: string
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: Record<string, string[]>
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

// Search Types
export interface SearchFilters {
  query?: string
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  inStock?: boolean
  featured?: boolean
  trending?: boolean
  sortBy?: "name" | "price" | "rating" | "created" | "popularity"
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
}

export interface SearchResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  filters: SearchFilters
  facets?: SearchFacet[]
}

export interface SearchFacet {
  name: string
  values: SearchFacetValue[]
}

export interface SearchFacetValue {
  value: string
  count: number
  selected: boolean
}

// Form Types
export interface FormField {
  name: string
  label: string
  type: string
  required: boolean
  placeholder?: string
  options?: { label: string; value: string }[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

export interface FormErrors {
  [key: string]: string | string[]
}

// Real-time Types
export interface SocketEvent {
  type: string
  data: any
  timestamp: string
  userId?: string
}

export interface RealTimeUpdate {
  type: "cart" | "wishlist" | "order" | "product" | "notification"
  action: "create" | "update" | "delete"
  data: any
  userId?: string
}

// Admin Types
export interface AdminDashboard {
  stats: {
    totalUsers: number
    totalOrders: number
    totalRevenue: number
    totalProducts: number
    newUsersToday: number
    ordersToday: number
    revenueToday: number
    conversionRate: number
  }
  recentOrders: Order[]
  topProducts: Product[]
  lowStockProducts: Product[]
  recentUsers: User[]
  salesChart: ChartData[]
  notifications: AdminNotification[]
}

export interface AdminNotification {
  id: string
  type: "info" | "warning" | "error" | "success"
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
}

export interface ChartData {
  label: string
  value: number
  date?: string
}

// Settings Types
export interface AppSettings {
  general: {
    siteName: string
    siteDescription: string
    siteUrl: string
    contactEmail: string
    supportPhone: string
    timezone: string
    currency: string
    language: string
  }
  shipping: {
    freeShippingThreshold: number
    standardShippingRate: number
    expressShippingRate: number
    sameDayDeliveryAvailable: boolean
    internationalShippingEnabled: boolean
  }
  payment: {
    enabledMethods: string[]
    codEnabled: boolean
    codCharges: number
    minimumOrderAmount: number
  }
  email: {
    smtpHost: string
    smtpPort: number
    smtpUser: string
    smtpPassword: string
    fromEmail: string
    fromName: string
  }
  sms: {
    provider: string
    apiKey: string
    senderId: string
    enabled: boolean
  }
  social: {
    facebookUrl?: string
    twitterUrl?: string
    instagramUrl?: string
    youtubeUrl?: string
    linkedinUrl?: string
  }
  seo: {
    metaTitle: string
    metaDescription: string
    metaKeywords: string[]
    googleAnalyticsId?: string
    facebookPixelId?: string
    googleTagManagerId?: string
  }
  features: {
    reviewsEnabled: boolean
    wishlistEnabled: boolean
    compareEnabled: boolean
    recentlyViewedEnabled: boolean
    recommendationsEnabled: boolean
    chatbotEnabled: boolean
  }
}

// Error Types
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: string
  userId?: string
  url?: string
  userAgent?: string
}

// File Upload Types
export interface FileUpload {
  file: File
  progress: number
  status: "pending" | "uploading" | "success" | "error"
  url?: string
  error?: string
}

// Theme Types
export interface Theme {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    success: string
    warning: string
    error: string
    info: string
  }
  fonts: {
    primary: string
    secondary: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
    full: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
  }
}

// Export all types
export type {
  BaseEntity,
  User,
  UserPreferences,
  Address,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  Product,
  ProductVariant,
  Category,
  Brand,
  Cart,
  CartItem,
  Wishlist,
  WishlistItem,
  Order,
  OrderItem,
  Review,
  Coupon,
  Notification,
  PaymentMethod,
  PaymentIntent,
  ShippingOption,
  AnalyticsEvent,
  ApiResponse,
  PaginatedResponse,
  SearchFilters,
  SearchResult,
  FormField,
  FormErrors,
  SocketEvent,
  RealTimeUpdate,
  AdminDashboard,
  AppSettings,
  AppError,
  FileUpload,
  Theme,
}
