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
import { Address } from "@/lib/backend-api-enhanced";

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
    <div>
      <p>Address Selector Component</p>
    </div>
  )
}




