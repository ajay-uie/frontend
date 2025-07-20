"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useAuth } from "@/contexts/new-auth-context"
import { useCart } from "@/contexts/new-cart-context"
import { LuxuryPreloader } from "@/components/luxury-preloader"

interface AppInitializerProps {
  children: ReactNode
}

export function AppInitializer({ children }: AppInitializerProps) {
  const { user, loading: authLoading } = useAuth()
  const { syncCart } = useCart()
  const [isInitialized, setIsInitialized] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("🚀 Initializing application...")

        // Initialize service worker for PWA
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
          try {
            const registration = await navigator.serviceWorker.register("/sw.js")
            console.log("✅ Service worker registered:", registration.scope)
          } catch (error) {
            console.warn("⚠️ Service worker registration failed:", error)
          }
        }

        // Sync cart data if user is authenticated
        if (user) {
          console.log("👤 User authenticated, syncing cart...")
          try {
            await syncCart()
            console.log("✅ Cart synchronized")
          } catch (error) {
            console.warn("⚠️ Cart sync failed, continuing with local data:", error)
          }
        }

        // Set up global error handlers
        if (typeof window !== "undefined") {
          window.addEventListener("error", (event) => {
            console.error("🚨 Global error:", {
              message: event.message,
              filename: event.filename,
              lineno: event.lineno,
              colno: event.colno,
              error: event.error,
            })
          })

          window.addEventListener("unhandledrejection", (event) => {
            console.error("🚨 Unhandled promise rejection:", {
              reason: event.reason,
            })
          })
        }

        setIsInitialized(true)
        console.log("✅ Application initialized successfully")
      } catch (error) {
        console.error("❌ Application initialization failed:", error)
        setInitError(error instanceof Error ? error.message : "Unknown initialization error")
      }
    }

    if (!authLoading) {
      initializeApp()
    }
  }, [user, authLoading, syncCart])

  // Show preloader while initializing
  if (authLoading || !isInitialized) {
    return <LuxuryPreloader />
  }

  // Show error state if initialization failed
  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Initialization Failed</h2>
          <p className="text-gray-600 mb-4">
            Failed to initialize the application. Please refresh the page to try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
          >
            Refresh Page
          </button>
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 text-left">
              <p className="text-sm text-gray-500 mb-2">Error Details:</p>
              <pre className="text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">{initError}</pre>
            </div>
          )}
        </div>
      </div>
    )
  }

  return <>{children}</>
}
