// Data Sync Engine for Offline/Online Synchronization
import { localDB, PendingAction } from './local-db'

interface SyncQueueItem {
  id: string
  type: 'api_call' | 'form_submission' | 'user_action'
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  data?: any
  headers?: Record<string, string>
  timestamp: string
  retryCount: number
  maxRetries: number
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'syncing' | 'completed' | 'failed'
}

interface SyncResult {
  success: boolean
  data?: any
  error?: string
  shouldRetry?: boolean
}

class DataSyncEngine {
  private syncQueue: SyncQueueItem[] = []
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
  private isSyncing = false
  private syncInterval: NodeJS.Timeout | null = null
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://fragransia.onrender.com'
  private listeners: Array<(event: SyncEvent) => void> = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeEventListeners()
      this.loadSyncQueue()
      this.startPeriodicSync()
    }
  }

  private initializeEventListeners(): void {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true
      this.emit('online', { timestamp: new Date().toISOString() })
      this.syncAll()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.emit('offline', { timestamp: new Date().toISOString() })
    })

    // Page visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.syncAll()
      }
    })

    // Before page unload
    window.addEventListener('beforeunload', () => {
      this.saveSyncQueue()
    })
  }

  private async loadSyncQueue(): Promise<void> {
    try {
      const stored = localStorage.getItem('sync_queue')
      if (stored) {
        this.syncQueue = JSON.parse(stored)
      }

      // Also load from IndexedDB pending actions
      const pendingActions = await localDB.getPendingActions()
      for (const action of pendingActions) {
        this.addToQueue({
          type: 'api_call',
          endpoint: this.getEndpointFromAction(action),
          method: this.getMethodFromAction(action),
          data: action.data,
          priority: 'medium',
          maxRetries: 3
        })
      }
    } catch (error) {
      console.error('Sync Engine: Failed to load sync queue:', error)
    }
  }

  private saveSyncQueue(): void {
    try {
      localStorage.setItem('sync_queue', JSON.stringify(this.syncQueue))
    } catch (error) {
      console.error('Sync Engine: Failed to save sync queue:', error)
    }
  }

  private startPeriodicSync(): void {
    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.syncAll()
      }
    }, 30000)
  }

  private getEndpointFromAction(action: PendingAction): string {
    switch (action.type) {
      case 'create_order':
        return '/orders'
      case 'update_profile':
        return '/users/profile'
      case 'add_review':
        return '/reviews'
      case 'newsletter_signup':
        return '/newsletter/subscribe'
      default:
        return '/unknown'
    }
  }

  private getMethodFromAction(action: PendingAction): 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' {
    switch (action.type) {
      case 'create_order':
      case 'add_review':
      case 'newsletter_signup':
        return 'POST'
      case 'update_profile':
        return 'PUT'
      default:
        return 'POST'
    }
  }

  // Add item to sync queue
  addToQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount' | 'status'>): string {
    const queueItem: SyncQueueItem = {
      ...item,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      status: 'pending'
    }

    this.syncQueue.push(queueItem)
    this.saveSyncQueue()

    this.emit('item_added', { item: queueItem })

    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncItem(queueItem)
    }

    return queueItem.id
  }

  // Queue API call for sync
  queueApiCall(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    data?: any,
    options: {
      priority?: 'low' | 'medium' | 'high'
      maxRetries?: number
      headers?: Record<string, string>
    } = {}
  ): string {
    return this.addToQueue({
      type: 'api_call',
      endpoint,
      method,
      data,
      priority: options.priority || 'medium',
      maxRetries: options.maxRetries || 3,
      headers: options.headers
    })
  }

  // Queue form submission
  queueFormSubmission(
    endpoint: string,
    formData: any,
    options: {
      priority?: 'low' | 'medium' | 'high'
      maxRetries?: number
    } = {}
  ): string {
    return this.addToQueue({
      type: 'form_submission',
      endpoint,
      method: 'POST',
      data: formData,
      priority: options.priority || 'high',
      maxRetries: options.maxRetries || 5
    })
  }

  // Queue user action
  queueUserAction(
    action: string,
    data: any,
    options: {
      priority?: 'low' | 'medium' | 'high'
      maxRetries?: number
    } = {}
  ): string {
    return this.addToQueue({
      type: 'user_action',
      endpoint: `/actions/${action}`,
      method: 'POST',
      data,
      priority: options.priority || 'medium',
      maxRetries: options.maxRetries || 3
    })
  }

  // Sync all pending items
  async syncAll(): Promise<void> {
    if (this.isSyncing || !this.isOnline) {
      return
    }

    this.isSyncing = true
    this.emit('sync_started', { timestamp: new Date().toISOString() })

    try {
      // Sort by priority and timestamp
      const sortedQueue = [...this.syncQueue]
        .filter(item => item.status === 'pending' || item.status === 'failed')
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
          if (priorityDiff !== 0) return priorityDiff
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        })

      let syncedCount = 0
      let failedCount = 0

      for (const item of sortedQueue) {
        try {
          const result = await this.syncItem(item)
          if (result.success) {
            syncedCount++
          } else {
            failedCount++
          }
        } catch (error) {
          console.error('Sync Engine: Failed to sync item:', error)
          failedCount++
        }
      }

      this.emit('sync_completed', {
        timestamp: new Date().toISOString(),
        syncedCount,
        failedCount,
        totalItems: sortedQueue.length
      })
    } catch (error) {
      console.error('Sync Engine: Sync all failed:', error)
      this.emit('sync_error', { error: error.message })
    } finally {
      this.isSyncing = false
      this.saveSyncQueue()
    }
  }

  // Sync individual item
  async syncItem(item: SyncQueueItem): Promise<SyncResult> {
    if (!this.isOnline) {
      return { success: false, error: 'Offline', shouldRetry: true }
    }

    item.status = 'syncing'
    this.emit('item_syncing', { item })

    try {
      const url = `${this.baseUrl}${item.endpoint}`
      const options: RequestInit = {
        method: item.method,
        headers: {
          'Content-Type': 'application/json',
          ...item.headers
        }
      }

      if (item.data && item.method !== 'GET') {
        options.body = JSON.stringify(item.data)
      }

      const response = await fetch(url, options)
      const responseData = await response.json()

      if (response.ok) {
        // Success - remove from queue
        this.removeFromQueue(item.id)
        item.status = 'completed'
        
        this.emit('item_synced', { item, response: responseData })
        
        return { success: true, data: responseData }
      } else {
        // Server error - decide whether to retry
        const shouldRetry = response.status >= 500 || response.status === 429
        
        if (shouldRetry && item.retryCount < item.maxRetries) {
          item.retryCount++
          item.status = 'pending'
          
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, item.retryCount), 30000)
          setTimeout(() => {
            if (this.isOnline) {
              this.syncItem(item)
            }
          }, delay)
          
          this.emit('item_retry', { item, delay })
          
          return { success: false, error: responseData.message, shouldRetry: true }
        } else {
          // Max retries reached or non-retryable error
          item.status = 'failed'
          this.emit('item_failed', { item, error: responseData.message })
          
          return { success: false, error: responseData.message, shouldRetry: false }
        }
      }
    } catch (error) {
      // Network error - retry if possible
      if (item.retryCount < item.maxRetries) {
        item.retryCount++
        item.status = 'pending'
        
        const delay = Math.min(1000 * Math.pow(2, item.retryCount), 30000)
        setTimeout(() => {
          if (this.isOnline) {
            this.syncItem(item)
          }
        }, delay)
        
        this.emit('item_retry', { item, delay })
        
        return { success: false, error: error.message, shouldRetry: true }
      } else {
        item.status = 'failed'
        this.emit('item_failed', { item, error: error.message })
        
        return { success: false, error: error.message, shouldRetry: false }
      }
    }
  }

  // Remove item from queue
  removeFromQueue(id: string): void {
    this.syncQueue = this.syncQueue.filter(item => item.id !== id)
    this.saveSyncQueue()
  }

  // Get queue status
  getQueueStatus(): {
    total: number
    pending: number
    syncing: number
    completed: number
    failed: number
    isOnline: boolean
    isSyncing: boolean
  } {
    const counts = this.syncQueue.reduce(
      (acc, item) => {
        acc[item.status]++
        return acc
      },
      { pending: 0, syncing: 0, completed: 0, failed: 0 }
    )

    return {
      total: this.syncQueue.length,
      ...counts,
      isOnline: this.isOnline,
      isSyncing: this.isSyncing
    }
  }

  // Get pending items
  getPendingItems(): SyncQueueItem[] {
    return this.syncQueue.filter(item => item.status === 'pending' || item.status === 'failed')
  }

  // Clear completed items
  clearCompleted(): void {
    this.syncQueue = this.syncQueue.filter(item => item.status !== 'completed')
    this.saveSyncQueue()
  }

  // Clear all items
  clearAll(): void {
    this.syncQueue = []
    this.saveSyncQueue()
    localStorage.removeItem('sync_queue')
  }

  // Retry failed items
  retryFailed(): void {
    this.syncQueue.forEach(item => {
      if (item.status === 'failed') {
        item.status = 'pending'
        item.retryCount = 0
      }
    })
    
    this.saveSyncQueue()
    
    if (this.isOnline) {
      this.syncAll()
    }
  }

  // Event system
  on(event: string, listener: (data: any) => void): void {
    this.listeners.push(listener)
  }

  off(event: string, listener: (data: any) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener)
  }

  private emit(event: string, data: any): void {
    this.listeners.forEach(listener => {
      try {
        listener({ type: event, ...data })
      } catch (error) {
        console.error('Sync Engine: Event listener error:', error)
      }
    })
  }

  // Cleanup
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
    
    this.saveSyncQueue()
    this.listeners = []
  }
}

// Sync event types
interface SyncEvent {
  type: 'online' | 'offline' | 'sync_started' | 'sync_completed' | 'sync_error' | 
        'item_added' | 'item_syncing' | 'item_synced' | 'item_retry' | 'item_failed'
  timestamp?: string
  item?: SyncQueueItem
  response?: any
  error?: string
  syncedCount?: number
  failedCount?: number
  totalItems?: number
  delay?: number
}

// Export singleton instance
export const syncEngine = new DataSyncEngine()

// React hook for sync status
export function useSyncStatus() {
  const [status, setStatus] = React.useState(syncEngine.getQueueStatus())
  
  React.useEffect(() => {
    const updateStatus = () => setStatus(syncEngine.getQueueStatus())
    
    syncEngine.on('sync_started', updateStatus)
    syncEngine.on('sync_completed', updateStatus)
    syncEngine.on('item_added', updateStatus)
    syncEngine.on('item_synced', updateStatus)
    syncEngine.on('item_failed', updateStatus)
    
    return () => {
      syncEngine.off('sync_started', updateStatus)
      syncEngine.off('sync_completed', updateStatus)
      syncEngine.off('item_added', updateStatus)
      syncEngine.off('item_synced', updateStatus)
      syncEngine.off('item_failed', updateStatus)
    }
  }, [])
  
  return status
}

export type { SyncQueueItem, SyncResult, SyncEvent }

