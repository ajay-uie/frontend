"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, TrendingDown } from "lucide-react"

const stats = [
  {
    title: "Total Revenue",
    value: "₹2,45,678",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Total Orders",
    value: "1,234",
    change: "+8.2%",
    trend: "up",
    icon: ShoppingCart,
  },
  {
    title: "Total Products",
    value: "456",
    change: "+2.1%",
    trend: "up",
    icon: Package,
  },
  {
    title: "Total Users",
    value: "8,901",
    change: "+15.3%",
    trend: "up",
    icon: Users,
  },
]

const recentOrders = [
  { id: "ORD-001", customer: "John Doe", product: "Chanel No. 5", amount: "₹8,500", status: "completed" },
  { id: "ORD-002", customer: "Jane Smith", product: "Dior Sauvage", amount: "₹6,200", status: "processing" },
  { id: "ORD-003", customer: "Mike Johnson", product: "Tom Ford Oud", amount: "₹12,000", status: "shipped" },
  { id: "ORD-004", customer: "Sarah Wilson", product: "Creed Aventus", amount: "₹15,500", status: "pending" },
  { id: "ORD-005", customer: "David Brown", product: "Yves Saint Laurent", amount: "₹7,800", status: "completed" },
]

const topProducts = [
  { name: "Chanel No. 5", sales: 145, revenue: "₹1,23,250" },
  { name: "Dior Sauvage", sales: 132, revenue: "₹81,840" },
  { name: "Tom Ford Oud Wood", sales: 98, revenue: "₹1,17,600" },
  { name: "Creed Aventus", sales: 87, revenue: "₹1,34,850" },
  { name: "YSL Black Opium", sales: 76, revenue: "₹59,280" },
]

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {stat.trend === "up" ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  )}
                  <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>{stat.change}</span>
                  <span className="ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from your customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{order.customer}</p>
                    <p className="text-xs text-muted-foreground">{order.product}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{order.amount}</span>
                    <Badge
                      variant={
                        order.status === "completed"
                          ? "default"
                          : order.status === "processing"
                            ? "secondary"
                            : order.status === "shipped"
                              ? "outline"
                              : "destructive"
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best performing products this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sales} sales</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium">{product.revenue}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
