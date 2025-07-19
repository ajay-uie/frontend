"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CreditCard,
  Smartphone,
  Building,
  Banknote,
  Wallet,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react"

type PaymentMethod = "card" | "upi" | "netbanking" | "cod" | "wallet"

interface PaymentFormProps {
  selectedMethod: PaymentMethod
  onMethodChange: (method: PaymentMethod) => void
  onPaymentSubmit: (paymentData: any) => void
  loading: boolean
  orderTotal: number
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess: (paymentData: any) => Promise<void>;
  onError: (error: any) => void;
}

export default function PaymentForm({
  selectedMethod,
  onMethodChange,
  onPaymentSubmit,
  loading,
  orderTotal,
  customerInfo,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  })
  const [upiId, setUpiId] = useState("")
  const [selectedBank, setSelectedBank] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const paymentMethods = [
    {
      id: "card" as const,
      name: "Credit/Debit Card",
      description: "Pay securely with your card",
      icon: CreditCard,
      processingFee: 0,
    },
    {
      id: "upi" as const,
      name: "UPI",
      description: "Pay with Google Pay, PhonePe, Paytm",
      icon: Smartphone,
      processingFee: 0,
    },
    {
      id: "netbanking" as const,
      name: "Net Banking",
      description: "Pay directly from your bank account",
      icon: Building,
      processingFee: 0,
    },
    {
      id: "cod" as const,
      name: "Cash on Delivery",
      description: "Pay when you receive your order",
      icon: Banknote,
      processingFee: 50,
    },
    {
      id: "wallet" as const,
      name: "Digital Wallet",
      description: "Pay with Paytm, Amazon Pay, etc.",
      icon: Wallet,
      processingFee: 0,
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

  const validateCardData = () => {
    const newErrors: Record<string, string> = {}

    if (!cardData.number || cardData.number.replace(/\s/g, "").length < 16) {
      newErrors.number = "Please enter a valid card number"
    }

    if (!cardData.expiry || !/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
      newErrors.expiry = "Please enter expiry in MM/YY format"
    }

    if (!cardData.cvv || cardData.cvv.length < 3) {
      newErrors.cvv = "Please enter a valid CVV"
    }

    if (!cardData.name.trim()) {
      newErrors.name = "Please enter cardholder name"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateUPI = () => {
    const newErrors: Record<string, string> = {}

    if (!upiId || !upiId.includes("@")) {
      newErrors.upi = "Please enter a valid UPI ID"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateNetBanking = () => {
    const newErrors: Record<string, string> = {}

    if (!selectedBank) {
      newErrors.bank = "Please select your bank"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCardNumberChange = (value: string) => {
    // Format card number with spaces
    const formatted = value
      .replace(/\s/g, "")
      .replace(/(.{4})/g, "$1 ")
      .trim()
      .slice(0, 19)
    setCardData({ ...cardData, number: formatted })
  }

  const handleExpiryChange = (value: string) => {
    // Format expiry as MM/YY
    const formatted = value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .slice(0, 5)
    setCardData({ ...cardData, expiry: formatted })
  }

  const handleSubmit = () => {
    let isValid = false

    switch (selectedMethod) {
      case "card":
        isValid = validateCardData()
        break
      case "upi":
        isValid = validateUPI()
        break
      case "netbanking":
        isValid = validateNetBanking()
        break
      case "cod":
      case "wallet":
        isValid = true
        break
    }

    if (isValid) {
      const paymentData = {
        method: selectedMethod,
        ...(selectedMethod === "card" && { card: cardData }),
        ...(selectedMethod === "upi" && { upiId }),
        ...(selectedMethod === "netbanking" && { bank: selectedBank }),
      }

      onPaymentSubmit(paymentData)
    }
  }

  const selectedMethodData = paymentMethods.find((method) => method.id === selectedMethod)
  const totalWithFees = orderTotal + (selectedMethodData?.processingFee || 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Method
        </CardTitle>
        <CardDescription>Choose your preferred payment method</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Method Selection */}
        <RadioGroup value={selectedMethod} onValueChange={onMethodChange}>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center space-x-3">
                <RadioGroupItem value={method.id} id={method.id} />
                <Label
                  htmlFor={method.id}
                  className="flex items-center gap-3 cursor-pointer flex-1 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  {method.icon && <method.icon className="w-5 h-5 text-gray-600" />}
                  <div className="flex-1">
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-gray-600">{method.description}</div>
                  </div>
                  {method.processingFee > 0 && <div className="text-sm text-gray-500">+₹{method.processingFee}</div>}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>

        <Separator />

        {/* Payment Method Forms */}
        {selectedMethod === "card" && (
          <div className="space-y-4">
            <h3 className="font-medium">Card Details</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardData.number}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  className={errors.number ? "border-red-500" : ""}
                />
                {errors.number && <p className="text-sm text-red-600 mt-1">{errors.number}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={cardData.expiry}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    className={errors.expiry ? "border-red-500" : ""}
                  />
                  {errors.expiry && <p className="text-sm text-red-600 mt-1">{errors.expiry}</p>}
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.slice(0, 4) })}
                    className={errors.cvv ? "border-red-500" : ""}
                  />
                  {errors.cvv && <p className="text-sm text-red-600 mt-1">{errors.cvv}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  placeholder="John Doe"
                  value={cardData.name}
                  onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
              </div>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <Shield className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Your card details are encrypted and secure. We use industry-standard SSL encryption.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {selectedMethod === "upi" && (
          <div className="space-y-4">
            <h3 className="font-medium">UPI Details</h3>
            <div>
              <Label htmlFor="upiId">UPI ID</Label>
              <Input
                id="upiId"
                placeholder="yourname@paytm"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className={errors.upi ? "border-red-500" : ""}
              />
              {errors.upi && <p className="text-sm text-red-600 mt-1">{errors.upi}</p>}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Supported apps:</span>
              <div className="flex items-center gap-2">
                <span>📱 Google Pay</span>
                <span>📱 PhonePe</span>
                <span>📱 Paytm</span>
                <span>📱 BHIM</span>
              </div>
            </div>
          </div>
        )}

        {selectedMethod === "netbanking" && (
          <div className="space-y-4">
            <h3 className="font-medium">Select Your Bank</h3>
            <RadioGroup value={selectedBank} onValueChange={setSelectedBank}>
              <div className="grid grid-cols-2 gap-2">
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
            {errors.bank && <p className="text-sm text-red-600 mt-1">{errors.bank}</p>}
          </div>
        )}

        {selectedMethod === "cod" && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="space-y-2">
                <p>Cash on Delivery - Pay when you receive your order</p>
                <p className="text-sm">
                  • Additional ₹50 processing fee applies
                  <br />• Please keep exact change ready
                  <br />• COD available for orders up to ₹50,000
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {selectedMethod === "wallet" && (
          <div className="space-y-4">
            <h3 className="font-medium">Digital Wallet</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-12 flex items-center gap-2 bg-transparent">
                <span>💰</span>
                Paytm Wallet
              </Button>
              <Button variant="outline" className="h-12 flex items-center gap-2 bg-transparent">
                <span>🛒</span>
                Amazon Pay
              </Button>
              <Button variant="outline" className="h-12 flex items-center gap-2 bg-transparent">
                <span>📱</span>
                PhonePe Wallet
              </Button>
              <Button variant="outline" className="h-12 flex items-center gap-2 bg-transparent">
                <span>💳</span>
                Mobikwik
              </Button>
            </div>
          </div>
        )}

        <Separator />

        {/* Order Total with Fees */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Order Total</span>
            <span>₹{orderTotal.toLocaleString()}</span>
          </div>
          {selectedMethodData?.processingFee && selectedMethodData.processingFee > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Processing Fee</span>
              <span>₹{selectedMethodData.processingFee}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-semibold pt-2 border-t">
            <span>Total Amount</span>
            <span>₹{totalWithFees.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Button */}
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 py-3 text-lg font-medium"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing Payment...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Pay ₹{totalWithFees.toLocaleString()}
            </div>
          )}
        </Button>

        {/* Security Notice */}
        <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
          <Shield className="w-3 h-3" />
          <span>Your payment information is secure and encrypted</span>
        </div>
      </CardContent>
    </Card>
  )
}


