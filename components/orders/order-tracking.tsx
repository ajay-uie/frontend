"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  ExternalLink,
  Phone,
  Mail,
} from "lucide-react"
import { shiprocketService } from "@/lib/shipping-service"
import { checkoutService } from "@/lib/checkout-service"
import { toast } from "sonner"

interface TrackingEvent {
  date: string
  status: string
  activity: string
  location: string
}

interface TrackingInfo {
  awbCode: string
  courierName: string
  currentStatus: string
  expectedDelivery?: string
  trackingEvents: TrackingEvent[]
  orderDetails?: {
    orderId: string
    orderDate: string
    items: Array<{
      name: string
      quantity: number
      price: number
    }>
    shippingAddress: {
      name: string
      address: string
      city: string
      state: string
      pincode: string
      phone: string
    }
  }
}

interface OrderTrackingProps {
  orderId?: string
  awbCode?: string
}

export default function OrderTracking({ orderId, awbCode }: OrderTrackingProps) {
  const [trackingInput, setTrackingInput] = useState(orderId || awbCode || "")
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (orderId || awbCode) {
      handleTrackOrder()
    }
  }, [orderId, awbCode])

  const handleTrackOrder = async () => {
    if (!trackingInput.trim()) {
      toast.error("Please enter Order ID or AWB Code")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Check if input is Order ID (starts with FR) or AWB Code
      const isOrderId = trackingInput.startsWith("FR")

      if (isOrderId) {
        // Get order details first
        const orderStatus = await checkoutService.getOrderStatus(trackingInput)

        if (orderStatus.error) {
          throw new Error(orderStatus.error)
        }

        if (orderStatus.trackingInfo) {
          setTrackingInfo({
            awbCode: orderStatus.trackingInfo.awb_code || "N/A",
            courierName: orderStatus.trackingInfo.courier_name || "Unknown",
            currentStatus: orderStatus.status,
            trackingEvents: orderStatus.trackingInfo.shipment_track_activities || [],
            expectedDelivery: calculateExpectedDelivery(orderStatus.trackingInfo.shipment_track_activities),
          })
        } else {
          // Fallback for orders without tracking info
          setTrackingInfo({
            awbCode: "Pending",
            courierName: "Processing",
            currentStatus: orderStatus.status,
            trackingEvents: [
              {
                date: new Date().toISOString(),
                status: orderStatus.status,
                activity: "Order confirmed and being processed",
                location: "Fulfillment Center",
              },
            ],
          })
        }
      } else {
        // Direct AWB tracking
        const trackingData = await shiprocketService.trackShipment(trackingInput)

        setTrackingInfo({
          awbCode: trackingInput,
          courierName: "Courier Partner",
          currentStatus: trackingData.tracking_data.shipment_status,
          trackingEvents: trackingData.tracking_data.shipment_track_activities || [],
          expectedDelivery: calculateExpectedDelivery(trackingData.tracking_data.shipment_track_activities),
        })
      }
    } catch (error) {
      console.error("Tracking error:", error)
      setError(error instanceof Error ? error.message : "Failed to track order")
      toast.error("Failed to track order")
    } finally {
      setLoading(false)
    }
  }

  const calculateExpectedDelivery = (events: TrackingEvent[]): string | undefined => {
    // Logic to calculate expected delivery based on tracking events
    const lastEvent = events?.[0]
    if (lastEvent && lastEvent.status.toLowerCase().includes("delivered")) {
      return "Delivered"
    }

    // Add 2-3 days from last update for estimation
    if (lastEvent) {
      const lastDate = new Date(lastEvent.date)
      lastDate.setDate(lastDate.getDate() + 2)
      return lastDate.toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }

    return undefined
  }

  const getStatusIcon = (status: string) => {
    const lowerStatus = status.toLowerCase()

    if (lowerStatus.includes("delivered")) {
      return <CheckCircle className="w-5 h-5 text-green-600" />
    } else if (lowerStatus.includes("out for delivery") || lowerStatus.includes("dispatched")) {
      return <Truck className="w-5 h-5 text-blue-600" />
    } else if (lowerStatus.includes("in transit") || lowerStatus.includes("shipped")) {
      return <Package className="w-5 h-5 text-orange-600" />
    } else if (lowerStatus.includes("picked up") || lowerStatus.includes("confirmed")) {
      return <Clock className="w-5 h-5 text-yellow-600" />
    } else {
      return <AlertCircle className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase()

    if (lowerStatus.includes("delivered")) {
      return "bg-green-100 text-green-800"
    } else if (lowerStatus.includes("out for delivery") || lowerStatus.includes("dispatched")) {
      return "bg-blue-100 text-blue-800"
    } else if (lowerStatus.includes("in transit") || lowerStatus.includes("shipped")) {
      return "bg-orange-100 text-orange-800"
    } else if (lowerStatus.includes("picked up") || lowerStatus.includes("confirmed")) {
      return "bg-yellow-100 text-yellow-800"
    } else {
      return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Track Your Order
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Enter Order ID (FR123456) or AWB Code"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleTrackOrder} disabled={loading}>
              {loading ? "Tracking..." : "Track"}
            </Button>
          </div>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </CardContent>
      </Card>

      {/* Tracking Results */}
      {trackingInfo && (
        <>
          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(trackingInfo.currentStatus)}
                  Current Status
                </div>
                <Badge className={getStatusColor(trackingInfo.currentStatus)}>{trackingInfo.currentStatus}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">AWB Code</p>
                  <p className="font-medium">{trackingInfo.awbCode}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Courier Partner</p>
                  <p className="font-medium">{trackingInfo.courierName}</p>
                </div>
                {trackingInfo.expectedDelivery && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Expected Delivery</p>
                    <p className="font-medium">{trackingInfo.expectedDelivery}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tracking Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Tracking Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {trackingInfo.trackingEvents.length > 0 ? (
                <div className="space-y-4">
                  {trackingInfo.trackingEvents.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${index === 0 ? "bg-blue-600" : "bg-gray-300"}`} />
                        {index < trackingInfo.trackingEvents.length - 1 && (
                          <div className="w-px h-12 bg-gray-200 mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">{event.activity}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(event.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {event.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No tracking events available yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Tracking information will be updated once your order is shipped
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Details */}
          {trackingInfo.orderDetails && (
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Order ID</p>
                      <p className="font-medium">{trackingInfo.orderDetails.orderId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="font-medium">
                        {new Date(trackingInfo.orderDetails.orderDate).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="font-medium mb-3">Items Ordered</p>
                    <div className="space-y-2">
                      {trackingInfo.orderDetails.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium">₹{item.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="font-medium mb-2">Delivery Address</p>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium text-gray-900">{trackingInfo.orderDetails.shippingAddress.name}</p>
                      <p>{trackingInfo.orderDetails.shippingAddress.address}</p>
                      <p>
                        {trackingInfo.orderDetails.shippingAddress.city},{" "}
                        {trackingInfo.orderDetails.shippingAddress.state} -{" "}
                        {trackingInfo.orderDetails.shippingAddress.pincode}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          <span>{trackingInfo.orderDetails.shippingAddress.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Section */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="font-medium">Contact Support</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>+91 9876543210</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>support@fragransia.com</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Courier Support</p>
                  <p className="text-sm text-gray-600">
                    For delivery-related queries, contact {trackingInfo.courierName} directly
                  </p>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Contact Courier
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
