"use client"

import { ShoppingBag, Tag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  size?: string
}

interface CouponData {
  code: string
  discount: number
  type: "percentage" | "fixed"
  description: string
}

interface OrderSummaryProps {
  items: CartItem[]
  subtotal: number
  discount: number
  shippingCost: number
  appliedCoupon: CouponData | null
  total: number
}

export default function OrderSummary({
  items,
  subtotal,
  discount,
  shippingCost,
  appliedCoupon,
  total,
}: OrderSummaryProps) {
  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          Order Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <Badge
                  variant="secondary"
                  className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
                >
                  {item.quantity}
                </Badge>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-900 truncate">{item.name}</h4>
                {item.size && <p className="text-xs text-gray-500">{item.size}</p>}
              </div>
              <div className="text-sm font-medium text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal ({items.length} items)</span>
            <span className="text-gray-900">₹{subtotal.toLocaleString()}</span>
          </div>

          {appliedCoupon && discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                Coupon ({appliedCoupon.code})
              </span>
              <span className="text-green-600">-₹{discount.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="text-gray-900">{shippingCost === 0 ? "FREE" : `₹${shippingCost.toLocaleString()}`}</span>
          </div>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between text-lg font-semibold">
          <span className="text-gray-900">Total</span>
          <span className="text-gray-900">₹{total.toLocaleString()}</span>
        </div>

        {/* Savings */}
        {discount > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800 font-medium">
              You're saving ₹{discount.toLocaleString()} on this order!
            </p>
          </div>
        )}

        {/* Delivery Info */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">
            All prices include applicable taxes. Free shipping on orders above ₹2,000.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
