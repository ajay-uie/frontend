'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { newBackendApi } from '@/lib/new-backend-api';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '@/lib/api-types';
import { auth } from '@/lib/firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  
  // Authentication methods
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (userData: RegisterRequest) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithFirebase: (token: string) => Promise<{ success: boolean; error?: string }>;
  handleSignOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  
  // Profile management
  updateUserProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  
  // Utility methods
  isAuthenticated: boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      try {
        if (newBackendApi.isAuthenticated()) {
          console.log('🔍 Verifying existing token...');
          const response = await newBackendApi.verifyToken();
          
          if (response.success && response.data?.user) {
            setUser(response.data.user);
            console.log('✅ Token verified, user authenticated');
          } else {
            console.log('❌ Token verification failed, clearing token');
            newBackendApi.clearToken();
            setUser(null);
          }
        } else {
          console.log('ℹ️ No authentication token found');
        }
      } catch (err) {
        console.error('❌ Auth initialization error:', err);
        newBackendApi.clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔐 Attempting email/password sign in...');
      const response = await newBackendApi.login({ email, password });

      if (response.success && response.data?.user) {
        setUser(response.data.user);
        console.log('✅ Sign in successful');
        return { success: true };
      } else {
        const errorMessage = response.error || 'Sign in failed';
        setError(errorMessage);
        console.log('❌ Sign in failed:', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
      setError(errorMessage);
      console.error('❌ Sign in error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (userData: RegisterRequest): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      console.log('👤 Attempting user registration...');
      const response = await newBackendApi.register(userData);

      if (response.success && response.data?.user) {
        setUser(response.data.user);
        console.log('✅ Registration successful');
        return { success: true };
      } else {
        const errorMessage = response.error || 'Registration failed';
        setError(errorMessage);
        console.log('❌ Registration failed:', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      console.error('❌ Registration error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔐 Attempting Google sign in...');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      if (result.user) {
        const token = await result.user.getIdToken();
        const response = await newBackendApi.googleLogin(token);

        if (response.success && response.data?.user) {
          setUser(response.data.user);
          console.log('✅ Google sign in successful');
          return { success: true };
        } else {
          const errorMessage = response.error || 'Google sign in failed';
          setError(errorMessage);
          console.log('❌ Google sign in failed:', errorMessage);
          return { success: false, error: errorMessage };
        }
      } else {
        const errorMessage = 'Google sign in was cancelled';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google sign in failed';
      setError(errorMessage);
      console.error('❌ Google sign in error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Firebase token
  const signInWithFirebase = async (token: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔐 Attempting Firebase token sign in...');
      const response = await newBackendApi.loginWithFirebaseToken(token);

      if (response.success && response.data?.user) {
        setUser(response.data.user);
        console.log('✅ Firebase token sign in successful');
        return { success: true };
      } else {
        const errorMessage = response.error || 'Firebase token sign in failed';
        setError(errorMessage);
        console.log('❌ Firebase token sign in failed:', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Firebase token sign in failed';
      setError(errorMessage);
      console.error('❌ Firebase token sign in error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const handleSignOut = async (): Promise<void> => {
    setLoading(true);

    try {
      console.log('🚪 Signing out...');
      
      // Sign out from backend
      await newBackendApi.logout();
      
      // Sign out from Firebase
      try {
        await signOut(auth);
      } catch (firebaseError) {
        console.warn('Firebase sign out error (non-critical):', firebaseError);
      }

      // Clear local state
      setUser(null);
      setError(null);
      
      console.log('✅ Sign out successful');
    } catch (err) {
      console.error('❌ Sign out error:', err);
      // Even if backend logout fails, clear local state
      setUser(null);
      newBackendApi.clearToken();
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);

    try {
      console.log('🔑 Requesting password reset...');
      
      // Send password reset email via Firebase
      await sendPasswordResetEmail(auth, email);
      
      // Also notify backend
      const response = await newBackendApi.forgotPassword(email);
      
      if (response.success) {
        console.log('✅ Password reset email sent');
        return { success: true };
      } else {
        const errorMessage = response.error || 'Password reset failed';
        setError(errorMessage);
        console.log('❌ Password reset failed:', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed';
      setError(errorMessage);
      console.error('❌ Password reset error:', err);
      return { success: false, error: errorMessage };
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    setError(null);

    try {
      console.log('👤 Updating user profile...');
      const response = await newBackendApi.updateUserProfile(updates);

      if (response.success && response.data?.user) {
        setUser(response.data.user);
        console.log('✅ Profile updated successfully');
        return { success: true };
      } else {
        const errorMessage = response.error || 'Profile update failed';
        setError(errorMessage);
        console.log('❌ Profile update failed:', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profile update failed';
      setError(errorMessage);
      console.error('❌ Profile update error:', err);
      return { success: false, error: errorMessage };
    }
  };

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    if (!newBackendApi.isAuthenticated()) {
      return;
    }

    try {
      console.log('🔄 Refreshing user data...');
      const response = await newBackendApi.getUserProfile();

      if (response.success && response.data?.user) {
        setUser(response.data.user);
        console.log('✅ User data refreshed');
      } else {
        console.log('❌ Failed to refresh user data');
      }
    } catch (err) {
      console.error('❌ User refresh error:', err);
    }
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithFirebase,
    handleSignOut,
    resetPassword,
    updateUserProfile,
    refreshUser,
    isAuthenticated: !!user,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export the context for advanced usage
export { AuthContext };

