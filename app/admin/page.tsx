"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Activity,
  Wifi,
  WifiOff,
  Bell,
  Settings,
  BarChart3,
  Eye,
  RefreshCw,
  Plus,
  Edit,
} from "lucide-react"
import { useRealTime } from "@/hooks/use-real-time"
import { RealTimeStatus } from "@/components/real-time-status"
import { enhancedApi } from "@/lib/enhanced-api"
import { clientLogger } from "@/utils/logger"
import { toast } from "sonner"
import type { AnalyticsData, SystemAlert, InventoryAlert } from "@/lib/types"

interface DashboardStats {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  lowStockProducts: number
  recentOrders: any[]
  topProducts: any[]
  systemAlerts: SystemAlert[]
  inventoryAlerts: InventoryAlert[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    recentOrders: [],
    topProducts: [],
    systemAlerts: [],
    inventoryAlerts: [],
  })

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [dateRange, setDateRange] = useState("7d")

  // Real-time hooks
  const { isConnected, isAuthenticated, notifications, unreadCount, authenticate, subscribeToUpdates, events } =
    useRealTime({
      enableNotifications: true,
      enableToasts: true,
      autoSubscribe: true,
      channels: ["admin", "orders", "products", "inventory", "users", "analytics"],
    })

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      clientLogger.info("📊 Loading admin dashboard data")

      // Load dashboard stats
      const dashboardResponse = await enhancedApi.getAdminDashboard()
      if (dashboardResponse.success && dashboardResponse.data) {
        setStats(dashboardResponse.data)
        clientLogger.success("✅ Dashboard stats loaded successfully")
      } else {
        throw new Error(dashboardResponse.error || "Failed to load dashboard data")
      }

      // Load analytics data
      const analyticsResponse = await enhancedApi.request<AnalyticsData>(`/api/admin/analytics?range=${dateRange}`, {
        method: "GET",
      })
      if (analyticsResponse.success && analyticsResponse.data) {
        setAnalyticsData(analyticsResponse.data)
        clientLogger.success("✅ Analytics data loaded successfully")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      setError(errorMessage)
      clientLogger.error("❌ Failed to load dashboard data:", err)
      toast.error("Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize dashboard
  useEffect(() => {
    loadDashboardData()

    // Auto-refresh every 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [dateRange])

  // Authenticate socket connection
  useEffect(() => {
    if (isConnected && !isAuthenticated) {
      const token = localStorage.getItem("auth_token")
      if (token) {
        clientLogger.info("🔐 Authenticating admin socket connection")
        authenticate(token, "admin")
      }
    }
  }, [isConnected, isAuthenticated, authenticate])

  // Update stats with real-time data
  useEffect(() => {
    // Listen for real-time events and update stats accordingly
    const orderEvents = events.filter((e) => e.type.startsWith("order_"))
    const productEvents = events.filter((e) => e.type.startsWith("product_") || e.type.startsWith("inventory_"))
    const userEvents = events.filter((e) => e.type.startsWith("user_"))

    if (orderEvents.length > 0) {
      setStats((prev) => ({
        ...prev,
        totalOrders: prev.totalOrders + orderEvents.filter((e) => e.type === "order_created").length,
        pendingOrders:
          prev.pendingOrders +
          orderEvents.filter(
            (e) => e.type === "order_created" || (e.type === "order_status_changed" && e.data?.status === "pending"),
          ).length,
      }))
    }

    if (productEvents.length > 0) {
      const lowStockEvents = productEvents.filter((e) => e.type === "inventory_low" || e.type === "inventory_out")
      if (lowStockEvents.length > 0) {
        setStats((prev) => ({
          ...prev,
          lowStockProducts: prev.lowStockProducts + lowStockEvents.length,
        }))
      }
    }

    if (userEvents.length > 0) {
      const newUserEvents = userEvents.filter((e) => e.type === "user_registered")
      if (newUserEvents.length > 0) {
        setStats((prev) => ({
          ...prev,
          totalUsers: prev.totalUsers + newUserEvents.length,
        }))
      }
    }
  }, [events])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-IN").format(num)
  }

  const getGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return 0
    return (((current - previous) / previous) * 100).toFixed(1)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading admin dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button variant="outline" size="sm" onClick={loadDashboardData} className="mt-2 w-full bg-transparent">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your store and monitor real-time activity</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-1 text-green-600">
                <Wifi className="h-4 w-4" />
                <span className="text-sm">Live</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm">Offline</span>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </div>

          <Button onClick={loadDashboardData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData && (
                <span className="text-green-600">
                  +{getGrowthPercentage(stats.totalRevenue, stats.totalRevenue * 0.8)}% from last period
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalOrders)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingOrders > 0 && <span className="text-orange-600">{stats.pendingOrders} pending</span>}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalUsers)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12% from last month</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalProducts)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.lowStockProducts > 0 && (
                <span className="text-orange-600">{stats.lowStockProducts} low stock</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="relative">
            Dashboard
            {(stats.pendingOrders > 0 || stats.lowStockProducts > 0) && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                !
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="orders" className="relative">
            Orders
            {stats.pendingOrders > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                {stats.pendingOrders}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="products" className="relative">
            Products
            {stats.lowStockProducts > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                {stats.lowStockProducts}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Recent Orders
                  {stats.pendingOrders > 0 && <Badge variant="destructive">{stats.pendingOrders} pending</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  {stats.recentOrders.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No recent orders</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.recentOrders.slice(0, 10).map((order, index) => (
                        <div
                          key={order.id || index}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div>
                            <p className="font-medium">#{order.orderNumber || `ORD-${index + 1}`}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.user?.firstName} {order.user?.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(order.total || 0)}</p>
                            <Badge
                              variant={
                                order.status === "completed"
                                  ? "default"
                                  : order.status === "pending"
                                    ? "secondary"
                                    : order.status === "cancelled"
                                      ? "destructive"
                                      : "outline"
                              }
                            >
                              {order.status || "pending"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Real-Time Status */}
            <div className="space-y-4">
              <RealTimeStatus showNotifications={true} showEvents={true} compact={false} />
            </div>
          </div>

          {/* System Alerts */}
          {(stats.systemAlerts.length > 0 || stats.inventoryAlerts.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Alerts */}
              {stats.systemAlerts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      System Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {stats.systemAlerts.map((alert) => (
                          <Alert key={alert.id} variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <div className="flex items-center justify-between">
                                <div>
                                  <strong>{alert.title}</strong>
                                  <p className="text-sm mt-1">{alert.message}</p>
                                </div>
                                {!alert.isResolved && (
                                  <Button variant="outline" size="sm">
                                    Resolve
                                  </Button>
                                )}
                              </div>
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Inventory Alerts */}
              {stats.inventoryAlerts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                      <Package className="h-5 w-5" />
                      Inventory Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {stats.inventoryAlerts.map((alert) => (
                          <Alert key={alert.id}>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <div className="flex items-center justify-between">
                                <div>
                                  <strong>{alert.productName}</strong>
                                  <p className="text-sm mt-1">
                                    {alert.status === "out"
                                      ? "Out of stock"
                                      : `Low stock: ${alert.currentStock} remaining`}
                                  </p>
                                </div>
                                <Badge variant={alert.status === "out" ? "destructive" : "secondary"}>
                                  {alert.status}
                                </Badge>
                              </div>
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Order Management</CardTitle>
                  <CardDescription>Manage and track all orders in real-time</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Order
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Completed: {stats.totalOrders - stats.pendingOrders}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Pending: {stats.pendingOrders}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Today: {events.filter((e) => e.type === "order_created").length}</span>
                  </div>
                </div>

                {/* Orders Table */}
                <div className="border rounded-lg">
                  <div className="p-4 border-b bg-muted/50">
                    <div className="grid grid-cols-6 gap-4 text-sm font-medium">
                      <span>Order #</span>
                      <span>Customer</span>
                      <span>Status</span>
                      <span>Total</span>
                      <span>Date</span>
                      <span>Actions</span>
                    </div>
                  </div>
                  <ScrollArea className="h-96">
                    {stats.recentOrders.map((order, index) => (
                      <div key={order.id || index} className="p-4 border-b hover:bg-muted/50">
                        <div className="grid grid-cols-6 gap-4 items-center text-sm">
                          <span className="font-medium">#{order.orderNumber || `ORD-${index + 1}`}</span>
                          <span>
                            {order.user?.firstName} {order.user?.lastName}
                          </span>
                          <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                            {order.status || "pending"}
                          </Badge>
                          <span>{formatCurrency(order.total || 0)}</span>
                          <span>{new Date(order.createdAt || Date.now()).toLocaleDateString()}</span>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Product Management</CardTitle>
                  <CardDescription>Manage inventory and monitor stock levels</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Total: {stats.totalProducts}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">
                      Low Stock: {stats.inventoryAlerts.filter((a) => a.status === "low").length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">
                      Out of Stock: {stats.inventoryAlerts.filter((a) => a.status === "out").length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Top Sellers: {stats.topProducts.length}</span>
                  </div>
                </div>

                {/* Top Products */}
                <div className="border rounded-lg">
                  <div className="p-4 border-b bg-muted/50">
                    <h3 className="font-medium">Top Selling Products</h3>
                  </div>
                  <ScrollArea className="h-64">
                    {stats.topProducts.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No product data available</p>
                    ) : (
                      <div className="space-y-2 p-4">
                        {stats.topProducts.map((product, index) => (
                          <div
                            key={product.id || index}
                            className="flex items-center justify-between p-2 border rounded"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(product.revenue || 0)}</p>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage customer accounts and user data</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Total Users: {formatNumber(stats.totalUsers)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      New Today: {events.filter((e) => e.type === "user_registered").length}
                    </span>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <p className="text-muted-foreground text-center">
                    User management interface with user profiles, account management, and user analytics would be
                    implemented here.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics & Reports
              </CardTitle>
              <CardDescription>View detailed analytics and generate reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      Revenue Growth: +{getGrowthPercentage(stats.totalRevenue, stats.totalRevenue * 0.8)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Conversion Rate: 3.2%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">
                      Avg Order Value: {formatCurrency(stats.totalRevenue / (stats.totalOrders || 1))}
                    </span>
                  </div>
                </div>

                {analyticsData && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Sales Overview</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Total Revenue:</span>
                          <span className="font-medium">{formatCurrency(analyticsData.overview.totalRevenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Total Orders:</span>
                          <span className="font-medium">{formatNumber(analyticsData.overview.totalOrders)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Conversion Rate:</span>
                          <span className="font-medium">{analyticsData.overview.conversionRate}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Growth Metrics</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Revenue Growth:</span>
                          <span className="font-medium text-green-600">+{analyticsData.overview.revenueGrowth}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Order Growth:</span>
                          <span className="font-medium text-green-600">+{analyticsData.overview.ordersGrowth}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Customer Growth:</span>
                          <span className="font-medium text-green-600">+{analyticsData.overview.customersGrowth}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Settings
              </CardTitle>
              <CardDescription>Configure system settings and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <p className="text-muted-foreground text-center">
                    Settings interface with system configuration, payment settings, notification preferences, and admin
                    management would be implemented here.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
