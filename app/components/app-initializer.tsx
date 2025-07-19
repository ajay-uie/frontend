"use client"

import { useEffect } from "react"
import { checkApiHealth } from "@/lib/api"

export default function AppInitializer() {
  useEffect(() => {
    // Check API health on app initialization
    checkApiHealth()
  }, [])

  return null
}
