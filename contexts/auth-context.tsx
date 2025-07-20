"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth"
import { clientLogger } from "@/utils/logger"
import { enhancedApi } from "@/lib/enhanced-api"
import type { User } from "@/lib/types"

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber?: string,
  ) => Promise<{ success: boolean; error?: string }>
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  handleSignOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  updateUserProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we have a stored token
        const storedToken = localStorage.getItem("auth_token")
        if (storedToken) {
          setToken(storedToken)

          // Verify token with backend
          const response = await enhancedApi.verifyToken()
          if (response.success && response.data?.user) {
            setUser(response.data.user)
            clientLogger.info("✅ User authenticated from stored token")
          } else {
            // Token is invalid, clear it
            localStorage.removeItem("auth_token")
            localStorage.removeItem("refresh_token")
            setToken(null)
            clientLogger.warn("⚠️ Stored token is invalid, cleared")
          }
        }

        // Set up Firebase auth state listener
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
          if (firebaseUser && !user) {
            try {
              const idToken = await firebaseUser.getIdToken()
              const response = await enhancedApi.loginWithFirebaseToken(idToken)

              if (response.success && response.data) {
                setUser(response.data.user)
                setToken(response.data.token)
                clientLogger.info("✅ User authenticated via Firebase")
              }
            } catch (error) {
              clientLogger.error("❌ Firebase auth error:", error)
            }
          }
        })

        return unsubscribe
      } catch (error) {
        clientLogger.error("❌ Auth initialization error:", error)
      } finally {
        setLoading(false)
      }
    }

    const unsubscribe = initializeAuth()
    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe()
      }
    }
  }, [])

  // Backend-first login with Firebase fallback
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      clientLogger.info("🔐 Attempting backend login for:", email)

      // Try backend login first
      const response = await enhancedApi.login({ email, password })

      if (response.success && response.data) {
        setUser(response.data.user)
        setToken(response.data.token)
        clientLogger.info("✅ Backend login successful")
        return { success: true }
      }

      // If backend fails, try Firebase
      clientLogger.warn("⚠️ Backend login failed, trying Firebase fallback")

      const firebaseResult = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await firebaseResult.user.getIdToken()

      const fbResponse = await enhancedApi.loginWithFirebaseToken(idToken)

      if (fbResponse.success && fbResponse.data) {
        setUser(fbResponse.data.user)
        setToken(fbResponse.data.token)
        clientLogger.info("✅ Firebase login successful")
        return { success: true }
      }

      return { success: false, error: fbResponse.error || "Login failed" }
    } catch (error: any) {
      clientLogger.error("❌ Login error:", error)

      // Handle specific Firebase errors
      if (error.code === "auth/user-not-found") {
        return { success: false, error: "No account found with this email address" }
      } else if (error.code === "auth/wrong-password") {
        return { success: false, error: "Incorrect password" }
      } else if (error.code === "auth/invalid-email") {
        return { success: false, error: "Invalid email address" }
      } else if (error.code === "auth/user-disabled") {
        return { success: false, error: "This account has been disabled" }
      }

      return { success: false, error: error.message || "Login failed" }
    } finally {
      setLoading(false)
    }
  }

  // Backend-first registration with Firebase fallback
  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber?: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      clientLogger.info("👤 Attempting backend registration for:", email)

      // Try backend registration first
      const response = await enhancedApi.register({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
      })

      if (response.success && response.data) {
        setUser(response.data.user)
        setToken(response.data.token)
        clientLogger.info("✅ Backend registration successful")
        return { success: true }
      }

      // If backend fails, try Firebase
      clientLogger.warn("⚠️ Backend registration failed, trying Firebase fallback")

      const firebaseResult = await createUserWithEmailAndPassword(auth, email, password)
      const idToken = await firebaseResult.user.getIdToken()

      const fbResponse = await enhancedApi.registerWithFirebaseToken(idToken)

      if (fbResponse.success && fbResponse.data) {
        setUser(fbResponse.data.user)
        setToken(fbResponse.data.token)
        clientLogger.info("✅ Firebase registration successful")
        return { success: true }
      }

      return { success: false, error: fbResponse.error || "Registration failed" }
    } catch (error: any) {
      clientLogger.error("❌ Registration error:", error)

      // Handle specific Firebase errors
      if (error.code === "auth/email-already-in-use") {
        return { success: false, error: "An account with this email already exists" }
      } else if (error.code === "auth/weak-password") {
        return { success: false, error: "Password is too weak. Please choose a stronger password" }
      } else if (error.code === "auth/invalid-email") {
        return { success: false, error: "Invalid email address" }
      }

      return { success: false, error: error.message || "Registration failed" }
    } finally {
      setLoading(false)
    }
  }

  // Google Sign-In
  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!auth) return { success: false, error: "Firebase Auth not initialized" }

      setLoading(true)
      clientLogger.info("🔐 Attempting Google sign-in")

      const provider = new GoogleAuthProvider()
      provider.addScope("email")
      provider.addScope("profile")

      const result = await signInWithPopup(auth, provider)
      const idToken = await result.user.getIdToken()

      const response = await enhancedApi.googleLogin(idToken)

      if (response.success && response.data) {
        setUser(response.data.user)
        setToken(response.data.token)
        clientLogger.info("✅ Google sign-in successful")
        return { success: true }
      } else {
        await signOut(auth)
        return { success: false, error: response.error || "Google sign-in failed" }
      }
    } catch (error: any) {
      clientLogger.error("❌ Google sign-in error:", error)

      if (error.code === "auth/popup-closed-by-user") {
        return { success: false, error: "Sign-in was cancelled" }
      } else if (error.code === "auth/popup-blocked") {
        return { success: false, error: "Popup was blocked by browser. Please allow popups and try again" }
      }

      return { success: false, error: error.message || "Google sign-in failed" }
    } finally {
      setLoading(false)
    }
  }

  // Sign Out
  const handleSignOut = async (): Promise<void> => {
    try {
      setLoading(true)
      clientLogger.info("👋 Signing out user")

      // Sign out from Firebase
      if (auth.currentUser) {
        await signOut(auth)
      }

      // Sign out from backend
      await enhancedApi.logout()

      // Clear local state
      setUser(null)
      setToken(null)

      // Clear stored tokens
      localStorage.removeItem("auth_token")
      localStorage.removeItem("refresh_token")

      clientLogger.info("✅ Sign out successful")
    } catch (error) {
      clientLogger.error("❌ Sign out error:", error)
      // Still clear local state even if backend call fails
      setUser(null)
      setToken(null)
      localStorage.removeItem("auth_token")
      localStorage.removeItem("refresh_token")
    } finally {
      setLoading(false)
    }
  }

  // Reset Password
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      clientLogger.info("🔑 Requesting password reset for:", email)

      // Try backend first
      const response = await enhancedApi.forgotPassword(email)
      if (response.success) {
        return { success: true }
      }

      // Fallback to Firebase
      await sendPasswordResetEmail(auth, email)
      clientLogger.info("✅ Password reset email sent via Firebase")
      return { success: true }
    } catch (error: any) {
      clientLogger.error("❌ Password reset error:", error)

      if (error.code === "auth/user-not-found") {
        return { success: false, error: "No account found with this email address" }
      } else if (error.code === "auth/invalid-email") {
        return { success: false, error: "Invalid email address" }
      }

      return { success: false, error: error.message || "Password reset failed" }
    }
  }

  // Update User Profile
  const updateUserProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      clientLogger.info("👤 Updating user profile")

      const response = await enhancedApi.updateUserProfile(updates)

      if (response.success && response.data) {
        setUser(response.data)
        clientLogger.info("✅ Profile updated successfully")
        return { success: true }
      }

      return { success: false, error: response.error || "Profile update failed" }
    } catch (error: any) {
      clientLogger.error("❌ Profile update error:", error)
      return { success: false, error: error.message || "Profile update failed" }
    }
  }

  // Refresh User Data
  const refreshUserData = async (): Promise<void> => {
    try {
      if (!token) return

      const response = await enhancedApi.getUserProfile()
      if (response.success && response.data?.user) {
        setUser(response.data.user)
        clientLogger.info("✅ User data refreshed")
      }
    } catch (error) {
      clientLogger.error("❌ Failed to refresh user data:", error)
    }
  }

  const value: AuthContextType = {
    user,
    token,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    handleSignOut,
    resetPassword,
    updateUserProfile,
    refreshUserData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Test credentials helper (development only)
export const testCredentials = {
  admin: {
    email: "admin@fragransia.in",
    password: "Admin@ajay#9196",
  },
  user: {
    email: "sarkarsachib@gmail.com",
    password: "Sachib@13",
  },
}

// Development helper for quick login
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  ;(window as any).testLogin = {
    admin: () => {
      console.log("🧪 Test Admin Login:", testCredentials.admin)
      return testCredentials.admin
    },
    user: () => {
      console.log("🧪 Test User Login:", testCredentials.user)
      return testCredentials.user
    },
  }
  console.log("🧪 Development mode: Use testLogin.admin() or testLogin.user() for quick access to test credentials")
}
