interface LogEntry {
  timestamp: string
  level: "DEBUG" | "INFO" | "WARN" | "ERROR" | "SUCCESS"
  message: string
  data?: any
  context?: string
  sessionId: string
}

class Logger {
  private sessionId: string
  private isClient: boolean
  private logs: LogEntry[] = []
  private maxLogs = 1000

  constructor() {
    this.sessionId = this.generateSessionId()
    this.isClient = typeof window !== "undefined"

    if (this.isClient) {
      this.loadStoredLogs()
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private loadStoredLogs(): void {
    try {
      const stored = localStorage.getItem("fragransia_logs")
      if (stored) {
        this.logs = JSON.parse(stored).slice(-this.maxLogs)
      }
    } catch (error) {
      console.warn("Failed to load stored logs:", error)
    }
  }

  private persistLogs(): void {
    if (!this.isClient) return

    try {
      localStorage.setItem("fragransia_logs", JSON.stringify(this.logs.slice(-this.maxLogs)))
    } catch (error) {
      console.warn("Failed to persist logs:", error)
    }
  }

  private createLogEntry(level: LogEntry["level"], message: string, data?: any, context?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      context,
      sessionId: this.sessionId,
    }
  }

  private outputToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString()
    const prefix = `%c${this.getLevelIcon(entry.level)} ${entry.level} ${timestamp}`
    const style = this.getLevelStyle(entry.level)
    const contextStr = entry.context ? ` [${entry.context}]` : ""

    if (entry.data) {
      console.log(`${prefix}${contextStr}`, style, entry.message, entry.data)
    } else {
      console.log(`${prefix}${contextStr}`, style, entry.message)
    }
  }

  private getLevelIcon(level: LogEntry["level"]): string {
    switch (level) {
      case "DEBUG":
        return "🔍"
      case "INFO":
        return "ℹ️"
      case "WARN":
        return "⚠️"
      case "ERROR":
        return "❌"
      case "SUCCESS":
        return "✅"
      default:
        return "📝"
    }
  }

  private getLevelStyle(level: LogEntry["level"]): string {
    switch (level) {
      case "DEBUG":
        return "color: #6b7280; font-weight: normal;"
      case "INFO":
        return "color: #3b82f6; font-weight: normal;"
      case "WARN":
        return "color: #f59e0b; font-weight: bold;"
      case "ERROR":
        return "color: #ef4444; font-weight: bold;"
      case "SUCCESS":
        return "color: #10b981; font-weight: bold;"
      default:
        return "color: #374151; font-weight: normal;"
    }
  }

  private log(level: LogEntry["level"], message: string, data?: any, context?: string): void {
    const entry = this.createLogEntry(level, message, data, context)
    this.logs.push(entry)

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    this.outputToConsole(entry)
    this.persistLogs()
  }

  debug(message: string, data?: any, context?: string): void {
    if (process.env.NODE_ENV === "development") {
      this.log("DEBUG", message, data, context)
    }
  }

  info(message: string, data?: any, context?: string): void {
    this.log("INFO", message, data, context)
  }

  warn(message: string, data?: any, context?: string): void {
    this.log("WARN", message, data, context)
  }

  error(message: string, data?: any, context?: string): void {
    this.log("ERROR", message, data, context)
  }

  success(message: string, data?: any, context?: string): void {
    this.log("SUCCESS", message, data, context)
  }

  // Utility methods
  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  clearLogs(): void {
    this.logs = []
    if (this.isClient) {
      localStorage.removeItem("fragransia_logs")
    }
  }

  getSessionId(): string {
    return this.sessionId
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}

// Create singleton instance
const logger = new Logger()

// Export both the instance and a client-specific logger
export default logger
export const clientLogger = logger
export const serverLogger = logger

// Export types
export type { LogEntry }
