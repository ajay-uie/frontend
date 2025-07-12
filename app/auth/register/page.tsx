"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  
  const { signUp } = useAuth()
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (!acceptTerms) {
      setError('Please accept the Terms of Service and Privacy Policy')
      return
    }

    setLoading(true)

    try {
      const result = await signUp(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.phoneNumber
      )
      
      if (result.success) {
        router.push('/dashboard')
      } else {
        setError(result.error || 'Registration failed')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <Card className="shadow-xl border border-gray-200 bg-white">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-black">
              Create Account
            </CardTitle>
            <CardDescription className="text-gray-600">
              Join Fragransia™ and discover your signature scent
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="pl-10 border-gray-300 focus:border-black focus:ring-black"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="pl-10 border-gray-300 focus:border-black focus:ring-black"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 border-gray-300 focus:border-black focus:ring-black"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                  Phone Number (Optional)
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="pl-10 border-gray-300 focus:border-black focus:ring-black"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 border-gray-300 focus:border-black focus:ring-black"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 border-gray-300 focus:border-black focus:ring-black"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black mt-0.5"
                  required
                />
                <Label htmlFor="acceptTerms" className="text-sm text-gray-600 leading-relaxed">
                  I agree to the{' '}
                  <Link href="/terms-conditions" className="text-black hover:underline font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy-policy" className="text-black hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2.5"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="text-black hover:text-gray-700 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

