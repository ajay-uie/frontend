"use client"

import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Truck, Clock, Shield, Zap } from "lucide-react"

interface ShippingOption {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: string
  provider: string
}

interface ShippingOptionsProps {
  options: ShippingOption[]
  selectedOption: ShippingOption | null
  onOptionSelect: (option: ShippingOption) => void
}

export default function ShippingOptions({ options, selectedOption, onOptionSelect }: ShippingOptionsProps) {
  const getShippingIcon = (optionId: string) => {
    if (optionId.includes("express") || optionId.includes("fast")) {
      return <Zap className="w-5 h-5 text-orange-500" />
    }
    return <Truck className="w-5 h-5 text-blue-500" />
  }

  const getShippingBadge = (option: ShippingOption) => {
    if (option.price === 0) {
      return <Badge className="bg-green-100 text-green-800">FREE</Badge>
    }
    if (option.id.includes("express")) {
      return <Badge className="bg-orange-100 text-orange-800">FAST</Badge>
    }
    return null
  }

  if (options.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Truck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No shipping options available for this location.</p>
      </div>
    )
  }

  return (
    <RadioGroup
      value={selectedOption?.id || ""}
      onValueChange={(value) => {
        const option = options.find((opt) => opt.id === value)
        if (option) onOptionSelect(option)
      }}
    >
      <div className="space-y-3">
        {options.map((option) => (
          <div key={option.id} className="flex items-center space-x-3">
            <RadioGroupItem value={option.id} id={option.id} />
            <Label
              htmlFor={option.id}
              className="flex-1 cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Card className="border-0 shadow-none">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getShippingIcon(option.id)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{option.name}</h3>
                          {getShippingBadge(option)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{option.estimatedDays}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            <span>Insured delivery</span>
                          </div>
                          <span>by {option.provider}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{option.price === 0 ? "FREE" : `₹${option.price}`}</div>
                      {option.price > 0 && <div className="text-xs text-gray-500">+ taxes</div>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Label>
          </div>
        ))}
      </div>
    </RadioGroup>
  )
}
