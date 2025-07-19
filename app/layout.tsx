import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import LuxuryPreloader from "@/components/luxury-preloader"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_TITLE || "Fragransia™ - Luxury Fragrances",
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Discover premium fragrances and luxury perfumes at Fragransia™. Shop authentic designer perfumes with fast delivery across India.",
  keywords: process.env.NEXT_PUBLIC_APP_KEYWORDS || "perfume, fragrance, luxury, designer, authentic, India",
  authors: [{ name: process.env.NEXT_PUBLIC_APP_AUTHOR || "Fragransia™" }],
  creator: process.env.NEXT_PUBLIC_APP_CREATOR || "Fragransia™",
  publisher: process.env.NEXT_PUBLIC_APP_PUBLISHER || "Fragransia™",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000"),
  openGraph: {
    title: "Fragransia™ - Luxury Fragrances",
    description: "Discover premium fragrances and luxury perfumes at Fragransia™",
    url: "/",
    siteName: "Fragransia™",
    images: [
      {
        url: "/images/hero-perfume.jpeg",
        width: 1200,
        height: 630,
        alt: "Fragransia™ Luxury Fragrances",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fragransia™ - Luxury Fragrances",
    description: "Discover premium fragrances and luxury perfumes",
    images: ["/images/hero-perfume.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION_CODE || "",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <LuxuryPreloader />
          {children}
          <Toaster />
          <SonnerToaster />
        </Providers>
      </body>
    </html>
  )
}
