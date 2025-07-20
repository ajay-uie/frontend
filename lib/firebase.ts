import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "fragransia-dev.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://fragransia-dev-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "fragransia-dev",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "fragransia-dev.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);
export const storage = getStorage(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Auth helper functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Get the ID token
    const idToken = await user.getIdToken();
    
    // Send to backend for processing
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store JWT token
      localStorage.setItem('authToken', data.data.token);
      return { success: true, user: data.data.user, isNewUser: data.data.isNewUser };
    } else {
      throw new Error(data.error || 'Google sign-in failed');
    }
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    // Sign out from Firebase
    await signOut(auth);
    
    // Call backend logout
    const token = localStorage.getItem('authToken');
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    }
    
    // Clear local storage
    localStorage.removeItem('authToken');
    
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Manual auth functions (for email/password)
export const registerWithEmail = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}) => {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store JWT token
      localStorage.setItem('authToken', data.data.token);
      return { success: true, user: data.data.user };
    } else {
      throw new Error(data.error || 'Registration failed');
    }
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store JWT token
      localStorage.setItem('authToken', data.data.token);
      return { success: true, user: data.data.user };
    } else {
      throw new Error(data.error || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return null;
    }
    
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data.user;
    } else {
      // Token might be expired
      localStorage.removeItem('authToken');
      return null;
    }
  } catch (error) {
    console.error('Get current user error:', error);
    localStorage.removeItem('authToken');
    return null;
  }
};

export const updateUserProfile = async (profileData: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: any;
  preferences?: any;
}) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token');
    }
    
    const response = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    
    const data = await response.json();
    
    if (data.success) {
      return { success: true, data: data.data };
    } else {
      throw new Error(data.error || 'Profile update failed');
    }
  } catch (error) {
    console.error('Profile update error:', error);
    throw error;
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      return { success: true, message: data.message };
    } else {
      throw new Error(data.error || 'Password reset failed');
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    throw error;
  }
};

// Real-time database helpers
export const subscribeToAnalytics = (callback: (data: any) => void) => {
  // In a real implementation, you'd use Firebase Realtime Database listeners
  // For now, we'll simulate with periodic API calls
  const interval = setInterval(async () => {
    try {
      const response = await fetch('/api/admin/analytics');
      const data = await response.json();
      if (data.success) {
        callback(data.data);
      }
    } catch (error) {
      console.error('Analytics subscription error:', error);
    }
  }, 5000); // Update every 5 seconds
  
  return () => clearInterval(interval);
};

export const subscribeToNotifications = (userId: string, callback: (notifications: any[]) => void) => {
  // Similar to analytics, in real implementation you'd use Firebase listeners
  const interval = setInterval(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        callback(data.data);
      }
    } catch (error) {
      console.error('Notifications subscription error:', error);
    }
  }, 10000); // Update every 10 seconds
  
  return () => clearInterval(interval);
};

export default app;

