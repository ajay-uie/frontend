"use client"

import { motion } from "framer-motion"
import Navigation from "../components/navigation"
import Footer from "../components/footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "How do I choose the right fragrance?",
    answer:
      "Choosing the right fragrance is a personal journey. Consider the occasion, your personality, and the season. We recommend trying our fragrance finder quiz or visiting our store for a personalized consultation. You can also read our detailed fragrance notes and customer reviews to help make your decision.",
  },
  {
    question: "How long do fragrances last?",
    answer:
      "The longevity of a fragrance depends on several factors including the concentration, your skin type, and environmental conditions. Our Eau de Parfum typically lasts 6-8 hours, while Eau de Toilette lasts 4-6 hours. For best results, apply to pulse points and moisturized skin.",
  },
  {
    question: "What's the difference between Eau de Parfum and Eau de Toilette?",
    answer:
      "The main difference is the concentration of fragrance oils. Eau de Parfum (EDP) contains 15-20% fragrance oils, making it longer-lasting and more intense. Eau de Toilette (EDT) contains 5-15% fragrance oils, making it lighter and more suitable for daytime wear.",
  },
  {
    question: "How should I store my fragrances?",
    answer:
      "Store your fragrances in a cool, dry place away from direct sunlight and heat. Avoid storing them in the bathroom due to humidity. Keep the bottles upright and tightly closed. Proper storage can help maintain the fragrance quality for years.",
  },
  {
    question: "Do you offer samples or testers?",
    answer:
      "Yes! We offer 2ml sample vials for most of our fragrances. You can order samples online or request them when you visit our store. This is a great way to try a fragrance before committing to a full bottle.",
  },
  {
    question: "What is your shipping policy?",
    answer:
      "We offer free standard shipping on orders above ₹2,000. Express shipping is available for ₹199, and overnight delivery for ₹499. All orders are carefully packaged to prevent damage during transit. Delivery times vary by location but typically range from 2-7 business days.",
  },
  {
    question: "Are your fragrances authentic?",
    answer:
      "Absolutely! We source all our fragrances directly from authorized distributors and brand partners. Every product comes with a guarantee of authenticity. We never sell counterfeit or diluted products.",
  },
  {
    question: "Can I track my order?",
    answer:
      "Yes, once your order is shipped, you'll receive a tracking number via email and SMS. You can use this to track your package in real-time. You can also check your order status by logging into your account on our website.",
  },
  {
    question: "Do you offer gift wrapping?",
    answer:
      "Yes, we offer complimentary gift wrapping for all orders. You can select this option during checkout. We also include a personalized gift message if requested. Perfect for birthdays, anniversaries, and special occasions!",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards (Visa, Mastercard, RuPay), UPI payments (Google Pay, PhonePe, Paytm), net banking, and cash on delivery. All payments are processed securely through our encrypted payment gateway.",
  },
  {
    question: "How can I contact customer support?",
    answer:
      "You can reach our customer support team through multiple channels: WhatsApp chat (available on our website), email at support@fragransia.com, or phone at +91-XXXXXXXXX. Our support hours are Monday to Saturday, 9 AM to 7 PM.",
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl font-light text-gray-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Find answers to common questions about our fragrances, shipping, and services
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-white border border-gray-200 rounded-lg px-6"
                >
                  <AccordionTrigger className="text-left font-medium text-gray-900 hover:text-gray-700">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12 p-8 bg-gray-50 rounded-lg"
          >
            <h2 className="text-2xl font-light text-gray-900 mb-4">Still have questions?</h2>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? Our customer support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@fragransia.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Email Support
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
