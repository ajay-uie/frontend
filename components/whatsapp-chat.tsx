"use client"

import { useState } from "react"
import { MessageCircle, X } from "lucide-react"
import { Button } from "./ui/button"

export default function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false)

  const handleWhatsAppClick = () => {
    const phoneNumber = "+918296229196" // Updated phone number
    const message = "Hi! I have a question about your fragrances."
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 bg-white rounded-lg shadow-lg p-4 w-80 border">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-900">Chat with us!</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mb-3">Have questions about our fragrances? We're here to help!</p>
          <Button onClick={handleWhatsAppClick} className="w-full bg-green-500 hover:bg-green-600 text-white">
            Start WhatsApp Chat
          </Button>
        </div>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  )
}
