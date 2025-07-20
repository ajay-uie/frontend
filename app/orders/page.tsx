"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  X,
  ArrowLeft,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  MapPin,
  CreditCard,
} from "lucide-react"
import Navigation from "../components/navigation"
import Footer from "../components/footer"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import Link from "next/link"
import { AuthModal } from "@/components/auth/auth-modal"

interface OrderItem {
  productId: string
  name: string
  brand: string
  price: number
  quantity: number
  size: string
  image: string
  total: number
}

interface Order {
  id: string
  orderId: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
  orderSummary: {
    subtotal: number
    shippingCost: number
    discountAmount: number
    finalTotal: number
  }
  items: OrderItem[]
  itemCount: number
  createdAt: Date
  estimatedDelivery: Date
  shippingAddress?: any
  trackingNumber?: string
}

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
  confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Confirmed' },
  processing: { color: 'bg-purple-100 text-purple-800', icon: Package, label: 'Processing' },
  shipped: { color: 'bg-indigo-100 text-indigo-800', icon: Truck, label: 'Shipped' },
  delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Delivered' },
  cancelled: { color: 'bg-red-100 text-red-800', icon: X, label: 'Cancelled' },
}

const paymentStatusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
  completed: { color: 'bg-green-100 text-green-800', label: 'Paid' },
  failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
  refunded: { color: 'bg-gray-100 text-gray-800', label: 'Refunded' },
}

export default function OrdersPage() {
  const router = useRouter()
  const { user, token } = useAuth()

  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-8npy.onrender.com'

  useEffect(() => {
    if (!user) {
      setShowAuthModal(true)
      setIsLoading(false)
      return
    }

    loadOrders()
  }, [user, token, activeTab, currentPage])

  const loadOrders = async () => {
    if (!user || !token) return

    setIsLoading(true)

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      })

      if (activeTab !== 'all') {
        params.append('status', activeTab)
      }

      const response = await fetch(`${API_BASE_URL}/api/orders/user/list?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const ordersData = data.orders.map((order: any) => ({
            ...order,
            createdAt: new Date(order.createdAt),
            estimatedDelivery: new Date(order.estimatedDelivery),
          }))
          setOrders(ordersData)
          setTotalPages(data.pagination.totalPages)
        } else {
          toast.error(data.message || 'Failed to load orders')
        }
      } else {
        toast.error('Failed to load orders')
      }
    } catch (error) {
      console.error('Error loading orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }

  const cancelOrder = async (orderId: string) => {
    if (!user || !token) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'Cancelled by customer',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast.success('Order cancelled successfully')
          loadOrders() // Refresh orders
        } else {
          toast.error(data.message || 'Failed to cancel order')
        }
      } else {
        toast.error('Failed to cancel order')
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
      toast.error('Failed to cancel order')
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    window.location.reload()
  }

  const getOrdersByStatus = (status: string) => {
    if (status === 'all') return orders
    return orders.filter(order => order.status === status)
  }

  const canCancelOrder = (order: Order) => {
    return ['pending', 'confirmed'].includes(order.status)
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
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h1>
                <p className="text-gray-600 mb-6">Please sign in to view your orders.</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/account">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Account
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-light text-gray-900">My Orders</h1>
                <p className="text-sm text-gray-600">Track and manage your orders</p>
              </div>
            </div>

            <Button onClick={loadOrders} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Order Status Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
              <TabsTrigger value="shipped">Shipped</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {/* Loading State */}
              {isLoading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your orders...</p>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && orders.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-medium text-gray-900 mb-2">
                    {activeTab === 'all' ? 'No orders found' : `No ${activeTab} orders`}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {activeTab === 'all' 
                      ? "You haven't placed any orders yet" 
                      : `You don't have any ${activeTab} orders`}
                  </p>
                  <Link href="/products">
                    <Button className="bg-black text-white hover:bg-gray-800">
                      Start Shopping
                    </Button>
                  </Link>
                </div>
              )}

              {/* Orders List */}
              {!isLoading && orders.length > 0 && (
                <div className="space-y-6">
                  {orders.map((order) => {
                    const StatusIcon = statusConfig[order.status].icon
                    
                    return (
                      <Card key={order.id} className="hover:shadow-lg transition-shadow duration-200">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div>
                                <CardTitle className="text-lg">Order #{order.orderId}</CardTitle>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {order.createdAt.toLocaleDateString()}
                                  </span>
                                  <span>{order.itemCount} items</span>
                                  <span>₹{order.orderSummary.finalTotal.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <Badge className={statusConfig[order.status].color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusConfig[order.status].label}
                              </Badge>
                              <Badge className={paymentStatusConfig[order.paymentStatus].color}>
                                {paymentStatusConfig[order.paymentStatus].label}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {/* Order Items */}
                          <div className="space-y-3">
                            {order.items.slice(0, 2).map((item) => (
                              <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3">
                                <img
                                  src={item.image || '/placeholder.svg'}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{item.name}</h4>
                                  <p className="text-xs text-gray-600">{item.brand} • {item.size}</p>
                                  <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-sm">₹{item.total.toLocaleString()}</p>
                                </div>
                              </div>
                            ))}

                            {order.items.length > 2 && (
                              <p className="text-sm text-gray-600 text-center">
                                +{order.items.length - 2} more items
                              </p>
                            )}
                          </div>

                          {/* Delivery Info */}
                          {order.status === 'shipped' && order.estimatedDelivery && (
                            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                              <Truck className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-blue-800">
                                Expected delivery: {order.estimatedDelivery.toLocaleDateString()}
                              </span>
                              {order.trackingNumber && (
                                <span className="text-sm text-blue-600 ml-auto">
                                  Tracking: {order.trackingNumber}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center gap-2">
                              <Link href={`/orders/${order.orderId}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Button>
                              </Link>

                              {order.status === 'shipped' && (
                                <Link href={`/orders/${order.orderId}/track`}>
                                  <Button variant="outline" size="sm">
                                    <Truck className="w-4 h-4 mr-2" />
                                    Track Order
                                  </Button>
                                </Link>
                              )}

                              {order.status === 'delivered' && (
                                <Button variant="outline" size="sm">
                                  <Download className="w-4 h-4 mr-2" />
                                  Download Invoice
                                </Button>
                              )}
                            </div>

                            {canCancelOrder(order) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => cancelOrder(order.orderId)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Cancel Order
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>

                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  )
}

