import { PAYMENT_CONFIG } from "./constants"
import { newBackendApi } from "./new-backend-api"
import logger from "@/utils/logger"

declare global {
  interface Window {
    Razorpay: any
  }
}

interface PaymentData {
  method: string
  amount: number
  currency: string
  orderData: any
  paymentDetails?: any
}

interface PaymentResult {
  success: boolean
  data?: any
  error?: string
}

class PaymentService {
  private razorpayLoaded = false

  constructor() {
    if (typeof window !== "undefined") {
      this.loadRazorpaySDK()
    }
  }

  private async loadRazorpaySDK(): Promise<void> {
    if (this.razorpayLoaded || typeof window === "undefined") {
      return
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => {
        this.razorpayLoaded = true
        logger.success("Razorpay SDK loaded successfully", undefined, "PaymentService")
        resolve()
      }
      script.onerror = () => {
        logger.error("Failed to load Razorpay SDK", undefined, "PaymentService")
        reject(new Error("Failed to load Razorpay SDK"))
      }
      document.head.appendChild(script)
    })
  }

  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      logger.info("Processing payment", { method: paymentData.method, amount: paymentData.amount }, "PaymentService")

      // Create order on backend
      const orderResponse = await newBackendApi.createPaymentOrder({
        amount: paymentData.amount,
        currency: paymentData.currency,
        method: paymentData.method,
        orderData: paymentData.orderData,
      })

      if (!orderResponse.success || !orderResponse.data) {
        throw new Error(orderResponse.error || "Failed to create payment order")
      }

      const { razorpayOrderId, orderId } = orderResponse.data

      // Process payment based on method
      switch (paymentData.method) {
        case "card":
        case "upi":
        case "netbanking":
        case "wallet":
          return await this.processRazorpayPayment(razorpayOrderId, orderId, paymentData)
        default:
          throw new Error(`Unsupported payment method: ${paymentData.method}`)
      }
    } catch (error) {
      logger.error("Payment processing failed", error, "PaymentService")
      return {
        success: false,
        error: error instanceof Error ? error.message : "Payment processing failed",
      }
    }
  }

  private async processRazorpayPayment(
    razorpayOrderId: string,
    orderId: string,
    paymentData: PaymentData,
  ): Promise<PaymentResult> {
    try {
      // Ensure Razorpay SDK is loaded
      await this.loadRazorpaySDK()

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not available")
      }

      return new Promise((resolve) => {
        const options = {
          key: PAYMENT_CONFIG.RAZORPAY.KEY_ID,
          amount: paymentData.amount * 100, // Convert to paise
          currency: paymentData.currency,
          name: "Fragransia™",
          description: "Premium Fragrances & Perfumes",
          order_id: razorpayOrderId,
          theme: {
            color: PAYMENT_CONFIG.RAZORPAY.THEME_COLOR,
          },
          modal: {
            ondismiss: () => {
              logger.warn("Payment modal dismissed by user", { orderId }, "PaymentService")
              resolve({
                success: false,
                error: "Payment cancelled by user",
              })
            },
          },
          handler: async (response: any) => {
            try {
              logger.info("Razorpay payment response received", response, "PaymentService")

              // Verify payment on backend
              const verificationResponse = await newBackendApi.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId,
              })

              if (verificationResponse.success) {
                logger.success("Payment verified successfully", verificationResponse.data, "PaymentService")
                resolve({
                  success: true,
                  data: verificationResponse.data,
                })
              } else {
                throw new Error(verificationResponse.error || "Payment verification failed")
              }
            } catch (error) {
              logger.error("Payment verification failed", error, "PaymentService")
              resolve({
                success: false,
                error: error instanceof Error ? error.message : "Payment verification failed",
              })
            }
          },
          prefill: {
            name: paymentData.orderData.shippingAddress?.name || "",
            email: paymentData.orderData.shippingAddress?.email || "",
            contact: paymentData.orderData.shippingAddress?.phone || "",
          },
          notes: {
            order_id: orderId,
            payment_method: paymentData.method,
          },
        }

        const razorpay = new window.Razorpay(options)
        razorpay.open()

        logger.info("Razorpay payment modal opened", { orderId, razorpayOrderId }, "PaymentService")
      })
    } catch (error) {
      logger.error("Razorpay payment failed", error, "PaymentService")
      return {
        success: false,
        error: error instanceof Error ? error.message : "Razorpay payment failed",
      }
    }
  }

  async createCODOrder(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      logger.info("Creating COD order", { amount: paymentData.amount }, "PaymentService")

      const response = await newBackendApi.createCODOrder({
        amount: paymentData.amount,
        orderData: paymentData.orderData,
      })

      if (response.success) {
        logger.success("COD order created successfully", response.data, "PaymentService")
        return {
          success: true,
          data: response.data,
        }
      } else {
        throw new Error(response.error || "Failed to create COD order")
      }
    } catch (error) {
      logger.error("COD order creation failed", error, "PaymentService")
      return {
        success: false,
        error: error instanceof Error ? error.message : "COD order creation failed",
      }
    }
  }

  async getPaymentMethods(): Promise<PaymentResult> {
    try {
      const response = await newBackendApi.getPaymentMethods()

      if (response.success) {
        return {
          success: true,
          data: response.data,
        }
      } else {
        throw new Error(response.error || "Failed to fetch payment methods")
      }
    } catch (error) {
      logger.error("Failed to fetch payment methods", error, "PaymentService")
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch payment methods",
      }
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentResult> {
    try {
      const response = await newBackendApi.getPaymentStatus(paymentId)

      if (response.success) {
        return {
          success: true,
          data: response.data,
        }
      } else {
        throw new Error(response.error || "Failed to get payment status")
      }
    } catch (error) {
      logger.error("Failed to get payment status", error, "PaymentService")
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get payment status",
      }
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<PaymentResult> {
    try {
      logger.info("Initiating payment refund", { paymentId, amount }, "PaymentService")

      const response = await newBackendApi.refundPayment({
        paymentId,
        amount,
      })

      if (response.success) {
        logger.success("Payment refund initiated successfully", response.data, "PaymentService")
        return {
          success: true,
          data: response.data,
        }
      } else {
        throw new Error(response.error || "Failed to initiate refund")
      }
    } catch (error) {
      logger.error("Payment refund failed", error, "PaymentService")
      return {
        success: false,
        error: error instanceof Error ? error.message : "Payment refund failed",
      }
    }
  }

  isRazorpayLoaded(): boolean {
    return this.razorpayLoaded && typeof window !== "undefined" && !!window.Razorpay
  }
}

// Create singleton instance
export const paymentService = new PaymentService()
export default paymentService
