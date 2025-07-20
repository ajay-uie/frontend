interface LocalDBConfig {
  dbName: string
  version: number
  stores: {
    [key: string]: {
      keyPath: string
      indexes?: { [key: string]: string }
    }
  }
}

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class LocalDatabase {
  private db: IDBDatabase | null = null
  private config: LocalDBConfig
  private isInitialized = false

  constructor() {
    this.config = {
      dbName: "FragransiaDB",
      version: 1,
      stores: {
        products: {
          keyPath: "id",
          indexes: {
            category: "category",
            name: "name",
            price: "price",
          },
        },
        cart: {
          keyPath: "id",
          indexes: {
            productId: "productId",
            userId: "userId",
          },
        },
        wishlist: {
          keyPath: "id",
          indexes: {
            productId: "productId",
            userId: "userId",
          },
        },
        orders: {
          keyPath: "id",
          indexes: {
            userId: "userId",
            status: "status",
            createdAt: "createdAt",
          },
        },
        users: {
          keyPath: "uid",
          indexes: {
            email: "email",
          },
        },
        addresses: {
          keyPath: "id",
          indexes: {
            userId: "userId",
            isDefault: "isDefault",
          },
        },
        cache: {
          keyPath: "key",
        },
      },
    }
  }

  async init(): Promise<void> {
    if (this.isInitialized) return

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        this.isInitialized = true
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        Object.entries(this.config.stores).forEach(([storeName, storeConfig]) => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: storeConfig.keyPath })

            if (storeConfig.indexes) {
              Object.entries(storeConfig.indexes).forEach(([indexName, indexKey]) => {
                store.createIndex(indexName, indexKey)
              })
            }
          }
        })
      }
    })
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.init()
    }
  }

  async get<T>(storeName: string, key: string): Promise<T | null> {
    await this.ensureInitialized()
    if (!this.db) return null

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    await this.ensureInitialized()
    if (!this.db) return []

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || [])
    })
  }

  async put<T>(storeName: string, data: T): Promise<void> {
    await this.ensureInitialized()
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.put(data)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async delete(storeName: string, key: string): Promise<void> {
    await this.ensureInitialized()
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async clear(storeName: string): Promise<void> {
    await this.ensureInitialized()
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async setCache<T>(key: string, data: T, ttl = 300000): Promise<void> {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    }
    await this.put("cache", { key, ...cacheItem })
  }

  async getCache<T>(key: string): Promise<T | null> {
    const cacheItem = await this.get<CacheItem<T>>("cache", key)
    if (!cacheItem) return null

    const now = Date.now()
    if (now - cacheItem.timestamp > cacheItem.ttl) {
      await this.delete("cache", key)
      return null
    }

    return cacheItem.data
  }

  async search<T>(storeName: string, indexName: string, query: string): Promise<T[]> {
    await this.ensureInitialized()
    if (!this.db) return []

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)
      const index = store.index(indexName)
      const request = index.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const results = request.result || []
        const filtered = results.filter((item: any) => {
          const value = item[indexName]
          return value && value.toString().toLowerCase().includes(query.toLowerCase())
        })
        resolve(filtered)
      }
    })
  }

  async count(storeName: string): Promise<number> {
    await this.ensureInitialized()
    if (!this.db) return 0

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.count()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async exportData(): Promise<{ [key: string]: any[] }> {
    const data: { [key: string]: any[] } = {}

    for (const storeName of Object.keys(this.config.stores)) {
      data[storeName] = await this.getAll(storeName)
    }

    return data
  }

  async importData(data: { [key: string]: any[] }): Promise<void> {
    for (const [storeName, items] of Object.entries(data)) {
      if (this.config.stores[storeName]) {
        await this.clear(storeName)
        for (const item of items) {
          await this.put(storeName, item)
        }
      }
    }
  }
}

// Create singleton instance
const localDB = new LocalDatabase()

// Export function to get the instance
export const getLocalDB = (): LocalDatabase => localDB

// Export the instance directly
export { localDB }

// Default export
export default localDB
