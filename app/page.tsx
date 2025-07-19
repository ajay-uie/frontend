"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Star, Truck, Shield, Award, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Navigation from "./components/navigation"
import Footer from "./components/footer"
import ProductCard from "./components/product-card"
import BrandComparison from "./components/brand-comparison"
import SaleCountdown from "./components/sale-countdown"
import WhatsAppChat from "./components/whatsapp-chat"
import NewsletterPopup from "./components/newsletter-popup"
import { useCart } from "@/contexts/cart-context";
import api, { type Product } from "@/lib/api";
import { firebaseService } from "@/lib/firebase-service"
import Link from "next/link"

export default function HomePage() {
  const { addToCart } = useCart()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [newsletterLoading, setNewsletterLoading] = useState(false)
  const [newsletterSuccess, setNewsletterSuccess] = useState(false)
  const [newsletterError, setNewsletterError] = useState("")

  useEffect(() => {
    loadFeaturedProducts()
  }, [])

  const loadFeaturedProducts = async () => {
    try {
      // Try API first, then Firebase, then mock data
     const response = await api.products.getAll();

      if (!response.success || !response.data) {
        // Try Firebase as fallback
        console.log("API failed, trying Firebase...")
        const products = await firebaseService.getProducts({ limit: 12 })
        if (products.length > 0) {
          setFeaturedProducts(
            products.map((p) => ({
              ...p,
              image: p.images?.[0] || "/placeholder.svg?height=400&width=300",
              description: p.description || "Premium fragrance",
              rating: 4.5,
              reviews: Math.floor(Math.random() * 200) + 50,
            })),
          )
        } else {
          // Use mock data as final fallback
          setFeaturedProducts([
            {
              id: "1",
              name: "PARTY MAN",
              price: 1099,
              originalPrice: 1299,
              size: "100ml",
              image: "/placeholder.svg?height=400&width=300",
              category: "woody",
              rating: 4.8,
              reviews: 127,
              discount: 5,
              description: "A sophisticated woody aromatic fragrance with notes of bergamot, cedar, and amber.",
              stock: 25,
              status: "active",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            // Add more mock products as needed
          ])
        }
      } else {
        setFeaturedProducts(response.data.products)
      }
    } catch (error) {
      console.error("Failed to load featured products:", error)
      // Use mock data as final fallback
      setFeaturedProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) return

    setNewsletterLoading(true)
    setNewsletterError("")

    try {
      // Try to save to Firebase first
      try {
        await firebaseService.logUserActivity(null, "newsletter_subscription", {
          email: newsletterEmail,
          source: "homepage",
          timestamp: new Date().toISOString(),
        })
      } catch (firebaseError) {
        console.warn("Firebase logging failed:", firebaseError)
      }

      // Store subscription data locally as backup
      const subscriptionData = {
        email: newsletterEmail,
        timestamp: new Date().toISOString(),
        source: "homepage",
      }

      localStorage.setItem("newsletter_subscribed", "true")
      localStorage.setItem("newsletter_data", JSON.stringify(subscriptionData))

      setNewsletterSuccess(true)
      setNewsletterEmail("")

      // Reset success message after 5 seconds
      setTimeout(() => {
        setNewsletterSuccess(false)
      }, 5000)
    } catch (error) {
      console.error("Newsletter subscription error:", error)
      setNewsletterError("Failed to subscribe. Please try again.")
    } finally {
      setNewsletterLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20 px-4 py-2">
                Luxury Collection 2025
              </Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-light leading-tight">
                Discover Your
                <br />
                <span className="font-normal">Signature Scent</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Immerse yourself in our curated collection of premium fragrances, crafted for those who appreciate the
                art of scent
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/products">
                <Button size="lg" className="bg-white text-black hover:bg-gray-100 px-8 py-4 text-lg">
                  Explore Collection
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/gift-guide">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg bg-transparent"
                >
                  Gift Guide
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Hero Image */}
        <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:block">
          <img
            src="/images/hero-perfume.jpeg"
            alt="Luxury Fragrance"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Free Shipping</h3>
              <p className="text-gray-600">On orders above ₹2,000</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Authentic Products</h3>
              <p className="text-gray-600">100% genuine fragrances</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Premium Quality</h3>
              <p className="text-gray-600">Luxury ingredients & craftsmanship</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Expert Support</h3>
              <p className="text-gray-600">Personalized fragrance consultation</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sale Countdown */}
      <SaleCountdown />

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">Featured Collection</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our most popular fragrances, carefully selected for their exceptional quality and timeless appeal
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(12)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/products">
              <Button size="lg" variant="outline" className="bg-transparent">
                View All Products
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Brand Comparison */}
      <BrandComparison />

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-light">Stay Updated</h2>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Be the first to know about new arrivals, exclusive offers, and fragrance tips from our experts
              </p>
            </div>

            {newsletterSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-600 rounded-lg p-6 max-w-md mx-auto"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Successfully Subscribed!</h3>
                    <p className="text-sm text-green-100">Thank you for joining our newsletter</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  />
                  <Button
                    type="submit"
                    disabled={newsletterLoading}
                    className="bg-white text-black hover:bg-gray-100 px-8 py-3"
                  >
                    {newsletterLoading ? "Subscribing..." : "Subscribe"}
                  </Button>
                </div>
                {newsletterError && <p className="text-red-400 text-sm mt-2">{newsletterError}</p>}
                <p className="text-gray-400 text-sm mt-4">No spam, unsubscribe at any time. We respect your privacy.</p>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      <WhatsAppChat />
      <Footer />
      <NewsletterPopup />
    </div>
  )
}
