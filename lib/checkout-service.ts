// Remove the problematic import and create a mock service instead
import { Address } from "./backend-api-enhanced";

export interface ShippingOption {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: string
  courierName: string
  courierCompanyId?: number
}

export interface Coupon {
  id: string
  code: string
  description: string
  type: "percentage" | "fixed"
  value: number
  minOrderValue: number
  maxDiscount?: number
  expiryDate: string
  usageLimit: number
  usedCount: number
  isActive: boolean
  discount: number
}

export interface PaymentMethod {
  id: string
  name: string
  type: "card" | "upi" | "netbanking" | "cod" | "wallet"
  description: string
  processingFee: number
  isActive: boolean
  icon?: string
}

export interface OrderSummary {
  subtotal: number
  discount: number
  shippingCost: number
  gst: number
  processingFee: number
  total: number
}

class CheckoutService {
  // Mock data for development
  private mockAddresses: Address[] = [
    {
      id: "addr_1",
      name: "John Doe",
      phone: "+91 9876543210",
      address: "123 Main Street, Apartment 4B",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      country: "India",
      isDefault: true,
      type: "home",
    },
    {
      id: "addr_2",
      name: "John Doe",
      phone: "+91 9876543210",
      address: "456 Business Park, Floor 5",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400070",
      country: "India",
      isDefault: false,
      type: "office",
    },
  ]

  private mockCoupons: Coupon[] = [
    {
      id: "coupon_1",
      code: "WELCOME10",
      description: "Get 10% off on your first order",
      type: "percentage",
      value: 10,
      minOrderValue: 1000,
      maxDiscount: 500,
      expiryDate: "2024-12-31",
      usageLimit: 100,
      usedCount: 25,
      isActive: true,
      discount: 0,
    },
    {
      id: "coupon_2",
      code: "FLAT200",
      description: "Flat ₹200 off on orders above ₹2000",
      type: "fixed",
      value: 200,
      minOrderValue: 2000,
      expiryDate: "2024-12-31",
      usageLimit: 50,
      usedCount: 10,
      isActive: true,
      discount: 0,
    },
    {
      id: "coupon_3",
      code: "FESTIVE25",
      description: "Festive special - 25% off (max ₹1000)",
      type: "percentage",
      value: 25,
      minOrderValue: 1500,
      maxDiscount: 1000,
      expiryDate: "2024-12-31",
      usageLimit: 200,
      usedCount: 75,
      isActive: true,
      discount: 0,
    },
  ]

  async checkMaintenanceMode(): Promise<{ isMaintenanceMode: boolean; message?: string }> {
    // In production, this would check a database or config
    return { isMaintenanceMode: false }
  }

  async getUserAddresses(userId: string): Promise<Address[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // In production, this would fetch from database
    return this.mockAddresses
  }

  async addUserAddress(userId: string, address: Omit<Address, "id">): Promise<Address> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const newAddress: Address = {
      ...address,
      id: `addr_${Date.now()}`,
    }

    this.mockAddresses.push(newAddress)
    return newAddress
  }

  async updateUserAddress(userId: string, addressId: string, updates: Partial<Address>): Promise<Address> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const addressIndex = this.mockAddresses.findIndex((addr) => addr.id === addressId)
    if (addressIndex === -1) {
      throw new Error("Address not found")
    }

    this.mockAddresses[addressIndex] = { ...this.mockAddresses[addressIndex], ...updates }
    return this.mockAddresses[addressIndex]
  }

  async deleteUserAddress(userId: string, addressId: string): Promise<void> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const addressIndex = this.mockAddresses.findIndex((addr) => addr.id === addressId)
    if (addressIndex === -1) {
      throw new Error("Address not found")
    }

    this.mockAddresses.splice(addressIndex, 1)
  }

  async getShippingOptions(pincode: string, weight: number): Promise<ShippingOption[]> {
    try {
      // Mock shipping options for now
      return [
        {
          id: "standard",
          name: "Standard Delivery",
          description: "Delivery in 5-7 business days",
          price: 99,
          estimatedDays: "5-7 days",
          courierName: "Standard Courier",
        },
        {
          id: "express",
          name: "Express Delivery",
          description: "Delivery in 2-3 business days",
          price: 199,
          estimatedDays: "2-3 days",
          courierName: "Express Courier",
        },
      ]
    } catch (error) {
      console.error("Failed to get shipping options:", error)

      // Return fallback options
      return [
        {
          id: "standard",
          name: "Standard Delivery",
          description: "Delivery in 5-7 business days",
          price: 99,
          estimatedDays: "5-7 days",
          courierName: "Standard Courier",
        },
        {
          id: "express",
          name: "Express Delivery",
          description: "Delivery in 2-3 business days",
          price: 199,
          estimatedDays: "2-3 days",
          courierName: "Express Courier",
        },
      ]
    }
  }

  async getAvailableCoupons(userId: string): Promise<Coupon[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // In production, this would filter based on user eligibility
    return this.mockCoupons.filter((coupon) => coupon.isActive)
  }

  async applyCoupon(code: string, orderTotal: number): Promise<{ success: boolean; coupon?: Coupon; error?: string }> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const coupon = this.mockCoupons.find((c) => c.code === code && c.isActive)

    if (!coupon) {
      return { success: false, error: "Invalid coupon code" }
    }

    if (orderTotal < coupon.minOrderValue) {
      return { success: false, error: `Minimum order value should be ₹${coupon.minOrderValue}` }
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return { success: false, error: "Coupon usage limit exceeded" }
    }

    // Calculate discount
    let discount = 0
    if (coupon.type === "percentage") {
      discount = (orderTotal * coupon.value) / 100
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount)
      }
    } else {
      discount = coupon.value
    }

    const appliedCoupon = { ...coupon, discount }

    return { success: true, coupon: appliedCoupon }
  }

  getPaymentMethods(): PaymentMethod[] {
    return [
      {
        id: "card",
        name: "Credit/Debit Card",
        type: "card",
        description: "Pay securely with your card",
        processingFee: 0,
        isActive: true,
        icon: "credit-card",
      },
      {
        id: "upi",
        name: "UPI",
        type: "upi",
        description: "Pay with Google Pay, PhonePe, Paytm",
        processingFee: 0,
        isActive: true,
        icon: "smartphone",
      },
      {
        id: "netbanking",
        name: "Net Banking",
        type: "netbanking",
        description: "Pay directly from your bank account",
        processingFee: 0,
        isActive: true,
        icon: "building",
      },
      {
        id: "cod",
        name: "Cash on Delivery",
        type: "cod",
        description: "Pay when you receive your order",
        processingFee: 50,
        isActive: true,
        icon: "banknote",
      },
      {
        id: "wallet",
        name: "Digital Wallet",
        type: "wallet",
        description: "Pay with Paytm, Amazon Pay, etc.",
        processingFee: 0,
        isActive: true,
        icon: "wallet",
      },
    ]
  }

  calculateOrderSummary(
    subtotal: number,
    shippingCost: number,
    coupon?: Coupon | null,
    paymentMethod?: PaymentMethod | null,
  ): OrderSummary {
    const discount = coupon?.discount || 0
    const discountedSubtotal = subtotal - discount
    const gst = Math.round(discountedSubtotal * 0.18) // 18% GST
    const processingFee = paymentMethod?.processingFee || 0
    const total = discountedSubtotal + shippingCost + gst + processingFee

    return {
      subtotal,
      discount,
      shippingCost,
      gst,
      processingFee,
      total,
    }
  }

  async processPayment(
    amount: number,
    orderId: string,
    paymentMethod: PaymentMethod,
    customerInfo: { name: string; email: string; phone: string },
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // For COD, no payment processing needed
    if (paymentMethod.type === "cod") {
      return { success: true, transactionId: `cod_${Date.now()}` }
    }

    // Simulate payment success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1

    if (isSuccess) {
      return { success: true, transactionId: `txn_${Date.now()}` }
    } else {
      return { success: false, error: "Payment failed. Please try again." }
    }
  }

  async createOrder(orderData: any): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
      // Simulate order creation delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const orderId = `order_${Date.now()}`

      // In production, this would:
      // 1. Save order to database
      // 2. Update inventory
      // 3. Send confirmation emails
      // 4. Create shipping label via Shiprocket

      console.log("Order created:", { orderId, orderData })

      return { success: true, orderId }
    } catch (error) {
      console.error("Order creation failed:", error)
      return { success: false, error: "Failed to create order" }
    }
  }

  async validatePincode(pincode: string): Promise<{ isValid: boolean; city?: string; state?: string }> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Basic pincode validation (6 digits)
    if (!/^\d{6}$/.test(pincode)) {
      return { isValid: false }
    }

    // Mock pincode data (in production, use a real pincode API)
    const pincodeData: Record<string, { city: string; state: string }> = {
      "400001": { city: "Mumbai", state: "Maharashtra" },
      "110001": { city: "New Delhi", state: "Delhi" },
      "560001": { city: "Bangalore", state: "Karnataka" },
      "600001": { city: "Chennai", state: "Tamil Nadu" },
      "700001": { city: "Kolkata", state: "West Bengal" },
      "411001": { city: "Pune", state: "Maharashtra" },
      "500001": { city: "Hyderabad", state: "Telangana" },
      "380001": { city: "Ahmedabad", state: "Gujarat" },
    }

    const data = pincodeData[pincode]
    if (data) {
      return { isValid: true, ...data }
    }

    // For unknown pincodes, assume valid but don't provide city/state
    return { isValid: true }
  }
}

export const checkoutService = new CheckoutService()
