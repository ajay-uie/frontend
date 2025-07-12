"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

export default function SaleCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    // Set sale end date (7 days from now for demo)
    const saleEndDate = new Date()
    saleEndDate.setDate(saleEndDate.getDate() + 7)
    saleEndDate.setHours(23, 59, 59, 999)

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = saleEndDate.getTime() - now

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        })
      } else {
        clearInterval(timer)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 bg-black text-white bg-grain-dark">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Clock className="w-5 h-5" />
          <h2 className="text-xl font-medium tracking-wide">LUXURY SALE ENDS IN</h2>
        </div>

        <div className="flex items-center justify-center gap-4 sm:gap-8">
          {Object.entries(timeLeft).map(([unit, value]) => (
            <div key={unit} className="text-center">
              <div className="bg-white text-black px-3 py-2 sm:px-4 sm:py-3 font-mono text-xl sm:text-2xl font-bold min-w-[60px] transition-all duration-300">
                {value.toString().padStart(2, "0")}
              </div>
              <div className="text-xs sm:text-sm text-gray-300 mt-1 uppercase tracking-wider">{unit}</div>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-300 mt-4">Up to 25% off on selected fragrances</p>
      </div>
    </section>
  )
}
