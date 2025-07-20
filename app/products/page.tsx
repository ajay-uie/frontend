"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Search, Filter, X, SlidersHorizontal, Grid3X3, List, ChevronDown } from "lucide-react"
import api, { type Product } from "@/lib/api";
import { firebaseService } from "@/lib/firebase-service";
import { toast } from "sonner"
import Navigation from "@/app/components/navigation"
import Footer from "@/app/components/footer"
import ProductCard from "@/app/components/product-card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const categories = []; // TODO: Fetch categories dynamically from backend API

const priceRanges = []; // TODO: Fetch price ranges dynamically or define based on backend data

const sortOptions = [
  { id: "featured", name: "Featured" },
  { id: "price-low", name: "Price: Low to High" },
  { id: "price-high", name: "Price: High to Low" },
  { id: "name", name: "Name: A to Z" },
  { id: "rating", name: "Highest Rated" },
]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPriceRange, setSelectedPriceRange] = useState("all")
  const [selectedSort, setSelectedSort] = useState("featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [products, searchQuery, selectedCategory, selectedPriceRange, selectedSort])

  const loadProducts = async () => {
    try {
      setLoading(true)

      // Try API first
      try {
       const response = await api.products.getAll();       if (response.success && response.products) {
          setProducts(response.products)
          return
        }
      } catch (error) {
        console.warn("API failed, trying Firebase:", error)
      }

      // Fallback to Firebase
      try {
        const firebaseProducts = await firebaseService.getProducts()
        setProducts(firebaseProducts)
      } catch (error) {
        console.warn("Firebase failed, using mock data:", error)
        // Mock data fallback
        setProducts([]) // No mock data, fetch from API or Firebase
      }
    } catch (error) {
      console.error("Error loading products:", error)
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...products]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query),
      )
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    // Price filter
    if (selectedPriceRange !== "all") {
      const range = priceRanges.find((r) => r.id === selectedPriceRange)
      if (range) {
        filtered = filtered.filter((product) => product.price >= range.min && product.price <= range.max)
      }
    }

    // Sort
    switch (selectedSort) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      default:
        // Featured - keep original order
        break
    }

    setFilteredProducts(filtered)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSelectedPriceRange("all")
    setSelectedSort("featured")
  }

  const hasActiveFilters = searchQuery || selectedCategory !== "all" || selectedPriceRange !== "all"

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Search</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id ? "bg-black text-white" : "hover:bg-gray-100"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Price Range</h3>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <button
              key={range.id}
              onClick={() => setSelectedPriceRange(range.id)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedPriceRange === range.id ? "bg-black text-white" : "hover:bg-gray-100"
              }`}
            >
              {range.name}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button onClick={clearFilters} variant="outline" className="w-full bg-transparent">
          Clear All Filters
        </Button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Products</h1>
            <p className="text-gray-600">Discover our curated collection of premium fragrances</p>
          </div>

          <div className="flex gap-8">
            {/* Desktop Filters Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <SlidersHorizontal className="h-5 w-5" />
                    <h2 className="text-lg font-semibold">Filters</h2>
                  </div>
                  <FilterContent />
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Mobile Filter & Controls */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  {/* Mobile Filter Button */}
                  <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden bg-transparent">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                        {hasActiveFilters && (
                          <Badge className="ml-2 bg-black text-white">
                            {
                              [searchQuery, selectedCategory !== "all", selectedPriceRange !== "all"].filter(Boolean)
                                .length
                            }
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterContent />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Results Count */}
                  <span className="text-sm text-gray-600">{filteredProducts.length} products found</span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Sort Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="bg-transparent">
                        {sortOptions.find((option) => option.id === selectedSort)?.name}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {sortOptions.map((option) => (
                        <DropdownMenuItem key={option.id} onClick={() => setSelectedSort(option.id)}>
                          {option.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* View Mode Toggle */}
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 ${viewMode === "grid" ? "bg-black text-white" : "hover:bg-gray-100"}`}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 ${viewMode === "list" ? "bg-black text-white" : "hover:bg-gray-100"}`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Search: {searchQuery}
                        <button onClick={() => setSearchQuery("")}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {selectedCategory !== "all" && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Category: {categories.find((c) => c.id === selectedCategory)?.name}
                        <button onClick={() => setSelectedCategory("all")}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {selectedPriceRange !== "all" && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Price: {priceRanges.find((p) => p.id === selectedPriceRange)?.name}
                        <button onClick={() => setSelectedPriceRange("all")}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Products Grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(12)].map((_, index) => (
                    <Card key={index} className="animate-pulse">
                      <div className="aspect-square bg-gray-200 rounded-t-lg" />
                      <CardContent className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                        <div className="h-6 bg-gray-200 rounded w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    <div className="mb-4">
                      <Search className="h-12 w-12 text-gray-400 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
                    <Button onClick={clearFilters} variant="outline">
                      Clear Filters
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                  }`}
                >
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} viewMode={viewMode} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
