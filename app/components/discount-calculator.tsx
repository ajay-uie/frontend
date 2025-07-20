"use client"

import { useState, useEffect } from "react"
import { Calculator, Tag, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DiscountCalculatorProps {
  cartTotal: number
  onDiscountApplied: (discount: { code: string; amount: number; percentage: number }) => void
  appliedDiscount?: { code: string; amount: number; percentage: number } | null
}

export default function DiscountCalculator({ cartTotal, onDiscountApplied, appliedDiscount }: DiscountCalculatorProps) {
  const [discountCode, setDiscountCode] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [copiedCode, setCopiedCode] = useState("")

  const discountCodes = [
    {
      code: "FIRST15",
      discount: 15,
      description: "15% off on first order",
      minOrder: 1000,
      maxDiscount: 1000,
    },
    {
      code: "LUXURY20",
      discount: 20,
      description: "20% off on orders above ₹3000",
      minOrder: 3000,
      maxDiscount: 2000,
    },
    {
      code: "PREMIUM25",
      discount: 25,
      description: "25% off on orders above ₹5000",
      minOrder: 5000,
      maxDiscount: 3000,
    },
    {
      code: "WELCOME10",
      discount: 10,
      description: "10% off - Welcome offer",
      minOrder: 500,
      maxDiscount: 500,
    },
  ]

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(""), 2000)
  }

  const applyDiscount = () => {
    setError("")
    setSuccess("")

    if (appliedDiscount) {
      setError("Only one discount code can be applied at a time")
      return
    }

    if (!discountCode.trim()) {
      setError("Please enter a discount code")
      return
    }

    const code = discountCodes.find((c) => c.code.toLowerCase() === discountCode.toLowerCase())

    if (!code) {
      setError("Invalid discount code")
      return
    }

    if (cartTotal < code.minOrder) {
      setError(`Minimum order of ₹${code.minOrder.toLocaleString()} required for this code`)
      return
    }

    const discountAmount = Math.min((cartTotal * code.discount) / 100, code.maxDiscount)

    onDiscountApplied({
      code: code.code,
      amount: discountAmount,
      percentage: code.discount,
    })

    setSuccess(`${code.code} applied! You saved ₹${discountAmount.toLocaleString()}`)
    setDiscountCode("")
  }

  const removeDiscount = () => {
    onDiscountApplied({ code: "", amount: 0, percentage: 0 })
    setSuccess("")
    setError("")
  }

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("")
        setSuccess("")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="w-4 h-4 text-gray-600" />
        <h3 className="font-medium text-gray-900">Apply Discount Code</h3>
      </div>

      {!appliedDiscount ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Enter discount code"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              className="flex-1"
              onKeyPress={(e) => e.key === "Enter" && applyDiscount()}
            />
            <Button onClick={applyDiscount} className="bg-black text-white hover:bg-gray-800">
              Apply
            </Button>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          {/* Available Codes */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium">Available Codes:</p>
            <div className="grid grid-cols-1 gap-2">
              {discountCodes.map((code) => (
                <div
                  key={code.code}
                  className={`flex items-center justify-between p-2 rounded border text-xs ${
                    cartTotal >= code.minOrder
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Tag className="w-3 h-3" />
                    <button
                      onClick={() => copyToClipboard(code.code)}
                      className="font-mono font-bold hover:underline flex items-center gap-1"
                    >
                      {code.code}
                      {copiedCode === code.code ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    <span>{code.description}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{code.discount}% OFF</div>
                    <div className="text-xs opacity-75">Min: ₹{code.minOrder.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-green-600" />
              <div>
                <p className="font-medium text-green-800">{appliedDiscount.code} Applied</p>
                <p className="text-sm text-green-600">
                  {appliedDiscount.percentage}% off - You saved ₹{appliedDiscount.amount.toLocaleString()}
                </p>
              </div>
            </div>
            <Button
              onClick={removeDiscount}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
            >
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
