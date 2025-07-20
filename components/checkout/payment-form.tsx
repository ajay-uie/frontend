"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CreditCard, Smartphone, Building2, Wallet, Truck, Shield, Info } from "lucide-react"
import { toast } from "sonner"
import { useCart } from "@/contexts/new-cart-context"
import { useAuth } from "@/contexts/new-auth-context"
import { paymentService } from "@/lib/payment-service"
import { PAYMENT_CONFIG } from "@/lib/constants"
import logger from "@/utils/logger"

interface PaymentFormProps {
  orderData: {
    items: any[]
    subtotal: number
    shipping: number
    tax: number
    total: number
    shippingAddress: any
  }
  onSuccess: (paymentData: any) => void
  onError: (error: string) => void
}

type PaymentMethod = "card" | "upi" | "netbanking" | "wallet" | "cod"

interface PaymentMethodOption {
  id: PaymentMethod
  name: string
  icon: any
  description: string
  processingFee: number
  feeType: "percentage" | "fixed"
  available: boolean
}

export function PaymentForm({ orderData, onSuccess, onError }: PaymentFormProps) {
  const { user } = useAuth()
  const { clearCart } = useCart()
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingFee, setProcessingFee] = useState(0)
  const [finalTotal, setFinalTotal] = useState(orderData.total)

  // Payment method form states
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  })
  const [upiId, setUpiId] = useState("")
  const [selectedBank, setSelectedBank] = useState("")
  const [selectedWallet, setSelectedWallet] = useState("")

  const paymentMethods: PaymentMethodOption[] = [
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: CreditCard,
      description: "Visa, Mastercard, RuPay",
      processingFee: PAYMENT_CONFIG.PROCESSING_FEES.CARD,
      feeType: "percentage",
      available: true,
    },
    {
      id: "upi",
      name: "UPI",
      icon: Smartphone,
      description: "Google Pay, PhonePe, Paytm",
      processingFee: PAYMENT_CONFIG.PROCESSING_FEES.UPI,
      feeType: "percentage",
      available: true,
    },
    {
      id: "netbanking",
      name: "Net Banking",
      icon: Building2,
      description: "All major banks",
      processingFee: PAYMENT_CONFIG.PROCESSING_FEES.NET_BANKING,
      feeType: "percentage",
      available: true,
    },
    {
      id: "wallet",
      name: "Wallet",
      icon: Wallet,
      description: "Paytm, PhonePe, Amazon Pay",
      processingFee: PAYMENT_CONFIG.PROCESSING_FEES.WALLET,
      feeType: "percentage",
      available: true,
    },
    {
      id: "cod",
      name: "Cash on Delivery",
      icon: Truck,
      description: "Pay when you receive",
      processingFee: PAYMENT_CONFIG.PROCESSING_FEES.COD,
      feeType: "fixed",
      available: orderData.total <= PAYMENT_CONFIG.LIMITS.COD_LIMIT,
    },
  ]

  const banks = [
    "State Bank of India",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "Kotak Mahindra Bank",
    "Punjab National Bank",
    "Bank of Baroda",
    "Canara Bank",
  ]

  const wallets = ["Paytm", "PhonePe", "Amazon Pay", "Mobikwik", "Freecharge"]

  // Calculate processing fee when payment method changes
  useEffect(() => {
    const method = paymentMethods.find((m) => m.id === selectedMethod)
    if (method) {
      const fee =
        method.feeType === "percentage" ? (orderData.total * method.processingFee) / 100 : method.processingFee

      setProcessingFee(fee)
      setFinalTotal(orderData.total + fee)
    }
  }, [selectedMethod, orderData.total])

  const validateCardData = (): boolean => {
    if (!cardData.number || cardData.number.length < 16) {
      toast.error("Please enter a valid card number")
      return false
    }
    if (!cardData.expiry || !/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
      toast.error("Please enter expiry in MM/YY format")
      return false
    }
    if (!cardData.cvv || cardData.cvv.length < 3) {
      toast.error("Please enter a valid CVV")
      return false
    }
    if (!cardData.name.trim()) {
      toast.error("Please enter cardholder name")
      return false
    }
    return true
  }

  const validateUPI = (): boolean => {
    if (!upiId || !upiId.includes("@")) {
      toast.error("Please enter a valid UPI ID")
      return false
    }
    return true
  }

  const validateNetBanking = (): boolean => {
    if (!selectedBank) {
      toast.error("Please select a bank")
      return false
    }
    return true
  }

  const validateWallet = (): boolean => {
    if (!selectedWallet) {
      toast.error("Please select a wallet")
      return false
    }
    return true
  }

  const validatePaymentMethod = (): boolean => {
    switch (selectedMethod) {
      case "card":
        return validateCardData()
      case "upi":
        return validateUPI()
      case "netbanking":
        return validateNetBanking()
      case "wallet":
        return validateWallet()
      case "cod":
        return true
      default:
        return false
    }
  }

  const handlePayment = async () => {
    if (!user) {
      toast.error("Please log in to continue")
      return
    }

    if (!validatePaymentMethod()) {
      return
    }

    setIsProcessing(true)
    logger.info("Payment process started", { method: selectedMethod, total: finalTotal }, "Payment")

    try {
      // Prepare payment data
      const paymentData = {
        method: selectedMethod,
        amount: finalTotal,
        currency: PAYMENT_CONFIG.RAZORPAY.CURRENCY,
        orderData,
        paymentDetails: {
          ...(selectedMethod === "card" && { card: cardData }),
          ...(selectedMethod === "upi" && { upiId }),
          ...(selectedMethod === "netbanking" && { bank: selectedBank }),
          ...(selectedMethod === "wallet" && { wallet: selectedWallet }),
        },
      }

      if (selectedMethod === "cod") {
        // Handle COD order
        const result = await paymentService.createCODOrder(paymentData)
        if (result.success) {
          logger.success("COD order created successfully", result.data, "Payment")
          await clearCart()
          onSuccess(result.data)
          toast.success("Order placed successfully! You can pay when you receive the order.")
        } else {
          throw new Error(result.error || "Failed to create COD order")
        }
      } else {
        // Handle online payment
        const result = await paymentService.processPayment(paymentData)
        if (result.success) {
          logger.success("Payment processed successfully", result.data, "Payment")
          await clearCart()
          onSuccess(result.data)
          toast.success("Payment successful! Your order has been placed.")
        } else {
          throw new Error(result.error || "Payment failed")
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Payment failed"
      logger.error("Payment process failed", { error: errorMessage, method: selectedMethod }, "Payment")
      onError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`
    }
    return v
  }

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Select Payment Method
          </CardTitle>
          <CardDescription>
            Choose your preferred payment method. All payments are secured with SSL encryption.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as PaymentMethod)}>
            <div className="grid gap-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="relative">
                  <div
                    className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedMethod === method.id ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"
                    } ${!method.available ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <RadioGroupItem value={method.id} id={method.id} disabled={!method.available} />
                    <method.icon className="h-5 w-5" />
                    <div className="flex-1">
                      <Label htmlFor={method.id} className="font-medium cursor-pointer">
                        {method.name}
                      </Label>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                    {method.processingFee > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {method.feeType === "percentage" ? `${method.processingFee}%` : `₹${method.processingFee}`} fee
                      </Badge>
                    )}
                    {!method.available && (
                      <Badge variant="destructive" className="text-xs">
                        Not Available
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Payment Method Forms */}
      {selectedMethod === "card" && (
        <Card>
          <CardHeader>
            <CardTitle>Card Details</CardTitle>
            <CardDescription>Enter your card information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardData.number}
                onChange={(e) => setCardData({ ...cardData, number: formatCardNumber(e.target.value) })}
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={cardData.expiry}
                  onChange={(e) => setCardData({ ...cardData, expiry: formatExpiry(e.target.value) })}
                  maxLength={5}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cardData.cvv}
                  onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, "") })}
                  maxLength={4}
                  type="password"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                placeholder="John Doe"
                value={cardData.name}
                onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {selectedMethod === "upi" && (
        <Card>
          <CardHeader>
            <CardTitle>UPI Details</CardTitle>
            <CardDescription>Enter your UPI ID</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="upiId">UPI ID</Label>
              <Input id="upiId" placeholder="yourname@paytm" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
            </div>
          </CardContent>
        </Card>
      )}

      {selectedMethod === "netbanking" && (
        <Card>
          <CardHeader>
            <CardTitle>Net Banking</CardTitle>
            <CardDescription>Select your bank</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedBank} onValueChange={setSelectedBank}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {banks.map((bank) => (
                  <div key={bank} className="flex items-center space-x-2">
                    <RadioGroupItem value={bank} id={bank} />
                    <Label htmlFor={bank} className="text-sm cursor-pointer">
                      {bank}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {selectedMethod === "wallet" && (
        <Card>
          <CardHeader>
            <CardTitle>Wallet</CardTitle>
            <CardDescription>Select your wallet</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedWallet} onValueChange={setSelectedWallet}>
              <div className="grid grid-cols-2 gap-2">
                {wallets.map((wallet) => (
                  <div key={wallet} className="flex items-center space-x-2">
                    <RadioGroupItem value={wallet} id={wallet} />
                    <Label htmlFor={wallet} className="text-sm cursor-pointer">
                      {wallet}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {selectedMethod === "cod" && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You can pay in cash when your order is delivered. A processing fee of ₹{PAYMENT_CONFIG.PROCESSING_FEES.COD}{" "}
            will be added.
          </AlertDescription>
        </Alert>
      )}

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{orderData.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>₹{orderData.shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>₹{orderData.tax.toFixed(2)}</span>
          </div>
          {processingFee > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Processing Fee</span>
              <span>₹{processingFee.toFixed(2)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>₹{finalTotal.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Button */}
      <Button onClick={handlePayment} disabled={isProcessing} className="w-full h-12 text-lg" size="lg">
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            {selectedMethod === "cod" ? "Place Order" : "Pay Now"} - ₹{finalTotal.toFixed(2)}
          </>
        )}
      </Button>

      {/* Security Notice */}
      <div className="text-center text-sm text-gray-600">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="h-4 w-4" />
          <span>Secured by SSL encryption</span>
        </div>
        <p>Your payment information is safe and secure</p>
      </div>
    </div>
  )
}
