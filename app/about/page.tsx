"use client"

import Navigation from "../components/navigation"
import Footer from "../components/footer"
import WhatsAppChat from "../components/whatsapp-chat"
import { useState } from "react"

export default function AboutPage() {
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-light text-gray-900 mb-8 text-center">About Fragransia</h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-xl text-gray-600 mb-8 text-center">Where luxury meets artistry in every precious drop</p>

            <h2>Our Story</h2>
            <p>
              Founded with a passion for exceptional fragrances, Fragransia represents the pinnacle of luxury perfumery.
              Our journey began with a simple belief: that fragrance is not just a scent, but an expression of one's
              personality and style.
            </p>

            <h2>Our Mission</h2>
            <p>
              We are dedicated to creating extraordinary fragrances that transcend time and trends. Each creation is a
              testament to our unwavering commitment to quality, combining rare ingredients with innovative techniques
              to craft scents that tell stories and evoke emotions.
            </p>

            <h2>Craftsmanship</h2>
            <p>
              Every Fragransia fragrance is meticulously crafted using the finest ingredients sourced from around the
              world. Our master perfumers blend traditional techniques with modern innovation to create unique
              compositions that capture the essence of luxury and sophistication.
            </p>

            <h2>Quality Promise</h2>
            <p>
              We believe in delivering only the highest quality products to our customers. Each fragrance undergoes
              rigorous testing and quality control to ensure that every bottle meets our exacting standards.
            </p>

            <h2>Contact Us</h2>
            <p>
              We'd love to hear from you. Reach out to us at info@fragransia.in or visit our store to experience our
              collection firsthand.
            </p>
          </div>
          <WhatsAppChat />
        </div>
      </div>

      <Footer />
    </div>
  )
}

