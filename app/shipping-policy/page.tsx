"use client"

import Navigation from "../components/navigation"
import Footer from "../components/footer"
import WhatsAppChat from "../components/whatsapp-chat"
import { useState } from "react"

export default function ShippingPolicyPage() {
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <Navigation onCartClick={() => setIsCartOpen(true)} />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-light text-gray-900 mb-8">Shipping Policy</h1>

          <div className="prose prose-gray max-w-none">
            <h2>Shipping Information</h2>
            <p>
              We are committed to delivering your Fragransia products safely and efficiently. Please review our shipping
              policy below.
            </p>

            <h2>Processing Time</h2>
            <p>
              Orders are typically processed within 1-2 business days. During peak seasons or promotional periods,
              processing may take up to 3 business days.
            </p>

            <h2>Shipping Methods & Delivery Times</h2>
            <ul>
              <li>
                <strong>Standard Shipping (3-5 business days):</strong> Free for orders above ₹2,000
              </li>
              <li>
                <strong>Express Shipping (1-2 business days):</strong> ₹200 for all orders
              </li>
              <li>
                <strong>Same Day Delivery:</strong> Available in select cities for ₹500
              </li>
            </ul>

            <h2>Shipping Charges</h2>
            <ul>
              <li>Orders above ₹2,000: Free standard shipping</li>
              <li>Orders below ₹2,000: ₹100 shipping charge</li>
              <li>Express shipping: ₹200 (regardless of order value)</li>
            </ul>

            <h2>Delivery Areas</h2>
            <p>We currently deliver across India to the following areas:</p>
            <ul>
              <li>All major cities and towns</li>
              <li>Pin codes serviceable by our courier partners</li>
              <li>Remote areas may have extended delivery times</li>
            </ul>

            <h2>Order Tracking</h2>
            <p>Once your order is shipped, you will receive:</p>
            <ul>
              <li>Email confirmation with tracking number</li>
              <li>SMS updates on delivery status</li>
              <li>Real-time tracking through our website</li>
            </ul>

            <h2>Delivery Issues</h2>
            <p>If you experience any delivery issues:</p>
            <ul>
              <li>Contact us immediately at info@fragransia.in</li>
              <li>Provide your order number and tracking details</li>
              <li>We will resolve the issue within 24 hours</li>
            </ul>

            <h2>International Shipping</h2>
            <p>
              Currently, we only ship within India. We are working on expanding our shipping to international locations.
              Please check back for updates.
            </p>

            <h2>Contact Us</h2>
            <p>For shipping-related queries, contact us at:</p>
            <ul>
              <li>Email: info@fragransia.in</li>
              <li>Phone: 18002094004</li>
            </ul>
          </div>
        </div>
      </div>

      <WhatsAppChat />
      <Footer />
    </div>
  )
}
