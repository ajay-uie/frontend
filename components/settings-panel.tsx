"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Store, CreditCard, MessageSquare, Shield, Truck, Bell } from "lucide-react"

export function SettingsPanel() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Configure your store settings and integrations</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="mr-2 h-5 w-5" />
                Store Information
              </CardTitle>
              <CardDescription>Basic information about your perfume store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store-name">Store Name</Label>
                  <Input id="store-name" defaultValue="Fragransia" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-email">Store Email</Label>
                  <Input id="store-email" defaultValue="info@fragransia.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-description">Store Description</Label>
                <Textarea id="store-description" defaultValue="Premium perfumes and fragrances for every occasion" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store-phone">Phone Number</Label>
                  <Input id="store-phone" defaultValue="+91 98765 43210" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-currency">Currency</Label>
                  <Select defaultValue="inr">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inr">INR (₹)</SelectItem>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-address">Store Address</Label>
                <Textarea
                  id="store-address"
                  defaultValue="123 Perfume Street, Fragrance District, Mumbai, Maharashtra 400001"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable to temporarily disable the store</p>
                </div>
                <Switch id="maintenance-mode" checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Payment Gateway Settings
              </CardTitle>
              <CardDescription>Configure Razorpay and other payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-semibold">Razorpay Configuration</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="razorpay-key">Razorpay Key ID</Label>
                    <Input id="razorpay-key" placeholder="rzp_test_..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="razorpay-secret">Razorpay Secret</Label>
                    <Input id="razorpay-secret" type="password" placeholder="••••••••" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="razorpay-enabled">Enable Razorpay</Label>
                  <Switch id="razorpay-enabled" defaultChecked />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Payment Methods</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Credit/Debit Cards</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>UPI Payments</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Net Banking</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Cash on Delivery</Label>
                    <Switch />
                  </div>
                </div>
              </div>
              <Button>Save Payment Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="mr-2 h-5 w-5" />
                Shipping Configuration
              </CardTitle>
              <CardDescription>Set up shipping rates and delivery options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="free-shipping">Free Shipping Above (₹)</Label>
                  <Input id="free-shipping" defaultValue="2000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="standard-shipping">Standard Shipping Rate (₹)</Label>
                  <Input id="standard-shipping" defaultValue="100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="express-shipping">Express Shipping Rate (₹)</Label>
                  <Input id="express-shipping" defaultValue="200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery-days">Standard Delivery Days</Label>
                  <Input id="delivery-days" defaultValue="3-5" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shipping-zones">Shipping Zones</Label>
                <Textarea
                  id="shipping-zones"
                  placeholder="Enter pincodes or areas (comma separated)"
                  defaultValue="400001, 400002, 400003, 110001, 560001"
                />
              </div>
              <Button>Save Shipping Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure email and SMS notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-semibold">Email Notifications</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send order confirmations and updates via email</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
                {emailNotifications && (
                  <div className="space-y-2">
                    <Label htmlFor="smtp-host">SMTP Host</Label>
                    <Input id="smtp-host" defaultValue="smtp.sendgrid.net" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtp-username">SMTP Username</Label>
                        <Input id="smtp-username" placeholder="apikey" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtp-password">SMTP Password</Label>
                        <Input id="smtp-password" type="password" placeholder="••••••••" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">SMS Notifications</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send order updates via SMS</p>
                  </div>
                  <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
                </div>
              </div>
              <Button>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Third-party Integrations
              </CardTitle>
              <CardDescription>Connect with external services and APIs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-semibold">WhatsApp Integration</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-token">WhatsApp API Token</Label>
                    <Input id="whatsapp-token" placeholder="Enter API token" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-number">Business Phone Number</Label>
                    <Input id="whatsapp-number" placeholder="+91 98765 43210" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Enable WhatsApp Notifications</Label>
                  <Switch />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Analytics Integration</h4>
                <div className="space-y-2">
                  <Label htmlFor="google-analytics">Google Analytics ID</Label>
                  <Input id="google-analytics" placeholder="GA-XXXXXXXXX-X" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook-pixel">Facebook Pixel ID</Label>
                  <Input id="facebook-pixel" placeholder="Enter Pixel ID" />
                </div>
              </div>
              <Button>Save Integration Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-semibold">Admin Access</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for admin login</p>
                  </div>
                  <Switch />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input id="session-timeout" defaultValue="60" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">API Security</h4>
                <div className="space-y-2">
                  <Label htmlFor="api-rate-limit">API Rate Limit (requests/minute)</Label>
                  <Input id="api-rate-limit" defaultValue="100" />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Enable CORS Protection</Label>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Data Protection</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Data Encryption</Label>
                    <p className="text-sm text-muted-foreground">Encrypt sensitive customer data</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Enable Audit Logging</Label>
                  <Switch defaultChecked />
                </div>
              </div>
              <Button>Save Security Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
