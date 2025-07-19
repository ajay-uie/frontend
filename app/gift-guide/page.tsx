"use client"

import { useState, useEffect } from "react"
import { Heart, Gift, Users, Briefcase, Calendar, Star, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Navigation from "../components/navigation"
import Footer from "../components/footer"
import WhatsAppChat from "../components/whatsapp-chat"
import ProductCard from "../components/product-card"
import { useCart } from "@/contexts/cart-context"
import api from "@/lib/api"
import Link from "next/link"

interface GiftSection {
  id: string
  title: string
  description: string
  icon: any
  products: Product[]
}

interface OccasionSection {
  id: string
  title: string
  description: string
  priceRange: string
  minPrice: number
  maxPrice: number
  products: Product[]
}

export default function GiftGuidePage() {
  const { addToCart } = useCart()
  const [loading, setLoading] = useState(true)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [giftSections, setGiftSections] = useState<GiftSection[]>([])
  const [occasionSections, setOccasionSections] = useState<OccasionSection[]>([])

  useEffect(() => {
    loadProductsAndGenerateGuide()
  }, [])

  const loadProductsAndGenerateGuide = async () => {
    try {
      setLoading(true)
      const response = await api.products.getAll()

      if (response.success && response.data) {
        const products = response.data.products
        setAllProducts(products)

        // Generate gift sections dynamically
        generateGiftSections(products)
        generateOccasionSections(products)
      }
    } catch (error) {
      console.error("Failed to load products for gift guide:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateGiftSections = (products: Product[]) => {
    const sections: GiftSection[] = [
      {
        id: "for-him",
        title: "For Him",
        description: "Sophisticated fragrances for the modern gentleman",
        icon: Users,
        products: filterProductsForHim(products),
      },
      {
        id: "for-her",
        title: "For Her",
        description: "Elegant and captivating scents for women",
        icon: Heart,
        products: filterProductsForHer(products),
      },
      {
        id: "couples",
        title: "Couples Set",
        description: "Perfect fragrance combinations for couples",
        icon: Gift,
        products: filterProductsForCouples(products),
      },
      {
        id: "corporate",
        title: "Corporate Gifts",
        description: "Professional and sophisticated choices",
        icon: Briefcase,
        products: filterProductsForCorporate(products),
      },
    ]

    setGiftSections(sections)
  }

  const generateOccasionSections = (products: Product[]) => {
    const occasions: OccasionSection[] = [
      {
        id: "birthday",
        title: "Birthday",
        description: "Celebrate with the perfect fragrance gift",
        priceRange: "₹3,000 - ₹8,000",
        minPrice: 3000,
        maxPrice: 8000,
        products: filterProductsByPriceRange(products, 3000, 8000),
      },
      {
        id: "anniversary",
        title: "Anniversary",
        description: "Romantic fragrances for special moments",
        priceRange: "₹5,000 - ₹15,000",
        minPrice: 5000,
        maxPrice: 15000,
        products: filterProductsByPriceRange(products, 5000, 15000),
      },
      {
        id: "wedding",
        title: "Wedding",
        description: "Luxurious scents for the big day",
        priceRange: "₹8,000 - ₹20,000",
        minPrice: 8000,
        maxPrice: 20000,
        products: filterProductsByPriceRange(products, 8000, 20000),
      },
      {
        id: "graduation",
        title: "Graduation",
        description: "Fresh starts deserve fresh fragrances",
        priceRange: "₹3,000 - ₹6,000",
        minPrice: 3000,
        maxPrice: 6000,
        products: filterProductsByPriceRange(products, 3000, 6000),
      },
    ]

    setOccasionSections(occasions)
  }

  // Filter functions for gift sections
  const filterProductsForHim = (products: Product[]): Product[] => {
    return products
      .filter((product) => {
        const name = product.name.toLowerCase()
        const category = product.category.toLowerCase()

        return (
          name.includes("leonardo") ||
          name.includes("gentleman") ||
          name.includes("him") ||
          category.includes("woody") ||
          category.includes("oriental") ||
          name.includes("masculine")
        )
      })
      .slice(0, 4)
  }

  const filterProductsForHer = (products: Product[]): Product[] => {
    return products
      .filter((product) => {
        const name = product.name.toLowerCase()
        const category = product.category.toLowerCase()

        return (
          name.includes("romance") ||
          name.includes("venetian") ||
          name.includes("sicilian") ||
          name.includes("her") ||
          category.includes("floral") ||
          category.includes("fresh") ||
          name.includes("feminine")
        )
      })
      .slice(0, 4)
  }

  const filterProductsForCouples = (products: Product[]): Product[] => {
    return products
      .filter((product) => {
        const name = product.name.toLowerCase()

        return (
          name.includes("duo") ||
          name.includes("couple") ||
          name.includes("his & hers") ||
          name.includes("anniversary") ||
          name.includes("romantic")
        )
      })
      .slice(0, 4)
  }

  const filterProductsForCorporate = (products: Product[]): Product[] => {
    return products
      .filter((product) => {
        const name = product.name.toLowerCase()

        return (
          name.includes("executive") ||
          name.includes("business") ||
          name.includes("elite") ||
          name.includes("corporate") ||
          product.price >= 5000 // Higher-end products for corporate gifts
        )
      })
      .slice(0, 4)
  }

  // Filter by price range for occasions
  const filterProductsByPriceRange = (products: Product[], minPrice: number, maxPrice: number): Product[] => {
    return products.filter((product) => product.price >= minPrice && product.price <= maxPrice).slice(0, 4)
  }

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      quantity: 1,
      size: product.size || "100ml",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-20 pb-16">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-4xl font-light text-gray-900 mb-8 text-center">Gift Guide</h1>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-lg aspect-square animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">The Perfect Gift Guide</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Discover the ideal fragrance for every person and occasion. Our curated selection makes gift-giving
              effortless and memorable.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="px-4 py-2">
                <Gift className="w-4 h-4 mr-2" />
                Premium Gift Wrapping
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                <Heart className="w-4 h-4 mr-2" />
                Personal Message
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                <Star className="w-4 h-4 mr-2" />
                Express Delivery
              </Badge>
            </div>
          </div>
        </section>

        {/* Gift by Recipient */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-light text-gray-900 mb-4">Shop by Recipient</h2>
              <p className="text-lg text-gray-600">Find the perfect fragrance for everyone on your list</p>
            </div>

            <div className="space-y-16">
              {giftSections.map((section) => (
                <div key={section.id} className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                      <section.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-light text-gray-900">{section.title}</h3>
                      <p className="text-gray-600">{section.description}</p>
                    </div>
                  </div>

                  {section.products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {section.products.map((product, index) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          index={index}
                          onAddToCart={() => handleAddToCart(product)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No products available in this category at the moment.</p>
                      <Link href="/products">
                        <Button variant="outline" className="mt-4 bg-transparent">
                          Browse All Products
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gift by Occasion */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-light text-gray-900 mb-4">Shop by Occasion</h2>
              <p className="text-lg text-gray-600">Celebrate life's special moments with the perfect fragrance</p>
            </div>

            <div className="space-y-16">
              {occasionSections.map((occasion) => (
                <div key={occasion.id} className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-light text-gray-900">{occasion.title}</h3>
                        <p className="text-gray-600">{occasion.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-white">
                      {occasion.priceRange}
                    </Badge>
                  </div>

                  {occasion.products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {occasion.products.map((product, index) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          index={index}
                          onAddToCart={() => handleAddToCart(product)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                      <p className="text-gray-500">No products available in this price range at the moment.</p>
                      <Link href="/products">
                        <Button variant="outline" className="mt-4 bg-transparent">
                          Browse All Products
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gift Services */}
        <section className="py-16 bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-light mb-4">Gift Services</h2>
              <p className="text-xl text-gray-300">Make your gift extra special with our premium services</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-medium mb-2">Premium Gift Wrapping</h3>
                <p className="text-gray-300">
                  Elegant packaging with luxury ribbons and personalized gift cards included at no extra cost.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-medium mb-2">Personal Message</h3>
                <p className="text-gray-300">
                  Add a heartfelt message with our beautiful greeting cards to make your gift more meaningful.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-medium mb-2">Express Delivery</h3>
                <p className="text-gray-300">
                  Same-day delivery available in select cities. Perfect for last-minute gift needs.
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link href="/products">
                <Button size="lg" className="bg-white text-black hover:bg-gray-100 px-8 py-4">
                  Start Shopping
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <WhatsAppChat />
      <Footer />
    </div>
  )
}
