"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Store, 
  CreditCard, 
  Truck, 
  Bell, 
  Zap, 
  Shield, 
  Clock,
  Save,
  X,
  Plus,
  Trash2
} from "lucide-react"
import { useAdminAuth } from "@/contexts/admin-auth-context"

interface StoreSettings {
  name: string
  email: string
  phone: string
  description: string
  currency: string
  timezone: string
  address: {
    street: string
    city: string
    state: string
    pincode: string
    country: string
  }
  socialMedia: {
    facebook?: string
    instagram?: string
    twitter?: string
    youtube?: string
  }
}

interface PaymentSettings {
  razorpayEnabled: boolean
  razorpayKeyId: string
  razorpayKeySecret: string
  stripeEnabled: boolean
  stripePublishableKey: string
  stripeSecretKey: string
  codEnabled: boolean
  codCharges: number
}

interface ShippingSettings {
  freeShippingThreshold: number
  standardShippingRate: number
  expressShippingRate: number
  shippingZones: Array<{
    name: string
    states: string[]
    rate: number
  }>
}

interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  orderNotifications: boolean
  lowStockNotifications: boolean
  newUserNotifications: boolean
  emailTemplates: {
    orderConfirmation: boolean
    orderShipped: boolean
    orderDelivered: boolean
  }
}

export function SettingsPanel() {
  const { token } = useAdminAuth()
  const [activeTab, setActiveTab] = useState("general")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    name: "Fragransia",
    email: "info@fragransia.com",
    phone: "+91 98765 43210",
    description: "Premium perfumes and fragrances for every occasion",
    currency: "INR",
    timezone: "Asia/Kolkata",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India"
    },
    socialMedia: {}
  })

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    razorpayEnabled: false,
    razorpayKeyId: "",
    razorpayKeySecret: "",
    stripeEnabled: false,
    stripePublishableKey: "",
    stripeSecretKey: "",
    codEnabled: true,
    codCharges: 50
  })

  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
    freeShippingThreshold: 1000,
    standardShippingRate: 100,
    expressShippingRate: 200,
    shippingZones: [
      { name: "Metro Cities", states: ["Delhi", "Mumbai", "Bangalore", "Chennai"], rate: 100 },
      { name: "Tier 1 Cities", states: ["Pune", "Hyderabad", "Kolkata", "Ahmedabad"], rate: 150 },
      { name: "Other Cities", states: ["Others"], rate: 200 }
    ]
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    orderNotifications: true,
    lowStockNotifications: true,
    newUserNotifications: true,
    emailTemplates: {
      orderConfirmation: true,
      orderShipped: true,
      orderDelivered: true
    }
  })

  const [countdownSettings, setCountdownSettings] = useState({
    enabled: false,
    endDate: "",
    title: "Limited Time Offer",
    description: "Don't miss out on our exclusive deals!"
  })

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      if (data.success) {
        if (data.data.store) setStoreSettings(data.data.store)
        if (data.data.payment) setPaymentSettings(data.data.payment)
        if (data.data.shipping) setShippingSettings(data.data.shipping)
        if (data.data.notifications) setNotificationSettings(data.data.notifications)
        if (data.data.countdown) setCountdownSettings(data.data.countdown)
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (settingsType: string, settings: any) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/admin/settings/${settingsType}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      const data = await response.json()
      if (data.success) {
        setMessage(`${settingsType.charAt(0).toUpperCase() + settingsType.slice(1)} settings saved successfully!`)
      } else {
        setMessage(`Error: ${data.error || "Failed to save settings"}`)
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message || "An unexpected error occurred"}`)
    } finally {
      setLoading(false)
    }
  }

  const addShippingZone = () => {
    setShippingSettings({
      ...shippingSettings,
      shippingZones: [
        ...shippingSettings.shippingZones,
        { name: "", states: [], rate: 0 }
      ]
    })
  }

  const removeShippingZone = (index: number) => {
    const newZones = shippingSettings.shippingZones.filter((_, i) => i !== index)
    setShippingSettings({ ...shippingSettings, shippingZones: newZones })
  }

  const updateShippingZone = (index: number, field: string, value: any) => {
    const newZones = [...shippingSettings.shippingZones]
    newZones[index] = { ...newZones[index], [field]: value }
    setShippingSettings({ ...shippingSettings, shippingZones: newZones })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Configure your store settings and integrations</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Payment</span>
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <span className="hidden sm:inline">Shipping</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="countdown" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Countdown</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                Store Information
              </CardTitle>
              <CardDescription>Basic information about your perfume store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={storeSettings.name}
                    onChange={(e) => setStoreSettings({...storeSettings, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeEmail">Store Email</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    value={storeSettings.email}
                    onChange={(e) => setStoreSettings({...storeSettings, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storePhone">Phone Number</Label>
                  <Input
                    id="storePhone"
                    value={storeSettings.phone}
                    onChange={(e) => setStoreSettings({...storeSettings, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={storeSettings.currency} 
                    onValueChange={(value) => setStoreSettings({...storeSettings, currency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeDescription">Store Description</Label>
                <Textarea
                  id="storeDescription"
                  value={storeSettings.description}
                  onChange={(e) => setStoreSettings({...storeSettings, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <Label>Store Address</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Street Address"
                    value={storeSettings.address.street}
                    onChange={(e) => setStoreSettings({
                      ...storeSettings,
                      address: {...storeSettings.address, street: e.target.value}
                    })}
                  />
                  <Input
                    placeholder="City"
                    value={storeSettings.address.city}
                    onChange={(e) => setStoreSettings({
                      ...storeSettings,
                      address: {...storeSettings.address, city: e.target.value}
                    })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    placeholder="State"
                    value={storeSettings.address.state}
                    onChange={(e) => setStoreSettings({
                      ...storeSettings,
                      address: {...storeSettings.address, state: e.target.value}
                    })}
                  />
                  <Input
                    placeholder="Pincode"
                    value={storeSettings.address.pincode}
                    onChange={(e) => setStoreSettings({
                      ...storeSettings,
                      address: {...storeSettings.address, pincode: e.target.value}
                    })}
                  />
                  <Input
                    placeholder="Country"
                    value={storeSettings.address.country}
                    onChange={(e) => setStoreSettings({
                      ...storeSettings,
                      address: {...storeSettings.address, country: e.target.value}
                    })}
                  />
                </div>
              </div>

              <Button 
                onClick={() => saveSettings('store', storeSettings)}
                disabled={loading}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Store Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Methods
              </CardTitle>
              <CardDescription>Configure payment gateways and options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Razorpay */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Razorpay</h4>
                    <p className="text-sm text-muted-foreground">Accept payments via Razorpay</p>
                  </div>
                  <Switch
                    checked={paymentSettings.razorpayEnabled}
                    onCheckedChange={(checked) => setPaymentSettings({
                      ...paymentSettings,
                      razorpayEnabled: checked
                    })}
                  />
                </div>
                {paymentSettings.razorpayEnabled && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label>Key ID</Label>
                      <Input
                        type="password"
                        value={paymentSettings.razorpayKeyId}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          razorpayKeyId: e.target.value
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Key Secret</Label>
                      <Input
                        type="password"
                        value={paymentSettings.razorpayKeySecret}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          razorpayKeySecret: e.target.value
                        })}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Cash on Delivery */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Cash on Delivery</h4>
                    <p className="text-sm text-muted-foreground">Accept cash payments on delivery</p>
                  </div>
                  <Switch
                    checked={paymentSettings.codEnabled}
                    onCheckedChange={(checked) => setPaymentSettings({
                      ...paymentSettings,
                      codEnabled: checked
                    })}
                  />
                </div>
                {paymentSettings.codEnabled && (
                  <div className="ml-6">
                    <div className="space-y-2">
                      <Label>COD Charges (₹)</Label>
                      <Input
                        type="number"
                        value={paymentSettings.codCharges}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          codCharges: parseFloat(e.target.value) || 0
                        })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={() => saveSettings('payment', paymentSettings)}
                disabled={loading}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Payment Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Shipping Configuration
              </CardTitle>
              <CardDescription>Configure shipping rates and zones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Free Shipping Threshold (₹)</Label>
                  <Input
                    type="number"
                    value={shippingSettings.freeShippingThreshold}
                    onChange={(e) => setShippingSettings({
                      ...shippingSettings,
                      freeShippingThreshold: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Standard Shipping (₹)</Label>
                  <Input
                    type="number"
                    value={shippingSettings.standardShippingRate}
                    onChange={(e) => setShippingSettings({
                      ...shippingSettings,
                      standardShippingRate: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Express Shipping (₹)</Label>
                  <Input
                    type="number"
                    value={shippingSettings.expressShippingRate}
                    onChange={(e) => setShippingSettings({
                      ...shippingSettings,
                      expressShippingRate: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Shipping Zones</Label>
                  <Button onClick={addShippingZone} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Zone
                  </Button>
                </div>
                
                {shippingSettings.shippingZones.map((zone, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Input
                        placeholder="Zone Name"
                        value={zone.name}
                        onChange={(e) => updateShippingZone(index, 'name', e.target.value)}
                        className="flex-1 mr-2"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeShippingZone(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="States (comma separated)"
                        value={zone.states.join(', ')}
                        onChange={(e) => updateShippingZone(index, 'states', e.target.value.split(',').map(s => s.trim()))}
                      />
                      <Input
                        type="number"
                        placeholder="Shipping Rate (₹)"
                        value={zone.rate}
                        onChange={(e) => updateShippingZone(index, 'rate', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => saveSettings('shipping', shippingSettings)}
                disabled={loading}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Shipping Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure notification settings and email templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Send notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({
                      ...notificationSettings,
                      emailNotifications: checked
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SMS Notifications</h4>
                    <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({
                      ...notificationSettings,
                      smsNotifications: checked
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Order Notifications</h4>
                    <p className="text-sm text-muted-foreground">Notify about new orders</p>
                  </div>
                  <Switch
                    checked={notificationSettings.orderNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({
                      ...notificationSettings,
                      orderNotifications: checked
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Low Stock Alerts</h4>
                    <p className="text-sm text-muted-foreground">Notify when products are low in stock</p>
                  </div>
                  <Switch
                    checked={notificationSettings.lowStockNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({
                      ...notificationSettings,
                      lowStockNotifications: checked
                    })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Email Templates</Label>
                <div className="space-y-3 ml-4">
                  <div className="flex items-center justify-between">
                    <span>Order Confirmation</span>
                    <Switch
                      checked={notificationSettings.emailTemplates.orderConfirmation}
                      onCheckedChange={(checked) => setNotificationSettings({
                        ...notificationSettings,
                        emailTemplates: {
                          ...notificationSettings.emailTemplates,
                          orderConfirmation: checked
                        }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Order Shipped</span>
                    <Switch
                      checked={notificationSettings.emailTemplates.orderShipped}
                      onCheckedChange={(checked) => setNotificationSettings({
                        ...notificationSettings,
                        emailTemplates: {
                          ...notificationSettings.emailTemplates,
                          orderShipped: checked
                        }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Order Delivered</span>
                    <Switch
                      checked={notificationSettings.emailTemplates.orderDelivered}
                      onCheckedChange={(checked) => setNotificationSettings({
                        ...notificationSettings,
                        emailTemplates: {
                          ...notificationSettings.emailTemplates,
                          orderDelivered: checked
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => saveSettings('notifications', notificationSettings)}
                disabled={loading}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Third-party Integrations
              </CardTitle>
              <CardDescription>Connect with external services and APIs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Google Analytics</h4>
                    <Badge variant="outline">Not Connected</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Track website analytics and user behavior
                  </p>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Facebook Pixel</h4>
                    <Badge variant="outline">Not Connected</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Track conversions and optimize ads
                  </p>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">WhatsApp Business</h4>
                    <Badge variant="outline">Not Connected</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Send order updates via WhatsApp
                  </p>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Mailchimp</h4>
                    <Badge variant="outline">Not Connected</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Email marketing and newsletters
                  </p>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Add extra security to admin accounts</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Login Attempt Limits</h4>
                    <p className="text-sm text-muted-foreground">Limit failed login attempts</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Session Timeout</h4>
                    <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Password Policy</Label>
                <div className="space-y-2 ml-4">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Minimum 8 characters</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Require uppercase letters</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Require numbers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" />
                    <span className="text-sm">Require special characters</span>
                  </div>
                </div>
              </div>

              <Button className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Countdown */}
        <TabsContent value="countdown" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Countdown Timer
              </CardTitle>
              <CardDescription>Create urgency with countdown timers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Enable Countdown</h4>
                  <p className="text-sm text-muted-foreground">Show countdown timer on website</p>
                </div>
                <Switch
                  checked={countdownSettings.enabled}
                  onCheckedChange={(checked) => setCountdownSettings({
                    ...countdownSettings,
                    enabled: checked
                  })}
                />
              </div>

              {countdownSettings.enabled && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>End Date & Time</Label>
                    <Input
                      type="datetime-local"
                      value={countdownSettings.endDate}
                      onChange={(e) => setCountdownSettings({
                        ...countdownSettings,
                        endDate: e.target.value
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={countdownSettings.title}
                      onChange={(e) => setCountdownSettings({
                        ...countdownSettings,
                        title: e.target.value
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={countdownSettings.description}
                      onChange={(e) => setCountdownSettings({
                        ...countdownSettings,
                        description: e.target.value
                      })}
                      rows={3}
                    />
                  </div>
                </div>
              )}

              <Button 
                onClick={() => saveSettings('countdown', countdownSettings)}
                disabled={loading}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Countdown Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

