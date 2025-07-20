"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator";
import api, { checkApiHealth } from "@/lib/api";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff,
  Database,
  Server,
  RefreshCw,
  Clock,
} from "lucide-react"

interface SystemStatus {
  api: boolean
  firebase: boolean
  network: boolean
  responseTime: number
}

interface HealthCheckResult {
  timestamp: string
  success: boolean
  responseTime: number
  error?: string
}

export function AdminSignalsPanel() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    api: false,
    firebase: false,
    network: true,
    responseTime: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [lastCheck, setLastCheck] = useState<string>("")
  const [healthHistory, setHealthHistory] = useState<HealthCheckResult[]>([])
  const [autoRefresh, setAutoRefresh] = useState(false)

  const checkSystemHealth = async () => {
    setIsLoading(true)
    const startTime = Date.now()

    try {
      console.log("🔍 Admin panel checking system health...")

      // Get comprehensive status from API client
     const status = await api.admin.getDashboard();
      setSystemStatus(status)

      // Manual health check for history
      const healthResult = await checkApiHealth()
      const responseTime = Date.now() - startTime

      const result: HealthCheckResult = {
        timestamp: new Date().toLocaleTimeString(),
        success: healthResult,
        responseTime,
        error: healthResult ? undefined : "Health check failed",
      }

      setHealthHistory((prev) => [result, ...prev.slice(0, 4)]) // Keep last 5 results
      setLastCheck(new Date().toLocaleString())

      console.log("📊 System health check completed:", status)
    } catch (error) {
      console.error("❌ System health check failed:", error)
      const result: HealthCheckResult = {
        timestamp: new Date().toLocaleTimeString(),
        success: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : "Unknown error",
      }
      setHealthHistory((prev) => [result, ...prev.slice(0, 4)])
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-refresh functionality
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (autoRefresh) {
      interval = setInterval(checkSystemHealth, 30000) // Every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  // Initial check on mount
  useEffect(() => {
    checkSystemHealth()
  }, [])

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = (status: boolean, label: string) => {
    return (
      <Badge variant={status ? "default" : "destructive"} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {label}
      </Badge>
    )
  }

  const getOverallHealth = () => {
    const healthyServices = [systemStatus.api, systemStatus.network].filter(Boolean).length
    const totalServices = 2 // API and Network (Firebase is optional)

    if (healthyServices === totalServices) return "healthy"
    if (healthyServices > 0) return "degraded"
    return "critical"
  }

  const overallHealth = getOverallHealth()

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health Monitor
            </CardTitle>
            <CardDescription>Real-time monitoring of API, database, and network connectivity</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? "bg-green-50 border-green-200" : ""}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh ? "animate-spin" : ""}`} />
              Auto Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={checkSystemHealth} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Test Now
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Status Alert */}
        <Alert
          className={
            overallHealth === "healthy"
              ? "border-green-200 bg-green-50"
              : overallHealth === "degraded"
                ? "border-yellow-200 bg-yellow-50"
                : "border-red-200 bg-red-50"
          }
        >
          <div className="flex items-center gap-2">
            {overallHealth === "healthy" && <CheckCircle className="h-4 w-4 text-green-600" />}
            {overallHealth === "degraded" && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
            {overallHealth === "critical" && <XCircle className="h-4 w-4 text-red-600" />}
            <AlertDescription className="font-medium">
              System Status: {overallHealth.charAt(0).toUpperCase() + overallHealth.slice(1)}
              {lastCheck && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">Last checked: {lastCheck}</span>
              )}
            </AlertDescription>
          </div>
        </Alert>

        {/* Service Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* API Status */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">API Server</span>
            </div>
            {getStatusBadge(systemStatus.api, systemStatus.api ? "Online" : "Offline")}
          </div>

          {/* Network Status */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {systemStatus.network ? (
                <Wifi className="h-4 w-4 text-muted-foreground" />
              ) : (
                <WifiOff className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="font-medium">Network</span>
            </div>
            {getStatusBadge(systemStatus.network, systemStatus.network ? "Connected" : "Disconnected")}
          </div>

          {/* Firebase Status */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Firebase</span>
            </div>
            {getStatusBadge(systemStatus.firebase, systemStatus.firebase ? "Connected" : "Fallback")}
          </div>
        </div>

        {/* Response Time */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Response Time</span>
          </div>
          <Badge variant="outline" className="font-mono">
            {systemStatus.responseTime}ms
          </Badge>
        </div>

        <Separator />

        {/* Health Check History */}
        <div>
          <h4 className="font-medium mb-3">Recent Health Checks</h4>
          <div className="space-y-2">
            {healthHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No health checks performed yet</p>
            ) : (
              healthHistory.map((check, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(check.success)}
                    <span className="font-mono">{check.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{check.responseTime}ms</span>
                    {check.error && (
                      <Badge variant="destructive" className="text-xs">
                        {check.error}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Debug Information */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>API Base: {process.env.NEXT_PUBLIC_API_URL || "https://fragransia.onrender.com/api"}</p>
          <p>Environment: {process.env.NODE_ENV || "development"}</p>
          <p>Health Endpoint: /api/health-check (proxied)</p>
        </div>
      </CardContent>
    </Card>
  )
}
