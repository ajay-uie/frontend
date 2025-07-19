"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BarChart3, Package, ShoppingCart, Users, Settings, Activity, TrendingUp, DollarSign, Ticket, LogOut } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Navigation from "../components/navigation"
import Footer from "../components/footer"
import { ProductsPanel } from "@/components/products-panel"
import { OrdersPanel } from "@/components/orders-panel"
import { UsersPanel } from "@/components/users-panel"
import { CouponsPanel } from "@/components/coupons-panel"
import { SignalsPanel } from "@/components/signals-panel"
import { SettingsPanel } from "@/components/settings-panel"
import { AdminLogin } from "@/components/admin-login"
import { AdminAuthProvider, useAdminAuth } from "@/contexts/admin-auth-context"

function AdminDashboard() {
  const { admin, logout, isLoading } = useAdminAuth()
  const [activeTab, setActiveTab] = useState("dashboard")

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const stats = [
    {
      title: "Total Revenue",
      value: "₹1,25,000",
      change: "+12.5%",
      trend: "up" as const,
      icon: DollarSign,
    },
    {
      title: "Total Orders",
      value: "342",
      change: "+8.2%",
      trend: "up" as const,
      icon: ShoppingCart,
    },
    {
      title: "Total Products",
      value: "48",
      change: "+2.1%",
      trend: "up" as const,
      icon: Package,
    },
    {
      title: "Total Users",
      value: "1,250",
      change: "+15.3%",
      trend: "up" as const,
      icon: Users,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-light text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {admin?.firstName || admin?.email}
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:grid-cols-7">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2" disabled={!admin?.permissions?.manageProducts}>
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2" disabled={!admin?.permissions?.manageOrders}>
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2" disabled={!admin?.permissions?.manageUsers}>
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="coupons" className="flex items-center gap-2" disabled={!admin?.permissions?.manageCoupons}>
              <Ticket className="w-4 h-4" />
              <span className="hidden sm:inline">Coupons</span>
            </TabsTrigger>
            <TabsTrigger value="signals" className="flex items-center gap-2" disabled={!admin?.permissions?.viewAnalytics}>
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Signals</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2" disabled={!admin?.permissions?.manageSettings}>
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <stat.icon className="w-8 h-8 text-gray-400 mb-2" />
                          <Badge
                            className={`${
                              stat.trend === "up" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {stat.change}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-gray-900">Order #ORD{1000 + i}</p>
                          <p className="text-sm text-gray-600">Customer {i}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{(Math.random() * 5000 + 1000).toFixed(0)}</p>
                          <Badge className="bg-green-100 text-green-800">Completed</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Low Stock Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "LEONARDO'S SECRET", stock: 5 },
                      { name: "VENETIAN NIGHTS", stock: 8 },
                      { name: "FLORENTINE GOLD", stock: 3 },
                      { name: "SICILIAN ROMANCE", stock: 12 },
                      { name: "ROMAN AFFAIR", stock: 7 },
                    ].map((product, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">100ml</p>
                        </div>
                        <Badge
                          className={`${
                            product.stock <= 5 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {product.stock} left
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {admin?.permissions?.manageProducts && (
            <TabsContent value="products">
              <ProductsPanel />
            </TabsContent>
          )}

          {admin?.permissions?.manageOrders && (
            <TabsContent value="orders">
              <OrdersPanel />
            </TabsContent>
          )}

          {admin?.permissions?.manageUsers && (
            <TabsContent value="users">
              <UsersPanel />
            </TabsContent>
          )}

          {admin?.permissions?.manageCoupons && (
            <TabsContent value="coupons">
              <CouponsPanel />
            </TabsContent>
          )}

          {admin?.permissions?.viewAnalytics && (
            <TabsContent value="signals">
              <SignalsPanel />
            </TabsContent>
          )}

          {admin?.permissions?.manageSettings && (
            <TabsContent value="settings">
              <SettingsPanel />
            </TabsContent>
          )}
        </Tabs>
      </div>

      <Footer />
    </div>
  )
}

function AdminLoginWrapper() {
  const { login, isLoading, isAuthenticated } = useAdminAuth()
  const [error, setError] = useState<string>("")

  const handleLogin = async (email: string, password: string) => {
    try {
      setError("")
      await login(email, password)
    } catch (error: any) {
      setError(error.message || "Login failed. Please try again.")
    }
  }

  if (isAuthenticated) {
    return <AdminDashboard />
  }

  return (
    <AdminLogin
      onLogin={handleLogin}
      isLoading={isLoading}
      error={error}
    />
  )
}

export default function AdminPage() {
  return (
    <AdminAuthProvider>
      <AdminLoginWrapper />
    </AdminAuthProvider>
  )
}

