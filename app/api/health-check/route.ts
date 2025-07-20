import type { NextRequest } from "next/server"

export async function GET(_req: NextRequest) {
  try {
    // ✅ Hardcoded API URL fallback
    const API_BASE = "https://backend-8npy.onrender.com"

    const response = await fetch(`${API_BASE}/api/health`, {
      cache: "no-store", // No cache to force live status check
      headers: {
        "Content-Type": "application/json",
      },
    })

    // If backend doesn't return JSON, this will fail
    const data = await response.json()

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
        backend: "https://backend-8npy.onrender.com/api/health",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
