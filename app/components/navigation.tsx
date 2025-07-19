"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Search, ShoppingCart, User, Heart, LogOut, Settings, Package, MapPin } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { AuthModal } from "@/components/auth/auth-modal"
import { CartPopup } from "@/app/components/cart-popup"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navigation() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { state: cartState } = useCart()
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const totalItems = cartState.itemCount

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const handleUserMenuClick = (path: string) => {
    router.push(path)
    setIsMobileMenuOpen(false)
  }

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">FRAGRANSIA™</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-gray-600 ${
                    pathname === link.href ? "text-gray-900" : "text-gray-700"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Search className="h-4 w-4" />
              </Button>

              {/* Wishlist */}
              {user && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard?tab=wishlist">
                    <Heart className="h-4 w-4" />
                  </Link>
                </Button>
              )}

              {/* Cart */}
              <Button variant="ghost" size="sm" onClick={() => setIsCartOpen(true)} className="relative">
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm font-medium">{user.name}</div>
                    <div className="px-2 py-1.5 text-xs text-gray-500">{user.email}</div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleUserMenuClick("/dashboard")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUserMenuClick("/dashboard?tab=orders")}>
                      <Package className="mr-2 h-4 w-4" />
                      Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUserMenuClick("/dashboard?tab=addresses")}>
                      <MapPin className="mr-2 h-4 w-4" />
                      Addresses
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUserMenuClick("/dashboard?tab=wishlist")}>
                      <Heart className="mr-2 h-4 w-4" />
                      Wishlist
                    </DropdownMenuItem>
                    {user.role === "admin" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleUserMenuClick("/admin")}>
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Panel
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setIsAuthModalOpen(true)}>
                  <User className="h-4 w-4" />
                </Button>
              )}

              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col space-y-4 mt-8">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`text-lg font-medium transition-colors hover:text-gray-600 ${
                          pathname === link.href ? "text-gray-900" : "text-gray-700"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}


                    {!user && (
                      <Button
                        onClick={() => {
                          setIsMobileMenuOpen(false)
                          setIsAuthModalOpen(true)
                        }}
                        className="justify-start"
                        variant="ghost"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Login / Register
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Modals */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <CartPopup isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
