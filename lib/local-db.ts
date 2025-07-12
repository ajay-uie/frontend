// Local Database Replacement using IndexedDB and localStorage
import { Product } from "./api"

interface LocalUser {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
  isEmailVerified: boolean
  createdAt: string
  lastLoginAt: string
}

interface LocalOrder {
  id: string
  userId: string
  items: Array<{
    productId: string
    quantity: number
    price: number
    name: string
  }>
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: any
  paymentMethod: string
  createdAt: string
  updatedAt: string
}

interface LocalCartItem {
  productId: string
  quantity: number
  addedAt: string
}

interface LocalWishlistItem {
  productId: string
  addedAt: string
}

interface PendingAction {
  id: string
  type: 'create_order' | 'update_profile' | 'add_review' | 'newsletter_signup'
  data: any
  timestamp: string
  retryCount: number
}

class LocalDatabase {
  private dbName = 'fragransia_local_db'
  private dbVersion = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    if (typeof window === 'undefined') return

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains('orders')) {
          db.createObjectStore('orders', { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains('reviews')) {
          db.createObjectStore('reviews', { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains('pendingActions')) {
          db.createObjectStore('pendingActions', { keyPath: 'id' })
        }
      }
    })
  }

  // Generic IndexedDB operations
  private async getFromStore<T>(storeName: string, key?: string): Promise<T[]> {
    if (!this.db) await this.init()
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      
      if (key) {
        const request = store.get(key)
        request.onsuccess = () => resolve(request.result ? [request.result] : [])
        request.onerror = () => reject(request.error)
      } else {
        const request = store.getAll()
        request.onsuccess = () => resolve(request.result || [])
        request.onerror = () => reject(request.error)
      }
    })
  }

  private async saveToStore<T>(storeName: string, data: T): Promise<void> {
    if (!this.db) await this.init()
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(data)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  private async deleteFromStore(storeName: string, key: string): Promise<void> {
    if (!this.db) await this.init()
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Products
  async getProducts(): Promise<Product[]> {
    try {
      return await this.getFromStore<Product>('products')
    } catch (error) {
      console.warn('IndexedDB failed, falling back to localStorage:', error)
      const stored = localStorage.getItem('local_products')
      return stored ? JSON.parse(stored) : []
    }
  }

  async saveProducts(products: Product[]): Promise<void> {
    try {
      for (const product of products) {
        await this.saveToStore('products', product)
      }
    } catch (error) {
      console.warn('IndexedDB failed, falling back to localStorage:', error)
      localStorage.setItem('local_products', JSON.stringify(products))
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    try {
      const products = await this.getFromStore<Product>('products', id)
      return products[0] || null
    } catch (error) {
      console.warn('IndexedDB failed, falling back to localStorage:', error)
      const stored = localStorage.getItem('local_products')
      if (stored) {
        const products: Product[] = JSON.parse(stored)
        return products.find(p => p.id === id) || null
      }
      return null
    }
  }

  // Users
  async saveUser(user: LocalUser): Promise<void> {
    try {
      await this.saveToStore('users', user)
    } catch (error) {
      console.warn('IndexedDB failed, falling back to localStorage:', error)
      localStorage.setItem(`local_user_${user.id}`, JSON.stringify(user))
    }
  }

  async getUser(id: string): Promise<LocalUser | null> {
    try {
      const users = await this.getFromStore<LocalUser>('users', id)
      return users[0] || null
    } catch (error) {
      console.warn('IndexedDB failed, falling back to localStorage:', error)
      const stored = localStorage.getItem(`local_user_${id}`)
      return stored ? JSON.parse(stored) : null
    }
  }

  // Orders
  async saveOrder(order: LocalOrder): Promise<void> {
    try {
      await this.saveToStore('orders', order)
    } catch (error) {
      console.warn('IndexedDB failed, falling back to localStorage:', error)
      const orders = this.getOrdersFromLocalStorage()
      orders.push(order)
      localStorage.setItem('local_orders', JSON.stringify(orders))
    }
  }

  async getOrders(userId?: string): Promise<LocalOrder[]> {
    try {
      const orders = await this.getFromStore<LocalOrder>('orders')
      return userId ? orders.filter(o => o.userId === userId) : orders
    } catch (error) {
      console.warn('IndexedDB failed, falling back to localStorage:', error)
      const orders = this.getOrdersFromLocalStorage()
      return userId ? orders.filter(o => o.userId === userId) : orders
    }
  }

  private getOrdersFromLocalStorage(): LocalOrder[] {
    const stored = localStorage.getItem('local_orders')
    return stored ? JSON.parse(stored) : []
  }

  // Cart (localStorage only for simplicity)
  getCart(): LocalCartItem[] {
    const stored = localStorage.getItem('local_cart')
    return stored ? JSON.parse(stored) : []
  }

  saveCart(items: LocalCartItem[]): void {
    localStorage.setItem('local_cart', JSON.stringify(items))
  }

  addToCart(productId: string, quantity: number = 1): void {
    const cart = this.getCart()
    const existingItem = cart.find(item => item.productId === productId)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.push({
        productId,
        quantity,
        addedAt: new Date().toISOString()
      })
    }
    
    this.saveCart(cart)
  }

  removeFromCart(productId: string): void {
    const cart = this.getCart().filter(item => item.productId !== productId)
    this.saveCart(cart)
  }

  clearCart(): void {
    localStorage.removeItem('local_cart')
  }

  // Wishlist (localStorage only)
  getWishlist(): LocalWishlistItem[] {
    const stored = localStorage.getItem('local_wishlist')
    return stored ? JSON.parse(stored) : []
  }

  saveWishlist(items: LocalWishlistItem[]): void {
    localStorage.setItem('local_wishlist', JSON.stringify(items))
  }

  addToWishlist(productId: string): void {
    const wishlist = this.getWishlist()
    if (!wishlist.find(item => item.productId === productId)) {
      wishlist.push({
        productId,
        addedAt: new Date().toISOString()
      })
      this.saveWishlist(wishlist)
    }
  }

  removeFromWishlist(productId: string): void {
    const wishlist = this.getWishlist().filter(item => item.productId !== productId)
    this.saveWishlist(wishlist)
  }

  // Pending Actions for Data Sync
  async savePendingAction(action: Omit<PendingAction, 'id'>): Promise<string> {
    const actionWithId: PendingAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    try {
      await this.saveToStore('pendingActions', actionWithId)
    } catch (error) {
      console.warn('IndexedDB failed, falling back to localStorage:', error)
      const actions = this.getPendingActionsFromLocalStorage()
      actions.push(actionWithId)
      localStorage.setItem('local_pending_actions', JSON.stringify(actions))
    }

    return actionWithId.id
  }

  async getPendingActions(): Promise<PendingAction[]> {
    try {
      return await this.getFromStore<PendingAction>('pendingActions')
    } catch (error) {
      console.warn('IndexedDB failed, falling back to localStorage:', error)
      return this.getPendingActionsFromLocalStorage()
    }
  }

  async deletePendingAction(id: string): Promise<void> {
    try {
      await this.deleteFromStore('pendingActions', id)
    } catch (error) {
      console.warn('IndexedDB failed, falling back to localStorage:', error)
      const actions = this.getPendingActionsFromLocalStorage()
      const filtered = actions.filter(a => a.id !== id)
      localStorage.setItem('local_pending_actions', JSON.stringify(filtered))
    }
  }

  private getPendingActionsFromLocalStorage(): PendingAction[] {
    const stored = localStorage.getItem('local_pending_actions')
    return stored ? JSON.parse(stored) : []
  }

  // User Session Management
  saveUserSession(user: LocalUser, token?: string): void {
    localStorage.setItem('local_user_session', JSON.stringify({
      user,
      token: token || `fake_jwt_${user.id}_${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    }))
  }

  getUserSession(): { user: LocalUser; token: string; expiresAt: string } | null {
    const stored = localStorage.getItem('local_user_session')
    if (!stored) return null

    const session = JSON.parse(stored)
    
    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      this.clearUserSession()
      return null
    }

    return session
  }

  clearUserSession(): void {
    localStorage.removeItem('local_user_session')
  }

  // Settings and Preferences
  saveSetting(key: string, value: any): void {
    const settings = this.getSettings()
    settings[key] = value
    localStorage.setItem('local_settings', JSON.stringify(settings))
  }

  getSetting(key: string, defaultValue?: any): any {
    const settings = this.getSettings()
    return settings[key] !== undefined ? settings[key] : defaultValue
  }

  getSettings(): Record<string, any> {
    const stored = localStorage.getItem('local_settings')
    return stored ? JSON.parse(stored) : {}
  }

  // Clear all local data
  async clearAllData(): Promise<void> {
    // Clear localStorage
    const keysToRemove = [
      'local_cart',
      'local_wishlist',
      'local_user_session',
      'local_settings',
      'local_products',
      'local_orders',
      'local_pending_actions'
    ]
    
    keysToRemove.forEach(key => localStorage.removeItem(key))

    // Clear IndexedDB
    if (this.db) {
      this.db.close()
      this.db = null
    }

    if (typeof window !== 'undefined') {
      indexedDB.deleteDatabase(this.dbName)
    }
  }
}

// Export singleton instance
export const localDB = new LocalDatabase()

// Initialize on import (client-side only)
if (typeof window !== 'undefined') {
  localDB.init().catch(console.error)
}

export type { LocalUser, LocalOrder, LocalCartItem, LocalWishlistItem, PendingAction }

