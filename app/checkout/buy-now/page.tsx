"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, CreditCard, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import Navigation from "../../components/navigation"
import Footer from "@/components/footer"
import { AuthModal } from "@/components/auth/auth-modal"
import AddressSelector from "@/components/checkout/address-selector"
import PaymentForm from "@/components/checkout/payment-form"
import { useAuth } from "@/contexts/auth-context"
import api from "@/lib/api";
import Link from "next/link";
import { backendApi, Address } from "@/lib/backend-api-enhanced";

interface BuyNowProduct {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  size: string
  quantity: number
}

export default function BuyNowCheckoutPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [product, setProduct] = useState<BuyNowProduct | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"card" | "upi" | "netbanking" | "cod" | "wallet">("card")

  // Address state
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])

  useEffect(() => {
    // Load product from session storage
    const productData = sessionStorage.getItem("buy_now_product")
    if (productData) {
      setProduct(JSON.parse(productData))
    } else {
      router.push("/products")
      return
    }

    if (!user) {
      setShowAuthModal(true)
      return
    }

    // Load user addresses
    loadUserAddresses()
  }, [user])

  const loadUserAddresses = async () => {
    try {
      const response = await backendApi.getUserAddresses(); // Corrected API call
      if (response.success && response.data) {
        setAddresses(response.data);
        const defaultAddress = response.data.find((addr: Address) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        }
      }
    } catch (error) {
      console.error("Failed to load addresses:", error)
    }
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!selectedAddress) {
          setError("Please select or add a delivery address to continue.")
          return false
        }
        // Removed country and type from validation as they are now optional in the Address interface
        if (
          !selectedAddress.name ||
          !selectedAddress.phone ||
          !selectedAddress.address ||
          !selectedAddress.city ||
          !selectedAddress.state ||
          !selectedAddress.pincode
        ) {
          setError("Please ensure all address fields are complete.")
          return false
        }
        break
      case 2:
        if (!selectedAddress) {
          setError("Please complete address selection before proceeding to payment.")
          return false
        }
        break
    }
    setError("")
    return true
  }

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePaymentSuccess = async (paymentData: any) => {
    if (!product || !selectedAddress) {
      setError("Missing required information. Please complete all steps.")
      return
    }

    setLoading(true)

    try {
      // First verify payment if it\"s Razorpay
      if (paymentData.method === "razorpay") {
        const verificationResponse = await api.payments.verify(paymentData)
        if (!verificationResponse.success) {
          throw new Error("Payment verification failed")
        }
      }

      // Create order
      const orderData = {
        items: [
          {
            productId: product.id,
            quantity: product.quantity,
            price: product.price,
          },
        ],
        shippingAddress: selectedAddress,
        shippingOption: { id: "standard", name: "Standard Delivery", price: 0 },
        coupon: null,
        paymentData,
        total: product.price * product.quantity,
      }

      const response = await api.orders.create(orderData)

      if (response.success && response.data) {
        // Clear session storage
        sessionStorage.removeItem("buy_now_product")
        router.push(`/order-confirmation/${response.data.id}`)
      } else {
        throw new Error("Failed to create order")
      }
    } catch (error) {
      setError("Failed to process order. Please contact support.")
      console.error("Order creation error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentError = (error: any) => {
    setError("Payment failed. Please try again.")
    console.error("Payment error:", error)
  }

  const steps = [
    { number: 1, title: "Address", icon: MapPin },
    { number: 2, title: "Payment", icon: CreditCard },
  ]

  if (!product) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/product/${product.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Product
            </Button>
          </Link>
          <h1 className="text-2xl font-light text-gray-900">Buy Now Checkout</h1>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Steps */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                          currentStep >= step.number
                            ? "bg-black text-white border-black"
                            : "bg-white text-gray-400 border-gray-300"
                        }`}
                      >
                        {currentStep > step.number ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <step.icon className="w-5 h-5" />
                        )}
                      </div>
                      <span
                        className={`ml-3 text-sm font-medium ${
                          currentStep >= step.number ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {step.title}
                      </span>
                      {index < steps.length - 1 && (
                        <div className={`w-16 h-px mx-4 ${currentStep > step.number ? "bg-black" : "bg-gray-300"}`} />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step Content */}
            {currentStep === 1 && (
              <AddressSelector
                addresses={addresses}
                selectedAddress={selectedAddress}
                onAddressSelect={setSelectedAddress}
                onAddressAdd={(address) => {
                  setAddresses([...addresses, address])
                  setSelectedAddress(address)
                }}
              />
            )}

            {currentStep === 2 && selectedAddress && (
              <PaymentForm
                orderTotal={product.price * product.quantity}
                customerInfo={{
                  name: selectedAddress.name,
                  email: user?.email || "",
                  phone: selectedAddress.phone,
                }}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                selectedMethod={selectedPaymentMethod}
                onMethodChange={setSelectedPaymentMethod}
                onPaymentSubmit={handlePaymentSuccess}
                loading={loading}
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                variant="outline"
                disabled={loading}
              >
                Previous
              </Button>

              {currentStep < 2 ? (
                <Button onClick={handleNextStep} disabled={loading} className="bg-black text-white hover:bg-gray-800">
                  Continue
                </Button>
              ) : null}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your order details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Product Details */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">{product.size}</p>
                    <p className="text-sm text-gray-600">Qty: {product.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{product.price.toLocaleString()}</p>
                    {product.originalPrice && (
                      <p className="text-sm text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</p>
                    )}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">₹{(product.price * product.quantity).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">₹{(product.price * product.quantity).toLocaleString()}</span>
                  </div>
                </div>

                {/* Security Info */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-green-800 font-medium mb-1">Secure Checkout</p>
                  <p className="text-xs text-green-700">
                    Your payment information is encrypted and secure. Free shipping included.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false)
          if (!user) {
            router.push("/products")
          }
        }}
      />
    </div>
  )
}


