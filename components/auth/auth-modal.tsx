"use client"

import type React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import LoginForm from "./login-form"
import RegisterForm from "./register-form"
import ForgotPasswordForm from "./forgot-password-form"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  defaultTab?: "login" | "register"
}

const GOOGLE_ICON = (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
)

const FACEBOOK_ICON = (
  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  defaultTab = "login",
}: AuthModalProps) {
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Debug logging
  console.log('AuthModal render:', { isOpen, activeTab, showForgotPassword });

  // Force render when open for debugging
  if (isOpen) {
    console.log('AuthModal should be visible now');
  }

  const handleSuccess = () => {
    onSuccess?.()
    onClose()
  }

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true)
    setError("")

    try {
      let result
      if (provider === "Google") {
        result = await signInWithGoogle()
      } else if (provider === "Facebook") {
        // Facebook login not implemented yet
        throw new Error("Facebook login not available")
      }

      if (result?.success) {
        toast.success(`${provider} login successful!`)
        onSuccess?.()
        onClose()
      } else {
        throw new Error(result?.error || `${provider} login failed.`)
      }
    } catch (error: any) {
      setError(`${provider} login failed. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setShowForgotPassword(false)
    setError("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl">
          <DialogHeader className="text-center pb-4">
            <DialogTitle className="text-2xl font-light text-gray-900">
              {showForgotPassword
                ? "Reset Password"
                : activeTab === "login"
                ? "Welcome Back"
                : "Join FRAGRANSIA™"}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              {showForgotPassword
                ? "Enter your email to receive a password reset link"
                : activeTab === "login"
                ? "Sign in to access your luxury fragrance collection"
                : "Create your account to start your fragrance journey"}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert className="border-red-200 bg-red-50 mb-4">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {showForgotPassword ? (
            <ForgotPasswordForm
              onBack={() => {
                setShowForgotPassword(false)
                setActiveTab("login")
              }}
              onSuccess={handleSuccess}
            />
          ) : (
            <div className="space-y-6">
              <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "login" | "register")}>
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
                  <TabsTrigger 
                    value="login" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="mt-6">
                  <LoginForm
                    onSuccess={handleSuccess}
                    onForgotPassword={() => setShowForgotPassword(true)}
                  />
                </TabsContent>
                <TabsContent value="register" className="mt-6">
                  <RegisterForm onSuccess={handleSuccess} />
                </TabsContent>
              </Tabs>
            </div>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-500 font-medium">Or continue with</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => handleSocialLogin("Google")}
              disabled={isLoading}
              className="w-full h-12 border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {GOOGLE_ICON}
              Continue with Google
            </Button>
          </div>

          {/* Enhanced visual indicator */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
