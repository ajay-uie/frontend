"use client"

import { motion } from "framer-motion"
import { Check, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const comparisonData = [
  {
    feature: "Premium Quality",
    fragransia: true,
    others: false,
    description: "Imported oils and luxury ingredients",
  },
  {
    feature: "Long-lasting (8-12 hours)",
    fragransia: true,
    others: false,
    description: "Superior longevity and projection",
  },
  {
    feature: "Excellent Sillage",
    fragransia: true,
    others: true,
    description: "Perfect scent trail and presence",
  },
  {
    feature: "Competitive Pricing",
    fragransia: true,
    others: false,
    description: "Best value for premium quality",
  },
  {
    feature: "Authentic Products",
    fragransia: true,
    others: true,
    description: "100% genuine fragrances",
  },
  {
    feature: "Expert Support",
    fragransia: true,
    others: false,
    description: "Personalized fragrance consultation",
  },
]

export default function BrandComparison() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">Why Choose Fragransia?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">See how we compare to other fragrance brands in the market</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-black to-gray-800 text-white">
              <div className="grid grid-cols-3 gap-4 items-center">
                <div></div>
                <CardTitle className="text-center text-xl">Fragransia</CardTitle>
                <CardTitle className="text-center text-xl">Others</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {comparisonData.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`grid grid-cols-3 gap-4 items-center p-6 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                >
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">{item.feature}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <div className="text-center">
                    {item.fragransia ? (
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                        <X className="w-5 h-5 text-red-600" />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    {item.others ? (
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                        <X className="w-5 h-5 text-red-600" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        
      </div>
    </section>
  )
}
