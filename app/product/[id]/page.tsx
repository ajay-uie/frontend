"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Star,
  Heart,
  Share2,
  Clock,
  Droplets,
  MapPin,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Plus,
  Minus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context";
import api, { type Product } from "@/lib/api";
import { WishlistButton } from "@/components/wishlist/wishlist-button"
import { ReviewList } from "@/components/reviews/review-list"
import { ReviewForm } from "@/components/reviews/review-form"
import Navigation from "@/app/components/navigation"
import Footer from "@/app/components/footer"
import { CartPopup } from "@/app/components/cart-popup"
import WhatsAppChat from "@/app/components/whatsapp-chat"
import AddToCartAlert from "@/app/components/add-to-cart-alert"
import { reviewService, type ReviewStats } from "@/lib/review-service"
import { motion } from "framer-motion"
import Link from "next/link"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem, state } = useCart()
  const { user } = useAuth()

  // State management - Checkpoint 1: Product data fetching and display
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)

  // UI state - Checkpoint 2: Interactive image gallery and product selection
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState("100ml")

  // Cart and interaction state - Checkpoint 3: Cart integration
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [alertProduct, setAlertProduct] = useState<any>(null)

  // Review system state - Checkpoint 4: Review system integration
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0)

  // UI interaction state - Checkpoint 5: Advanced UI interactions
  const [expandedSections, setExpandedSections] = useState<string[]>(["description"])
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0)

  const productId = params.id as string

  // Product images with fallbacks
  const productImages = product
    ? [
        product.image,
        "/placeholder.svg?height=600&width=400",
        "/placeholder.svg?height=600&width=400",
        "/placeholder.svg?height=600&width=400",
      ]
    : []

  // Mock fragrance notes with visual design
  const fragranceNotes = [
    {
      type: "TOP",
      notes: product?.notes?.top || ["Pineapple", "Bergamot", "Black Currant", "Apple"],
      image: "/placeholder.svg?height=200&width=200",
      color: "from-yellow-400 to-orange-500",
    },
    {
      type: "MIDDLE",
      notes: product?.notes?.middle || ["Patchouli", "Rose", "Jasmine", "Birch"],
      image: "/placeholder.svg?height=200&width=200",
      color: "from-pink-400 to-rose-500",
    },
    {
      type: "BASE",
      notes: product?.notes?.base || ["Vanilla", "Musk", "Ambergris", "Oakmoss"],
      image: "/placeholder.svg?height=200&width=200",
      color: "from-purple-400 to-indigo-500",
    },
  ]

  // Checkpoint 1: Product data fetching and display
  useEffect(() => {
    if (productId) {
      fetchProduct()
      fetchRelatedProducts()
      loadReviewStats()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await api.products.getById(productId)
      if (response.success && response.data) {
        setProduct(response.data)
        if (response.data.size) {
          setSelectedSize(response.data.size)
        }
      } else {
        // Fallback to mock data for demo
        setProduct({
          id: productId,
          name: "LEONARDO'S SECRET",
          price: 1099,
          originalPrice: 1099,
          category: "Woody Aromatic",
          rating: 4.8,
          reviews: 127,
          size: "100ml",
          image: "/placeholder.svg?height=400&width=300",
          description:
            "A daring blend of ripe fruit & earthy intrigue, Leonardo's Secret is brilliance wrapped in mystery. This sophisticated fragrance opens with vibrant notes of pineapple and bergamot, creating an immediate sense of luxury and refinement.",
          notes: {
            top: ["Pineapple", "Bergamot", "Black Currant", "Apple"],
            middle: ["Patchouli", "Rose", "Jasmine", "Birch"],
            base: ["Vanilla", "Musk", "Ambergris", "Oakmoss"],
          },
          discount: 0,
          stock: 25,
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          mrp: "Rs. 1099",
          batchNo: "AF1098",
          dateOfMfg: "10.02.2025",
          ratePerMl: "Rs. 10.99",
          bestBefore: "36 Months",
          netVol: "100 ml | e 3.4 oz.",
          marketedBy: "Mahadev Enterprises, EP 61/BP.C Ghosh Road, Kolkata, West Bengal-700048 INDIA",
          customerCare: "+919433387574",
          customerSupportEmail: "care@fragransia.in",
        })
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      toast.error("Failed to load product")
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedProducts = async () => {
    try {
      const response = await apiClient.getProducts({ limit: 4 })
      if (response.success && response.data) {
        setRelatedProducts(response.data.products.filter((p) => p.id !== productId))
      }
    } catch (error) {
      console.error("Failed to fetch related products:", error)
    }
  }

  const loadReviewStats = async () => {
    try {
      const stats = await reviewService.getReviewStats(productId)
      setReviewStats(stats)
    } catch (error) {
      console.error("Error loading review stats:", error)
    }
  }

  // Checkpoint 3: Cart integration with quantity management
  const handleAddToCart = async () => {
    if (!product) return

    setIsAddingToCart(true)
    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: selectedSize,
        quantity: quantity,
      })

      setAlertProduct({
        ...product,
        selectedSize,
        quantity,
      })

      setTimeout(() => setAlertProduct(null), 4000)
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    if (!product) return

    if (!user) {
      toast.error("Please login to continue")
      return
    }

    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: selectedSize,
        quantity: quantity,
      })

      router.push("/checkout/buy-now")
    } catch (error) {
      toast.error("Failed to proceed to checkout")
    }
  }

  // Checkpoint 5: Advanced UI interactions
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Product link copied to clipboard!")
    }
  }

  const nextNote = () => {
    setCurrentNoteIndex((prev) => (prev + 1) % fragranceNotes.length)
  }

  const prevNote = () => {
    setCurrentNoteIndex((prev) => (prev - 1 + fragranceNotes.length) % fragranceNotes.length)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="aspect-[3/4] bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Product not found state
  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-900 mb-2">Product not found</h1>
          <Link href="/products">
            <Button className="bg-black text-white hover:bg-gray-800">Browse Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Expandable sections configuration
  const expandableSections = [
    {
      id: "description",
      title: "PRODUCT DESCRIPTION",
      content: product.description,
    },
    {
      id: "care",
      title: "CARE INSTRUCTIONS",
      content:
        "Store in a cool, dry place away from direct sunlight. Avoid extreme temperatures. Apply to pulse points for best longevity.",
    },
    {
      id: "details",
      title: "PRODUCT DETAILS",
      content: (
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>MRP:</strong> {product.mrp}</p>
          <p><strong>BATCH NO.:</strong> {product.batchNo}</p>
          <p><strong>DATE OF MFG:</strong> {product.dateOfMfg}</p>
          <p><strong>RATE PER ML:</strong> {product.ratePerMl}</p>
          <p><strong>Best Before:</strong> {product.bestBefore}</p>
          <p><strong>Net Vol.:</strong> {product.netVol}</p>
          <p><strong>Marketed by:</strong> {product.marketedBy}</p>
          <p><strong>Customer care executive:</strong> {product.customerCare}</p>
          <p><strong>For any feedback/ Customer Support, Please write to us at:</strong> {product.customerSupportEmail}</p>
        </div>
      ),
    },
    {
      id: "shipping",
      title: "SHIPPING & RETURNS",
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-gray-600" />
            <div>
              <div className="font-medium">Free Shipping</div>
              <div className="text-sm text-gray-600">On orders above ₹2000</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-600" />
            <div>
              <div className="font-medium">Secure Packaging</div>
              <div className="text-sm text-gray-600">Protected during transit</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Droplets className="w-5 h-5 text-gray-600" />
            <div>
              <div className="font-medium">No Returns Except Certain Conditions</div>
              <div className="text-sm text-gray-600">Please read our return policy</div>
            </div>
          </div>
        </div>
      ),
    },
  ]

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Promotional Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center text-sm font-medium">
            <div className="animate-pulse mr-2">🎉</div>
            <span>Limited Time Offer: Free Shipping on Orders Above ₹2,999</span>
            <div className="animate-pulse ml-2">🎉</div>
          </div>
        </div>
      </div>

      <div className="pt-8">
        {/* Product Detail Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Checkpoint 2: Interactive image gallery */}
            <div className="space-y-4">
              <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden relative">
                <img
                  src={productImages[selectedImage] || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <WishlistButton productId={product.id} />
                </div>
              </div>

              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? "border-black" : "border-transparent"
                    }`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {product.category.toUpperCase()}
                  </Badge>
                  <button
                    onClick={handleShare}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Share product"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">{product.name}</h1>

                {/* Rating and Reviews */}
                {reviewStats && reviewStats.totalReviews > 0 && (
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(reviewStats.averageRating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {reviewStats.averageRating.toFixed(1)} ({reviewStats.totalReviews} reviews)
                      </span>
                    </div>
                  </div>
                )}

                <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

                {/* Size Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Size</label>
                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-center">
                    <span className="font-medium text-gray-900">100ml - Premium Size</span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-3xl font-light text-gray-900">₹{product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                      <Badge variant="destructive" className="text-xs">
                        {discountPercentage}% OFF
                      </Badge>
                    </>
                  )}
                </div>

                {/* Quantity */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600 ml-4">{product.stock} in stock</span>
                  </div>
                </div>

                {/* Stock Status */}
                {product.stock !== undefined && (
                  <div className="mb-6">
                    <div className={`text-sm ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                      {product.stock > 0 ? (
                        <>
                          <span className="font-medium">In Stock</span>
                          {product.stock <= 10 && (
                            <span className="ml-2 text-orange-600">Only {product.stock} left!</span>
                          )}
                        </>
                      ) : (
                        <span className="font-medium">Out of Stock</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || product.stock === 0}
                    className="flex-1 bg-black text-white hover:bg-gray-800 py-3 text-lg"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {isAddingToCart ? "ADDING..." : product.stock === 0 ? "OUT OF STOCK" : "ADD TO CART"}
                  </Button>
                  <Button
                    onClick={handleBuyNow}
                    variant="outline"
                    disabled={product.stock === 0}
                    className="flex-1 border-black text-black hover:bg-black hover:text-white py-3 text-lg bg-transparent"
                  >
                    BUY NOW
                  </Button>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-4 py-6 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium">Cruelty Free</div>
                      <div className="text-xs text-gray-500">Not tested on animals</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium">Long Lasting</div>
                      <div className="text-xs text-gray-500">6-8 hour longevity</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Droplets className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium">Imported Oil</div>
                      <div className="text-xs text-gray-500">Premium quality oils</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium">Made in India</div>
                      <div className="text-xs text-gray-500">Proudly Indian</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fragrance Notes Carousel */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-light text-center mb-8">FRAGRANCE NOTES</h2>

            <div className="relative">
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <button onClick={prevNote} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <div className="text-center flex-1">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${fragranceNotes[currentNoteIndex].color} rounded-full mx-auto mb-4 flex items-center justify-center`}
                    >
                      <span className="text-white font-bold text-lg">{fragranceNotes[currentNoteIndex].type[0]}</span>
                    </div>
                    <h3 className="text-xl font-medium mb-2">{fragranceNotes[currentNoteIndex].type} NOTES</h3>
                    <p className="text-gray-600">{fragranceNotes[currentNoteIndex].notes.join(", ")}</p>
                  </div>

                  <button onClick={nextNote} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                {/* Mini Images Carousel */}
                <div className="flex justify-center gap-4">
                  {fragranceNotes[currentNoteIndex].notes.map((note, index) => (
                    <div key={index} className="text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full mb-2 overflow-hidden">
                        <img
                          src={`/placeholder.svg?height=48&width=48`}
                          alt={note}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs text-gray-600">{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 mt-6">
                {fragranceNotes.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentNoteIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentNoteIndex ? "bg-gray-800" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Expandable Sections */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {expandableSections.map((section) => (
                <div key={section.id} className="bg-white border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">{section.title}</span>
                    {expandedSections.includes(section.id) ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  {expandedSections.includes(section.id) && (
                    <div className="px-6 pb-6 text-gray-600">
                      {typeof section.content === "string" ? (
                        <div className="whitespace-pre-line">{section.content}</div>
                      ) : (
                        section.content
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Checkpoint 4: Reviews Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-light text-gray-900">Customer Reviews</h2>
              {user && (
                <Button onClick={() => setShowReviewForm(!showReviewForm)} variant="outline" className="gap-2">
                  <Star className="w-4 h-4" />
                  Write Review
                </Button>
              )}
            </div>

            {showReviewForm && (
              <div className="mb-8">
                <ReviewForm
                  productId={product.id}
                  onReviewSubmitted={() => {
                    setShowReviewForm(false)
                    setReviewRefreshTrigger((prev) => prev + 1)
                    loadReviewStats()
                  }}
                />
              </div>
            )}

            <ReviewList productId={product.id} refreshTrigger={reviewRefreshTrigger} />
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl font-light text-center mb-8"
              >
                YOU MAY ALSO LIKE
              </motion.h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {relatedProducts.map((relatedProduct, index) => (
                  <motion.div
                    key={relatedProduct.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="h-full"
                  >
                    <Link href={`/product/${relatedProduct.id}`} className="block h-full">
                      <div className="group cursor-pointer h-full">
                        <div className="relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200 h-full flex flex-col">
                          {relatedProduct.discount && relatedProduct.discount > 0 && (
                            <div className="absolute top-2 left-2 z-10">
                              <span className="bg-black text-white text-xs px-2 py-1 rounded">
                                {relatedProduct.discount}% OFF
                              </span>
                            </div>
                          )}

                          <div className="absolute top-2 right-2 z-10">
                            <WishlistButton productId={relatedProduct.id} />
                          </div>

                          <div className="aspect-square bg-gray-100 overflow-hidden">
                            <img
                              src={relatedProduct.image || "/placeholder.svg"}
                              alt={relatedProduct.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>

                          <div className="p-3 flex-1 flex flex-col">
                            <div className="text-xs text-gray-500 mb-1">100ml</div>
                            <h3 className="font-medium text-sm mb-1 leading-tight flex-1">{relatedProduct.name}</h3>
                            <div className="text-xs text-gray-600 mb-2 line-clamp-2">{relatedProduct.description}</div>

                            {relatedProduct.rating && (
                              <div className="flex items-center gap-1 mb-2">
                                <Star className="w-3 h-3 fill-gray-800 text-gray-800" />
                                <span className="text-xs text-gray-600">{relatedProduct.rating}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-2 mt-auto">
                              <span className="font-semibold text-sm">₹{relatedProduct.price.toLocaleString()}</span>
                              {relatedProduct.originalPrice && (
                                <span className="text-xs text-gray-400 line-through">
                                  ₹{relatedProduct.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      <Footer />
      <CartPopup isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <WhatsAppChat />
      <AddToCartAlert product={alertProduct} onClose={() => setAlertProduct(null)} />
    </div>
  )
}
