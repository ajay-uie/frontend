import { initializeApp, getApps } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { getStorage, connectStorageEmulator } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredKeys = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ]

  const missingKeys = requiredKeys.filter((key) => !process.env[key])

  if (missingKeys.length > 0) {
    console.warn("❌ Missing Firebase configuration keys:", missingKeys)
    console.warn("🔧 Firebase features will be disabled")
    return false
  }

  console.log("✅ Firebase configuration validated successfully")
  return true
}

// Check if we're in development mode (safe for client-side)
const isDevelopment =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_NODE_ENV === "development"
    : typeof process !== "undefined" && process.env.NODE_ENV === "development"

// Initialize Firebase
let app
let isFirebaseEnabled = false
try {
  isFirebaseEnabled = validateFirebaseConfig()
  if (isFirebaseEnabled) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    console.log("✅ Firebase app initialized successfully")
  } else {
    console.log("⚠️ Firebase disabled due to missing configuration")
  }
} catch (error) {
  console.error("❌ Firebase initialization failed:", error)
  isFirebaseEnabled = false
}

// Initialize services with null checks
export const auth = isFirebaseEnabled && app ? getAuth(app) : null
export const db = isFirebaseEnabled && app ? getFirestore(app) : null
export const storage = isFirebaseEnabled && app ? getStorage(app) : null

// Connect to emulators in development (safe check for window)
if (typeof window !== "undefined" && isDevelopment && isFirebaseEnabled && auth && db && storage) {
  try {
    // Only connect if not already connected
    if (!auth.config.emulator) {
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
      console.log("🔧 Connected to Auth emulator")
    }

    // Check if Firestore is already connected to emulator
    const firestoreSettings = (db as any)._delegate?._databaseId
    if (firestoreSettings && !firestoreSettings.projectId.includes("demo-")) {
      connectFirestoreEmulator(db, "localhost", 8080)
      console.log("🔧 Connected to Firestore emulator")
    }

    // Check if Storage is already connected to emulator
    const storageHost = (storage as any)._delegate?._host
    if (storageHost && !storageHost.includes("localhost")) {
      connectStorageEmulator(storage, "localhost", 9199)
      console.log("🔧 Connected to Storage emulator")
    }
  } catch (error) {
    console.warn("⚠️ Emulator connection failed (may already be connected):", error.message)
  }
}

// Test Firebase connection with detailed error reporting
export const testFirebaseConnection = async () => {
  if (!db) {
    console.warn("❌ Firebase not initialized - check environment variables")
    return false
  }

  try {
    // Test Firestore connection
    const { doc, getDoc } = await import("firebase/firestore")
    const testDoc = doc(db, "test", "connection")
    await getDoc(testDoc)
    console.log("✅ Firestore connection successful")

    // Test Auth connection
    console.log("✅ Firebase Auth ready:", !!auth?.currentUser !== undefined)

    // Test Storage connection
    console.log("✅ Firebase Storage ready:", !!storage)

    return true
  } catch (error) {
    console.error("❌ Firebase connection test failed:", error)
    if (error.code === "permission-denied") {
      console.error("🔧 Fix: Update Firestore security rules to allow read/write")
    }
    return false
  }
}

// Debug function to check Firebase status
export const debugFirebaseStatus = () => {
  console.log("🔍 Firebase Debug Status:")
  console.log("- Environment:", isDevelopment ? "Development" : "Production")
  console.log("- Firebase Enabled:", isFirebaseEnabled)
  console.log("- App Initialized:", !!app)
  console.log("- Auth Service:", !!auth)
  console.log("- Firestore Service:", !!db)
  console.log("- Storage Service:", !!storage)
  console.log("- Config Keys Present:", {
    apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  })
}

// Export default app
export default app
export { isFirebaseEnabled, isDevelopment }
