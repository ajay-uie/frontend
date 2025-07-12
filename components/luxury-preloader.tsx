"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function LuxuryPreloader() {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(() => setIsVisible(false), 500)
          return 100
        }
        return prev + 2
      })
    }, 50)

    return () => clearInterval(timer)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-6xl font-light text-white tracking-wider mb-2">FRAGRANSIA™</h1>
              <p className="text-white/70 text-sm tracking-widest">LUXURY FRAGRANCES</p>
            </motion.div>

            <div className="w-64 mx-auto">
              <div className="h-px bg-white/20 relative overflow-hidden">
                <motion.div
                  className="h-full bg-white absolute left-0 top-0"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <div className="mt-4 text-white/60 text-sm font-light">{progress}%</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
