'use client'


'use client'

import Navigation from "../components/navigation"
import Footer from "../components/footer"
import WhatsAppChat from "../components/whatsapp-chat"

  const handleCartClick = () => {
    // Handle cart click
  }

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation onCartClick={handleCartClick} />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-light text-gray-900 mb-8">Privacy Policy</h1>

          <div className="prose prose-gray max-w-none">
            <h2>Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you create an account, make a purchase, or
              contact us.
            </p>

            <h2>How We Use Your Information</h2>
            <p>
              We use the information we collect to provide, maintain, and improve our services, process transactions,
              and communicate with you.
            </p>

            <h2>Information Sharing</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties without your
              consent, except as described in this policy.
            </p>

            <h2>Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information against unauthorized
              access, alteration, disclosure, or destruction.
            </p>

            <h2>Cookies</h2>
            <p>
              We use cookies to enhance your experience on our website. You can choose to disable cookies through your
              browser settings.
            </p>

            <h2>Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal information. Contact us to exercise these
              rights.
            </p>

            <h2>Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new
              policy on this page.
            </p>

            <h2>Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us at info@fragransia.in</p>
          </div>
        </div>
      </div>

      <WhatsAppChat />
      <Footer />
    </div>
  )
}
