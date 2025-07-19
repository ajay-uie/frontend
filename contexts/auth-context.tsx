import React, { createContext, useContext, useEffect, useState } from 'react'
import { backendApi, User } from '@/lib/backend-api-enhanced'
import { auth } from '@/lib/firebase'
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { clientLogger } from "@/utils/logger";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, firstName: string, lastName: string, phoneNumber?: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  handleSignOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (typeof window !== "undefined") { // Ensure localStorage is only accessed on the client-side
        try {
          if (backendApi.isAuthenticated()) {
            const response = await backendApi.verifyToken();
            if (response.success && response.data?.user) {
              setUser(response.data.user);
            } else {
              backendApi.clearToken();
            }
          }
        } catch (error) {
          clientLogger.error("Auth check failed:", error);
          backendApi.clearToken();
        } finally {
          setLoading(false);
        }
      }
    };

    checkAuthStatus();
  }, []);

  // ✅ Dual login: backend → firebase fallback
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      const response = await backendApi.login({ email, password });
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return { success: true };
      }

      clientLogger.warn("⚠️ Backend login failed. Trying Firebase fallback...");

      const firebaseUser = await signInWithEmailAndPassword(auth, email, password);
      const token = await firebaseUser.user.getIdToken();
      const fbResponse = await backendApi.loginWithFirebaseToken(token);

      if (fbResponse.success && fbResponse.data?.user) {
        setUser(fbResponse.data.user);
        return { success: true };
      }

      return { success: false, error: fbResponse.error || 'Firebase login failed' };

    } catch (error: any) {
      clientLogger.error("Login failed:", error);
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Enhanced signup: try backend first, Firebase fallback
  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      // Try backend registration first
      const response = await backendApi.register({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
      });

      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return { success: true };
      }

      clientLogger.warn("⚠️ Backend registration failed. Trying Firebase fallback...");

      // Fallback to Firebase registration
      const firebaseUser = await createUserWithEmailAndPassword(auth, email, password);
      const token = await firebaseUser.user.getIdToken();
      
      // Register with backend using Firebase token
      const fbResponse = await backendApi.loginWithFirebaseToken(token);

      if (fbResponse.success && fbResponse.data?.user) {
        setUser(fbResponse.data.user);
        return { success: true };
      }

      return { success: false, error: fbResponse.error || 'Registration failed' };

    } catch (error: any) {
      clientLogger.error("Registration error:", error);
      return { success: false, error: error.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!auth) return { success: false, error: 'Firebase Auth not initialized' };

      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      const backendResponse = await backendApi.googleLogin(token);
      if (backendResponse.success && backendResponse.data?.user) {
        setUser(backendResponse.data.user);
        return { success: true };
      } else {
        await signOut(auth);
        return { success: false, error: backendResponse.error || 'Google login failed' };
      }
    } catch (error: any) {
      clientLogger.error("Google Sign-In error:", error);
      return { success: false, error: error.message || 'Google Sign-In failed' };
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      setLoading(true);
      if (auth) await signOut(auth);
      await backendApi.logout();
      backendApi.clearToken();
      setUser(null);
    } catch (error) {
      clientLogger.error("Logout error:", error);
      backendApi.clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await backendApi.forgotPassword(email);
      if (response.success) return { success: true };
      return { success: false, error: response.error || 'Password reset failed' };
    } catch (error: any) {
      clientLogger.error("Password reset error:", error);
      return { success: false, error: error.message || 'Password reset failed' };
    }
  };

  const updateUserProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await backendApi.updateUserProfile(updates);
      if (response.success && response.data) {
        setUser(response.data);
        return { success: true };
      }
      return { success: false, error: response.error || 'Profile update failed' };
    } catch (error: any) {
      clientLogger.error("Profile update error:", error);
      return { success: false, error: error.message || 'Profile update failed' };
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    handleSignOut,
    resetPassword,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}