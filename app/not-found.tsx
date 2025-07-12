"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Home, Search, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Navigation from "./components/navigation"
import Footer from "./components/footer"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            {/* 404 Number */}
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="mb-8">
              <h1 className="text-9xl font-light text-gray-300 mb-4">404</h1>
            </motion.div>

            {/* Error Message */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-8">
              <h2 className="text-3xl font-light text-gray-900 mb-4">Page Not Found</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                The page you're looking for doesn't exist or has been moved. Let's get you back to discovering our
                exquisite fragrances.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/">
                <Button className="bg-black text-white hover:bg-gray-800 gap-2">
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
              </Link>

              <Link href="/products">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Search className="w-4 h-4" />
                  Browse Products
                </Button>
              </Link>

              <Button variant="ghost" onClick={() => window.history.back()} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Button>
            </motion.div>

            {/* Decorative Element */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-16">
              <div className="w-24 h-px bg-gray-300 mx-auto mb-8"></div>
              <p className="text-sm text-gray-500">
                Need help?{" "}
                <Link href="/contact" className="text-black hover:underline">
                  Contact us
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
