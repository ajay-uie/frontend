"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Eye, Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react"
import { useAdminAuth } from "@/contexts/admin-auth-context"

interface Order {
  id: string
  customerEmail: string
  customerPhone?: string
  customerName?: string
  items: Array<{
    productId: string
    productName: string
    quantity: number
    price: number
    image?: string
  }>
  total: number
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  shippingAddress: {
    name: string
    phone: string
    address: string
    city: string
    state: string
    pincode: string
  }
  paymentMethod: string
  trackingNumber?: string
  createdAt: string
  updatedAt: string
}

export function OrdersPanel() {
  const { token } = useAdminAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [trackingNumber, setTrackingNumber] = useState("")

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  useEffect(() => {
    loadOrders()
  }, [currentPage, selectedStatus, searchTerm])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20"
      })
      
      if (searchTerm) params.append("search", searchTerm)
      if (selectedStatus !== "all") params.append("status", selectedStatus)

      const response = await fetch(`${API_BASE_URL}/api/admin/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      if (data.success) {
        setOrders(data.data || [])
        setTotalPages(data.pagination?.totalPages || 1)
      } else {
        setMessage("Failed to load orders")
      }
    } catch (error) {
      console.error("Failed to load orders:", error)
      setMessage("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string, trackingNum?: string) => {
    try {
      const updateData: any = { status: newStatus }
      if (trackingNum) {
        updateData.trackingNumber = trackingNum
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()
      if (data.success) {
        setMessage("Order status updated successfully!")
        loadOrders()
        
        // Update selected order if it's the one being updated
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus as any, trackingNumber: trackingNum })
        }
      } else {
        setMessage(`Error: ${data.error || "Failed to update order status"}`)
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message || "An unexpected error occurred"}`)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "confirmed":
      case "processing":
        return <Package className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">{getStatusIcon(status)} Pending</Badge>
      case "confirmed":
        return <Badge variant="default">{getStatusIcon(status)} Confirmed</Badge>
      case "processing":
        return <Badge variant="default">{getStatusIcon(status)} Processing</Badge>
      case "shipped":
        return <Badge variant="outline">{getStatusIcon(status)} Shipped</Badge>
      case "delivered":
        return <Badge variant="default">{getStatusIcon(status)} Delivered</Badge>
      case "cancelled":
        return <Badge variant="destructive">{getStatusIcon(status)} Cancelled</Badge>
      default:
        return <Badge variant="secondary">{getStatusIcon(status)} {status}</Badge>
    }
  }

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setTrackingNumber(order.trackingNumber || "")
    setIsDetailDialogOpen(true)
  }

  const handleStatusUpdate = (newStatus: string) => {
    if (!selectedOrder) return
    
    if (newStatus === "shipped" && !trackingNumber.trim()) {
      setMessage("Please enter a tracking number for shipped orders")
      return
    }
    
    updateOrderStatus(selectedOrder.id, newStatus, trackingNumber.trim() || undefined)
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone?.includes(searchTerm) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        <p className="text-muted-foreground">Manage customer orders and track fulfillment</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders by ID, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>{filteredOrders.length} orders found</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading orders...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customerName || order.shippingAddress?.name || "N/A"}</div>
                          <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                          {order.customerPhone && (
                            <div className="text-sm text-muted-foreground">{order.customerPhone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {order.items?.length || 0} item(s)
                          {order.items && order.items.length > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {order.items[0].productName}
                              {order.items.length > 1 && ` +${order.items.length - 1} more`}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>₹{order.total?.toLocaleString() || 0}</TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openOrderDetails(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Select 
                            value={order.status} 
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center space-x-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
            <DialogDescription>Complete order information and status management</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium">Name</Label>
                      <p>{selectedOrder.customerName || selectedOrder.shippingAddress?.name || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p>{selectedOrder.customerEmail}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Phone</Label>
                      <p>{selectedOrder.customerPhone || selectedOrder.shippingAddress?.phone || "N/A"}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Current Status</Label>
                      <div className="mt-1">
                        {getStatusBadge(selectedOrder.status)}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="status-update" className="text-sm font-medium">Update Status</Label>
                      <Select
                        value={selectedOrder.status}
                        onValueChange={handleStatusUpdate}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="tracking" className="text-sm font-medium">Tracking Number</Label>
                      <Input
                        id="tracking"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Enter tracking number"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.productName}
                                  className="h-10 w-10 rounded-md object-cover"
                                />
                              )}
                              <div>
                                <div className="font-medium">{item.productName}</div>
                                <div className="text-sm text-muted-foreground">{item.productId}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₹{item.price?.toLocaleString()}</TableCell>
                          <TableCell>₹{(item.price * item.quantity)?.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 text-right">
                    <div className="text-lg font-bold">
                      Total: ₹{selectedOrder.total?.toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Shipping Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium">Shipping Address</Label>
                      <p className="mt-1">
                        {selectedOrder.shippingAddress?.name}<br />
                        {selectedOrder.shippingAddress?.address}<br />
                        {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.pincode}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Payment Method</Label>
                      <p>{selectedOrder.paymentMethod}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Order Date</Label>
                      <p>{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    </div>
                    {selectedOrder.trackingNumber && (
                      <div>
                        <Label className="text-sm font-medium">Tracking Number</Label>
                        <p>{selectedOrder.trackingNumber}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Global Message */}
      {message && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg z-50 ${
          message.includes("Error") 
            ? "bg-red-50 text-red-700 border border-red-200" 
            : "bg-green-50 text-green-700 border border-green-200"
        }`}>
          <div className="flex items-center justify-between">
            <span>{message}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMessage("")}
            >
              ×
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

