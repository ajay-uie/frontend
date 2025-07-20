import { useState, useEffect } from "react"
import { Clock } from "lucide-react"
import { backendApi } from "@/lib/backend-api-enhanced"

export default function SaleCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [countdownEnabled, setCountdownEnabled] = useState(false)
  const [countdownEndDate, setCountdownEndDate] = useState<Date | null>(null)
  const [countdownDisplayMessage, setCountdownDisplayMessage] = useState("")

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await backendApi.getCountdownSettings()
        if (response.success && response.settings) {
          setCountdownEnabled(response.settings.enabled)
          if (response.settings.endDate) {
            setCountdownEndDate(new Date(response.settings.endDate._seconds * 1000))
          }
          setCountdownDisplayMessage(response.settings.message || "")
        }
      } catch (error) {
        console.error("Failed to fetch countdown settings:", error)
      }
    }
    fetchSettings()
  }, [])

  useEffect(() => {
    if (!countdownEnabled || !countdownEndDate) return

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = countdownEndDate.getTime() - now

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
        setCountdownEnabled(false) // Disable countdown if it ends
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [countdownEnabled, countdownEndDate])

  if (!countdownEnabled) {
    return null // Don\'t render if countdown is not enabled
  }

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 bg-black text-white bg-grain-dark">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Clock className="w-5 h-5" />
          <h2 className="text-xl font-medium tracking-wide">{countdownDisplayMessage || "LUXURY SALE ENDS IN"}</h2>
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

        {countdownDisplayMessage && (
          <p className="text-sm text-gray-300 mt-4">{countdownDisplayMessage}</p>
        )}
      </div>
    </section>
  )
}
