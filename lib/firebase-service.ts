import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface FirebaseAddress {
  id?: string
  userId: string
  name: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
  createdAt: Date
}

export interface FirebaseOrder {
  id?: string
  userId: string
  items: Array<{
    productId: string
    name: string
    price: number
    quantity: number
    image: string
  }>
  shippingAddress: FirebaseAddress
  paymentMethod: string
  status: string
  total: number
  createdAt: Date
  trackingId?: string
}

export interface FirebaseCoupon {
  id: string
  code: string
  description: string
  discount: number
  type: "percentage" | "fixed"
  minOrderValue: number
  maxDiscount?: number
  validUntil: Date
  isActive: boolean
  usageLimit: number
  usedCount: number
}

class FirebaseService {
  // Address Management
  async getUserAddresses(userId: string): Promise<FirebaseAddress[]> {
    try {
      const addressesRef = collection(db, "addresses")
      const q = query(addressesRef, where("userId", "==", userId), orderBy("createdAt", "desc"))
      const snapshot = await getDocs(q)

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as FirebaseAddress[]
    } catch (error) {
      console.error("Error fetching addresses:", error)
      throw new Error("Failed to fetch addresses")
    }
  }

  async addAddress(address: Omit<FirebaseAddress, "id" | "createdAt">): Promise<string> {
    try {
      const addressesRef = collection(db, "addresses")
      const docRef = await addDoc(addressesRef, {
        ...address,
        createdAt: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error adding address:", error)
      throw new Error("Failed to add address")
    }
  }

  async updateAddress(addressId: string, updates: Partial<FirebaseAddress>): Promise<void> {
    try {
      const addressRef = doc(db, "addresses", addressId)
      await updateDoc(addressRef, updates)
    } catch (error) {
      console.error("Error updating address:", error)
      throw new Error("Failed to update address")
    }
  }

  async deleteAddress(addressId: string): Promise<void> {
    try {
      const addressRef = doc(db, "addresses", addressId)
      await deleteDoc(addressRef)
    } catch (error) {
      console.error("Error deleting address:", error)
      throw new Error("Failed to delete address")
    }
  }

  // Order Management
  async createOrder(orderData: Omit<FirebaseOrder, "id" | "createdAt">): Promise<string> {
    try {
      const ordersRef = collection(db, "orders")
      const docRef = await addDoc(ordersRef, {
        ...orderData,
        createdAt: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error creating order:", error)
      throw new Error("Failed to create order")
    }
  }

  async getUserOrders(userId: string): Promise<FirebaseOrder[]> {
    try {
      const ordersRef = collection(db, "orders")
      const q = query(ordersRef, where("userId", "==", userId), orderBy("createdAt", "desc"))
      const snapshot = await getDocs(q)

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as FirebaseOrder[]
    } catch (error) {
      console.error("Error fetching orders:", error)
      throw new Error("Failed to fetch orders")
    }
  }

  async getOrder(orderId: string): Promise<FirebaseOrder | null> {
    try {
      const orderRef = doc(db, "orders", orderId)
      const orderDoc = await getDoc(orderRef)

      if (orderDoc.exists()) {
        return {
          id: orderDoc.id,
          ...orderDoc.data(),
          createdAt: orderDoc.data().createdAt?.toDate() || new Date(),
        } as FirebaseOrder
      }

      return null
    } catch (error) {
      console.error("Error fetching order:", error)
      throw new Error("Failed to fetch order")
    }
  }

  async updateOrderStatus(orderId: string, status: string, trackingId?: string): Promise<void> {
    try {
      const orderRef = doc(db, "orders", orderId)
      const updates: any = { status }
      if (trackingId) updates.trackingId = trackingId

      await updateDoc(orderRef, updates)
    } catch (error) {
      console.error("Error updating order status:", error)
      throw new Error("Failed to update order status")
    }
  }

  // Coupon Management
  async getAvailableCoupons(userId: string): Promise<FirebaseCoupon[]> {
    try {
      const couponsRef = collection(db, "coupons")
      const q = query(
        couponsRef,
        where("isActive", "==", true),
        where("validUntil", ">", new Date()),
        orderBy("validUntil", "asc"),
      )
      const snapshot = await getDocs(q)

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        validUntil: doc.data().validUntil?.toDate() || new Date(),
      })) as FirebaseCoupon[]
    } catch (error) {
      console.error("Error fetching coupons:", error)
      throw new Error("Failed to fetch coupons")
    }
  }

  async validateCoupon(code: string, orderValue: number): Promise<FirebaseCoupon | null> {
    try {
      const couponsRef = collection(db, "coupons")
      const q = query(
        couponsRef,
        where("code", "==", code.toUpperCase()),
        where("isActive", "==", true),
        where("validUntil", ">", new Date()),
        limit(1),
      )
      const snapshot = await getDocs(q)

      if (snapshot.empty) return null

      const couponDoc = snapshot.docs[0]
      const coupon = {
        id: couponDoc.id,
        ...couponDoc.data(),
        validUntil: couponDoc.data().validUntil?.toDate() || new Date(),
      } as FirebaseCoupon

      // Check if coupon is valid for this order
      if (orderValue < coupon.minOrderValue) return null
      if (coupon.usedCount >= coupon.usageLimit) return null

      return coupon
    } catch (error) {
      console.error("Error validating coupon:", error)
      throw new Error("Failed to validate coupon")
    }
  }

  async incrementCouponUsage(couponId: string): Promise<void> {
    try {
      const couponRef = doc(db, "coupons", couponId)
      const couponDoc = await getDoc(couponRef)

      if (couponDoc.exists()) {
        const currentUsage = couponDoc.data().usedCount || 0
        await updateDoc(couponRef, {
          usedCount: currentUsage + 1,
        })
      }
    } catch (error) {
      console.error("Error incrementing coupon usage:", error)
      throw new Error("Failed to update coupon usage")
    }
  }

  // Health Check
  async checkConnection(): Promise<boolean> {
    try {
      const testRef = doc(db, "health", "check")
      await getDoc(testRef)
      return true
    } catch (error) {
      console.error("Firebase connection check failed:", error)
      return false
    }
  }
}

export const firebaseService = new FirebaseService()
