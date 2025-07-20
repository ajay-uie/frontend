"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
import { Search, Plus, Edit, Trash2, Copy, Calendar, Percent, DollarSign, Users, X } from "lucide-react"
import { useAdminAuth } from "@/contexts/admin-auth-context"

interface Coupon {
  id: string
  code: string
  name: string
  description: string
  type: "percentage" | "fixed"
  value: number
  minimumAmount?: number
  maximumDiscount?: number
  usageLimit?: number
  usedCount: number
  isActive: boolean
  startDate: string
  endDate: string
  applicableProducts?: string[]
  applicableCategories?: string[]
  createdAt: string
  updatedAt: string
}

export function CouponsPanel() {
  const { token } = useAdminAuth()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [message, setMessage] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    type: "percentage",
    value: "",
    minimumAmount: "",
    maximumDiscount: "",
    usageLimit: "",
    isActive: true,
    startDate: "",
    endDate: ""
  })

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  useEffect(() => {
    loadCoupons()
  }, [currentPage, selectedType, selectedStatus, searchTerm])

  const loadCoupons = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20"
      })
      
      if (searchTerm) params.append("search", searchTerm)
      if (selectedType !== "all") params.append("type", selectedType)
      if (selectedStatus !== "all") params.append("status", selectedStatus)

      const response = await fetch(`${API_BASE_URL}/api/admin/coupons?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      if (data.success) {
        setCoupons(data.data || [])
        setTotalPages(data.pagination?.totalPages || 1)
      } else {
        setMessage("Failed to load coupons")
      }
    } catch (error) {
      console.error("Failed to load coupons:", error)
      setMessage("Failed to load coupons")
    } finally {
      setLoading(false)
    }
  }

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({...formData, code: result})
  }

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    
    try {
      const couponData = {
        ...formData,
        value: parseFloat(formData.value),
        minimumAmount: formData.minimumAmount ? parseFloat(formData.minimumAmount) : undefined,
        maximumDiscount: formData.maximumDiscount ? parseFloat(formData.maximumDiscount) : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/coupons`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(couponData)
      })

      const data = await response.json()
      if (data.success) {
        setMessage("Coupon created successfully!")
        resetForm()
        setIsAddDialogOpen(false)
        loadCoupons()
      } else {
        setMessage(`Error: ${data.error || "Failed to create coupon"}`)
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message || "An unexpected error occurred"}`)
    }
  }

  const handleUpdateCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCoupon) return
    
    setMessage("")
    
    try {
      const couponData = {
        ...formData,
        value: parseFloat(formData.value),
        minimumAmount: formData.minimumAmount ? parseFloat(formData.minimumAmount) : undefined,
        maximumDiscount: formData.maximumDiscount ? parseFloat(formData.maximumDiscount) : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/coupons/${editingCoupon.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(couponData)
      })

      const data = await response.json()
      if (data.success) {
        setMessage("Coupon updated successfully!")
        resetForm()
        setIsEditDialogOpen(false)
        setEditingCoupon(null)
        loadCoupons()
      } else {
        setMessage(`Error: ${data.error || "Failed to update coupon"}`)
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message || "An unexpected error occurred"}`)
    }
  }

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/coupons/${couponId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      if (data.success) {
        setMessage("Coupon deleted successfully!")
        loadCoupons()
      } else {
        setMessage(`Error: ${data.error || "Failed to delete coupon"}`)
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message || "An unexpected error occurred"}`)
    }
  }

  const openEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value.toString(),
      minimumAmount: coupon.minimumAmount?.toString() || "",
      maximumDiscount: coupon.maximumDiscount?.toString() || "",
      usageLimit: coupon.usageLimit?.toString() || "",
      isActive: coupon.isActive,
      startDate: coupon.startDate.split('T')[0],
      endDate: coupon.endDate.split('T')[0]
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      type: "percentage",
      value: "",
      minimumAmount: "",
      maximumDiscount: "",
      usageLimit: "",
      isActive: true,
      startDate: "",
      endDate: ""
    })
    setMessage("")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setMessage("Coupon code copied to clipboard!")
  }

  const getStatusBadge = (coupon: Coupon) => {
    const now = new Date()
    const startDate = new Date(coupon.startDate)
    const endDate = new Date(coupon.endDate)

    if (!coupon.isActive) {
      return <Badge variant="secondary">Inactive</Badge>
    } else if (now < startDate) {
      return <Badge variant="outline">Scheduled</Badge>
    } else if (now > endDate) {
      return <Badge variant="destructive">Expired</Badge>
    } else if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return <Badge variant="destructive">Limit Reached</Badge>
    } else {
      return <Badge variant="default">Active</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    return type === "percentage" ? 
      <Badge variant="secondary"><Percent className="w-3 h-3 mr-1" />Percentage</Badge> : 
      <Badge variant="outline"><DollarSign className="w-3 h-3 mr-1" />Fixed Amount</Badge>
  }

  const CouponForm = ({ onSubmit, isEdit = false }: { onSubmit: (e: React.FormEvent) => void, isEdit?: boolean }) => (
    <form onSubmit={onSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Coupon Code *</Label>
          <div className="flex space-x-2">
            <Input 
              id="code" 
              placeholder="Enter coupon code"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
              required
            />
            <Button type="button" variant="outline" onClick={generateCouponCode}>
              Generate
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Coupon Name *</Label>
          <Input 
            id="name" 
            placeholder="Enter coupon name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input 
          id="description" 
          placeholder="Enter coupon description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Discount Type *</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select discount type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="value">
            {formData.type === "percentage" ? "Discount Percentage *" : "Discount Amount (₹) *"}
          </Label>
          <Input 
            id="value" 
            type="number"
            step={formData.type === "percentage" ? "0.01" : "1"}
            max={formData.type === "percentage" ? "100" : undefined}
            placeholder={formData.type === "percentage" ? "0.00" : "0"}
            value={formData.value}
            onChange={(e) => setFormData({...formData, value: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minimumAmount">Minimum Order Amount (₹)</Label>
          <Input 
            id="minimumAmount" 
            type="number"
            placeholder="0"
            value={formData.minimumAmount}
            onChange={(e) => setFormData({...formData, minimumAmount: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maximumDiscount">Maximum Discount (₹)</Label>
          <Input 
            id="maximumDiscount" 
            type="number"
            placeholder="0"
            value={formData.maximumDiscount}
            onChange={(e) => setFormData({...formData, maximumDiscount: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="usageLimit">Usage Limit</Label>
          <Input 
            id="usageLimit" 
            type="number"
            placeholder="Unlimited"
            value={formData.usageLimit}
            onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input 
            id="startDate" 
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date *</Label>
          <Input 
            id="endDate" 
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({...formData, endDate: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
        />
        <Label htmlFor="isActive">Active Coupon</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            resetForm()
            setIsAddDialogOpen(false)
            setIsEditDialogOpen(false)
            setEditingCoupon(null)
          }}
        >
          Cancel
        </Button>
        <Button type="submit">
          {isEdit ? "Update Coupon" : "Create Coupon"}
        </Button>
      </div>
    </form>
  )

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch =
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || coupon.type === selectedType
    const matchesStatus = selectedStatus === "all" || 
      (selectedStatus === "active" && coupon.isActive) ||
      (selectedStatus === "inactive" && !coupon.isActive)
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Coupons</h2>
          <p className="text-muted-foreground">Manage discount coupons and promotional codes</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Coupon</DialogTitle>
              <DialogDescription>Create a new discount coupon for your store</DialogDescription>
            </DialogHeader>
            <CouponForm onSubmit={handleCreateCoupon} />
            {message && (
              <div className={`mt-4 p-3 rounded-md text-sm ${
                message.includes("Error") 
                  ? "bg-red-50 text-red-700 border border-red-200" 
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}>
                {message}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>Update coupon information</DialogDescription>
          </DialogHeader>
          <CouponForm onSubmit={handleUpdateCoupon} isEdit={true} />
          {message && (
            <div className={`mt-4 p-3 rounded-md text-sm ${
              message.includes("Error") 
                ? "bg-red-50 text-red-700 border border-red-200" 
                : "bg-green-50 text-green-700 border border-green-200"
            }`}>
              {message}
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                  placeholder="Search coupons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>Coupon Management</CardTitle>
          <CardDescription>{filteredCoupons.length} coupons found</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading coupons...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Valid Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                            {coupon.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(coupon.code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{coupon.name}</div>
                          {coupon.description && (
                            <div className="text-sm text-muted-foreground">{coupon.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(coupon.type)}
                      </TableCell>
                      <TableCell>
                        {coupon.type === "percentage" ? `${coupon.value}%` : `₹${coupon.value}`}
                        {coupon.maximumDiscount && (
                          <div className="text-sm text-muted-foreground">
                            Max: ₹{coupon.maximumDiscount}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-muted-foreground" />
                          {coupon.usedCount}/{coupon.usageLimit || "∞"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1 text-muted-foreground" />
                            {new Date(coupon.startDate).toLocaleDateString()}
                          </div>
                          <div className="text-muted-foreground">
                            to {new Date(coupon.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(coupon)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditDialog(coupon)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteCoupon(coupon.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
