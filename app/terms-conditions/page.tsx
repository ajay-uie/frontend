'use client'

import Navigation from "../components/navigation"
import Footer from "../components/footer"
import WhatsAppChat from "../components/whatsapp-chat"

  const handleCartClick = () => {
    // Handle cart click
  }

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation onCartClick={handleCartClick} />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-light text-gray-900 mb-8">Terms & Conditions</h1>

          <div className="prose prose-gray max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using this website, you accept and agree to be bound by the terms and provision of this
              agreement.
            </p>

            <h2>2. Products and Services</h2>
            <p>
              All products and services are subject to availability. We reserve the right to discontinue any product at
              any time.
            </p>

            <h2>3. Pricing</h2>
            <p>All prices are subject to change without notice. We reserve the right to modify prices at any time.</p>

            <h2>4. Payment Terms</h2>
            <p>
              Payment must be received in full before products are shipped. We accept major credit cards and digital
              payment methods.
            </p>

            <h2>5. Shipping and Delivery</h2>
            <p>
              We aim to process and ship orders within 2-3 business days. Delivery times may vary based on location.
            </p>

            <h2>6. Returns and Exchanges</h2>
            <p>Please refer to our Return Policy for detailed information about returns and exchanges.</p>

            <h2>7. Limitation of Liability</h2>
            <p>
              Fragransia shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
            </p>

            <h2>8. Contact Information</h2>
            <p>For questions about these Terms & Conditions, please contact us at info@fragransia.in</p>
          </div>
        </div>
      </div>

      <WhatsAppChat />
      <Footer />
    </div>
  )
}
