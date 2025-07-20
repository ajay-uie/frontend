"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Search, ShoppingBag, User, Menu, Heart, LogOut, Settings, Package, Star, X } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { AuthModal } from "@/components/auth/auth-modal"
import { toast } from "sonner"

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const { items, total, removeFromCart, updateQuantity } = useCart()
  const { user, handleSignOut } = useAuth()

  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
      setIsSearchOpen(false)
    }
  }

  const handleSignOutClick = async () => {
    try {
      await handleSignOut()
      toast.success("Signed out successfully")
      router.push("/")
    } catch (error) {
      toast.error("Failed to sign out")
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    toast.success("Welcome to FRAGRANSIA™!")
  }

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-light tracking-wider text-gray-900">
                FRAGRANSIA™
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? "text-gray-900 border-b-2 border-gray-900"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                {isSearchOpen ? (
                  <form onSubmit={handleSearch} className="flex items-center">
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64 pr-10"
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setIsSearchOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </form>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => setIsSearchOpen(true)} className="hidden sm:flex">
                    <Search className="h-5 w-5" />
                  </Button>
                )}
              </div>

              {/* Wishlist */}
              {user && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/wishlist">
                    <Heart className="h-5 w-5" />
                  </Link>
                </Button>
              )}

              {/* Cart */}
              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <ShoppingBag className="h-5 w-5" />
                    {itemCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {itemCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg">
                  <SheetHeader>
                    <SheetTitle>Shopping Cart</SheetTitle>
                    <SheetDescription>
                      {itemCount === 0 ? "Your cart is empty" : `${itemCount} item(s) in your cart`}
                    </SheetDescription>
                  </SheetHeader>

                  <div className="mt-6 space-y-4">
                    {items.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Your cart is empty</p>
                        <Button
                          className="mt-4"
                          onClick={() => {
                            setIsCartOpen(false)
                            router.push("/products")
                          }}
                        >
                          Continue Shopping
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {items.map((item) => (
                            <div key={`${item.id}-${item.size}`} className="flex items-center space-x-4">
                              <img
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{item.name}</h4>
                                <p className="text-xs text-gray-600">{item.size}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                                    className="h-6 w-6 p-0"
                                  >
                                    -
                                  </Button>
                                  <span className="text-sm">{item.quantity}</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                                    className="h-6 w-6 p-0"
                                  >
                                    +
                                  </Button>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFromCart(item.id, item.size)}
                                  className="text-red-600 hover:text-red-800 p-0 h-auto"
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center mb-4">
                            <span className="font-medium">Total:</span>
                            <span className="font-bold text-lg">₹{total.toLocaleString()}</span>
                          </div>
                          <div className="space-y-2">
                            <Button
                              className="w-full"
                              onClick={() => {
                                setIsCartOpen(false)
                                router.push("/cart")
                              }}
                            >
                              View Cart
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full bg-transparent"
                              onClick={() => {
                                setIsCartOpen(false)
                                router.push("/checkout")
                              }}
                            >
                              Checkout
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="flex items-center">
                        <Package className="mr-2 h-4 w-4" />
                        Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/wishlist" className="flex items-center">
                        <Heart className="mr-2 h-4 w-4" />
                        Wishlist
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/reviews" className="flex items-center">
                        <Star className="mr-2 h-4 w-4" />
                        Reviews
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOutClick} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setShowAuthModal(true)}>
                  <User className="h-5 w-5" />
                </Button>
              )}

              {/* Mobile menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>FRAGRANSIA™</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`block px-3 py-2 text-base font-medium transition-colors ${
                          pathname === item.href ? "text-gray-900 bg-gray-100" : "text-gray-600 hover:text-gray-900"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                    <div className="pt-4 border-t">
                      <form onSubmit={handleSearch} className="mb-4">
                        <Input
                          type="text"
                          placeholder="Search products..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </form>
                      {!user && (
                        <Button
                          className="w-full"
                          onClick={() => {
                            setIsMobileMenuOpen(false)
                            setShowAuthModal(true)
                          }}
                        >
                          Sign In
                        </Button>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={handleAuthSuccess} />
    </>
  )
}
