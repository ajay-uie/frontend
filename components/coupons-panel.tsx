"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Edit, Trash2, Eye, Calendar, Percent, DollarSign, Gift, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

interface Coupon {
  id: string
  code: string
  type: "percentage" | "fixed" | "freeShipping" | "buy2get1" | "buy3special"
  value: number
  specialPrice?: number
  description: string
  minOrderAmount?: number
  maxDiscount?: number
  usageLimit?: number
  userUsageLimit?: number
  usedCount: number
  isActive: boolean
  expiryDate: string
  startDate?: string
  createdAt: string
}

export function CouponsPanel() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    type: "percentage" as const,
    value: 0,
    specialPrice: 0,
    description: "",
    minOrderAmount: 0,
    maxDiscount: 0,
    usageLimit: 0,
    userUsageLimit: 0,
    expiryDate: "",
    startDate: ""
  })

  const fetchCoupons = async () => {
    try {
      setIsLoading(true)
      // This would be replaced with actual API call
      // For now, we'll use mock data
      const mockCoupons: Coupon[] = [
        {
          id: "WELCOME10",
          code: "WELCOME10",
          type: "percentage",
          value: 10,
          description: "Welcome discount for new customers",
          minOrderAmount: 1000,
          maxDiscount: 500,
          usageLimit: 100,
          userUsageLimit: 1,
          usedCount: 25,
          isActive: true,
          expiryDate: "2025-12-31",
          startDate: "2025-01-01",
          createdAt: "2025-01-01"
        },
        {
          id: "BUY2GET1",
          code: "BUY2GET1",
          type: "buy2get1",
          value: 0,
          description: "Buy 2 Get 1 Free on all fragrances",
          minOrderAmount: 2000,
          usageLimit: 50,
          userUsageLimit: 2,
          usedCount: 12,
          isActive: true,
          expiryDate: "2025-08-31",
          startDate: "2025-07-01",
          createdAt: "2025-07-01"
        },
        {
          id: "TRIO5000",
          code: "TRIO5000",
          type: "buy3special",
          value: 5000,
          specialPrice: 5000,
          description: "Buy any 3 fragrances for ₹5000",
          minOrderAmount: 3000,
          usageLimit: 30,
          userUsageLimit: 1,
          usedCount: 8,
          isActive: true,
          expiryDate: "2025-09-30",
          startDate: "2025-07-15",
          createdAt: "2025-07-15"
        }
      ]
      setCoupons(mockCoupons)
    } catch (error) {
      console.error("Error fetching coupons:", error)
      toast.error("Failed to fetch coupons")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const handleCreateCoupon = async () => {
    try {
      if (!newCoupon.code || !newCoupon.description || !newCoupon.expiryDate) {
        toast.error("Please fill in all required fields")
        return
      }

      // This would be replaced with actual API call
      const couponData = {
        ...newCoupon,
        code: newCoupon.code.toUpperCase(),
        expiryDate: new Date(newCoupon.expiryDate).toISOString(),
        startDate: newCoupon.startDate ? new Date(newCoupon.startDate).toISOString() : null
      }

      console.log("Creating coupon:", couponData)
      toast.success("Coupon created successfully!")
      
      // Reset form
      setNewCoupon({
        code: "",
        type: "percentage",
        value: 0,
        specialPrice: 0,
        description: "",
        minOrderAmount: 0,
        maxDiscount: 0,
        usageLimit: 0,
        userUsageLimit: 0,
        expiryDate: "",
        startDate: ""
      })
      setIsCreateDialogOpen(false)
      fetchCoupons()
    } catch (error) {
      console.error("Error creating coupon:", error)
      toast.error("Failed to create coupon")
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "percentage":
        return <Percent className="w-4 h-4" />
      case "fixed":
        return <DollarSign className="w-4 h-4" />
      case "freeShipping":
        return <Package className="w-4 h-4" />
      case "buy2get1":
      case "buy3special":
        return <Gift className="w-4 h-4" />
      default:
        return <Percent className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "percentage":
        return "Percentage"
      case "fixed":
        return "Fixed Amount"
      case "freeShipping":
        return "Free Shipping"
      case "buy2get1":
        return "Buy 2 Get 1"
      case "buy3special":
        return "Buy 3 Special"
      default:
        return type
    }
  }

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-light text-gray-900">Coupons</h2>
          <p className="text-gray-600">Manage discount coupons and promotional offers</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black text-white hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-2" />
              Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Coupon</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Coupon Code *</Label>
                  <Input
                    id="code"
                    placeholder="Enter coupon code"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Coupon Type *</Label>
                  <Select value={newCoupon.type} onValueChange={(value: any) => setNewCoupon({ ...newCoupon, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage Discount</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                      <SelectItem value="freeShipping">Free Shipping</SelectItem>
                      <SelectItem value="buy2get1">Buy 2 Get 1 Free</SelectItem>
                      <SelectItem value="buy3special">Buy 3 at Special Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="value">
                    {newCoupon.type === "percentage" ? "Percentage (%)" : 
                     newCoupon.type === "fixed" ? "Amount (₹)" :
                     newCoupon.type === "buy3special" ? "Special Price (₹)" : "Value"}
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    placeholder="0"
                    value={newCoupon.value}
                    onChange={(e) => setNewCoupon({ ...newCoupon, value: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                {newCoupon.type === "buy3special" && (
                  <div>
                    <Label htmlFor="specialPrice">Special Price (₹)</Label>
                    <Input
                      id="specialPrice"
                      type="number"
                      placeholder="0"
                      value={newCoupon.specialPrice}
                      onChange={(e) => setNewCoupon({ ...newCoupon, specialPrice: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the coupon offer"
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minOrderAmount">Minimum Order Amount (₹)</Label>
                  <Input
                    id="minOrderAmount"
                    type="number"
                    placeholder="0"
                    value={newCoupon.minOrderAmount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minOrderAmount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                {newCoupon.type === "percentage" && (
                  <div>
                    <Label htmlFor="maxDiscount">Maximum Discount (₹)</Label>
                    <Input
                      id="maxDiscount"
                      type="number"
                      placeholder="0"
                      value={newCoupon.maxDiscount}
                      onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="usageLimit">Total Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    placeholder="0 (unlimited)"
                    value={newCoupon.usageLimit}
                    onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="userUsageLimit">Per User Limit</Label>
                  <Input
                    id="userUsageLimit"
                    type="number"
                    placeholder="0 (unlimited)"
                    value={newCoupon.userUsageLimit}
                    onChange={(e) => setNewCoupon({ ...newCoupon, userUsageLimit: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newCoupon.startDate}
                    onChange={(e) => setNewCoupon({ ...newCoupon, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="expiryDate">Expiry Date *</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={newCoupon.expiryDate}
                    onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCoupon} className="bg-black text-white hover:bg-gray-800">
                  Create Coupon
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search coupons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Coupons List */}
      <Card>
        <CardHeader>
          <CardTitle>Coupon Inventory</CardTitle>
          <p className="text-sm text-gray-600">{filteredCoupons.length} coupons found</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading coupons...</div>
          ) : filteredCoupons.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No coupons found. Create your first coupon to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Coupon</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Value</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Usage</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Expiry</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoupons.map((coupon) => (
                    <motion.tr
                      key={coupon.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{coupon.code}</p>
                          <p className="text-sm text-gray-600 max-w-xs truncate">{coupon.description}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(coupon.type)}
                          <span className="text-sm">{getTypeLabel(coupon.type)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm">
                          {coupon.type === "percentage" ? `${coupon.value}%` :
                           coupon.type === "fixed" ? `₹${coupon.value}` :
                           coupon.type === "buy3special" ? `₹${coupon.specialPrice || coupon.value}` :
                           coupon.type === "freeShipping" ? "Free" : "Special"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm">
                          {coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ""}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={coupon.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {coupon.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">
                          {new Date(coupon.expiryDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

