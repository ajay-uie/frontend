"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Search } from "lucide-react"
import { apiClient } from "../lib/api"

export function ProductsPanel() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    image: ""
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getProducts()
      if (response.success && response.data) {
        setProducts(response.data.products || [])
      }
    } catch (error) {
      console.error("Failed to load products:", error)
      setMessage("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    
    try {
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        description: formData.description,
        stock: parseInt(formData.stock),
        status: "active" as const,
        image: formData.image || "/placeholder.svg?height=400&width=300"
      }
      
      const response = await apiClient.createProduct(productData)
      if (response.success) {
        setMessage("Product created successfully!")
        setFormData({
          name: "",
          category: "",
          price: "",
          stock: "",
          description: "",
          image: ""
        })
        setIsAddDialogOpen(false)
        loadProducts() // Reload products
      } else {
        setMessage(`Error: ${response.error || "Failed to create product"}`)
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message || "An unexpected error occurred"}`)
    }
  }

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category.toLowerCase() === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getStatusBadge = (product: any) => {
    if (product.stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    } else if (product.stock < 10) {
      return <Badge variant="secondary">Low Stock</Badge>
    } else {
      return <Badge variant="default">Active</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">Manage your perfume inventory and product catalog</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>Create a new perfume product for your catalog</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProduct} className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="men">Men</SelectItem>
                      <SelectItem value="women">Women</SelectItem>
                      <SelectItem value="luxury">Luxury</SelectItem>
                      <SelectItem value="unisex">Unisex</SelectItem>
                      <SelectItem value="woody">Woody</SelectItem>
                      <SelectItem value="oriental">Oriental</SelectItem>
                      <SelectItem value="fresh">Fresh</SelectItem>
                      <SelectItem value="floral">Floral</SelectItem>
                      <SelectItem value="citrus">Citrus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input 
                    id="stock" 
                    type="number" 
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Product description..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image URL (optional)</Label>
                <Input 
                  id="image" 
                  placeholder="https://example.com/image.jpg"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Product</Button>
              </div>
            </form>
            {message && (
              <div className={`mt-4 p-3 rounded-md text-sm ${
                message.includes("Error") 
                  ? "bg-red-50 text-red-700 border border-red-200" 
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}>
                {message}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="men">Men</SelectItem>
                <SelectItem value="women">Women</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
                <SelectItem value="unisex">Unisex</SelectItem>
                <SelectItem value="woody">Woody</SelectItem>
                <SelectItem value="oriental">Oriental</SelectItem>
                <SelectItem value="fresh">Fresh</SelectItem>
                <SelectItem value="floral">Floral</SelectItem>
                <SelectItem value="citrus">Citrus</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>{filteredProducts.length} products found</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading products...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">{product.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{product.category}</TableCell>
                    <TableCell>₹{product.price?.toLocaleString()}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      {getStatusBadge(product)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
