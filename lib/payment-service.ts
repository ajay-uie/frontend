// Payment service for Razorpay integration
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PaymentOptions {
  amount: number;
  currency: string;
  orderId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

class PaymentService {
  private razorpayKeyId: string;
  private apiBaseUrl: string;

  constructor() {
    this.razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
    this.apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backend-8npy.onrender.com/api';
  }

  // Load Razorpay script dynamically
  private loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  // Create order on backend
  async createOrder(orderData: {
    items: any[];
    shippingAddress: any;
    couponCode?: string;
    giftWrap?: boolean;
    notes?: string;
  }, token: string): Promise<{ success: boolean; order?: any; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true, order: data.order };
      } else {
        return { success: false, error: data.message || 'Failed to create order' };
      }
    } catch (error) {
      console.error('Create order error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  // Verify payment on backend
  async verifyPayment(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderId: string;
  }, token: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Payment verification failed' };
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  // Process payment with Razorpay
  async processPayment(options: PaymentOptions): Promise<void> {
    try {
      // Load Razorpay script
      const isLoaded = await this.loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Configure Razorpay options
      const razorpayOptions = {
        key: this.razorpayKeyId,
        amount: options.amount * 100, // Convert to paise
        currency: options.currency,
        order_id: options.orderId,
        name: 'Fragransia',
        description: 'Premium Fragrance Purchase',
        image: '/placeholder-logo.png',
        prefill: {
          name: options.customerInfo.name,
          email: options.customerInfo.email,
          contact: options.customerInfo.phone,
        },
        theme: {
          color: '#000000',
        },
        modal: {
          ondismiss: () => {
            options.onFailure({ error: 'Payment cancelled by user' });
          },
        },
        handler: (response: RazorpayResponse) => {
          options.onSuccess(response);
        },
        notes: {
          platform: 'web',
          version: '1.0.0',
        },
      };

      // Create and open Razorpay checkout
      const razorpay = new window.Razorpay(razorpayOptions);
      
      razorpay.on('payment.failed', (response: any) => {
        options.onFailure(response.error);
      });

      razorpay.open();
    } catch (error) {
      console.error('Payment processing error:', error);
      options.onFailure({ error: 'Failed to initialize payment' });
    }
  }

  // Process UPI payment
  async processUPIPayment(options: PaymentOptions & { upiId?: string }): Promise<void> {
    try {
      const isLoaded = await this.loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      const razorpayOptions = {
        key: this.razorpayKeyId,
        amount: options.amount * 100,
        currency: options.currency,
        order_id: options.orderId,
        name: 'Fragransia',
        description: 'Premium Fragrance Purchase',
        prefill: {
          name: options.customerInfo.name,
          email: options.customerInfo.email,
          contact: options.customerInfo.phone,
          vpa: options.upiId,
        },
        theme: {
          color: '#000000',
        },
        handler: (response: RazorpayResponse) => {
          options.onSuccess(response);
        },
        modal: {
          ondismiss: () => {
            options.onFailure({ error: 'Payment cancelled by user' });
          },
        },
      };

      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.on('payment.failed', (response: any) => {
        options.onFailure(response.error);
      });

      razorpay.open();
    } catch (error) {
      console.error('UPI payment error:', error);
      options.onFailure({ error: 'Failed to initialize UPI payment' });
    }
  }

  // Process Net Banking payment
  async processNetBankingPayment(options: PaymentOptions & { bankCode?: string }): Promise<void> {
    try {
      const isLoaded = await this.loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      const razorpayOptions = {
        key: this.razorpayKeyId,
        amount: options.amount * 100,
        currency: options.currency,
        order_id: options.orderId,
        name: 'Fragransia',
        description: 'Premium Fragrance Purchase',
        method: {
          netbanking: true,
        },
        prefill: {
          name: options.customerInfo.name,
          email: options.customerInfo.email,
          contact: options.customerInfo.phone,
        },
        theme: {
          color: '#000000',
        },
        handler: (response: RazorpayResponse) => {
          options.onSuccess(response);
        },
        modal: {
          ondismiss: () => {
            options.onFailure({ error: 'Payment cancelled by user' });
          },
        },
      };

      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.on('payment.failed', (response: any) => {
        options.onFailure(response.error);
      });

      razorpay.open();
    } catch (error) {
      console.error('Net banking payment error:', error);
      options.onFailure({ error: 'Failed to initialize net banking payment' });
    }
  }

  // Process Wallet payment
  async processWalletPayment(options: PaymentOptions & { wallet?: string }): Promise<void> {
    try {
      const isLoaded = await this.loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      const razorpayOptions = {
        key: this.razorpayKeyId,
        amount: options.amount * 100,
        currency: options.currency,
        order_id: options.orderId,
        name: 'Fragransia',
        description: 'Premium Fragrance Purchase',
        method: {
          wallet: {
            [options.wallet || 'paytm']: true,
          },
        },
        prefill: {
          name: options.customerInfo.name,
          email: options.customerInfo.email,
          contact: options.customerInfo.phone,
        },
        theme: {
          color: '#000000',
        },
        handler: (response: RazorpayResponse) => {
          options.onSuccess(response);
        },
        modal: {
          ondismiss: () => {
            options.onFailure({ error: 'Payment cancelled by user' });
          },
        },
      };

      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.on('payment.failed', (response: any) => {
        options.onFailure(response.error);
      });

      razorpay.open();
    } catch (error) {
      console.error('Wallet payment error:', error);
      options.onFailure({ error: 'Failed to initialize wallet payment' });
    }
  }

  // Get payment methods
  getPaymentMethods() {
    return [
      {
        id: 'card',
        name: 'Credit/Debit Card',
        description: 'Visa, Mastercard, RuPay, American Express',
        icon: '💳',
        processingFee: 25,
      },
      {
        id: 'upi',
        name: 'UPI',
        description: 'Google Pay, PhonePe, Paytm, BHIM',
        icon: '📱',
        processingFee: 0,
      },
      {
        id: 'netbanking',
        name: 'Net Banking',
        description: 'All major banks supported',
        icon: '🏦',
        processingFee: 25,
      },
      {
        id: 'wallet',
        name: 'Wallets',
        description: 'Paytm, Mobikwik, Freecharge',
        icon: '👛',
        processingFee: 15,
      },
      {
        id: 'cod',
        name: 'Cash on Delivery',
        description: 'Pay when you receive',
        icon: '💵',
        processingFee: 50,
      },
    ];
  }

  // Get popular banks for net banking
  getPopularBanks() {
    return [
      { code: 'HDFC', name: 'HDFC Bank' },
      { code: 'ICIC', name: 'ICICI Bank' },
      { code: 'SBIN', name: 'State Bank of India' },
      { code: 'AXIS', name: 'Axis Bank' },
      { code: 'KKBK', name: 'Kotak Mahindra Bank' },
      { code: 'UTIB', name: 'Yes Bank' },
      { code: 'PUNB', name: 'Punjab National Bank' },
      { code: 'INDB', name: 'IndusInd Bank' },
    ];
  }

  // Get supported wallets
  getSupportedWallets() {
    return [
      { code: 'paytm', name: 'Paytm' },
      { code: 'mobikwik', name: 'Mobikwik' },
      { code: 'freecharge', name: 'Freecharge' },
      { code: 'ola', name: 'Ola Money' },
      { code: 'jiomoney', name: 'JioMoney' },
    ];
  }
}

export const paymentService = new PaymentService();

