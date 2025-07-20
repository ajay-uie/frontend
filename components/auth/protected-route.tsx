"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  redirectTo?: string
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  redirectTo = "/",
}: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push(redirectTo)
    } else if (requireAdmin && userProfile?.role !== "admin") {
      router.push("/dashboard")
    }
  }, [user, userProfile, loading, router, redirectTo, requireAdmin])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="h-10 w-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || (requireAdmin && userProfile?.role !== "admin")) {
    return null
  }

  return <>{children}</>
}
