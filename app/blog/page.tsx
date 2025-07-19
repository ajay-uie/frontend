
"use client"

import Navigation from "../components/navigation"
import Footer from "../components/footer"
import WhatsAppChat from "../components/whatsapp-chat"
import Link from "next/link"

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: "The Art of Fragrance Layering",
      excerpt:
        "Discover how to create your unique scent by layering different fragrances for a personalized experience.",
      image: "/placeholder.svg?height=300&width=400",
      date: "December 15, 2024",
      category: "Tips & Guides",
      readTime: "5 min read",
    },
    {
      id: 2,
      title: "Understanding Fragrance Notes",
      excerpt: "Learn about top, middle, and base notes and how they create the perfect fragrance pyramid.",
      image: "/placeholder.svg?height=300&width=400",
      date: "December 10, 2024",
      category: "Education",
      readTime: "7 min read",
    },
    {
      id: 3,
      title: "Seasonal Fragrance Guide",
      excerpt: "Choose the perfect fragrance for every season with our comprehensive seasonal guide.",
      image: "/placeholder.svg?height=300&width=400",
      date: "December 5, 2024",
      category: "Seasonal",
      readTime: "6 min read",
    },
    {
      id: 4,
      title: "The History of Italian Perfumery",
      excerpt: "Explore the rich heritage and tradition of Italian fragrance making through the centuries.",
      image: "/placeholder.svg?height=300&width=400",
      date: "November 28, 2024",
      category: "History",
      readTime: "8 min read",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-light text-gray-900 mb-4">Fragrance Journal</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the world of ultra luxury fragrances through our curated articles, guides, and insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-video bg-gray-200 overflow-hidden">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{post.category}</span>
                    <span className="text-xs text-gray-500">{post.readTime}</span>
                  </div>

                  <h2 className="text-xl font-medium text-gray-900 mb-3 hover:text-gray-700 transition-colors">
                    <Link href={`/blog/${post.id}`}>{post.title}</Link>
                  </h2>

                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{post.excerpt}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{post.date}</span>
                    <Link href={`/blog/${post.id}`} className="text-sm text-black hover:underline">
                      Read More
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <WhatsAppChat />
      <Footer />
    </div>
  )
}


