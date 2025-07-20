"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Search, ShoppingBag, Heart, User, Menu, LogOut, Settings, Package, MapPin, Shield } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { useWishlist } from "@/lib/wishlist-service"
import { AuthModal } from "@/components/auth/auth-modal"
import { CartPopup } from "@/app/components/cart-popup"
import { motion } from "framer-motion"
import { toast } from "sonner"
import logger from "@/utils/logger"

const navigationItems = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Categories", href: "/products?category=all" },
  { name: "Brands", href: "/products?brand=all" },
  { name: "Gift Guide", href: "/gift-guide" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
]

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, handleSignOut, loading } = useAuth()
  const { state: cartState } = useCart()
  const { wishlist } = useWishlist(user?.id)

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
      setIsSearchFocused(false)
      logger.userAction("search_performed", { query: searchQuery.trim() }, "Navigation")
    }
  }

  const handleSignOutClick = async () => {
    try {
      await handleSignOut()
      toast.success("Signed out successfully")
      logger.userAction("user_signout", undefined, "Navigation")
    } catch (error) {
      toast.error("Failed to sign out")
      logger.error("Signout failed", error, "Navigation")
    }
  }

  const isActivePath = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200"
            : "bg-white/90 backdrop-blur-sm"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-10 h-10 lg:w-12 lg:h-12">
                <Image
                  src="/fragransia-logo.jpg"
                  alt="Fragransia™"
                  fill
                  className="object-cover rounded-full group-hover:scale-105 transition-transform duration-200"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl lg:text-2xl font-light text-gray-900 tracking-wide">Fragransia™</h1>
                <p className="text-xs text-gray-500 tracking-widest">PREMIUM FRAGRANCES</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors duration-200 relative group ${
                    isActivePath(item.href) ? "text-black" : "text-gray-600 hover:text-black"
                  }`}
                >
                  {item.name}
                  <span
                    className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-200 group-hover:w-full ${
                      isActivePath(item.href) ? "w-full" : ""
                    }`}
                  />
                </Link>
              ))}
            </nav>

            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <Input
                  type="text"
                  placeholder="Search fragrances..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={`w-full pl-10 pr-4 py-2 border-gray-300 rounded-full transition-all duration-200 ${
                    isSearchFocused ? "ring-2 ring-black border-black" : ""
                  }`}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </form>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Mobile Search */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Search className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="top" className="h-auto">
                  <SheetHeader>
                    <SheetTitle>Search Products</SheetTitle>
                    <SheetDescription>Find your perfect fragrance</SheetDescription>
                  </SheetHeader>
                  <form onSubmit={handleSearch} className="mt-4">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Search fragrances..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-lg"
                        autoFocus
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </form>
                </SheetContent>
              </Sheet>

              {/* Wishlist */}
              {user && (
                <Link href="/wishlist">
                  <Button variant="ghost" size="icon" className="relative">
                    <Heart className="h-5 w-5" />
                    {wishlist.length > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                        {wishlist.length}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )}

              {/* Cart */}
              <Button variant="ghost" size="icon" className="relative" onClick={() => setIsCartOpen(true)}>
                <ShoppingBag className="h-5 w-5" />
                {cartState.itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-black">
                    {cartState.itemCount}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              {loading ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard?tab=orders" className="flex items-center">
                        <Package className="mr-2 h-4 w-4" />
                        Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard?tab=addresses" className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4" />
                        Addresses
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard?tab=settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "admin" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOutClick}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => setIsAuthModalOpen(true)} variant="ghost" size="sm" className="hidden sm:flex">
                  Sign In
                </Button>
              )}

              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="flex items-center space-x-2">
                      <Image
                        src="/fragransia-logo.jpg"
                        alt="Fragransia™"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <span>Fragransia™</span>
                    </SheetTitle>
                    <SheetDescription>Premium Fragrances & Perfumes</SheetDescription>
                  </SheetHeader>

                  <div className="mt-8 space-y-4">
                    {/* User Info */}
                    {user ? (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    ) : (
                      <Button
                        onClick={() => {
                          setIsAuthModalOpen(true)
                          setIsMobileMenuOpen(false)
                        }}
                        className="w-full bg-black text-white hover:bg-gray-800"
                      >
                        Sign In
                      </Button>
                    )}

                    {/* Navigation Links */}
                    <nav className="space-y-2">
                      {navigationItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`block px-4 py-2 rounded-lg transition-colors ${
                            isActivePath(item.href) ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </nav>

                    {/* User Actions */}
                    {user && (
                      <div className="space-y-2 pt-4 border-t">
                        <Link
                          href="/dashboard"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                          <User className="mr-3 h-4 w-4" />
                          Dashboard
                        </Link>
                        <Link
                          href="/wishlist"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                          <Heart className="mr-3 h-4 w-4" />
                          Wishlist
                          {wishlist.length > 0 && <Badge className="ml-auto bg-red-500">{wishlist.length}</Badge>}
                        </Link>
                        {user.role === "admin" && (
                          <Link
                            href="/admin"
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                          >
                            <Shield className="mr-3 h-4 w-4" />
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            handleSignOutClick()
                            setIsMobileMenuOpen(false)
                          }}
                          className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Modals */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <CartPopup isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
