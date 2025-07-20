"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { socket } from "@/lib/socket"
import logger from "@/utils/logger"
import { toast } from "sonner"

interface RealTimeState {
  isConnected: boolean
  isConnecting: boolean
  lastPing: number | null
  reconnectAttempts: number
  error: string | null
}

interface RealTimeHook {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  connect: () => void
  disconnect: () => void
  sendMessage: (event: string, data: any) => void
  lastPing: number | null
  reconnectAttempts: number
}

export function useRealTime(): RealTimeHook {
  const { user } = useAuth()
  const { refreshCart } = useCart()
  const [state, setState] = useState<RealTimeState>({
    isConnected: false,
    isConnecting: false,
    lastPing: null,
    reconnectAttempts: 0,
    error: null,
  })

  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const pingIntervalRef = useRef<NodeJS.Timeout>()
  const maxReconnectAttempts = 5
  const reconnectDelay = 2000

  const connect = useCallback(() => {
    if (state.isConnected || state.isConnecting) return

    setState((prev) => ({ ...prev, isConnecting: true, error: null }))
    logger.info("Attempting to connect to real-time services", undefined, "RealTime")

    try {
      socket.connect()
    } catch (error) {
      logger.error("Failed to connect to real-time services", error, "RealTime")
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : "Connection failed",
      }))
    }
  }, [state.isConnected, state.isConnecting])

  const disconnect = useCallback(() => {
    logger.info("Disconnecting from real-time services", undefined, "RealTime")

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
    }

    socket.disconnect()
    setState({
      isConnected: false,
      isConnecting: false,
      lastPing: null,
      reconnectAttempts: 0,
      error: null,
    })
  }, [])

  const sendMessage = useCallback(
    (event: string, data: any) => {
      if (!state.isConnected) {
        logger.warn("Cannot send message: not connected to real-time services", { event, data }, "RealTime")
        return
      }

      try {
        socket.emit(event, data)
        logger.debug("Real-time message sent", { event, data }, "RealTime")
      } catch (error) {
        logger.error("Failed to send real-time message", { event, data, error }, "RealTime")
      }
    },
    [state.isConnected],
  )

  const handleReconnect = useCallback(() => {
    if (state.reconnectAttempts >= maxReconnectAttempts) {
      logger.error("Max reconnection attempts reached", { attempts: state.reconnectAttempts }, "RealTime")
      setState((prev) => ({ ...prev, error: "Connection failed after multiple attempts" }))
      return
    }

    const delay = reconnectDelay * Math.pow(2, state.reconnectAttempts)
    logger.info("Scheduling reconnection", { attempt: state.reconnectAttempts + 1, delay }, "RealTime")

    setState((prev) => ({ ...prev, reconnectAttempts: prev.reconnectAttempts + 1 }))

    reconnectTimeoutRef.current = setTimeout(() => {
      connect()
    }, delay)
  }, [state.reconnectAttempts, connect])

  const startPingInterval = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
    }

    pingIntervalRef.current = setInterval(() => {
      if (state.isConnected) {
        const pingTime = Date.now()
        socket.emit("ping", { timestamp: pingTime })
        logger.debug("Ping sent", { timestamp: pingTime }, "RealTime")
      }
    }, 30000) // Ping every 30 seconds
  }, [state.isConnected])

  useEffect(() => {
    // Socket event handlers
    const handleConnect = () => {
      logger.success("Connected to real-time services", undefined, "RealTime")
      setState((prev) => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        reconnectAttempts: 0,
        error: null,
      }))

      // Authenticate with the server
      if (user) {
        socket.emit("authenticate", { userId: user.uid })
      }

      startPingInterval()
    }

    const handleDisconnect = (reason: string) => {
      logger.warn("Disconnected from real-time services", { reason }, "RealTime")
      setState((prev) => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        lastPing: null,
      }))

      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
      }

      // Auto-reconnect unless it was a manual disconnect
      if (reason !== "io client disconnect") {
        handleReconnect()
      }
    }

    const handleConnectError = (error: any) => {
      logger.error("Real-time connection error", error, "RealTime")
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: error.message || "Connection error",
      }))
      handleReconnect()
    }

    const handlePong = (data: { timestamp: number }) => {
      const latency = Date.now() - data.timestamp
      setState((prev) => ({ ...prev, lastPing: latency }))
      logger.debug("Pong received", { latency }, "RealTime")
    }

    const handleAuthenticated = () => {
      logger.success("Authenticated with real-time services", undefined, "RealTime")
    }

    const handleOrderUpdate = (data: any) => {
      logger.info("Order update received", data, "RealTime")
      toast.success(`Order ${data.orderId} status updated to ${data.status}`)
    }

    const handleCartUpdate = (data: any) => {
      logger.info("Cart update received", data, "RealTime")
      refreshCart()
    }

    const handleProductUpdate = (data: any) => {
      logger.info("Product update received", data, "RealTime")
      // Handle product updates (price changes, stock updates, etc.)
    }

    const handleNotification = (data: any) => {
      logger.info("Notification received", data, "RealTime")
      toast.info(data.message, {
        description: data.description,
        action: data.action
          ? {
              label: data.action.label,
              onClick: () => {
                if (data.action.url) {
                  window.location.href = data.action.url
                }
              },
            }
          : undefined,
      })
    }

    const handleSystemAlert = (data: any) => {
      logger.warn("System alert received", data, "RealTime")
      toast.warning(data.message, {
        description: data.description,
        duration: 10000,
      })
    }

    // Register event listeners
    socket.on("connect", handleConnect)
    socket.on("disconnect", handleDisconnect)
    socket.on("connect_error", handleConnectError)
    socket.on("pong", handlePong)
    socket.on("authenticated", handleAuthenticated)
    socket.on("order_update", handleOrderUpdate)
    socket.on("cart_update", handleCartUpdate)
    socket.on("product_update", handleProductUpdate)
    socket.on("notification", handleNotification)
    socket.on("system_alert", handleSystemAlert)

    return () => {
      // Cleanup event listeners
      socket.off("connect", handleConnect)
      socket.off("disconnect", handleDisconnect)
      socket.off("connect_error", handleConnectError)
      socket.off("pong", handlePong)
      socket.off("authenticated", handleAuthenticated)
      socket.off("order_update", handleOrderUpdate)
      socket.off("cart_update", handleCartUpdate)
      socket.off("product_update", handleProductUpdate)
      socket.off("notification", handleNotification)
      socket.off("system_alert", handleSystemAlert)
    }
  }, [user, refreshCart, handleReconnect, startPingInterval])

  // Auto-connect when user is authenticated
  useEffect(() => {
    if (user && !state.isConnected && !state.isConnecting) {
      connect()
    } else if (!user && state.isConnected) {
      disconnect()
    }
  }, [user, state.isConnected, state.isConnecting, connect, disconnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
      }
    }
  }, [])

  return {
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    error: state.error,
    connect,
    disconnect,
    sendMessage,
    lastPing: state.lastPing,
    reconnectAttempts: state.reconnectAttempts,
  }
}
