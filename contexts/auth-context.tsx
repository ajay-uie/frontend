import React, { createContext, useContext, useEffect, useState } from 'react'
import { backendApi, User, AuthResponse } from '@/lib/backend-api'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, firstName: string, lastName: string, phoneNumber?: string) => Promise<{ success: boolean; error?: string }>
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  handleSignOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  updateUserProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkAuthStatus = async () => {
      try {
        if (backendApi.isAuthenticated()) {
          const response = await backendApi.verifyToken()
          if (response.success && response.data?.user) {
            setUser(response.data.user)
          } else {
            // Token is invalid, clear it
            backendApi.clearToken()
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        backendApi.clearToken()
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      const response = await backendApi.login({ email, password })
      
      if (response.success && response.data?.user) {
        setUser(response.data.user)
        return { success: true }
      } else {
        return { 
          success: false, 
          error: response.error || 'Login failed' 
        }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string, 
    phoneNumber?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      const response = await backendApi.register({
        email,
        password,
        firstName,
        lastName,
        phoneNumber
      })
      
      if (response.success && response.data?.user) {
        setUser(response.data.user)
        return { success: true }
      } else {
        return { 
          success: false, 
          error: response.error || 'Registration failed' 
        }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      }
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    // Google Sign-In would need to be implemented on the backend
    // For now, return an error indicating it's not available
    return {
      success: false,
      error: 'Google Sign-In is not available in offline mode. Please use email/password login.'
    }
  }

  const handleSignOut = async (): Promise<void> => {
    try {
      setLoading(true)
      await backendApi.logout()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      // Even if logout fails on backend, clear local state
      backendApi.clearToken()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await backendApi.forgotPassword(email)
      
      if (response.success) {
        return { success: true }
      } else {
        return { 
          success: false, 
          error: response.error || 'Password reset failed' 
        }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Password reset failed' 
      }
    }
  }

  const updateUserProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await backendApi.updateUserProfile(updates)
      
      if (response.success && response.data) {
        setUser(response.data)
        return { success: true }
      } else {
        return { 
          success: false, 
          error: response.error || 'Profile update failed' 
        }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Profile update failed' 
      }
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    handleSignOut,
    resetPassword,
    updateUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

