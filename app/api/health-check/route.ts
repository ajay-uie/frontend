import type { NextRequest } from "next/server"

// FIXED: Proxy to external API, not internal route
export async function GET(_req: NextRequest) {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://fragransia.onrender.com/api"

    const upstream = await fetch(`${API_BASE}/health`, {
      // Never cache – we want a live status.
      cache: "no-store",
    })

    const data = await upstream.json()
    // Mirror the upstream status code (usually 200).
    return new Response(JSON.stringify(data), {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({
        status: "error",
        error: err instanceof Error ? err.message : "unknown",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
