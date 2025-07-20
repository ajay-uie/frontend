"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
import { Plus, Edit, Trash2, Search, Upload, X, Image as ImageIcon } from "lucide-react"
import { useAdminAuth } from "@/contexts/admin-auth-context"

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  brand: string
  inventory: number
  sku: string
  tags: string[]
  images: string[]
  isFeatured: boolean
  isActive: boolean
  weight?: number
  dimensions?: any
  sold: number
  rating: number
  reviewCount: number
  createdAt: string
  updatedAt: string
}

export function ProductsPanel() {
  const { token } = useAdminAuth()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    brand: "",
    inventory: "",
    sku: "",
    tags: "",
    isFeatured: false,
    isActive: true,
    weight: "",
    dimensions: ""
  })

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>(["", "", "", ""])

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [currentPage, selectedCategory, selectedStatus, searchTerm])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20"
      })
      
      if (searchTerm) params.append("search", searchTerm)
      if (selectedCategory !== "all") params.append("category", selectedCategory)
      if (selectedStatus !== "all") params.append("status", selectedStatus)

      const response = await fetch(`${API_BASE_URL}/api/admin/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      if (data.success) {
        setProducts(data.data || [])
        setTotalPages(data.pagination?.totalPages || 1)
      } else {
        setMessage("Failed to load products")
      }
    } catch (error) {
      console.error("Failed to load products:", error)
      setMessage("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      if (data.success) {
        setCategories(data.data || [])
      }
    } catch (error) {
      console.error("Failed to load categories:", error)
    }
  }

  const handleImageUpload = (files: FileList | null, index: number) => {
    if (!files || files.length === 0) return

    const file = files[0]
    if (!file.type.startsWith('image/')) {
      setMessage("Please select an image file")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage("Image size should be less than 10MB")
      return
    }

    const newImageFiles = [...imageFiles]
    newImageFiles[index] = file
    setImageFiles(newImageFiles)

    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      const newImageUrls = [...imageUrls]
      newImageUrls[index] = e.target?.result as string
      setImageUrls(newImageUrls)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = (index: number) => {
    const newImageFiles = [...imageFiles]
    const newImageUrls = [...imageUrls]
    
    newImageFiles[index] = null as any
    newImageUrls[index] = ""
    
    setImageFiles(newImageFiles)
    setImageUrls(newImageUrls)
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    
    try {
      const formDataToSend = new FormData()
      
      // Add text fields
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('price', formData.price)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('brand', formData.brand)
      formDataToSend.append('inventory', formData.inventory)
      formDataToSend.append('sku', formData.sku)
      formDataToSend.append('tags', formData.tags)
      formDataToSend.append('isFeatured', formData.isFeatured.toString())
      formDataToSend.append('isActive', formData.isActive.toString())
      
      if (formData.weight) formDataToSend.append('weight', formData.weight)
      if (formData.dimensions) formDataToSend.append('dimensions', formData.dimensions)

      // Add image files
      // imageFiles.forEach((file, index) => {
      //   if (file) {
      //     formDataToSend.append("images", file)
      //   }
      // })

      const response = await fetch(`${API_BASE_URL}/api/admin/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      })

      const data = await response.json()
      if (data.success) {
        setMessage("Product created successfully!")
        resetForm()
        setIsAddDialogOpen(false)
        loadProducts()
      } else {
        setMessage(`Error: ${data.error || "Failed to create product"}`)
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message || "An unexpected error occurred"}`)
    }
  }

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return
    
    setMessage("")
    
    try {
      const formDataToSend = new FormData()
      
      // Add text fields
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('price', formData.price)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('brand', formData.brand)
      formDataToSend.append('inventory', formData.inventory)
      formDataToSend.append('sku', formData.sku)
      formDataToSend.append('tags', formData.tags)
      formDataToSend.append('isFeatured', formData.isFeatured.toString())
      formDataToSend.append('isActive', formData.isActive.toString())
      
      if (formData.weight) formDataToSend.append('weight', formData.weight)
      if (formData.dimensions) formDataToSend.append('dimensions', formData.dimensions)

      // Add existing images that weren't replaced
      const existingImages = imageUrls.filter((url, index) => 
        url && !imageFiles[index] && !url.startsWith('data:')
      )
      if (existingImages.length > 0) {
        formDataToSend.append('existingImages', JSON.stringify(existingImages))
      }

      // Add new image files
      imageFiles.forEach((file, index) => {
        if (file) {
          formDataToSend.append('images', file)
        }
      })

      const response = await fetch(`${API_BASE_URL}/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      })

      const data = await response.json()
      if (data.success) {
        setMessage("Product updated successfully!")
        resetForm()
        setIsEditDialogOpen(false)
        setEditingProduct(null)
        loadProducts()
      } else {
        setMessage(`Error: ${data.error || "Failed to update product"}`)
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message || "An unexpected error occurred"}`)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      if (data.success) {
        setMessage("Product deleted successfully!")
        loadProducts()
      } else {
        setMessage(`Error: ${data.error || "Failed to delete product"}`)
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message || "An unexpected error occurred"}`)
    }
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      brand: product.brand,
      inventory: product.inventory.toString(),
      sku: product.sku,
      tags: product.tags.join(', '),
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      weight: product.weight?.toString() || "",
      dimensions: product.dimensions ? JSON.stringify(product.dimensions) : ""
    })
    
    // Set existing images
    const existingImages = [...product.images]
    while (existingImages.length < 4) {
      existingImages.push("")
    }
    setImageUrls(existingImages.slice(0, 4))
    setImageFiles([])
    
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      brand: "",
      inventory: "",
      sku: "",
      tags: "",
      isFeatured: false,
      isActive: true,
      weight: "",
      dimensions: ""
    })
    setImageFiles([])
    setImageUrls(["", "", "", ""])
    setMessage("")
  }

  const getStatusBadge = (product: Product) => {
    if (!product.isActive) {
      return <Badge variant="secondary">Inactive</Badge>
    } else if (product.inventory === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    } else if (product.inventory < 10) {
      return <Badge variant="outline">Low Stock</Badge>
    } else {
      return <Badge variant="default">Active</Badge>
    }
  }

  const ProductForm = ({ onSubmit, isEdit = false }: { onSubmit: (e: React.FormEvent) => void, isEdit?: boolean }) => (
    <form onSubmit={onSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input 
            id="name" 
            placeholder="Enter product name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="brand">Brand</Label>
          <Input 
            id="brand" 
            placeholder="Enter brand name"
            value={formData.brand}
            onChange={(e) => setFormData({...formData, brand: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name.toLowerCase()}>
                  {category.name}
                </SelectItem>
              ))}
              <SelectItem value="men">Men</SelectItem>
              <SelectItem value="women">Women</SelectItem>
              <SelectItem value="luxury">Luxury</SelectItem>
              <SelectItem value="unisex">Unisex</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input 
            id="sku" 
            placeholder="Product SKU"
            value={formData.sku}
            onChange={(e) => setFormData({...formData, sku: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (₹) *</Label>
          <Input 
            id="price" 
            type="number" 
            step="0.01"
            placeholder="0.00"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inventory">Stock Quantity *</Label>
          <Input 
            id="inventory" 
            type="number" 
            placeholder="0"
            value={formData.inventory}
            onChange={(e) => setFormData({...formData, inventory: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (g)</Label>
          <Input 
            id="weight" 
            type="number" 
            placeholder="0"
            value={formData.weight}
            onChange={(e) => setFormData({...formData, weight: e.target.value})}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea 
          id="description" 
          placeholder="Product description..."
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          required
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input 
          id="tags" 
          placeholder="luxury, men, woody, evening"
          value={formData.tags}
          onChange={(e) => setFormData({...formData, tags: e.target.value})}
        />
      </div>

      <div className="space-y-4">
        <Label>Product Images (up to 4)</Label>
        <div className="grid grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Image {index + 1} {index === 0 && "(Main)"}
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {imageUrls[index] ? (
                  <div className="relative">
                    <img 
                      src={imageUrls[index]} 
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="text-sm text-gray-600">
                      <label htmlFor={`image-${index}`} className="cursor-pointer text-blue-600 hover:text-blue-500">
                        Upload image
                      </label>
                      <input
                        id={`image-${index}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e.target.files, index)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="isFeatured"
            checked={formData.isFeatured}
            onCheckedChange={(checked) => setFormData({...formData, isFeatured: checked})}
          />
          <Label htmlFor="isFeatured">Featured Product</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            resetForm()
            setIsAddDialogOpen(false)
            setIsEditDialogOpen(false)
            setEditingProduct(null)
          }}
        >
          Cancel
        </Button>
        <Button type="submit">
          {isEdit ? "Update Product" : "Add Product"}
        </Button>
      </div>
    </form>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">Manage your perfume inventory and product catalog</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>Create a new perfume product for your catalog</DialogDescription>
            </DialogHeader>
            <ProductForm onSubmit={handleCreateProduct} />
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information</DialogDescription>
          </DialogHeader>
          <ProductForm onSubmit={handleUpdateProduct} isEdit={true} />
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
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name.toLowerCase()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>{products.length} products found</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading products...</div>
          ) : (
            <>
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
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.images?.[0] || "/placeholder.svg"}
                            alt={product.name}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">{product.sku}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{product.category}</TableCell>
                      <TableCell>₹{product.price?.toLocaleString()}</TableCell>
                      <TableCell>{product.inventory}</TableCell>
                      <TableCell>
                        {getStatusBadge(product)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditDialog(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center space-x-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Global Message */}
      {message && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg z-50 ${
          message.includes("Error") 
            ? "bg-red-50 text-red-700 border border-red-200" 
            : "bg-green-50 text-green-700 border border-green-200"
        }`}>
          <div className="flex items-center justify-between">
            <span>{message}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMessage("")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
