"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Cookie, X, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false,
    preferences: false
  })

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent')
    if (!cookieConsent) {
      setIsVisible(true)
    }
  }, [])

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true
    }
    setPreferences(allAccepted)
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted))
    setIsVisible(false)
  }

  const handleAcceptSelected = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences))
    setIsVisible(false)
  }

  const handleRejectAll = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false
    }
    setPreferences(essentialOnly)
    localStorage.setItem('cookieConsent', JSON.stringify(essentialOnly))
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg"
        >
          <div className="max-w-7xl mx-auto p-6">
            {!showSettings ? (
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Cookie className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      We use cookies to enhance your experience
                    </h3>
                    <p className="text-sm text-gray-600">
                      We use cookies to personalize content, provide social media features, and analyze our traffic. 
                      You can choose which cookies you allow.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSettings(true)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Customize
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRejectAll}
                  >
                    Reject All
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAcceptAll}
                  >
                    Accept All
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Cookie Preferences</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Essential Cookies</h4>
                      <p className="text-sm text-gray-600">Required for the website to function</p>
                    </div>
                    <Switch checked={preferences.essential} disabled />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Analytics Cookies</h4>
                      <p className="text-sm text-gray-600">Help us understand how you use our website</p>
                    </div>
                    <Switch
                      checked={preferences.analytics}
                      onCheckedChange={(checked) =>
                        setPreferences(prev => ({ ...prev, analytics: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Marketing Cookies</h4>
                      <p className="text-sm text-gray-600">Used to show you relevant advertisements</p>
                    </div>
                    <Switch
                      checked={preferences.marketing}
                      onCheckedChange={(checked) =>
                        setPreferences(prev => ({ ...prev, marketing: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Preference Cookies</h4>
                      <p className="text-sm text-gray-600">Remember your settings and preferences</p>
                    </div>
                    <Switch
                      checked={preferences.preferences}
                      onCheckedChange={(checked) =>
                        setPreferences(prev => ({ ...prev, preferences: checked }))
                      }
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowSettings(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAcceptSelected}>
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
