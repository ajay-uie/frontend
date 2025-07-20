import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { AppInitializer } from "@/app/components/app-initializer"
import { cn } from "@/lib/utils"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_APP_TITLE || "Fragransia™ - Premium Fragrances & Perfumes",
    template: "%s | Fragransia™",
  },
  description:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
    "Discover premium fragrances and perfumes at Fragransia™. Shop authentic designer perfumes, niche fragrances, and exclusive collections with fast delivery across India.",
  keywords:
    process.env.NEXT_PUBLIC_APP_KEYWORDS ||
    "perfumes, fragrances, designer perfumes, niche fragrances, cologne, eau de parfum, eau de toilette, luxury perfumes, online perfume store, India",
  authors: [{ name: process.env.NEXT_PUBLIC_APP_AUTHOR || "Fragransia Team" }],
  creator: process.env.NEXT_PUBLIC_APP_CREATOR || "Fragransia",
  publisher: process.env.NEXT_PUBLIC_APP_PUBLISHER || "Fragransia",
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
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_FRONTEND_URL,
    siteName: "Fragransia™",
    title: "Fragransia™ - Premium Fragrances & Perfumes",
    description:
      "Discover premium fragrances and perfumes at Fragransia™. Shop authentic designer perfumes, niche fragrances, and exclusive collections with fast delivery across India.",
    images: [
      {
        url: "/fragransia-logo.jpg",
        width: 1200,
        height: 630,
        alt: "Fragransia™ - Premium Fragrances & Perfumes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fragransia™ - Premium Fragrances & Perfumes",
    description:
      "Discover premium fragrances and perfumes at Fragransia™. Shop authentic designer perfumes, niche fragrances, and exclusive collections with fast delivery across India.",
    images: ["/fragransia-logo.jpg"],
    creator: "@fragransia",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION_CODE,
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_FRONTEND_URL,
  },
  category: "ecommerce",
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Fragransia™" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={cn(inter.className, "min-h-screen bg-background font-sans antialiased")}>
        <Providers>
          <AppInitializer>
            <div className="relative flex min-h-screen flex-col">
              <div className="flex-1">{children}</div>
            </div>
          </AppInitializer>
        </Providers>

        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_title: document.title,
                  page_location: window.location.href,
                });
              `}
            </Script>
          </>
        )}

        {/* Facebook Pixel */}
        {process.env.NEXT_PUBLIC_FB_PIXEL_ID && (
          <Script id="facebook-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}

        {/* Structured Data */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Fragransia™",
              url: process.env.NEXT_PUBLIC_FRONTEND_URL,
              logo: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/fragransia-logo.jpg`,
              description: "Premium fragrances and perfumes online store in India",
              address: {
                "@type": "PostalAddress",
                addressCountry: "IN",
              },
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                availableLanguage: ["English", "Hindi"],
              },
              sameAs: [
                "https://www.facebook.com/fragransia",
                "https://www.instagram.com/fragransia",
                "https://twitter.com/fragransia",
              ],
            }),
          }}
        />
      </body>
    </html>
  )
}
