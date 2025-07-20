"use client"

import { useRealTime } from "@/hooks/use-real-time"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle } from "lucide-react"
import { useState } from "react"

export function RealTimeStatus() {
  const { isConnected, isConnecting, error, connect, lastPing, reconnectAttempts } = useRealTime()
  const [isOpen, setIsOpen] = useState(false)

  const getStatusIcon = () => {
    if (isConnecting) {
      return <RefreshCw className="h-3 w-3 animate-spin" />
    }
    if (error) {
      return <AlertCircle className="h-3 w-3" />
    }
    if (isConnected) {
      return <CheckCircle className="h-3 w-3" />
    }
    return <WifiOff className="h-3 w-3" />
  }

  const getStatusColor = () => {
    if (isConnecting) return "bg-yellow-100 text-yellow-800"
    if (error) return "bg-red-100 text-red-800"
    if (isConnected) return "bg-green-100 text-green-800"
    return "bg-gray-100 text-gray-800"
  }

  const getStatusText = () => {
    if (isConnecting) return "Connecting..."
    if (error) return "Disconnected"
    if (isConnected) return "Connected"
    return "Offline"
  }

  const getPingStatus = () => {
    if (!lastPing) return "No data"
    if (lastPing < 100) return "Excellent"
    if (lastPing < 300) return "Good"
    if (lastPing < 500) return "Fair"
    return "Poor"
  }

  const getPingColor = () => {
    if (!lastPing) return "text-gray-500"
    if (lastPing < 100) return "text-green-600"
    if (lastPing < 300) return "text-yellow-600"
    if (lastPing < 500) return "text-orange-600"
    return "text-red-600"
  }

  // Only show in development or when there are connection issues
  if (process.env.NODE_ENV === "production" && isConnected && !error) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`${getStatusColor()} border-0 shadow-lg hover:shadow-xl transition-all duration-200`}
          >
            {getStatusIcon()}
            <span className="ml-2 text-xs font-medium">{getStatusText()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Real-time Connection</h4>
              <Badge className={getStatusColor()}>
                {getStatusIcon()}
                <span className="ml-1">{getStatusText()}</span>
              </Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={isConnected ? "text-green-600" : "text-red-600"}>
                  {isConnected ? "Online" : "Offline"}
                </span>
              </div>

              {lastPing && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Latency:</span>
                  <span className={getPingColor()}>
                    {lastPing}ms ({getPingStatus()})
                  </span>
                </div>
              )}

              {reconnectAttempts > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Reconnect attempts:</span>
                  <span className="text-orange-600">{reconnectAttempts}</span>
                </div>
              )}

              {error && (
                <div className="mt-2 p-2 bg-red-50 rounded text-red-700 text-xs">
                  <strong>Error:</strong> {error}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {!isConnected && !isConnecting && (
                <Button size="sm" onClick={connect} className="flex-1 bg-black text-white hover:bg-gray-800">
                  <Wifi className="h-3 w-3 mr-1" />
                  Reconnect
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                Close
              </Button>
            </div>

            {process.env.NODE_ENV === "development" && (
              <div className="pt-2 border-t text-xs text-gray-500">
                <p>Development mode - Connection status visible</p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
