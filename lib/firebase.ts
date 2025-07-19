import { initializeApp, getApps } from "firebase/app"
import { getAuth, connectAuthEmulator, GoogleAuthProvider } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { getStorage, connectStorageEmulator } from "firebase/storage"
import { getAnalytics } from "firebase/analytics"

const fallbackConfig = {
  apiKey: "AIzaSyDx70ZWTDr-RIZjJIKlF7stmTdcArbRZRo",
  authDomain: "fragransia-dbms.firebaseapp.com",
  databaseURL: "https://fragransia-dbms-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fragransia-dbms",
  storageBucket: "fragransia-dbms.appspot.com",
  messagingSenderId: "186915704462",
  appId: "1:186915704462:web:85993177df2d11281b43df",
  measurementId: "G-DL5QDLGJYJ"
}

// Use env vars or fallback if not defined
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || fallbackConfig.databaseURL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || fallbackConfig.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || fallbackConfig.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || fallbackConfig.appId,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || fallbackConfig.measurementId,
}

const isBrowser = typeof window !== "undefined"
const isDevelopment = isBrowser
  ? process.env.NEXT_PUBLIC_NODE_ENV === "development"
  : process.env.NODE_ENV === "development"

let app
if (!getApps().length) {
  app = initializeApp(firebaseConfig)
  if (isBrowser) getAnalytics(app)
} else {
  app = getApps()[0]
}

// Firebase Services
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

// Emulator Connections (Dev only)
if (isDevelopment && isBrowser) {
  try {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
    connectFirestoreEmulator(db, "localhost", 8080)
    connectStorageEmulator(storage, "localhost", 9199)
    console.log("🔧 Firebase emulators connected")
  } catch (err) {
    console.warn("⚠️ Emulator connection failed:", err.message)
  }
}

const provider = new GoogleAuthProvider();

// Export
export { app, auth, db, storage, provider }

