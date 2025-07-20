"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Package,
  Eye,
  MousePointer,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Calendar,
  Download
} from "lucide-react"
import { useAdminAuth } from "@/contexts/admin-auth-context"

interface AnalyticsData {
  overview: {
    totalRevenue: number
    totalOrders: number
    totalCustomers: number
    totalProducts: number
    revenueGrowth: number
    ordersGrowth: number
    customersGrowth: number
    conversionRate: number
  }
  salesData: Array<{
    date: string
    revenue: number
    orders: number
  }>
  topProducts: Array<{
    id: string
    name: string
    sales: number
    revenue: number
  }>
  customerData: Array<{
    date: string
    newCustomers: number
    returningCustomers: number
  }>
  trafficData: Array<{
    source: string
    visitors: number
    conversions: number
  }>
}

interface SystemSignals {
  alerts: Array<{
    id: string
    type: "error" | "warning" | "info"
    title: string
    message: string
    timestamp: string
    resolved: boolean
  }>
  performance: {
    serverUptime: number
    responseTime: number
    errorRate: number
    activeUsers: number
  }
  inventory: Array<{
    productId: string
    productName: string
    currentStock: number
    minStock: number
    status: "low" | "out" | "normal"
  }>
}

export function SignalsPanel() {
  const { token } = useAdminAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [dateRange, setDateRange] = useState("7d")
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [systemSignals, setSystemSignals] = useState<SystemSignals | null>(null)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  useEffect(() => {
    loadAnalytics()
    loadSystemSignals()
  }, [dateRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/admin/analytics?range=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      if (data.success) {
        setAnalyticsData(data.data)
      }
    } catch (error) {
      console.error("Failed to load analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadSystemSignals = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/signals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      if (data.success) {
        setSystemSignals(data.data)
      }
    } catch (error) {
      console.error("Failed to load system signals:", error)
    }
  }

  const resolveAlert = async (alertId: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/admin/signals/alerts/${alertId}/resolve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      loadSystemSignals()
    } catch (error) {
      console.error("Failed to resolve alert:", error)
    }
  }

  const exportData = async (type: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/analytics/export?type=${type}&range=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${type}-report-${dateRange}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Failed to export data:", error)
    }
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />
    } else if (growth < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />
    }
    return null
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "text-green-500"
    if (growth < 0) return "text-red-500"
    return "text-gray-500"
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "info":
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  if (loading || !analyticsData || !systemSignals) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics & Signals</h2>
          <p className="text-muted-foreground">Monitor your store performance and system health</p>
        </div>
        <div className="flex space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportData('sales')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{analyticsData.overview.totalRevenue.toLocaleString()}</div>
                <div className={`text-xs flex items-center ${getGrowthColor(analyticsData.overview.revenueGrowth)}`}>
                  {getGrowthIcon(analyticsData.overview.revenueGrowth)}
                  <span className="ml-1">{Math.abs(analyticsData.overview.revenueGrowth)}% from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.totalOrders.toLocaleString()}</div>
                <div className={`text-xs flex items-center ${getGrowthColor(analyticsData.overview.ordersGrowth)}`}>
                  {getGrowthIcon(analyticsData.overview.ordersGrowth)}
                  <span className="ml-1">{Math.abs(analyticsData.overview.ordersGrowth)}% from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.totalCustomers.toLocaleString()}</div>
                <div className={`text-xs flex items-center ${getGrowthColor(analyticsData.overview.customersGrowth)}`}>
                  {getGrowthIcon(analyticsData.overview.customersGrowth)}
                  <span className="ml-1">{Math.abs(analyticsData.overview.customersGrowth)}% from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.conversionRate}%</div>
                <div className="text-xs text-muted-foreground">
                  Visitors to customers
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Daily revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Where your visitors come from</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.trafficData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="visitors"
                    >
                      {analyticsData.trafficData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Performance</CardTitle>
                <CardDescription>Revenue and orders over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={analyticsData.salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue (₹)" />
                    <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#82ca9d" name="Orders" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best performing products by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">{product.sales} sales</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{product.revenue.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Acquisition</CardTitle>
              <CardDescription>New vs returning customers</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData.customerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="newCustomers" stackId="a" fill="#8884d8" name="New Customers" />
                  <Bar dataKey="returningCustomers" stackId="a" fill="#82ca9d" name="Returning Customers" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
                <CardDescription>Top selling products</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analyticsData.topProducts} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Alerts</CardTitle>
                <CardDescription>Products requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemSignals.inventory.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-muted-foreground">
                          Current: {item.currentStock} | Min: {item.minStock}
                        </div>
                      </div>
                      <Badge variant={item.status === "out" ? "destructive" : item.status === "low" ? "secondary" : "default"}>
                        {item.status === "out" ? "Out of Stock" : item.status === "low" ? "Low Stock" : "Normal"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>Real-time system metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Server Uptime</span>
                  <Badge variant="default">{systemSignals.performance.serverUptime}%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Response Time</span>
                  <Badge variant="outline">{systemSignals.performance.responseTime}ms</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Error Rate</span>
                  <Badge variant={systemSignals.performance.errorRate > 5 ? "destructive" : "default"}>
                    {systemSignals.performance.errorRate}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active Users</span>
                  <Badge variant="secondary">{systemSignals.performance.activeUsers}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>Recent system notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemSignals.alerts.map((alert) => (
                    <div key={alert.id} className={`p-3 border rounded-lg ${alert.resolved ? 'opacity-50' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2">
                          {getAlertIcon(alert.type)}
                          <div>
                            <div className="font-medium">{alert.title}</div>
                            <div className="text-sm text-muted-foreground">{alert.message}</div>
                            <div className="text-xs text-muted-foreground flex items-center mt-1">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(alert.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        {!alert.resolved && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
