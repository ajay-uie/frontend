import { io, type Socket } from "socket.io-client"
import { SOCKET_CONFIG, SOCKET_EVENTS } from "./constants"
import logger from "@/utils/logger"

class SocketManager {
  private socket: Socket | null = null
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeSocket()
    }
  }

  private initializeSocket(): void {
    try {
      this.socket = io(SOCKET_CONFIG.URL, SOCKET_CONFIG.OPTIONS)
      this.setupEventListeners()
      logger.info("Socket initialized", { url: SOCKET_CONFIG.URL }, "Socket")
    } catch (error) {
      logger.error("Failed to initialize socket", error, "Socket")
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return

    // Connection events
    this.socket.on(SOCKET_EVENTS.CONNECT, () => {
      this.isConnected = true
      this.reconnectAttempts = 0
      logger.success("Socket connected", { socketId: this.socket?.id }, "Socket")
    })

    this.socket.on(SOCKET_EVENTS.DISCONNECT, (reason: string) => {
      this.isConnected = false
      logger.warn("Socket disconnected", { reason }, "Socket")

      if (reason === "io server disconnect") {
        // Server initiated disconnect, reconnect manually
        this.reconnect()
      }
    })

    this.socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error: any) => {
      logger.error("Socket connection error", error, "Socket")
      this.handleReconnect()
    })

    this.socket.on(SOCKET_EVENTS.RECONNECT, (attemptNumber: number) => {
      logger.info("Socket reconnected", { attemptNumber }, "Socket")
    })

    // Authentication events
    this.socket.on(SOCKET_EVENTS.AUTHENTICATED, (data: any) => {
      logger.success("Socket authenticated", data, "Socket")
    })

    this.socket.on(SOCKET_EVENTS.UNAUTHORIZED, (error: any) => {
      logger.error("Socket authentication failed", error, "Socket")
    })

    // Heartbeat
    this.socket.on(SOCKET_EVENTS.PONG, (data: any) => {
      logger.debug("Pong received", data, "Socket")
    })
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error("Max reconnection attempts reached", { attempts: this.reconnectAttempts }, "Socket")
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    logger.info("Attempting to reconnect", { attempt: this.reconnectAttempts, delay }, "Socket")

    setTimeout(() => {
      this.reconnect()
    }, delay)
  }

  public connect(): void {
    if (this.socket && !this.isConnected) {
      this.socket.connect()
      logger.info("Manual socket connection initiated", undefined, "Socket")
    }
  }

  public disconnect(): void {
    if (this.socket && this.isConnected) {
      this.socket.disconnect()
      logger.info("Socket disconnected manually", undefined, "Socket")
    }
  }

  public reconnect(): void {
    if (this.socket) {
      this.socket.connect()
      logger.info("Socket reconnection initiated", undefined, "Socket")
    }
  }

  public emit(event: string, data?: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data)
      logger.debug("Socket event emitted", { event, data }, "Socket")
    } else {
      logger.warn("Cannot emit event: socket not connected", { event, data }, "Socket")
    }
  }

  public on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback)
      logger.debug("Socket event listener added", { event }, "Socket")
    }
  }

  public off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback)
      logger.debug("Socket event listener removed", { event }, "Socket")
    }
  }

  public authenticate(token: string): void {
    this.emit(SOCKET_EVENTS.AUTHENTICATE, { token })
    logger.info("Socket authentication requested", undefined, "Socket")
  }

  public ping(): void {
    this.emit(SOCKET_EVENTS.PING, { timestamp: Date.now() })
  }

  public getConnectionStatus(): boolean {
    return this.isConnected
  }

  public getSocketId(): string | undefined {
    return this.socket?.id
  }

  public destroy(): void {
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      logger.info("Socket destroyed", undefined, "Socket")
    }
  }
}

// Create singleton instance
const socketManager = new SocketManager()

// Export the socket instance for direct use
export const socket = socketManager
export default socketManager

// Export socket events for convenience
export { SOCKET_EVENTS }
