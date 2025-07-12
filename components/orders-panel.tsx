"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Search, Eye } from "lucide-react"

const orders = [
  {
    id: "ORD-001",
    customer: "John Doe",
    email: "john@example.com",
    products: ["Chanel No. 5", "Dior Sauvage"],
    total: 14700,
    status: "completed",
    date: "2024-01-15",
    address: "123 Main St, Mumbai, Maharashtra 400001",
  },
  {
    id: "ORD-002",
    customer: "Jane Smith",
    email: "jane@example.com",
    products: ["Tom Ford Oud Wood"],
    total: 12000,
    status: "processing",
    date: "2024-01-14",
    address: "456 Park Ave, Delhi, Delhi 110001",
  },
  {
    id: "ORD-003",
    customer: "Mike Johnson",
    email: "mike@example.com",
    products: ["Creed Aventus", "YSL Black Opium"],
    total: 23300,
    status: "shipped",
    date: "2024-01-13",
    address: "789 Oak Rd, Bangalore, Karnataka 560001",
  },
  {
    id: "ORD-004",
    customer: "Sarah Wilson",
    email: "sarah@example.com",
    products: ["Chanel No. 5"],
    total: 8500,
    status: "pending",
    date: "2024-01-12",
    address: "321 Pine St, Chennai, Tamil Nadu 600001",
  },
  {
    id: "ORD-005",
    customer: "David Brown",
    email: "david@example.com",
    products: ["Dior Sauvage", "Tom Ford Oud Wood"],
    total: 18200,
    status: "cancelled",
    date: "2024-01-11",
    address: "654 Elm Ave, Pune, Maharashtra 411001",
  },
]

export function OrdersPanel() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<(typeof orders)[0] | null>(null)

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    // In a real app, this would make an API call
    console.log(`Updating order ${orderId} to status: ${newStatus}`)
  }

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
                  placeholder="Search orders..."
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
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Products</TableHead>
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
                      <div className="font-medium">{order.customer}</div>
                      <div className="text-sm text-muted-foreground">{order.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{order.products.join(", ")}</div>
                  </TableCell>
                  <TableCell>₹{order.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "completed"
                          ? "default"
                          : order.status === "processing"
                            ? "secondary"
                            : order.status === "shipped"
                              ? "outline"
                              : order.status === "pending"
                                ? "secondary"
                                : "destructive"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Order Details - {order.id}</DialogTitle>
                            <DialogDescription>Complete order information and status management</DialogDescription>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold">Customer Information</h4>
                                  <p>{selectedOrder.customer}</p>
                                  <p className="text-sm text-muted-foreground">{selectedOrder.email}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold">Order Status</h4>
                                  <Select
                                    value={selectedOrder.status}
                                    onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="processing">Processing</SelectItem>
                                      <SelectItem value="shipped">Shipped</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                      <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold">Products</h4>
                                <ul className="list-disc list-inside">
                                  {selectedOrder.products.map((product, index) => (
                                    <li key={index}>{product}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-semibold">Shipping Address</h4>
                                <p>{selectedOrder.address}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold">Order Total</h4>
                                <p className="text-lg font-bold">₹{selectedOrder.total.toLocaleString()}</p>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
