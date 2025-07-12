"use client"

import { useState } from "react"
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
import { MapPin, Plus, Edit, Trash2, Home, Building, MapIcon } from "lucide-react"
import { toast } from "sonner"

interface Address {
  id: string
  name: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  country: string
  isDefault: boolean
  type: "home" | "office" | "other"
}

interface AddressSelectorProps {
  addresses: Address[]
  selectedAddress: Address | null
  onAddressSelect: (address: Address) => void
  onAddressAdd: (address: Address) => void
}

export default function AddressSelector({
  addresses,
  selectedAddress,
  onAddressSelect,
  onAddressAdd,
}: AddressSelectorProps) {
  const [showAddForm, setShowAddForm] = useState(false)
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) newErrors.phone = "Invalid phone number"
    if (!formData.address.trim()) newErrors.address = "Address is required"
    if (!formData.city.trim()) newErrors.city = "City is required"
    if (!formData.state) newErrors.state = "State is required"
    if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required"
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = "Invalid pincode"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const newAddress: Address = {
        id: `addr_${Date.now()}`,
        ...formData,
      }

      onAddressAdd(newAddress)
      setShowAddForm(false)
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
      toast.success("Address added successfully")
    } catch (error) {
      toast.error("Failed to add address")
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
      {/* Existing Addresses */}
      {addresses.length > 0 && (
        <RadioGroup
          value={selectedAddress?.id || ""}
          onValueChange={(value) => {
            const address = addresses.find((addr) => addr.id === value)
            if (address) onAddressSelect(address)
          }}
        >
          <div className="space-y-3">
            {addresses.map((address) => (
              <div key={address.id} className="flex items-start space-x-3">
                <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                <Label
                  htmlFor={address.id}
                  className="flex-1 cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{address.name}</span>
                      <Badge className={getAddressTypeColor(address.type)}>
                        <div className="flex items-center gap-1">
                          {getAddressTypeIcon(address.type)}
                          <span className="capitalize">{address.type}</span>
                        </div>
                      </Badge>
                      {address.isDefault && <Badge variant="secondary">Default</Badge>}
                    </div>
                    <p className="text-sm text-gray-600">{address.phone}</p>
                    <p className="text-sm text-gray-700">
                      {address.address}, {address.city}, {address.state} - {address.pincode}
                    </p>
                  </div>
                </Label>
                <div className="flex items-center gap-1 mt-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </RadioGroup>
      )}

      {/* Add New Address */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full bg-transparent">
            <Plus className="w-4 h-4 mr-2" />
            Add New Address
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
            <DialogDescription>Add a new delivery address to your account</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                placeholder="House/Flat/Office No., Building Name, Street"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={errors.city ? "border-red-500" : ""}
                />
                {errors.city && <p className="text-sm text-red-600 mt-1">{errors.city}</p>}
              </div>
              <div>
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className={errors.pincode ? "border-red-500" : ""}
                />
                {errors.pincode && <p className="text-sm text-red-600 mt-1">{errors.pincode}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">State *</Label>
                <Select value={formData.state} onValueChange={(value) => setFormData({ ...formData, state: value })}>
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
                {errors.state && <p className="text-sm text-red-600 mt-1">{errors.state}</p>}
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={formData.country} disabled className="bg-gray-50" />
              </div>
            </div>

            <div>
              <Label>Address Type</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value: "home" | "office" | "other") => setFormData({ ...formData, type: value })}
                className="flex gap-6 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="home" id="home" />
                  <Label htmlFor="home" className="flex items-center gap-2 cursor-pointer">
                    <Home className="w-4 h-4" />
                    Home
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="office" id="office" />
                  <Label htmlFor="office" className="flex items-center gap-2 cursor-pointer">
                    <Building className="w-4 h-4" />
                    Office
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="flex items-center gap-2 cursor-pointer">
                    <MapIcon className="w-4 h-4" />
                    Other
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isDefault" className="cursor-pointer">
                Make this my default address
              </Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
                {isLoading ? "Adding..." : "Add Address"}
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {addresses.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No addresses found. Add your first delivery address.</p>
        </div>
      )}
    </div>
  )
}
