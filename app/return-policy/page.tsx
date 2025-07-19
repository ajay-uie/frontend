"use client"

import Navigation from "../components/navigation"
import Footer from "../components/footer"
import { useState } from "react"

export default function ReturnPolicyPage() {
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <Navigation onCartClick={() => setIsCartOpen(true)} />

      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-light text-gray-900 mb-8">Return Policy</h1>

          <div className="prose prose-gray max-w-none">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-red-800 mb-4">Important Notice</h2>
              <p className="text-red-700">
                <strong>NO RETURNS EXCEPT UNDER CERTAIN CONDITIONS</strong>
                <br />
                Due to the nature of our ultra luxury fragrance products, we have a strict no-return policy except under
                specific circumstances outlined below.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Return Conditions</h2>
            <p className="mb-6">We only accept returns under the following specific conditions:</p>

            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Damaged During Shipping</h3>
                <p className="text-gray-700">
                  If your fragrance arrives damaged due to shipping issues, you may return it within 48 hours of
                  delivery. You must provide photographic evidence of the damage and the original packaging.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Wrong Product Shipped</h3>
                <p className="text-gray-700">
                  If we accidentally ship the wrong product, you may return it within 48 hours of delivery. The product
                  must be unopened and in its original packaging.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Manufacturing Defect</h3>
                <p className="text-gray-700">
                  If there is a clear manufacturing defect with the bottle or spray mechanism (not the fragrance
                  itself), you may return it within 7 days of delivery with photographic evidence.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">What We DO NOT Accept</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Returns based on fragrance preference or scent dissatisfaction</li>
              <li>Returns of opened or used products (except for manufacturing defects)</li>
              <li>Returns after the specified time limits</li>
              <li>Returns without original packaging</li>
              <li>Returns due to allergic reactions (please test before purchasing)</li>
              <li>Returns for size preference changes</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">Return Process</h2>
            <p className="mb-4">If your return meets our conditions:</p>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>Contact our customer service within the specified time frame</li>
              <li>Provide your order number and photographic evidence if required</li>
              <li>Wait for return authorization before shipping the product back</li>
              <li>Ship the product in its original packaging with all accessories</li>
              <li>Refund will be processed within 7-10 business days after we receive the returned item</li>
            </ol>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">Contact Information</h2>
            <p className="text-gray-700">
              Marketed by: Mahadev Enterprises, EP 61/BP.C Ghosh Road, Kolkata, West Bengal-700048 INDIA
              <br />
              Customer care executive:- +919433387574
              <br />
              For any feedback/ Customer Support, Please write to us at: care@fragransia.in
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Why This Policy?</h3>
              <p className="text-gray-700">Our strict return policy ensures:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                <li>Product authenticity and quality for all customers</li>
                <li>Hygiene standards for luxury fragrances</li>
                <li>Fair pricing by reducing return-related costs</li>
                <li>Exclusive availability - Only 100ml Available per fragrance</li>
              </ul>
            </div>

            <p className="text-sm text-gray-600 mt-8">
              This policy is effective as of January 1, 2024, and applies to all purchases made through our website and
              authorized retailers.
              <br />
              <strong>All fragrances are available exclusively in 100ml bottles.</strong>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
