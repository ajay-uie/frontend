"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, MapPin, Edit, Trash2, Home, Building, Star, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import type { Address } from "@/lib/firebase-service"

export default function AddressManager() {
  const { userProfile, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    label: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  })

  const addresses = userProfile?.addresses || []

  const addressLabels = [
    { value: "home", label: "Home", icon: Home },
    { value: "work", label: "Work", icon: Building },
    { value: "other", label: "Other", icon: MapPin },
  ]

  const resetForm = () => {
    setFormData({
      label: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India",
    })
    setEditingAddress(null)
  }

  const handleSave = async () => {
    if (!formData.street || !formData.city || !formData.state || !formData.zipCode) {
      return
    }

    setLoading(true)
    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, formData)
      } else {
        await addAddress({
          ...formData,
          isDefault: addresses.length === 0, // First address is default
        })
      }

      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving address:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setFormData({
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (addressId: string) => {
    setLoading(true)
    try {
      await deleteAddress(addressId)
    } catch (error) {
      console.error("Error deleting address:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSetDefault = async (addressId: string) => {
    setLoading(true)
    try {
      await setDefaultAddress(addressId)
    } catch (error) {
      console.error("Error setting default address:", error)
    } finally {
      setLoading(false)
    }
  }

  const getLabelIcon = (label: string) => {
    const labelData = addressLabels.find((l) => l.value === label.toLowerCase())
    return labelData?.icon || MapPin
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Saved Addresses</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-black text-white hover:bg-gray-800" disabled={loading}>
              <Plus className="w-4 h-4 mr-2" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address Label</label>
                <Select value={formData.label} onValueChange={(value) => setFormData({ ...formData, label: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select address type" />
                  </SelectTrigger>
                  <SelectContent>
                    {addressLabels.map((label) => (
                      <SelectItem key={label.value} value={label.value}>
                        <div className="flex items-center gap-2">
                          <label.icon className="w-4 h-4" />
                          {label.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                <Textarea
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="Enter complete street address"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                  <Input
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder="ZIP Code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <Input
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Country"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-black text-white hover:bg-gray-800"
                  disabled={loading}
                >
                  <Check className="w-4 h-4 mr-2" />
                  {loading ? "Saving..." : editingAddress ? "Update" : "Save"} Address
                </Button>
                <Button onClick={() => setIsDialogOpen(false)} variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <AnimatePresence>
        {addresses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg"
          >
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No addresses saved yet</p>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline" disabled={loading}>
              Add Your First Address
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {addresses.map((address) => {
              const IconComponent = getLabelIcon(address.label)
              return (
                <motion.div
                  key={address.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900 capitalize">{address.label}</h4>
                          {address.isDefault && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <Star className="w-3 h-3 mr-1" />
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {address.street}
                          <br />
                          {address.city}, {address.state} {address.zipCode}
                          <br />
                          {address.country}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!address.isDefault && (
                        <Button
                          onClick={() => handleSetDefault(address.id)}
                          variant="ghost"
                          size="sm"
                          className="text-gray-500 hover:text-gray-700"
                          disabled={loading}
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        onClick={() => handleEdit(address)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700"
                        disabled={loading}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(address.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
