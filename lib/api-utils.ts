import { ApiResponse, ApiError, ValidationError } from './api-types';

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:10000/api',
  TIMEOUT: 15000, // 15 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Token Management Utilities
export class TokenManager {
  private static readonly USER_TOKEN_KEY = 'user_token';
  private static readonly ADMIN_TOKEN_KEY = 'admin_token';

  static setUserToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_TOKEN_KEY, token);
    }
  }

  static getUserToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.USER_TOKEN_KEY);
    }
    return null;
  }

  static clearUserToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.USER_TOKEN_KEY);
    }
  }

  static setAdminToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.ADMIN_TOKEN_KEY, token);
    }
  }

  static getAdminToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.ADMIN_TOKEN_KEY);
    }
    return null;
  }

  static clearAdminToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.ADMIN_TOKEN_KEY);
    }
  }

  static clearAllTokens(): void {
    this.clearUserToken();
    this.clearAdminToken();
  }
}

// HTTP Client Utilities
export class HttpClient {
  private static async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        return {
          success: false,
          error: 'Invalid response format from server',
        };
      }

      if (!response.ok) {
        const errorMessage = data.error || data.message || `HTTP ${response.status}: ${response.statusText}`;
        return {
          success: false,
          error: errorMessage,
          details: data.details,
        };
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout - please check your connection',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: 'Unknown error occurred',
      };
    }
  }

  static async get<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return this.makeRequest<T>(url, {
      method: 'GET',
      headers,
    });
  }

  static async post<T>(
    endpoint: string,
    body?: any,
    token?: string
  ): Promise<ApiResponse<T>> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return this.makeRequest<T>(url, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  static async put<T>(
    endpoint: string,
    body?: any,
    token?: string
  ): Promise<ApiResponse<T>> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return this.makeRequest<T>(url, {
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  static async delete<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return this.makeRequest<T>(url, {
      method: 'DELETE',
      headers,
    });
  }
}

// Error Handling Utilities
export class ErrorHandler {
  static isApiError(error: any): error is ApiError {
    return error && typeof error === 'object' && error.success === false;
  }

  static getErrorMessage(error: any): string {
    if (this.isApiError(error)) {
      return error.error || 'An error occurred';
    }

    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    return 'An unknown error occurred';
  }

  static getValidationErrors(error: any): ValidationError[] {
    if (this.isApiError(error) && error.details) {
      return error.details.filter((detail: any) => 
        detail && typeof detail === 'object' && detail.field && detail.message
      );
    }
    return [];
  }

  static formatValidationErrors(errors: ValidationError[]): Record<string, string> {
    const formatted: Record<string, string> = {};
    errors.forEach(error => {
      formatted[error.field] = error.message;
    });
    return formatted;
  }

  static isNetworkError(error: any): boolean {
    if (error instanceof Error) {
      return error.name === 'AbortError' || 
             error.message.includes('timeout') ||
             error.message.includes('network') ||
             error.message.includes('fetch');
    }
    return false;
  }

  static isAuthError(error: any): boolean {
    if (this.isApiError(error)) {
      return error.error?.includes('token') ||
             error.error?.includes('authentication') ||
             error.error?.includes('unauthorized') ||
             error.error?.includes('expired');
    }
    return false;
  }
}

// URL Building Utilities
export class UrlBuilder {
  static buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  static buildEndpoint(path: string, params?: Record<string, any>): string {
    const queryString = params ? this.buildQueryString(params) : '';
    return `${path}${queryString}`;
  }
}

// Data Transformation Utilities
export class DataTransformer {
  static transformDates(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.transformDates(item));
    }

    const transformed: any = {};
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'string' && this.isDateString(value)) {
        transformed[key] = new Date(value);
      } else if (typeof value === 'object' && value !== null) {
        transformed[key] = this.transformDates(value);
      } else {
        transformed[key] = value;
      }
    });

    return transformed;
  }

  private static isDateString(value: string): boolean {
    // Check if string matches common date formats
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    return dateRegex.test(value) && !isNaN(Date.parse(value));
  }

  static sanitizeFormData(data: any): any {
    const sanitized: any = {};
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string') {
          sanitized[key] = value.trim();
        } else {
          sanitized[key] = value;
        }
      }
    });

    return sanitized;
  }
}

// Cache Utilities
export class CacheManager {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  static set(key: string, data: any, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  static get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  static clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  static generateKey(endpoint: string, params?: any): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${endpoint}:${paramString}`;
  }
}

// Retry Utilities
export class RetryManager {
  static async withRetry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = API_CONFIG.RETRY_ATTEMPTS,
    delay: number = API_CONFIG.RETRY_DELAY
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxAttempts) {
          break;
        }

        // Don't retry on certain types of errors
        if (ErrorHandler.isApiError(error) && !ErrorHandler.isNetworkError(error)) {
          break;
        }

        await this.sleep(delay * attempt);
      }
    }

    throw lastError;
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Validation Utilities
export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  static isValidPassword(password: string): boolean {
    return password.length >= 6;
  }

  static isValidPincode(pincode: string): boolean {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(pincode);
  }

  static validateRequired(value: any, fieldName: string): string | null {
    if (value === undefined || value === null || value === '') {
      return `${fieldName} is required`;
    }
    return null;
  }

  static validateEmail(email: string): string | null {
    if (!email) {
      return 'Email is required';
    }
    if (!this.isValidEmail(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  }

  static validatePassword(password: string): string | null {
    if (!password) {
      return 'Password is required';
    }
    if (!this.isValidPassword(password)) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  }
}

// Logging Utilities
export class Logger {
  private static isDevelopment = process.env.NODE_ENV === 'development';

  static log(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(`[API] ${message}`, data || '');
    }
  }

  static error(message: string, error?: any): void {
    if (this.isDevelopment) {
      console.error(`[API Error] ${message}`, error || '');
    }
  }

  static warn(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.warn(`[API Warning] ${message}`, data || '');
    }
  }

  static info(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.info(`[API Info] ${message}`, data || '');
    }
  }
}

// Export all utilities
export {
  API_CONFIG,
  TokenManager,
  HttpClient,
  ErrorHandler,
  UrlBuilder,
  DataTransformer,
  CacheManager,
  RetryManager,
  ValidationUtils,
  Logger,
};
