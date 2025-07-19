interface ShippingAddress {
  name: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  country: string
}

interface ShipmentData {
  order_id: string
  order_date: string
  pickup_location: string
  billing_customer_name: string
  billing_last_name: string
  billing_address: string
  billing_city: string
  billing_pincode: string
  billing_state: string
  billing_country: string
  billing_email: string
  billing_phone: string
  shipping_is_billing: boolean
  order_items: Array<{
    name: string
    sku: string
    units: number
    selling_price: number
  }>
  payment_method: string
  sub_total: number
  length: number
  breadth: number
  height: number
  weight: number
}

interface ShippingRate {
  courier_company_id: number
  courier_name: string
  rate: number
  estimated_delivery_days: string
}

interface ShiprocketOrder {
  order_id: number
  shipment_id: number
  status: string
  status_code: number
  onboarding_completed_now: number
  awb_code?: string
  courier_name?: string
}

interface AWBResponse {
  awb_assign_status: number
  response: {
    data: {
      awb_code: string
      courier_name: string
      courier_company_id: number
    }
  }
}

interface PickupResponse {
  pickup_status: number
  response: {
    pickup_scheduled_date: string
    pickup_token_number: string
  }
}

interface ManifestResponse {
  status: number
  manifest_url?: string
}

interface LabelResponse {
  label_created: number
  response: {
    label_url: string
  }
}

interface InvoiceResponse {
  invoice_url: string
}

interface TrackingResponse {
  tracking_data: {
    track_status: number
    shipment_status: string
    shipment_track: Array<{
      date: string
      status: string
      activity: string
      location: string
    }>
  }
}

class ShippingService {
  private baseUrl = process.env.NEXT_PUBLIC_SHIPROCKET_API_URL || "https://apiv2.shiprocket.in/v1/external"
  private token: string | null = null
  private email = process.env.NEXT_PUBLIC_SHIPROCKET_EMAIL || ""
  private password = process.env.NEXT_PUBLIC_SHIPROCKET_PASSWORD || ""

  async authenticate(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: this.email,
          password: this.password,
        }),
      })

      if (!response.ok) {
        throw new Error(`Shiprocket authentication failed: ${response.status}`)
      }

      const data = await response.json()

      if (!data.token) {
        throw new Error("No token received from Shiprocket")
      }

      this.token = data.token
      console.log("Shiprocket authentication successful")
      return data.token
    } catch (error) {
      console.error("Shiprocket authentication error:", error)
      throw error
    }
  }

  async getAuthHeaders(): Promise<Record<string, string>> {
    if (!this.token) {
      await this.authenticate()
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.token}`,
    }
  }

  async checkServiceability(pincode: string): Promise<boolean> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(
        `${this.baseUrl}/courier/serviceability/?pickup_postcode=110001&delivery_postcode=${pincode}&weight=1&cod=0`,
        {
          headers,
        },
      )

      if (!response.ok) {
        console.error(`Serviceability check failed: ${response.status}`)
        return false
      }

      const data = await response.json()
      return data.status === 200 && data.data.available_courier_companies.length > 0
    } catch (error) {
      console.error("Serviceability check error:", error)
      return false
    }
  }

  async getShippingRates(
    pickupPincode: string,
    deliveryPincode: string,
    weight: number,
    cod = false,
  ): Promise<ShippingRate[]> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(
        `${this.baseUrl}/courier/serviceability/?pickup_postcode=${pickupPincode}&delivery_postcode=${deliveryPincode}&weight=${weight}&cod=${cod ? 1 : 0}`,
        { headers },
      )

      if (!response.ok) {
        throw new Error(`Failed to get shipping rates: ${response.status}`)
      }

      const data = await response.json()

      if (data.status !== 200) {
        throw new Error(`Shiprocket API error: ${data.message || "Unknown error"}`)
      }

      return data.data.available_courier_companies || []
    } catch (error) {
      console.error("Shipping rates error:", error)
      return []
    }
  }

  async createShipment(shipmentData: ShipmentData): Promise<ShiprocketOrder> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${this.baseUrl}/orders/create/adhoc`, {
        method: "POST",
        headers,
        body: JSON.stringify(shipmentData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to create shipment: ${response.status} - ${errorText}`)
      }

      const data = await response.json()

      if (!data.order_id || !data.shipment_id) {
        throw new Error("Invalid response from Shiprocket: missing order_id or shipment_id")
      }

      console.log("Shipment created successfully:", data)
      return data
    } catch (error) {
      console.error("Shipment creation error:", error)
      throw error
    }
  }

  async assignAWB(shipmentId: number): Promise<AWBResponse> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${this.baseUrl}/courier/assign/awb`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          shipment_id: shipmentId,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to assign AWB: ${response.status} - ${errorText}`)
      }

      const data = await response.json()

      if (data.awb_assign_status !== 1) {
        throw new Error(`AWB assignment failed: ${data.response?.message || "Unknown error"}`)
      }

      console.log("AWB assigned successfully:", data)
      return data
    } catch (error) {
      console.error("AWB assignment error:", error)
      throw error
    }
  }

  async generatePickup(shipmentId: number): Promise<PickupResponse> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${this.baseUrl}/courier/generate/pickup`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          shipment_id: [shipmentId],
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to generate pickup: ${response.status} - ${errorText}`)
      }

      const data = await response.json()

      if (data.pickup_status !== 1) {
        throw new Error(`Pickup generation failed: ${data.message || "Unknown error"}`)
      }

      console.log("Pickup generated successfully:", data)
      return data
    } catch (error) {
      console.error("Pickup generation error:", error)
      throw error
    }
  }

  async generateManifest(shipmentIds: number[]): Promise<ManifestResponse> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${this.baseUrl}/manifests/generate`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          shipment_id: shipmentIds,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to generate manifest: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log("Manifest generated successfully:", data)
      return data
    } catch (error) {
      console.error("Manifest generation error:", error)
      throw error
    }
  }

  async printManifest(orderId: number): Promise<string> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${this.baseUrl}/manifests/print`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          order_ids: [orderId],
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to print manifest: ${response.status} - ${errorText}`)
      }

      const data = await response.json()

      if (!data.manifest_url) {
        throw new Error("No manifest URL received")
      }

      console.log("Manifest printed successfully:", data.manifest_url)
      return data.manifest_url
    } catch (error) {
      console.error("Manifest printing error:", error)
      throw error
    }
  }

  async generateLabel(shipmentId: number): Promise<string> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${this.baseUrl}/courier/generate/label`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          shipment_id: [shipmentId],
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to generate label: ${response.status} - ${errorText}`)
      }

      const data: LabelResponse = await response.json()

      if (data.label_created !== 1 || !data.response?.label_url) {
        throw new Error("Label generation failed or no URL received")
      }

      console.log("Label generated successfully:", data.response.label_url)
      return data.response.label_url
    } catch (error) {
      console.error("Label generation error:", error)
      throw error
    }
  }

  async printInvoice(orderId: number): Promise<string> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${this.baseUrl}/orders/print/invoice`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ids: [orderId],
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to print invoice: ${response.status} - ${errorText}`)
      }

      const data: InvoiceResponse = await response.json()

      if (!data.invoice_url) {
        throw new Error("No invoice URL received")
      }

      console.log("Invoice printed successfully:", data.invoice_url)
      return data.invoice_url
    } catch (error) {
      console.error("Invoice printing error:", error)
      throw error
    }
  }

  async trackShipment(awbCode: string): Promise<TrackingResponse> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${this.baseUrl}/courier/track/awb/${awbCode}`, {
        headers,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to track shipment: ${response.status} - ${errorText}`)
      }

      const data: TrackingResponse = await response.json()
      console.log("Shipment tracking retrieved:", data)
      return data
    } catch (error) {
      console.error("Shipment tracking error:", error)
      throw error
    }
  }

  async cancelShipment(awbCode: string): Promise<any> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${this.baseUrl}/orders/cancel`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          awbs: [awbCode],
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to cancel shipment: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log("Shipment cancelled successfully:", data)
      return data
    } catch (error) {
      console.error("Shipment cancellation error:", error)
      throw error
    }
  }

  async getPickupLocations(): Promise<any> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${this.baseUrl}/settings/company/pickup`, {
        headers,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to get pickup locations: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log("Pickup locations retrieved:", data)
      return data
    } catch (error) {
      console.error("Pickup locations error:", error)
      throw error
    }
  }

  // Complete workflow method that handles the entire shipping process
  async processCompleteShipment(shipmentData: ShipmentData): Promise<{
    orderId: number
    shipmentId: number
    awbCode: string
    courierName: string
    labelUrl: string
    invoiceUrl: string
    manifestUrl: string
    pickupScheduled: boolean
  }> {
    try {
      console.log("Starting complete shipment process...")

      // Step 1: Create shipment
      const shipmentResult = await this.createShipment(shipmentData)
      console.log("✅ Step 1: Shipment created", shipmentResult)

      // Step 2: Assign AWB
      const awbResult = await this.assignAWB(shipmentResult.shipment_id)
      console.log("✅ Step 2: AWB assigned", awbResult)

      // Step 3: Generate pickup
      const pickupResult = await this.generatePickup(shipmentResult.shipment_id)
      console.log("✅ Step 3: Pickup generated", pickupResult)

      // Step 4: Generate manifest
      const manifestResult = await this.generateManifest([shipmentResult.shipment_id])
      console.log("✅ Step 4: Manifest generated", manifestResult)

      // Step 5: Print manifest
      const manifestUrl = await this.printManifest(shipmentResult.order_id)
      console.log("✅ Step 5: Manifest printed", manifestUrl)

      // Step 6: Generate label
      const labelUrl = await this.generateLabel(shipmentResult.shipment_id)
      console.log("✅ Step 6: Label generated", labelUrl)

      // Step 7: Print invoice
      const invoiceUrl = await this.printInvoice(shipmentResult.order_id)
      console.log("✅ Step 7: Invoice printed", invoiceUrl)

      const result = {
        orderId: shipmentResult.order_id,
        shipmentId: shipmentResult.shipment_id,
        awbCode: awbResult.response.data.awb_code,
        courierName: awbResult.response.data.courier_name,
        labelUrl,
        invoiceUrl,
        manifestUrl,
        pickupScheduled: pickupResult.pickup_status === 1,
      }

      console.log("🎉 Complete shipment process finished successfully:", result)
      return result
    } catch (error) {
      console.error("❌ Complete shipment process failed:", error)
      throw error
    }
  }

  // Helper method to format shipment data from order
  formatShipmentData(order: any, pickupLocation = "Primary"): ShipmentData {
    const orderDate = new Date().toISOString().split("T")[0] // YYYY-MM-DD format

    return {
      order_id: order.id.toString(),
      order_date: orderDate,
      pickup_location: pickupLocation,
      billing_customer_name: order.shippingAddress.name.split(" ")[0] || order.shippingAddress.name,
      billing_last_name: order.shippingAddress.name.split(" ").slice(1).join(" ") || "",
      billing_address: order.shippingAddress.address,
      billing_city: order.shippingAddress.city,
      billing_pincode: order.shippingAddress.pincode,
      billing_state: order.shippingAddress.state,
      billing_country: order.shippingAddress.country || "India",
      billing_email: order.customerEmail || "customer@fragransia.in",
      billing_phone: order.shippingAddress.phone,
      shipping_is_billing: true,
      order_items: order.items.map((item: any) => ({
        name: item.name,
        sku: item.productId || item.id,
        units: item.quantity,
        selling_price: item.price,
      })),
      payment_method: order.paymentMethod?.type === "cod" ? "COD" : "Prepaid",
      sub_total: order.total,
      length: 15, // Default dimensions in cm
      breadth: 10,
      height: 5,
      weight: order.items.reduce((total: number, item: any) => total + item.quantity * 0.5, 0), // 0.5kg per item
    }
  }
}

// Create and export the service instance
export const shippingService = new ShippingService()

// Export types for use in other files
export type {
  ShippingAddress,
  ShipmentData,
  ShippingRate,
  ShiprocketOrder,
  AWBResponse,
  PickupResponse,
  ManifestResponse,
  LabelResponse,
  InvoiceResponse,
  TrackingResponse,
}

// Also export as default
export default shippingService


