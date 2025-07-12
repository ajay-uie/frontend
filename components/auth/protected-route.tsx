"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  redirectTo?: string
}

export default function ProtectedRoute({ children, requireAdmin = false, redirectTo = "/" }: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(`${redirectTo}`)
        return
      }

      if (requireAdmin && userProfile?.role !== "admin") {
        router.push("/dashboard")
        return
      }
    }
  }, [user, userProfile, loading, router, redirectTo, requireAdmin])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!user || (requireAdmin && userProfile?.role !== "admin")) {
    return null
  }

  return <>{children}</>
}
