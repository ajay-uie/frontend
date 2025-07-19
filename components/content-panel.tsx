"use client"

import { useState } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, FileText, Megaphone, Timer } from "lucide-react"

const blogPosts = [
  {
    id: "POST-001",
    title: "Top 10 Perfumes for Winter 2024",
    status: "published",
    author: "Admin",
    publishDate: "2024-01-10",
    views: 1250,
  },
  {
    id: "POST-002",
    title: "How to Choose the Perfect Fragrance",
    status: "draft",
    author: "Admin",
    publishDate: null,
    views: 0,
  },
  {
    id: "POST-003",
    title: "The Art of Layering Perfumes",
    status: "published",
    author: "Admin",
    publishDate: "2024-01-05",
    views: 890,
  },
]

const banners = [
  {
    id: "BAN-001",
    title: "Winter Sale - Up to 50% Off",
    position: "homepage-hero",
    status: "active",
    startDate: "2024-01-01",
    endDate: "2024-02-29",
  },
  {
    id: "BAN-002",
    title: "New Arrivals from Tom Ford",
    position: "category-page",
    status: "active",
    startDate: "2024-01-15",
    endDate: "2024-03-15",
  },
]

export function ContentPanel() {
  const [isAddBlogOpen, setIsAddBlogOpen] = useState(false)
  const [isAddBannerOpen, setIsAddBannerOpen] = useState(false)
  const [popupEnabled, setPopupEnabled] = useState(true)
  const [countdownEnabled, setCountdownEnabled] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Content Management</h2>
        <p className="text-muted-foreground">Manage blog posts, banners, popups, and site content</p>
      </div>

      <Tabs defaultValue="blog" className="space-y-4">
        <TabsList>
          <TabsTrigger value="blog">Blog Posts</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="popups">Popups & Offers</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
        </TabsList>

        <TabsContent value="blog" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Blog Management</h3>
            <Dialog open={isAddBlogOpen} onOpenChange={setIsAddBlogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create New Blog Post</DialogTitle>
                  <DialogDescription>Write a new blog post for your customers</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Post Title</Label>
                    <Input id="title" placeholder="Enter post title" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea id="content" placeholder="Write your blog post content..." className="min-h-[200px]" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="featured-image">Featured Image</Label>
                    <Input id="featured-image" type="file" accept="image/*" />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddBlogOpen(false)}>
                    Save Draft
                  </Button>
                  <Button onClick={() => setIsAddBlogOpen(false)}>Publish</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Publish Date</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>
                        <Badge variant={post.status === "published" ? "default" : "secondary"}>{post.status}</Badge>
                      </TableCell>
                      <TableCell>{post.author}</TableCell>
                      <TableCell>{post.publishDate || "Not published"}</TableCell>
                      <TableCell>{post.views}</TableCell>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banners" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Banner Management</h3>
            <Dialog open={isAddBannerOpen} onOpenChange={setIsAddBannerOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Banner
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Banner</DialogTitle>
                  <DialogDescription>Design a new promotional banner</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="banner-title">Banner Title</Label>
                    <Input id="banner-title" placeholder="Enter banner title" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="banner-image">Banner Image</Label>
                    <Input id="banner-image" type="file" accept="image/*" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input id="start-date" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date</Label>
                      <Input id="end-date" type="date" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddBannerOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsAddBannerOpen(false)}>Create Banner</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell className="font-medium">{banner.title}</TableCell>
                      <TableCell>{banner.position}</TableCell>
                      <TableCell>
                        <Badge variant={banner.status === "active" ? "default" : "secondary"}>{banner.status}</Badge>
                      </TableCell>
                      <TableCell>{banner.startDate}</TableCell>
                      <TableCell>{banner.endDate}</TableCell>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popups" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Megaphone className="mr-2 h-5 w-5" />
                  Popup Manager
                </CardTitle>
                <CardDescription>Control promotional popups and offers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="popup-toggle">Enable Popup</Label>
                  <Switch id="popup-toggle" checked={popupEnabled} onCheckedChange={setPopupEnabled} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="popup-title">Popup Title</Label>
                  <Input id="popup-title" defaultValue="Special Offer!" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="popup-content">Popup Content</Label>
                  <Textarea id="popup-content" defaultValue="Get 20% off on your first order! Use code WELCOME20" />
                </div>
                <Button className="w-full">Update Popup</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Timer className="mr-2 h-5 w-5" />
                  Countdown Timer
                </CardTitle>
                <CardDescription>Set up countdown timers for sales and events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="countdown-toggle">Enable Countdown</Label>
                  <Switch id="countdown-toggle" checked={countdownEnabled} onCheckedChange={setCountdownEnabled} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="countdown-title">Event Title</Label>
                  <Input id="countdown-title" defaultValue="Flash Sale Ends In:" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="countdown-date">End Date & Time</Label>
                  <Input id="countdown-date" type="datetime-local" />
                </div>
                <Button className="w-full">Update Countdown</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Static Pages</CardTitle>
                <CardDescription>Edit content for static pages like About, Terms, Privacy Policy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button variant="outline" className="h-20 flex flex-col bg-transparent">
                    <FileText className="h-6 w-6 mb-2" />
                    About Us
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col bg-transparent">
                    <FileText className="h-6 w-6 mb-2" />
                    Terms & Conditions
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col bg-transparent">
                    <FileText className="h-6 w-6 mb-2" />
                    Privacy Policy
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col bg-transparent">
                    <FileText className="h-6 w-6 mb-2" />
                    Shipping Policy
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col bg-transparent">
                    <FileText className="h-6 w-6 mb-2" />
                    Return Policy
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col bg-transparent">
                    <FileText className="h-6 w-6 mb-2" />
                    Contact Us
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
