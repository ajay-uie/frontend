"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, ShoppingCart, Users, Ticket, FileText, Settings, X, Sparkles, LogOut } from "lucide-react"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  onLogout?: () => void
}

const navigation = [
  { name: "Dashboard", id: "dashboard", icon: LayoutDashboard },
  { name: "Products", id: "products", icon: Package },
  { name: "Orders", id: "orders", icon: ShoppingCart },
  { name: "Users", id: "users", icon: Users },
  { name: "Coupons", id: "coupons", icon: Ticket },
  { name: "Content", id: "content", icon: FileText },
  { name: "Settings", id: "settings", icon: Settings },
]

export function Sidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, onLogout }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <span className="text-xl font-bold text-gray-900">Fragransia</span>
          </div>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-6 px-3 flex flex-col h-full">
          <div className="space-y-1 flex-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    activeTab === item.id && "bg-purple-50 text-purple-700 border-purple-200",
                  )}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                  }}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              )
            })}
          </div>
          
          {onLogout && (
            <div className="pb-6 px-3">
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                onClick={onLogout}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </Button>
            </div>
          )}
        </nav>
      </div>
    </>
  )
}
