import { io, Socket } from 'socket.io-client';
import { API_BASE } from './constants';

class SocketClient {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      const socketUrl = API_BASE.WITHOUT_API;
      
      this.socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
      });

      this.setupEventHandlers();
    } catch (error) {
      console.error('Socket connection error:', error);
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected', { socketId: this.socket?.id });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      this.emit('disconnected', { reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      this.emit('connection_error', { error, attempts: this.reconnectAttempts });
    });

    this.socket.on('authenticated', (data) => {
      console.log('Socket authenticated:', data);
      this.emit('authenticated', data);
    });

    this.socket.on('authentication-error', (data) => {
      console.error('Socket authentication error:', data);
      this.emit('authentication_error', data);
    });

    // Real-time data events
    this.socket.on('product-updated', (data) => {
      console.log('Product updated:', data);
      this.emit('product_updated', data);
    });

    this.socket.on('product-available', (data) => {
      console.log('Product available:', data);
      this.emit('product_available', data);
    });

    this.socket.on('order-updated', (data) => {
      console.log('Order updated:', data);
      this.emit('order_updated', data);
    });

    this.socket.on('order-status-update', (data) => {
      console.log('Order status update:', data);
      this.emit('order_status_update', data);
    });

    this.socket.on('inventory-alert', (data) => {
      console.log('Inventory alert:', data);
      this.emit('inventory_alert', data);
    });

    this.socket.on('sales-update', (data) => {
      console.log('Sales update:', data);
      this.emit('sales_update', data);
    });

    this.socket.on('visitor-update', (data) => {
      console.log('Visitor update:', data);
      this.emit('visitor_update', data);
    });

    this.socket.on('system-alert', (data) => {
      console.log('System alert:', data);
      this.emit('system_alert', data);
    });

    this.socket.on('system-stats-update', (data) => {
      console.log('System stats update:', data);
      this.emit('system_stats_update', data);
    });

    this.socket.on('dashboard-data', (data) => {
      console.log('Dashboard data:', data);
      this.emit('dashboard_data', data);
    });

    this.socket.on('website-data', (data) => {
      console.log('Website data:', data);
      this.emit('website_data', data);
    });

    this.socket.on('heartbeat', (data) => {
      this.emit('heartbeat', data);
    });
  }

  // Authentication methods
  authenticate(token: string, userType: 'user' | 'admin' = 'user') {
    if (this.socket && this.isConnected) {
      this.socket.emit('authenticate', { token, userType });
    }
  }

  subscribeToUpdates(types: string[]) {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribe-to-updates', { types });
    }
  }

  // Admin actions
  triggerAdminAction(action: string, payload: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit('admin-action', { action, payload });
    }
  }

  // Event listener management
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback?: Function) {
    if (!callback) {
      this.listeners.delete(event);
      return;
    }

    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  // Connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Reconnect
  reconnect() {
    this.disconnect();
    this.connect();
  }
}

// Create singleton instance
const socketClient = new SocketClient();

export default socketClient;

// Export types for TypeScript
export interface SocketEventData {
  type: string;
  data: any;
  timestamp: Date;
}

export interface ProductUpdateData extends SocketEventData {
  data: {
    id: string;
    name: string;
    price: number;
    stock: number;
    active: boolean;
    [key: string]: any;
  };
}

export interface OrderUpdateData extends SocketEventData {
  data: {
    id: string;
    status: string;
    [key: string]: any;
  };
}

export interface InventoryAlertData extends SocketEventData {
  data: {
    productId: string;
    productName: string;
    currentStock: number;
    status: 'out-of-stock' | 'low-stock';
  };
}

