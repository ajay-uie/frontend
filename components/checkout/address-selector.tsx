"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Plus, Edit, Trash2, Home, Building, MapIcon, Check, X } from "lucide-react"
import { toast } from "sonner"
import type { Address } from "@/lib/backend-api-enhanced"
import { newBackendApi } from "@/lib/new-backend-api"
import { useAuth } from "@/contexts/auth-context"
import logger from "@/utils/logger"

interface AddressSelectorProps {
  addresses: Address[]
  selectedAddress: Address | null
  onAddressSelect: (address: Address) => void
  onAddressAdd: (address: Address) => void
  onAddressUpdate?: (address: Address) => void
  onAddressDelete?: (addressId: string) => void
}

export default function AddressSelector({
  addresses: initialAddresses,
  selectedAddress,
  onAddressSelect,
  onAddressAdd,
  onAddressUpdate,
  onAddressDelete,
}: AddressSelectorProps) {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    type: "home" as "home" | "office" | "other",
    isDefault: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi",
  ]

  useEffect(() => {
    setAddresses(initialAddresses)
  }, [initialAddresses])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^[+]?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format"
    }
    if (!formData.address.trim()) newErrors.address = "Address is required"
    if (!formData.city.trim()) newErrors.city = "City is required"
    if (!formData.state) newErrors.state = "State is required"
    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required"
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      type: "home",
      isDefault: false,
    })
    setEditingAddress(null)
    setErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    logger.userAction("address_form_submit", { editing: !!editingAddress }, "AddressSelector")

    try {
      if (editingAddress) {
        // Update existing address
        const response = await newBackendApi.updateAddress(editingAddress.id, formData)

        if (response.success && response.data?.address) {
          const updatedAddress = response.data.address
          setAddresses((prev) => prev.map((addr) => (addr.id === editingAddress.id ? updatedAddress : addr)))
          onAddressUpdate?.(updatedAddress)
          toast.success("Address updated successfully")
          logger.success("Address updated", { addressId: editingAddress.id })
        } else {
          throw new Error(response.error || "Failed to update address")
        }
      } else {
        // Add new address
        const response = await newBackendApi.addAddress(formData)

        if (response.success && response.data?.address) {
          const newAddress = response.data.address
          setAddresses((prev) => [...prev, newAddress])
          onAddressAdd(newAddress)

          // If this is the first address or marked as default, select it
          if (addresses.length === 0 || formData.isDefault) {
            onAddressSelect(newAddress)
          }

          toast.success("Address added successfully")
          logger.success("Address added", { addressId: newAddress.id })
        } else {
          throw new Error(response.error || "Failed to add address")
        }
      }

      setShowAddForm(false)
      resetForm()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save address"
      toast.error(errorMessage)
      logger.error("Address save failed", error, "AddressSelector")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setFormData({
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country || "India",
      type: address.type,
      isDefault: address.isDefault,
    })
    setShowAddForm(true)
    logger.userAction("address_edit_start", { addressId: address.id }, "AddressSelector")
  }

  const handleDelete = async (address: Address) => {
    if (!confirm("Are you sure you want to delete this address?")) return

    setIsLoading(true)
    logger.userAction("address_delete_attempt", { addressId: address.id }, "AddressSelector")

    try {
      const response = await newBackendApi.deleteAddress(address.id)

      if (response.success) {
        setAddresses((prev) => prev.filter((addr) => addr.id !== address.id))
        onAddressDelete?.(address.id)

        // If deleted address was selected, clear selection
        if (selectedAddress?.id === address.id) {
          const remainingAddresses = addresses.filter((addr) => addr.id !== address.id)
          if (remainingAddresses.length > 0) {
            onAddressSelect(remainingAddresses[0])
          }
        }

        toast.success("Address deleted successfully")
        logger.success("Address deleted", { addressId: address.id })
      } else {
        throw new Error(response.error || "Failed to delete address")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete address"
      toast.error(errorMessage)
      logger.error("Address delete failed", error, "AddressSelector")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetDefault = async (address: Address) => {
    setIsLoading(true)
    logger.userAction("address_set_default", { addressId: address.id }, "AddressSelector")

    try {
      const response = await newBackendApi.updateAddress(address.id, { isDefault: true })

      if (response.success && response.data?.address) {
        // Update all addresses - set others to non-default
        setAddresses((prev) =>
          prev.map((addr) => ({
            ...addr,
            isDefault: addr.id === address.id,
          })),
        )

        onAddressSelect(response.data.address)
        toast.success("Default address updated")
        logger.success("Default address set", { addressId: address.id })
      } else {
        throw new Error(response.error || "Failed to set default address")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to set default address"
      toast.error(errorMessage)
      logger.error("Set default address failed", error, "AddressSelector")
    } finally {
      setIsLoading(false)
    }
  }

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Home className="w-4 h-4" />
      case "office":
        return <Building className="w-4 h-4" />
      default:
        return <MapIcon className="w-4 h-4" />
    }
  }

  const getAddressTypeColor = (type: string) => {
    switch (type) {
      case "home":
        return "bg-blue-100 text-blue-800"
      case "office":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Delivery Address</h3>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetForm()
                logger.userAction("address_add_start", undefined, "AddressSelector")
              }}
              disabled={isLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
              <DialogDescription>
                {editingAddress ? "Update your delivery address details" : "Add a new delivery address to your account"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 9876543210"
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="House/Flat No, Street, Area"
                  className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                    className={errors.city ? "border-red-500" : ""}
                  />
                  {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData((prev) => ({ ...prev, pincode: e.target.value }))}
                    placeholder="400001"
                    maxLength={6}
                    className={errors.pincode ? "border-red-500" : ""}
                  />
                  {errors.pincode && <p className="text-sm text-red-500 mt-1">{errors.pincode}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="state">State *</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, state: value }))}
                >
                  <SelectTrigger className={errors.state ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {indianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
              </div>

              <div>
                <Label htmlFor="type">Address Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "home" | "office" | "other") =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Home
                      </div>
                    </SelectItem>
                    <SelectItem value="office">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Office
                      </div>
                    </SelectItem>
                    <SelectItem value="other">
                      <div className="flex items-center gap-2">
                        <MapIcon className="w-4 h-4" />
                        Other
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isDefault: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="isDefault" className="text-sm">
                  Set as default address
                </Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-black text-white hover:bg-gray-800" disabled={isLoading}>
                  {isLoading ? (
                    "Saving..."
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {editingAddress ? "Update Address" : "Save Address"}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false)
                    resetForm()
                  }}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <MapPin className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No addresses found</p>
            <Button
              onClick={() => {
                resetForm()
                setShowAddForm(true)
              }}
              className="bg-black text-white hover:bg-gray-800"
            >
              Add Your First Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <RadioGroup
          value={selectedAddress?.id || ""}
          onValueChange={(value) => {
            const address = addresses.find((addr) => addr.id === value)
            if (address) {
              onAddressSelect(address)
              logger.userAction("address_selected", { addressId: address.id }, "AddressSelector")
            }
          }}
          className="space-y-3"
        >
          {addresses.map((address) => (
            <div key={address.id} className="relative">
              <Card
                className={`cursor-pointer transition-colors ${
                  selectedAddress?.id === address.id ? "ring-2 ring-black bg-gray-50" : "hover:bg-gray-50"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getAddressTypeIcon(address.type)}
                        <span className="font-medium">{address.name}</span>
                        <Badge className={getAddressTypeColor(address.type)}>{address.type}</Badge>
                        {address.isDefault && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{address.address}</p>
                      <p className="text-sm text-gray-600 mb-1">
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      <p className="text-sm text-gray-600">Phone: {address.phone}</p>
                    </div>
                    <div className="flex gap-1">
                      {!address.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSetDefault(address)
                          }}
                          disabled={isLoading}
                          title="Set as default"
                        >
                          <MapPin className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(address)
                        }}
                        disabled={isLoading}
                        title="Edit address"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(address)
                        }}
                        disabled={isLoading}
                        className="text-red-500 hover:text-red-700"
                        title="Delete address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </RadioGroup>
      )}
    </div>
  )
}
