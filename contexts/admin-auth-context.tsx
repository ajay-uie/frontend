"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { clientLogger } from "@/utils/logger"
import { enhancedApi } from "@/lib/enhanced-api"
import type { AdminUser, AuthResponse } from "@/lib/types"

interface AdminAuthContextType {
  admin: AdminUser | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  refreshAdminData: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!admin && !!token

  // Load token from localStorage on mount
  useEffect(() => {
    const initializeAdminAuth = async () => {
      if (typeof window !== "undefined") {
        try {
          const savedToken = localStorage.getItem("admin_token")
          if (savedToken) {
            setToken(savedToken)
            await verifyToken(savedToken)
          }
        } catch (error) {
          clientLogger.error("Admin auth initialization error:", error)
          clearTokens()
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }

    initializeAdminAuth()
  }, [])

  // Clear tokens helper
  const clearTokens = () => {
    setToken(null)
    setAdmin(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_token")
      localStorage.removeItem("admin_refresh_token")
    }
  }

  // Verify token with backend
  const verifyToken = async (tokenToVerify: string) => {
    try {
      clientLogger.info("🔍 Verifying admin token")

      // Set token temporarily for the request
      const originalToken = enhancedApi.isAuthenticated()
      enhancedApi.setTokens(tokenToVerify)

      const response = await enhancedApi.request<{ admin: AdminUser }>("/api/admin/auth/verify", {
        method: "POST",
        timeout: 15000,
      })

      if (response.success && response.data?.admin) {
        setAdmin(response.data.admin)
        setToken(tokenToVerify)
        clientLogger.info("✅ Admin token verified successfully")
      } else {
        clientLogger.warn("⚠️ Admin token verification failed")
        clearTokens()
        // Restore original token if verification failed
        if (!originalToken) {
          enhancedApi.clearTokens()
        }
      }
    } catch (error) {
      clientLogger.error("❌ Admin token verification error:", error)
      clearTokens()
    }
  }

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      clientLogger.info("👑 Attempting admin login for:", email)

      const response = await enhancedApi.adminLogin({ email, password })

      if (response.success && response.data) {
        const { admin: adminData, token: authToken, refreshToken } = response.data

        setAdmin(adminData)
        setToken(authToken)

        // Store tokens
        if (typeof window !== "undefined") {
          localStorage.setItem("admin_token", authToken)
          if (refreshToken) {
            localStorage.setItem("admin_refresh_token", refreshToken)
          }
        }

        clientLogger.info("✅ Admin login successful")
      } else {
        throw new Error(response.error || "Admin login failed")
      }
    } catch (error: any) {
      clientLogger.error("❌ Admin login error:", error)
      clearTokens()
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    setIsLoading(true)
    try {
      clientLogger.info("👋 Admin logout")

      if (token) {
        // Set token for logout request
        enhancedApi.setTokens(token)

        try {
          await enhancedApi.request("/api/admin/auth/logout", {
            method: "POST",
            timeout: 10000,
          })
        } catch (error) {
          clientLogger.warn("⚠️ Admin logout API call failed:", error)
          // Continue with local logout even if API call fails
        }
      }
    } catch (error) {
      clientLogger.error("❌ Admin logout error:", error)
    } finally {
      // Always clear local state
      clearTokens()
      enhancedApi.clearTokens()
      setIsLoading(false)
      clientLogger.info("✅ Admin logout completed")
    }
  }

  // Refresh token function
  const refreshToken = async () => {
    if (!token) return

    try {
      clientLogger.info("🔄 Refreshing admin token")

      const refreshTokenValue = typeof window !== "undefined" ? localStorage.getItem("admin_refresh_token") : null

      if (!refreshTokenValue) {
        throw new Error("No refresh token available")
      }

      const response = await enhancedApi.request<AuthResponse>("/api/admin/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
        timeout: 15000,
      })

      if (response.success && response.data) {
        const { token: newToken, refreshToken: newRefreshToken, user: adminData } = response.data

        setToken(newToken)
        if (adminData) {
          setAdmin(adminData as AdminUser)
        }

        // Update stored tokens
        if (typeof window !== "undefined") {
          localStorage.setItem("admin_token", newToken)
          if (newRefreshToken) {
            localStorage.setItem("admin_refresh_token", newRefreshToken)
          }
        }

        // Update API client token
        enhancedApi.setTokens(newToken, newRefreshToken)

        clientLogger.info("✅ Admin token refreshed successfully")
      } else {
        throw new Error("Token refresh failed")
      }
    } catch (error) {
      clientLogger.error("❌ Admin token refresh error:", error)
      await logout()
    }
  }

  // Refresh admin data
  const refreshAdminData = async () => {
    if (!token) return

    try {
      enhancedApi.setTokens(token)

      const response = await enhancedApi.request<{ admin: AdminUser }>("/api/admin/auth/profile", {
        method: "GET",
        timeout: 10000,
      })

      if (response.success && response.data?.admin) {
        setAdmin(response.data.admin)
        clientLogger.info("✅ Admin data refreshed")
      }
    } catch (error) {
      clientLogger.error("❌ Failed to refresh admin data:", error)
    }
  }

  // Auto-refresh token every 23 hours
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(
        () => {
          refreshToken()
        },
        23 * 60 * 60 * 1000,
      ) // 23 hours

      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const value: AdminAuthContextType = {
    admin,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshToken,
    refreshAdminData,
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}

// HOC for protecting admin routes
export function withAdminAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAdminAuth()

    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading admin panel...</p>
          </div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null // This will be handled by the parent component
    }

    return <Component {...props} />
  }
}

// Test credentials helper (development only)
export const testAdminCredentials = {
  email: "admin@fragransia.in",
  password: "Admin@ajay#9196",
}

// Development helper
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  ;(window as any).testAdminLogin = () => {
    console.log("🧪 Test Admin Credentials:", testAdminCredentials)
    return testAdminCredentials
  }
  console.log("🧪 Development mode: Use testAdminLogin() for admin credentials")
}
