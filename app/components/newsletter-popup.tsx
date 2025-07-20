"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Mail, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"

export default function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if user has already seen the popup
    const hasSeenPopup = localStorage.getItem("newsletter_popup_seen")
    const hasSubscribed = localStorage.getItem("newsletter_subscribed")

    if (!hasSeenPopup && !hasSubscribed) {
      // Show popup after 30 seconds
      const timer = setTimeout(() => {
        setIsOpen(true)
        localStorage.setItem("newsletter_popup_seen", "true")
      }, 30000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)

    try {
      // Simulate API call - replace with actual Firebase implementation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Store subscription in localStorage (replace with Firebase)
      const subscriptionData = {
        email,
        timestamp: new Date().toISOString(),
        source: "popup",
      }

      localStorage.setItem("newsletter_subscribed", "true")
      localStorage.setItem("newsletter_data", JSON.stringify(subscriptionData))

      setIsSubmitted(true)

      // Close popup after 3 seconds
      setTimeout(() => {
        setIsOpen(false)
      }, 3000)
    } catch (error) {
      console.error("Newsletter subscription error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4"
            onClick={handleClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto overflow-hidden">
              {!isSubmitted ? (
                <>
                  {/* Header */}
                  <div className="relative bg-gradient-to-br from-black to-gray-800 text-white p-8 text-center">
                    <button
                      onClick={handleClose}
                      className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8" />
                    </div>

                    <h2 className="text-2xl font-light mb-2">Stay in the Loop</h2>
                    <p className="text-white/80">
                      Get exclusive offers, new arrivals, and fragrance tips delivered to your inbox
                    </p>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
                      <Gift className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Welcome Offer</p>
                        <p className="text-sm text-gray-600">Get 10% off your first order</p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-12 border-gray-300 focus:border-black focus:ring-black"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white hover:bg-gray-800 h-12"
                      >
                        {loading ? "Subscribing..." : "Subscribe & Get 10% Off"}
                      </Button>
                    </form>

                    <p className="text-xs text-gray-500 text-center mt-4">
                      No spam, unsubscribe at any time. We respect your privacy.
                    </p>
                  </div>
                </>
              ) : (
                /* Success State */
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-green-600" />
                  </div>

                  <h2 className="text-2xl font-light text-gray-900 mb-2">Welcome to Fragransia™!</h2>
                  <p className="text-gray-600 mb-4">
                    Thank you for subscribing. Check your email for your 10% discount code.
                  </p>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800 font-medium">
                      Your discount code will arrive within 5 minutes
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
