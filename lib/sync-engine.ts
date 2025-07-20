"use client"

import { localDB } from "./local-db"
import { enhancedApi } from "./enhanced-api"
import { clientLogger } from "@/utils/logger"

interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  pendingCount: number
  lastSync: Date | null
  errors: string[]
}

interface SyncOptions {
  maxRetries: number
  retryDelay: number
  batchSize: number
  priorityOrder: ("high" | "medium" | "low")[]
}

interface SyncOperation {
  id: string
  type: "create" | "update" | "delete"
  entity: string
  data: any
  timestamp: number
  retries: number
  maxRetries: number
}

class SyncEngine {
  private isOnline = typeof navigator !== "undefined" ? navigator.onLine : true
  private syncQueue: SyncOperation[] = []
  private isSyncing = false
  private syncInterval: NodeJS.Timeout | null = null
  private listeners: Map<string, Function[]> = new Map()
  private lastSync: Date | null = null
  private errors: string[] = []

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeEventListeners()
      this.startSyncInterval()
      this.loadSyncQueue()
    }
  }

  private initializeEventListeners(): void {
    window.addEventListener("online", () => {
      this.isOnline = true
      clientLogger.info("🌐 Connection restored - starting sync")
      this.syncAll()
    })

    window.addEventListener("offline", () => {
      this.isOnline = false
      clientLogger.warn("📴 Connection lost - queuing operations")
    })

    // Sync before page unload
    window.addEventListener("beforeunload", () => {
      this.saveSyncQueue()
    })
  }

  private startSyncInterval(): void {
    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.syncAll()
      }
    }, 30000)
  }

  private async loadSyncQueue(): Promise<void> {
    try {
      const savedQueue = await localDB.getSetting("sync_queue")
      if (savedQueue && Array.isArray(savedQueue)) {
        this.syncQueue = savedQueue
        clientLogger.info(`🔄 Loaded ${this.syncQueue.length} pending sync operations`)
      }
    } catch (error) {
      clientLogger.error("❌ Failed to load sync queue:", error)
    }
  }

  private async saveSyncQueue(): Promise<void> {
    try {
      await localDB.saveSetting("sync_queue", this.syncQueue)
      clientLogger.debug("💾 Sync queue saved")
    } catch (error) {
      clientLogger.error("❌ Failed to save sync queue:", error)
    }
  }

  private emit(event: string, data?: any): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data))
    }
  }

  // Event listener management
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)?.push(callback)
  }

  off(event: string, callback?: Function): void {
    if (!callback) {
      this.listeners.delete(event)
      return
    }

    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(callback)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  // Add operation to sync queue
  private addToQueue(operation: Omit<SyncOperation, "id" | "timestamp" | "retries">): void {
    const syncOp: SyncOperation = {
      ...operation,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
    }

    this.syncQueue.push(syncOp)
    this.saveSyncQueue()

    clientLogger.debug(`📝 Added ${operation.type} operation for ${operation.entity} to sync queue`)

    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncAll()
    }
  }

  // Cart sync operations
  async syncCartAdd(productId: string, quantity: number, size?: string): Promise<void> {
    if (this.isOnline) {
      try {
        const response = await enhancedApi.addToCart(productId, quantity, size)
        if (response.success) {
          await localDB.saveCart(response.data?.cart)
          return
        }
      } catch (error) {
        clientLogger.warn("⚠️ Failed to sync cart add online, queuing for later")
      }
    }

    // Add to offline queue
    this.addToQueue({
      type: "create",
      entity: "cart_item",
      data: { productId, quantity, size },
      maxRetries: 3,
    })

    // Update local cart immediately
    const localCart = (await localDB.getCart()) || { items: [], total: 0 }
    const existingItem = localCart.items.find((item: any) => item.productId === productId && item.size === size)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      localCart.items.push({
        id: `temp_${Date.now()}`,
        productId,
        quantity,
        size,
        addedAt: new Date().toISOString(),
      })
    }

    await localDB.saveCart(localCart)
  }

  async syncCartUpdate(cartId: string, quantity: number): Promise<void> {
    if (this.isOnline) {
      try {
        const response = await enhancedApi.updateCartItem(cartId, quantity)
        if (response.success) {
          await localDB.saveCart(response.data?.cart)
          return
        }
      } catch (error) {
        clientLogger.warn("⚠️ Failed to sync cart update online, queuing for later")
      }
    }

    this.addToQueue({
      type: "update",
      entity: "cart_item",
      data: { cartId, quantity },
      maxRetries: 3,
    })

    // Update local cart
    const localCart = await localDB.getCart()
    if (localCart) {
      const item = localCart.items.find((item: any) => item.id === cartId)
      if (item) {
        item.quantity = quantity
        await localDB.saveCart(localCart)
      }
    }
  }

  async syncCartRemove(cartId: string): Promise<void> {
    if (this.isOnline) {
      try {
        const response = await enhancedApi.removeCartItem(cartId)
        if (response.success) {
          const updatedCart = await localDB.getCart()
          if (updatedCart) {
            updatedCart.items = updatedCart.items.filter((item: any) => item.id !== cartId)
            await localDB.saveCart(updatedCart)
          }
          return
        }
      } catch (error) {
        clientLogger.warn("⚠️ Failed to sync cart remove online, queuing for later")
      }
    }

    this.addToQueue({
      type: "delete",
      entity: "cart_item",
      data: { cartId },
      maxRetries: 3,
    })

    // Remove from local cart
    const localCart = await localDB.getCart()
    if (localCart) {
      localCart.items = localCart.items.filter((item: any) => item.id !== cartId)
      await localDB.saveCart(localCart)
    }
  }

  // Wishlist sync operations
  async syncWishlistAdd(productId: string): Promise<void> {
    if (this.isOnline) {
      try {
        const response = await enhancedApi.addToWishlist(productId)
        if (response.success) {
          await localDB.saveWishlist(response.data?.wishlist)
          return
        }
      } catch (error) {
        clientLogger.warn("⚠️ Failed to sync wishlist add online, queuing for later")
      }
    }

    this.addToQueue({
      type: "create",
      entity: "wishlist_item",
      data: { productId },
      maxRetries: 3,
    })

    // Update local wishlist
    const localWishlist = (await localDB.getWishlist()) || { items: [] }
    const exists = localWishlist.items.find((item: any) => item.productId === productId)

    if (!exists) {
      localWishlist.items.push({
        id: `temp_${Date.now()}`,
        productId,
        addedAt: new Date().toISOString(),
      })
      await localDB.saveWishlist(localWishlist)
    }
  }

  async syncWishlistRemove(productId: string): Promise<void> {
    if (this.isOnline) {
      try {
        const response = await enhancedApi.removeFromWishlist(productId)
        if (response.success) {
          const updatedWishlist = await localDB.getWishlist()
          if (updatedWishlist) {
            updatedWishlist.items = updatedWishlist.items.filter((item: any) => item.productId !== productId)
            await localDB.saveWishlist(updatedWishlist)
          }
          return
        }
      } catch (error) {
        clientLogger.warn("⚠️ Failed to sync wishlist remove online, queuing for later")
      }
    }

    this.addToQueue({
      type: "delete",
      entity: "wishlist_item",
      data: { productId },
      maxRetries: 3,
    })

    // Remove from local wishlist
    const localWishlist = await localDB.getWishlist()
    if (localWishlist) {
      localWishlist.items = localWishlist.items.filter((item: any) => item.productId !== productId)
      await localDB.saveWishlist(localWishlist)
    }
  }

  // Sync all pending operations
  async syncAll(): Promise<void> {
    if (!this.isOnline || this.isSyncing || this.syncQueue.length === 0) {
      return
    }

    this.isSyncing = true
    clientLogger.info(`🔄 Starting sync of ${this.syncQueue.length} operations`)

    const successfulSyncs: string[] = []
    const failedSyncs: SyncOperation[] = []

    for (const operation of this.syncQueue) {
      try {
        const success = await this.syncOperation(operation)
        if (success) {
          successfulSyncs.push(operation.id)
        } else {
          operation.retries++
          if (operation.retries < operation.maxRetries) {
            failedSyncs.push(operation)
          } else {
            clientLogger.error(`❌ Max retries exceeded for operation ${operation.id}`)
          }
        }
      } catch (error) {
        clientLogger.error(`❌ Sync operation ${operation.id} failed:`, error)
        operation.retries++
        if (operation.retries < operation.maxRetries) {
          failedSyncs.push(operation)
        }
      }
    }

    // Update sync queue
    this.syncQueue = failedSyncs
    await this.saveSyncQueue()

    clientLogger.info(`✅ Sync completed: ${successfulSyncs.length} successful, ${failedSyncs.length} failed`)
    this.isSyncing = false
  }

  private async syncOperation(operation: SyncOperation): Promise<boolean> {
    try {
      switch (operation.entity) {
        case "cart_item":
          return await this.syncCartOperation(operation)
        case "wishlist_item":
          return await this.syncWishlistOperation(operation)
        default:
          clientLogger.warn(`⚠️ Unknown entity type: ${operation.entity}`)
          return false
      }
    } catch (error) {
      clientLogger.error(`❌ Failed to sync ${operation.entity} operation:`, error)
      return false
    }
  }

  private async syncCartOperation(operation: SyncOperation): Promise<boolean> {
    const { type, data } = operation

    switch (type) {
      case "create":
        const addResponse = await enhancedApi.addToCart(data.productId, data.quantity, data.size)
        return addResponse.success

      case "update":
        const updateResponse = await enhancedApi.updateCartItem(data.cartId, data.quantity)
        return updateResponse.success

      case "delete":
        const removeResponse = await enhancedApi.removeCartItem(data.cartId)
        return removeResponse.success

      default:
        return false
    }
  }

  private async syncWishlistOperation(operation: SyncOperation): Promise<boolean> {
    const { type, data } = operation

    switch (type) {
      case "create":
        const addResponse = await enhancedApi.addToWishlist(data.productId)
        return addResponse.success

      case "delete":
        const removeResponse = await enhancedApi.removeFromWishlist(data.productId)
        return removeResponse.success

      default:
        return false
    }
  }

  // Force sync specific entity
  async forceSyncCart(): Promise<void> {
    if (!this.isOnline) {
      clientLogger.warn("⚠️ Cannot force sync cart: offline")
      return
    }

    try {
      const localCart = await localDB.getCart()
      if (localCart && localCart.items.length > 0) {
        const response = await enhancedApi.syncCart(localCart.items)
        if (response.success) {
          await localDB.saveCart(response.data?.cart)
          clientLogger.success("✅ Cart force sync completed")
        }
      }
    } catch (error) {
      clientLogger.error("❌ Failed to force sync cart:", error)
    }
  }

  async forceSyncWishlist(): Promise<void> {
    if (!this.isOnline) {
      clientLogger.warn("⚠️ Cannot force sync wishlist: offline")
      return
    }

    try {
      const localWishlist = await localDB.getWishlist()
      if (localWishlist && localWishlist.items.length > 0) {
        // Sync each wishlist item individually
        for (const item of localWishlist.items) {
          await enhancedApi.addToWishlist(item.productId)
        }
        clientLogger.success("✅ Wishlist force sync completed")
      }
    } catch (error) {
      clientLogger.error("❌ Failed to force sync wishlist:", error)
    }
  }

  // Get sync status
  getSyncStatus(): {
    isOnline: boolean
    isSyncing: boolean
    queueLength: number
    pendingOperations: SyncOperation[]
  } {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      queueLength: this.syncQueue.length,
      pendingOperations: [...this.syncQueue],
    }
  }

  // Clear sync queue
  async clearSyncQueue(): Promise<void> {
    this.syncQueue = []
    await this.saveSyncQueue()
    clientLogger.info("🗑️ Sync queue cleared")
  }

  // Cleanup
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
    this.saveSyncQueue()
  }
}

// Create singleton instance
export const syncEngine = new SyncEngine()
export default syncEngine
