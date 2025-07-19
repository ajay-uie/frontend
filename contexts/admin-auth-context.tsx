"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { clientLogger } from "@/utils/logger";

interface AdminUser {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  permissions: {
    manageProducts: boolean;
    manageOrders: boolean;
    manageUsers: boolean;
    manageCoupons: boolean;
    viewAnalytics: boolean;
    manageSettings: boolean;
  };
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!admin && !!token;

  // Load token from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") { // Ensure localStorage is only accessed on the client-side
      const savedToken = localStorage.getItem("admin_token");
      if (savedToken) {
        setToken(savedToken);
        verifyToken(savedToken);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  // Verify token with backend
  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/auth/verify`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${tokenToVerify}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.admin) {
          setAdmin(data.data.admin);
          setToken(tokenToVerify);
        } else {
          // Token is invalid
          localStorage.removeItem("admin_token");
          setToken(null);
          setAdmin(null);
        }
      } else {
        // Token is invalid or expired
        localStorage.removeItem("admin_token");
        setToken(null);
        setAdmin(null);
      }
    } catch (error) {
      clientLogger.error("Token verification error:", error);
      localStorage.removeItem("admin_token");
      setToken(null);
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Updated to handle the new standardized response format
        setAdmin(data.data.admin);
        setToken(data.data.token);
        localStorage.setItem("admin_token", data.data.token);
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      clientLogger.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      if (token) {
        // Call logout endpoint
        await fetch(`${API_BASE_URL}/admin/auth/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      clientLogger.error("Logout error:", error);
    } finally {
      // Clear local state regardless of API call success
      setAdmin(null);
      setToken(null);
      localStorage.removeItem("admin_token");
      setIsLoading(false);
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/auth/refresh`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.token) {
          setToken(data.token);
          setAdmin(data.admin);
          localStorage.setItem("admin_token", data.token);
        }
      } else {
        // Refresh failed, logout
        await logout();
      }
    } catch (error) {
      clientLogger.error("Token refresh error:", error);
      await logout();
    }
  };

  // Auto-refresh token every 23 hours
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        refreshToken();
      }, 23 * 60 * 60 * 1000); // 23 hours

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const value: AdminAuthContextType = {
    admin,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshToken,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}

// HOC for protecting admin routes
export function withAdminAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ProtectedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAdminAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null; // This will be handled by the parent component
    }

    return <Component {...props} />;
  };
}

