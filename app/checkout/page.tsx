"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  MapPin,
  Truck,
  CreditCard,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ShoppingBag,
  Tag,
  Calculator,
} from "lucide-react"
import Navigation from "../components/navigation"
import Footer from "../components/footer"
import AddressSelector from "@/components/checkout/address-selector"
import ShippingOptions from "@/components/checkout/shipping-options"
import PaymentForm from "@/components/checkout/payment-form"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import Link from "next/link"
import { api } from "@/lib/api";

// Import the auth modal component
import { AuthModal } from "@/components/auth/auth-modal"

// Define types

interface ShippingOption {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: string
  provider: string
}

interface Coupon {
  id: string
  code: string
  description: string
  discount: number
  type: "percentage" | "fixed"
  minOrderValue: number
}

type PaymentMethod = "card" | "upi" | "netbanking" | "cod" | "wallet"

const checkoutService = {
  checkMaintenanceMode: async () => {
    try {
      const response = await api.checkHealth();
      return { isMaintenanceMode: !response.success, message: response.error || "" };
    } catch (error) {
      return { isMaintenanceMode: true, message: "Backend API is unreachable." };
    }
  },

  getUserAddresses: async (userId: string) => {
    const response = await api.users.getAddresses(userId);
    if (response.success) {
      return response.data.addresses;
    } else {
      throw new Error(response.error);
    }
  },

  getShippingOptions: async (pincode: string, weight: number) => {
    const response = await api.shipping.getOptions(pincode, weight);
    if (response.success) {
      return response.data.options;
    } else {
      throw new Error(response.error);
    }
  },

  getAvailableCoupons: async (userId: string) => {
    const response = await api.coupons.getAll(userId);
    if (response.success) {
      return response.data.coupons;
    } else {
      throw new Error(response.error);
    }
  },

  applyCoupon: async (code: string, total: number) => {
    const response = await api.coupons.apply(code, total);
    if (response.success) {
      return { success: true, coupon: response.data.coupon };
    } else {
      return { success: false, error: response.error };
    }
  },

  calculateOrderSummary: (
    subtotal: number,
    shippingCost: number,
    coupon: Coupon | null,
    paymentMethod: PaymentMethod | null,
  ) => {
    let discount = 0;
    if (coupon) {
      if (coupon.type === "percentage") {
        discount = Math.round((subtotal * coupon.discount) / 100);
      } else {
        discount = coupon.discount;
      }
    }

    const gst = Math.round(((subtotal - discount) * 18) / 100);
    let processingFee = 0;

    if (paymentMethod === "cod") {
      processingFee = 50;
    } else if (paymentMethod === "card" || paymentMethod === "netbanking") {
      processingFee = 25;
    }

    const total = subtotal - discount + shippingCost + gst + processingFee;

    return {
      subtotal,
      discount,
      shippingCost,
      gst,
      processingFee,
      total,
    };
  },

  processPayment: async (amount: number, orderId: string, paymentMethod: PaymentMethod, customerInfo: any) => {
    const response = await api.payments.process({
      amount,
      orderId,
      paymentMethod,
      customerInfo,
    });
    if (response.success) {
      return { success: true, transactionId: response.data.transactionId };
    } else {
      return { success: false, error: response.error };
    }
  },

  createOrder: async (orderData: any) => {
    const response = await api.orders.create(orderData);
    if (response.success) {
      return { success: true, orderId: response.data.orderId };
    } else {
      return { success: false, error: response.error };
    }
  },
};

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()

  // Authentication state
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  // Checkout flow state
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  // Data state
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null)
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([])
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("card")

  // Form state
  const [couponCode, setCouponCode] = useState("")
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Check authentication and maintenance mode on mount
  useEffect(() => {
    const initializeCheckout = async () => {
      // Check maintenance mode
      const maintenanceCheck = await checkoutService.checkMaintenanceMode()
      if (maintenanceCheck.isMaintenanceMode) {
        setMaintenanceMode(true)
        toast.error(maintenanceCheck.message || "System is under maintenance")
        return
      }

      // Check if user is authenticated
      if (!user) {
        setShowAuthModal(true)
        return
      }

      // Check if cart has items
      if (items.length === 0) {
        toast.error("Your cart is empty")
        router.push("/products")
        return
      }

      // Initialize checkout data
      await loadCheckoutData()
    }

    initializeCheckout()
  }, [user, items, router])

  const loadCheckoutData = async () => {
    setIsLoading(true)

    try {
      // Load user addresses
      const userAddresses = await checkoutService.getUserAddresses(user!.id)
      setAddresses(userAddresses)

      // Set default address
      const defaultAddress = userAddresses.find((addr) => addr.isDefault) || userAddresses[0]
      if (defaultAddress) {
        setSelectedAddress(defaultAddress)
        await loadShippingOptions(defaultAddress.pincode)
      }

      // Load available coupons
      const coupons = await checkoutService.getAvailableCoupons(user!.id)
      setAvailableCoupons(coupons)
    } catch (error) {
      console.error("Failed to load checkout data:", error)
      toast.error("Failed to load checkout data")
    } finally {
      setIsLoading(false)
    }
  }

  const loadShippingOptions = async (pincode: string) => {
    try {
      const totalWeight = items.reduce((weight, item) => weight + item.quantity * 0.5, 0) // Assume 0.5kg per item
      const options = await checkoutService.getShippingOptions(pincode, totalWeight)
      setShippingOptions(options)

      // Set default shipping option (usually the cheapest)
      const defaultOption = options.find((opt) => opt.price === 0) || options[0]
      setSelectedShipping(defaultOption)
    } catch (error) {
      console.error("Failed to load shipping options:", error)
      toast.error("Failed to load shipping options")
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    setIsAuthenticating(false)
    // Reload checkout data after authentication
    loadCheckoutData()
  }

  const handleAddressSelect = async (address: Address) => {
    setSelectedAddress(address)
    await loadShippingOptions(address.pincode)
  }

  const handleAddressAdd = (address: Address) => {
    setAddresses((prev) => [...prev, address])
    setSelectedAddress(address)
    loadShippingOptions(address.pincode)
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code")
      return
    }

    setIsApplyingCoupon(true)

    try {
      const result = await checkoutService.applyCoupon(couponCode, total)

      if (result.success && result.coupon) {
        setAppliedCoupon(result.coupon)
        setCouponCode("")
        toast.success(`Coupon applied! You saved ₹${result.coupon.discount}`)
      } else {
        toast.error(result.error || "Invalid coupon code")
      }
    } catch (error) {
      console.error("Failed to apply coupon:", error)
      toast.error("Failed to apply coupon")
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    toast.success("Coupon removed")
  }

  const validateStep = (step: number): boolean => {
    const errors: string[] = []

    switch (step) {
      case 1: // Address validation
        if (!selectedAddress) {
          errors.push("Please select a delivery address")
        }
        break

      case 2: // Shipping validation
        if (!selectedShipping) {
          errors.push("Please select a shipping option")
        }
        break

      case 3: // Payment validation
        if (!selectedPayment) {
          errors.push("Please select a payment method")
        }
        break
    }

    setValidationErrors(errors)

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error))
      return false
    }

    return true
  }

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3))
      setValidationErrors([])
    }
  }

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    setValidationErrors([])
  }

  const calculateOrderSummary = () => {
    if (!selectedShipping) return null

    return checkoutService.calculateOrderSummary(total, selectedShipping.price, appliedCoupon, selectedPayment)
  }

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setSelectedPayment(method)
  }

  const handlePaymentSubmit = async (paymentData: any) => {
    if (!selectedAddress || !selectedShipping) {
      toast.error("Please complete all checkout steps")
      return
    }

    const summary = calculateOrderSummary()
    if (!summary) return

    setIsLoading(true)

    try {
      const checkoutData = {
        items: items.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        shippingAddress: selectedAddress,
        shippingOption: selectedShipping,
        paymentMethod: selectedPayment,
        coupon: appliedCoupon,
        summary,
      }

      // Process payment first
      const paymentResult = await checkoutService.processPayment(summary.total, `temp_${Date.now()}`, selectedPayment, {
        name: user!.name,
        email: user!.email,
        phone: selectedAddress.phone,
      })

      if (!paymentResult.success) {
        toast.error("Payment failed")
        return
      }

      // Create order after successful payment
      const orderResult = await checkoutService.createOrder(checkoutData)

      if (orderResult.success && orderResult.orderId) {
        clearCart()
        toast.success("Order placed successfully!")
        router.push(`/order-confirmation/${orderResult.orderId}`)
      } else {
        toast.error("Failed to create order")
      }
    } catch (error) {
      console.error("Order placement failed:", error)
      toast.error("Failed to place order")
    } finally {
      setIsLoading(false)
    }
  }

  // Maintenance mode screen
  if (maintenanceMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">System Maintenance</h1>
          <p className="text-gray-600 mb-6">
            We're currently performing maintenance to improve your experience. Please try again later.
          </p>
          <Link href="/">
            <Button className="bg-black text-white hover:bg-gray-800">Return to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Authentication required
  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="pt-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center">
                <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
                <p className="text-gray-600 mb-6">Please sign in to continue with your checkout.</p>
                <Button onClick={() => setShowAuthModal(true)} className="bg-black text-white hover:bg-gray-800">
                  Sign In to Continue
                </Button>
              </div>
            </div>
          </div>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={handleAuthSuccess} />
      </>
    )
  }

  const steps = [
    { number: 1, title: "Address", icon: MapPin },
    { number: 2, title: "Shipping", icon: Truck },
    { number: 3, title: "Payment", icon: CreditCard },
  ]

  const summary = calculateOrderSummary()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/cart">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Cart
                </Button>
              </Link>
              <h1 className="text-2xl font-light text-gray-900">Secure Checkout</h1>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
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
                    className={`ml-2 text-sm font-medium ${
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

            {/* Progress Bar */}
            <Progress value={(currentStep / 3) * 100} className="mb-6" />
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="space-y-1">
                  {validationErrors.map((error, index) => (
                    <div key={index}>• {error}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Address Selection */}
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Delivery Address
                    </CardTitle>
                    <CardDescription>Choose where you want your order delivered</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AddressSelector
                      addresses={addresses}
                      selectedAddress={selectedAddress}
                      onAddressSelect={handleAddressSelect}
                      onAddressAdd={handleAddressAdd}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Shipping Options */}
              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      Shipping Options
                    </CardTitle>
                    <CardDescription>Select your preferred delivery speed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ShippingOptions
                      options={shippingOptions}
                      selectedOption={selectedShipping}
                      onOptionSelect={setSelectedShipping}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && summary && (
                <PaymentForm
                  selectedMethod={selectedPayment}
                  onMethodChange={handlePaymentMethodChange}
                  onPaymentSubmit={handlePaymentSubmit}
                  loading={isLoading}
                  orderTotal={summary.total}
                />
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevStep} disabled={currentStep === 1 || isLoading}>
                  Previous
                </Button>

                {currentStep < 3 ? (
                  <Button onClick={handleNextStep} disabled={isLoading}>
                    Continue
                  </Button>
                ) : (
                  <div className="text-sm text-gray-600">Complete payment to place order</div>
                )}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="space-y-6">
              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex items-center gap-3">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-600">{item.size}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Coupon Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Tag className="w-5 h-5" />
                    Coupons & Offers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div>
                        <p className="font-medium text-green-800">{appliedCoupon.code}</p>
                        <p className="text-sm text-green-600">{appliedCoupon.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="text-green-600 hover:text-green-800"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <Button onClick={handleApplyCoupon} disabled={isApplyingCoupon} size="sm">
                          {isApplyingCoupon ? "Applying..." : "Apply"}
                        </Button>
                      </div>

                      {/* Available Coupons */}
                      {availableCoupons.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Available Offers:</p>
                          {availableCoupons.slice(0, 2).map((coupon) => (
                            <div
                              key={coupon.id}
                              className="p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50"
                              onClick={() => setCouponCode(coupon.code)}
                            >
                              <p className="font-medium text-sm">{coupon.code}</p>
                              <p className="text-xs text-gray-600">{coupon.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Price Breakdown */}
              {summary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calculator className="w-5 h-5" />
                      Price Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({items.length} items)</span>
                      <span>₹{summary.subtotal.toLocaleString()}</span>
                    </div>

                    {summary.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Coupon Discount</span>
                        <span>-₹{summary.discount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span>Shipping Charges</span>
                      <span>{summary.shippingCost === 0 ? "FREE" : `₹${summary.shippingCost.toLocaleString()}`}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>GST (18%)</span>
                      <span>₹{summary.gst.toLocaleString()}</span>
                    </div>

                    {summary.processingFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Processing Fee</span>
                        <span>₹{summary.processingFee.toLocaleString()}</span>
                      </div>
                    )}

                    <Separator />

                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total Amount</span>
                      <span>₹{summary.total.toLocaleString()}</span>
                    </div>

                    {summary.discount > 0 && (
                      <div className="text-sm text-green-600 text-center">
                        You saved ₹{summary.discount.toLocaleString()} on this order!
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
