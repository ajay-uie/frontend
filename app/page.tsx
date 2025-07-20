"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Navigation from "./components/navigation"
import Footer from "./components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Heart, Truck, Shield, Award, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ProductCard } from "./components/product-card"
import { BrandComparison } from "./components/brand-comparison"
import { DiscountCalculator } from "./components/discount-calculator"
import { SaleCountdown } from "./components/sale-countdown"
import { NewsletterPopup } from "./components/newsletter-popup"
import { WhatsAppChat } from "./components/whatsapp-chat"
import { CookieBanner } from "./components/cookie-banner"
import { newBackendApi } from "@/lib/new-backend-api"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import logger from "@/utils/logger"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviews: number
  discount?: number
  category: string
  brand: string
  description: string
  notes?: {
    top: string[]
    middle: string[]
    base: string[]
  }
}

interface HeroProduct {
  id: string
  name: string
  tagline: string
  price: number
  originalPrice: number
  image: string
  features: string[]
}

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function HomePage() {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [heroProduct, setHeroProduct] = useState<HeroProduct | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)

  useEffect(() => {
    loadHomePageData()
  }, [])

  const loadHomePageData = async () => {
    try {
      logger.info("Loading homepage data", undefined, "HomePage")

      // Load featured products
      const productsResponse = await newBackendApi.getProducts({
        limit: 8,
        sortBy: "rating",
        sortOrder: "desc",
      })

      if (productsResponse.success && productsResponse.data?.products) {
        const products = productsResponse.data.products.map((product) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image || "/placeholder.svg?height=300&width=300",
          rating: product.rating || 4.5,
          reviews: product.reviews || 0,
          discount: product.discount,
          category: product.category,
          brand: product.brand || "Premium",
          description: product.description,
          notes: product.notes,
        }))

        setFeaturedProducts(products)

        // Set hero product (first featured product)
        if (products.length > 0) {
          const hero = products[0]
          setHeroProduct({
            id: hero.id,
            name: hero.name,
            tagline: "Experience Luxury in Every Drop",
            price: hero.price,
            originalPrice: hero.originalPrice || hero.price + 500,
            image: hero.image,
            features: ["Long-lasting fragrance", "Premium ingredients", "Elegant packaging", "Free shipping"],
          })
        }

        logger.success("Homepage data loaded", { productsCount: products.length }, "HomePage")
      }
    } catch (error) {
      logger.error("Failed to load homepage data", error, "HomePage")
      // Set fallback data
      setFeaturedProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      toast.error("Please login to add items to cart")
      return
    }

    setAddingToCart(productId)
    logger.userAction("add_to_cart_attempt", { productId }, "HomePage")

    try {
      await addToCart(productId, 1)
      toast.success("Added to cart successfully!")
      logger.success("Product added to cart", { productId }, "HomePage")
    } catch (error) {
      toast.error("Failed to add to cart")
      logger.error("Add to cart failed", error, "HomePage")
    } finally {
      setAddingToCart(null)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,0,0,0.05),transparent_50%)]" />

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Badge className="bg-black text-white px-4 py-2 text-sm font-medium">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Premium Collection
                  </Badge>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="text-5xl lg:text-7xl font-light text-gray-900 leading-tight"
                >
                  Discover Your
                  <span className="block font-normal bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Signature Scent
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="text-xl text-gray-600 max-w-lg leading-relaxed"
                >
                  Explore our curated collection of premium fragrances from world-renowned brands. Find the perfect
                  scent that defines your unique personality.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link href="/products">
                  <Button size="lg" className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg">
                    Shop Collection
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/gift-guide">
                  <Button size="lg" variant="outline" className="px-8 py-4 text-lg bg-transparent">
                    Gift Guide
                  </Button>
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="flex items-center gap-8 pt-8"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600">100% Authentic</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Free Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  <span className="text-sm text-gray-600">Premium Quality</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Product */}
            {heroProduct && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative"
              >
                <Card className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50">
                  <CardContent className="p-8">
                    <div className="aspect-square relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                      <Image
                        src={heroProduct.image || "/placeholder.svg"}
                        alt={heroProduct.name}
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-110"
                        priority
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-red-500 text-white">
                          Save ₹{heroProduct.originalPrice - heroProduct.price}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-2xl font-light text-gray-900">{heroProduct.name}</h3>
                        <p className="text-gray-600">{heroProduct.tagline}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-gray-900">₹{heroProduct.price.toLocaleString()}</span>
                        <span className="text-lg text-gray-500 line-through">
                          ₹{heroProduct.originalPrice.toLocaleString()}
                        </span>
                      </div>

                      <ul className="space-y-2">
                        {heroProduct.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-black rounded-full" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={() => handleAddToCart(heroProduct.id)}
                          disabled={addingToCart === heroProduct.id}
                          className="flex-1 bg-black text-white hover:bg-gray-800"
                        >
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          {addingToCart === heroProduct.id ? "Adding..." : "Add to Cart"}
                        </Button>
                        <Button variant="outline" size="icon">
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Sale Countdown */}
      <SaleCountdown />

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-light text-gray-900 mb-4">Featured Fragrances</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of premium fragrances, carefully curated for the discerning fragrance
              enthusiast.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-lg mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {featuredProducts.map((product, index) => (
                <motion.div key={product.id} variants={fadeInUp}>
                  <ProductCard
                    product={product}
                    onAddToCart={() => handleAddToCart(product.id)}
                    isAddingToCart={addingToCart === product.id}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/products">
              <Button size="lg" variant="outline" className="px-8 py-4 bg-transparent">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Brand Comparison */}
      <BrandComparison />

      {/* Discount Calculator */}
      <DiscountCalculator />

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-light text-gray-900 mb-4">Why Choose Fragransia™</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're committed to providing you with the finest fragrance experience, backed by our promise of
              authenticity and excellence.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Shield,
                title: "100% Authentic",
                description: "All our fragrances are sourced directly from authorized distributors and brands.",
              },
              {
                icon: Truck,
                title: "Fast & Free Shipping",
                description: "Enjoy free shipping on orders above ₹999 with express delivery options.",
              },
              {
                icon: Award,
                title: "Premium Quality",
                description: "Each fragrance is carefully inspected to ensure the highest quality standards.",
              },
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="text-center p-8 h-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="space-y-4">
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto space-y-8"
          >
            <h2 className="text-4xl lg:text-5xl font-light">Stay in the Loop</h2>
            <p className="text-xl text-gray-300">
              Be the first to know about new arrivals, exclusive offers, and fragrance tips.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <Button className="bg-white text-black hover:bg-gray-100 px-6 py-3">Subscribe</Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* Floating Components */}
      <WhatsAppChat />
      <NewsletterPopup />
      <CookieBanner />
    </div>
  )
}
