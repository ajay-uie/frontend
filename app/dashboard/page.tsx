"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AuthModal } from "@/components/auth/auth-modal"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { useWishlist } from "@/lib/wishlist-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  User,
  Package,
  Heart,
  Settings,
  ShoppingBag,
  MapPin,
  Star,
  Trash2,
  Shield,
  Loader2,
  RefreshCw,
} from "lucide-react"
import Navigation from "../components/navigation"
import Footer from "../components/footer"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"
import type { Address } from "@/lib/backend-api-enhanced"
import { newBackendApi } from "@/lib/new-backend-api"
import AddressSelector from "@/components/checkout/address-selector"
import logger from "@/utils/logger"

interface Order {
  id: string
  orderId: string
  date: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  total: number
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
    image: string
  }>
  shippingAddress: {
    name: string
    address: string
    city: string
    state: string
    pincode: string
  }
  trackingNumber?: string
}

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const activeTabFromUrl = searchParams.get("tab") || "overview"

  const { user, loading: authLoading, handleSignOut } = useAuth()
  const { state: cartState } = useCart()
  const { wishlist, remove: removeFromWishlist, loading: wishlistLoading } = useWishlist(user?.id)

  const [activeTab, setActiveTab] = useState(activeTabFromUrl)
  const [orders, setOrders] = useState<Order[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
  })

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
      })
      loadUserData()
    }
  }, [user])

  useEffect(() => {
    setActiveTab(activeTabFromUrl)
  }, [activeTabFromUrl])

  const loadUserData = async () => {
    if (!user) return

    setIsLoading(true)
    logger.info("Loading user dashboard data", { userId: user.uid }, "Dashboard")

    try {
      // Load orders
      const ordersResponse = await newBackendApi.getOrders({ limit: 10, sortBy: "createdAt", sortOrder: "desc" })
      if (ordersResponse.success && ordersResponse.data?.orders) {
        const formattedOrders = ordersResponse.data.orders.map((order) => ({
          id: order.id,
          orderId: order.id,
          date: order.createdAt,
          status: order.status,
          total: order.total,
          items: order.items.map((item) => ({
            id: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image || "/placeholder.svg?height=100&width=100",
          })),
          shippingAddress: order.shippingAddress,
          trackingNumber: order.trackingNumber,
        }))
        setOrders(formattedOrders)
        logger.success("Orders loaded", { count: formattedOrders.length }, "Dashboard")
      }

      // Load addresses
      const addressesResponse = await newBackendApi.getUserAddresses()
      if (addressesResponse.success && addressesResponse.data?.addresses) {
        setAddresses(addressesResponse.data.addresses)
        logger.success("Addresses loaded", { count: addressesResponse.data.addresses.length }, "Dashboard")
      }
    } catch (error) {
      logger.error("Error loading user data", error, "Dashboard")
      toast.error("Failed to load user data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    logger.userAction("dashboard_refresh", undefined, "Dashboard")
    await loadUserData()
    setRefreshing(false)
    toast.success("Dashboard refreshed")
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    logger.userAction("profile_update_attempt", profileForm, "Dashboard")

    try {
      const response = await newBackendApi.updateUserProfile(profileForm)

      if (response.success) {
        toast.success("Profile updated successfully")
        logger.success("Profile updated", { userId: user?.uid }, "Dashboard")
      } else {
        throw new Error(response.error || "Failed to update profile")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile"
      toast.error(errorMessage)
      logger.error("Profile update failed", error, "Dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords don't match")
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)
    logger.userAction("password_change_attempt", undefined, "Dashboard")

    try {
      const response = await newBackendApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword)

      if (response.success) {
        toast.success("Password changed successfully")
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
        logger.success("Password changed", { userId: user?.uid }, "Dashboard")
      } else {
        throw new Error(response.error || "Failed to change password")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to change password"
      toast.error(errorMessage)
      logger.error("Password change failed", error, "Dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFromWishlist = async (productId: string | number) => {
    try {
      await removeFromWishlist(productId)
      toast.success("Removed from wishlist")
      logger.userAction("wishlist_item_removed", { productId }, "Dashboard")
    } catch (error) {
      toast.error("Failed to remove from wishlist")
      logger.error("Wishlist removal failed", error, "Dashboard")
    }
  }

  const handleAddressAdd = (address: Address) => {
    setAddresses((prev) => [...prev, address])
    logger.success("Address added to dashboard", { addressId: address.id }, "Dashboard")
  }

  const handleAddressUpdate = (address: Address) => {
    setAddresses((prev) => prev.map((addr) => (addr.id === address.id ? address : addr)))
    logger.success("Address updated in dashboard", { addressId: address.id }, "Dashboard")
  }

  const handleAddressDelete = (addressId: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== addressId))
    logger.success("Address removed from dashboard", { addressId }, "Dashboard")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "pending":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-900 mb-4">Please log in to access your dashboard</h1>
          <Button onClick={() => setIsAuthModalOpen(true)} className="bg-black text-white hover:bg-gray-800">
            Login
          </Button>
          <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder.svg" alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback className="bg-black text-white text-lg">
                    {user.firstName?.charAt(0)?.toUpperCase()}
                    {user.lastName?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-light text-gray-900">
                    Welcome back, {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-gray-600">{user.email}</p>
                  {user.role === "admin" && (
                    <Badge variant="secondary" className="mt-1">
                      <Shield className="h-3 w-3 mr-1" />
                      Administrator
                    </Badge>
                  )}
                </div>
              </div>
              <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Dashboard Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Wishlist</span>
              </TabsTrigger>
              <TabsTrigger value="addresses" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Addresses</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{orders.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {orders.filter((o) => o.status === "delivered").length} delivered
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{wishlist.length}</div>
                    <p className="text-xs text-muted-foreground">Items saved for later</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cart Value</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{cartState.total.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">{cartState.itemCount} items in cart</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₹{orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">Lifetime value</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No orders yet</p>
                      <Link href="/products">
                        <Button className="mt-4 bg-black text-white hover:bg-gray-800">Start Shopping</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="font-medium">Order #{order.orderId}</p>
                              <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                            <p className="font-medium">₹{order.total.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Admin Panel Link */}
              {user.role === "admin" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Admin Panel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Access administrative features to manage products, orders, and users.
                    </p>
                    <Link href="/admin">
                      <Button className="bg-black text-white hover:bg-gray-800">Go to Admin Panel</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No orders found</p>
                      <Link href="/products">
                        <Button className="mt-4 bg-black text-white hover:bg-gray-800">Start Shopping</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-medium">Order #{order.orderId}</h3>
                              <p className="text-sm text-gray-500">
                                Placed on {new Date(order.date).toLocaleDateString()}
                              </p>
                              {order.trackingNumber && (
                                <p className="text-sm text-blue-600">Tracking: {order.trackingNumber}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                              <p className="font-medium mt-1">₹{order.total.toLocaleString()}</p>
                            </div>
                          </div>

                          <Separator className="my-4" />

                          <div className="space-y-3">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-4">
                                <Image
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.name}
                                  width={60}
                                  height={60}
                                  className="rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                </div>
                                <p className="font-medium">₹{item.price.toLocaleString()}</p>
                              </div>
                            ))}
                          </div>

                          {order.shippingAddress && (
                            <>
                              <Separator className="my-4" />
                              <div>
                                <h4 className="font-medium mb-2">Shipping Address</h4>
                                <p className="text-sm text-gray-600">
                                  {order.shippingAddress.name}
                                  <br />
                                  {order.shippingAddress.address}
                                  <br />
                                  {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                                  {order.shippingAddress.pincode}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wishlist Tab */}
            <TabsContent value="wishlist" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Wishlist</CardTitle>
                </CardHeader>
                <CardContent>
                  {wishlistLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : wishlist.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Your wishlist is empty</p>
                      <Link href="/products">
                        <Button className="mt-4 bg-black text-white hover:bg-gray-800">Browse Products</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wishlist.map((item) => (
                        <div key={item.productId} className="border rounded-lg p-4">
                          <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              width={200}
                              height={200}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-medium line-clamp-2">{item.name}</h3>
                            <p className="text-sm text-gray-500">{item.size}</p>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">₹{item.price.toLocaleString()}</span>
                              {item.originalPrice && (
                                <span className="text-sm text-gray-400 line-through">
                                  ₹{item.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Link href={`/product/${item.productId}`} className="flex-1">
                                <Button variant="outline" className="w-full bg-transparent">
                                  View Product
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleRemoveFromWishlist(item.productId)}
                                className="text-red-500 hover:text-red-700"
                                disabled={isLoading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Addresses</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <AddressSelector
                      addresses={addresses}
                      selectedAddress={null}
                      onAddressSelect={() => {}}
                      onAddressAdd={handleAddressAdd}
                      onAddressUpdate={handleAddressUpdate}
                      onAddressDelete={handleAddressDelete}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profileForm.firstName}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))}
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profileForm.lastName}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))}
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={profileForm.phoneNumber}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <Button type="submit" disabled={isLoading} className="bg-black text-white hover:bg-gray-800">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Profile"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Password Change */}
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm new password"
                      />
                    </div>
                    <Button type="submit" disabled={isLoading} className="bg-black text-white hover:bg-gray-800">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Changing...
                        </>
                      ) : (
                        "Change Password"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Account Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                  >
                    Logout
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  )
}
