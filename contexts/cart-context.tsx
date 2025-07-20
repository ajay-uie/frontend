"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import { toast } from "sonner"
import { useAuth } from "./auth-context"

export interface CartItem {
  id: string
  cartId?: string
  productId: string
  name: string
  brand?: string
  price: number
  originalPrice?: number
  size: string
  image: string
  category?: string
  quantity: number
  itemTotal?: number
  isAvailable?: boolean
  maxQuantity?: number
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
  isLoading: boolean
  shippingCost: number
  subtotal: number
  freeShippingThreshold: number
  qualifiesForFreeShipping: boolean
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> & { quantity?: number } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOAD_CART"; payload: { items: CartItem[]; summary: any } }

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,
  shippingCost: 50,
  subtotal: 0,
  freeShippingThreshold: 500,
  qualifiesForFreeShipping: false,
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(
        (item) => item.productId === action.payload.productId && item.size === action.payload.size,
      )

      let newItems: CartItem[]

      if (existingItemIndex > -1) {
        newItems = state.items.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) } : item,
        )
      } else {
        const newItem: CartItem = {
          ...action.payload,
          quantity: action.payload.quantity || 1,
        }
        newItems = [...state.items, newItem]
      }

      const subtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const shippingCost = subtotal >= state.freeShippingThreshold ? 0 : 50
      const total = subtotal + shippingCost

      return {
        ...state,
        items: newItems,
        total,
        subtotal,
        itemCount,
        shippingCost,
        qualifiesForFreeShipping: subtotal >= state.freeShippingThreshold,
      }
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.id !== action.payload && item.cartId !== action.payload)
      const subtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const shippingCost = subtotal >= state.freeShippingThreshold ? 0 : 50
      const total = subtotal + shippingCost

      return {
        ...state,
        items: newItems,
        total,
        subtotal,
        itemCount,
        shippingCost,
        qualifiesForFreeShipping: subtotal >= state.freeShippingThreshold,
      }
    }

    case "UPDATE_QUANTITY": {
      const newItems = state.items
        .map((item) =>
          item.id === action.payload.id || item.cartId === action.payload.id 
            ? { ...item, quantity: Math.max(0, action.payload.quantity) } 
            : item,
        )
        .filter((item) => item.quantity > 0)

      const subtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const shippingCost = subtotal >= state.freeShippingThreshold ? 0 : 50
      const total = subtotal + shippingCost

      return {
        ...state,
        items: newItems,
        total,
        subtotal,
        itemCount,
        shippingCost,
        qualifiesForFreeShipping: subtotal >= state.freeShippingThreshold,
      }
    }

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        total: 0,
        subtotal: 0,
        itemCount: 0,
        shippingCost: 50,
        qualifiesForFreeShipping: false,
      }

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      }

    case "LOAD_CART":
      const { items, summary } = action.payload
      return {
        ...state,
        items,
        total: summary.total,
        subtotal: summary.subtotal,
        itemCount: summary.itemCount,
        shippingCost: summary.shippingCost,
        freeShippingThreshold: summary.freeShippingThreshold,
        qualifiesForFreeShipping: summary.qualifiesForFreeShipping,
      }

    default:
      return state
  }
}

interface CartContextType {
  state: CartState
  items: CartItem[]
  total: number
  itemCount: number
  subtotal: number
  shippingCost: number
  freeShippingThreshold: number
  qualifiesForFreeShipping: boolean
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => Promise<void>
  removeItem: (id: string) => Promise<void>
  updateQuantity: (id: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
  // Backward compatibility methods
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  removeFromCart: (id: string) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const { user, token } = useAuth()

  // API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-8npy.onrender.com'

  // Load cart from backend when user is authenticated
  useEffect(() => {
    if (user && token) {
      refreshCart()
    } else {
      // Load from localStorage for guest users
      loadLocalCart()
    }
  }, [user, token])

  const loadLocalCart = () => {
    try {
      const savedCart = localStorage.getItem("fragransia_cart")
      if (savedCart) {
        const cartItems = JSON.parse(savedCart)
        const summary = {
          itemCount: cartItems.length,
          subtotal: cartItems.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0),
          shippingCost: 50,
          total: 0,
          freeShippingThreshold: 500,
          qualifiesForFreeShipping: false
        }
        summary.qualifiesForFreeShipping = summary.subtotal >= summary.freeShippingThreshold
        summary.shippingCost = summary.qualifiesForFreeShipping ? 0 : 50
        summary.total = summary.subtotal + summary.shippingCost
        
        dispatch({ type: "LOAD_CART", payload: { items: cartItems, summary } })
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error)
      localStorage.removeItem("fragransia_cart")
    }
  }

  const refreshCart = async () => {
    if (!user || !token) {
      loadLocalCart()
      return
    }

    try {
      dispatch({ type: "SET_LOADING", payload: true })
      
      const response = await fetch(`${API_BASE_URL}/api/cart/list`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const cartItems = data.cart.items.map((item: any) => ({
            id: item.cartId,
            cartId: item.cartId,
            productId: item.productId,
            name: item.productName,
            brand: item.productBrand,
            price: item.productPrice,
            size: item.size,
            image: item.productImage,
            quantity: item.quantity,
            itemTotal: item.itemTotal,
            isAvailable: item.isAvailable,
            maxQuantity: item.maxQuantity,
          }))
          
          dispatch({ type: "LOAD_CART", payload: { items: cartItems, summary: data.cart.summary } })
        }
      }
    } catch (error) {
      console.error("Error refreshing cart:", error)
      loadLocalCart()
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  // Save cart to localStorage for guest users
  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem("fragransia_cart", JSON.stringify(state.items))
      } catch (error) {
        console.error("Error saving cart to localStorage:", error)
      }
    }
  }, [state.items, user])

  const addItem = async (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    dispatch({ type: "SET_LOADING", payload: true })
    
    try {
      if (user && token) {
        // Add to backend cart
        const response = await fetch(`${API_BASE_URL}/api/cart/add`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: item.productId || item.id,
            quantity: item.quantity || 1,
            size: item.size,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            await refreshCart()
            const quantity = item.quantity || 1
            const itemName = quantity > 1 ? `${quantity} ${item.name}` : item.name
            toast.success(`${itemName} added to cart`)
          } else {
            throw new Error(data.message || 'Failed to add item to cart')
          }
        } else {
          throw new Error('Failed to add item to cart')
        }
      } else {
        // Add to local cart for guest users
        dispatch({ type: "ADD_ITEM", payload: item })
        const quantity = item.quantity || 1
        const itemName = quantity > 1 ? `${quantity} ${item.name}` : item.name
        toast.success(`${itemName} added to cart`)
      }
    } catch (error) {
      console.error("Error adding item to cart:", error)
      toast.error("Failed to add item to cart")
      throw error
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const removeItem = async (id: string) => {
    if (user && token) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/cart/remove/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            dispatch({ type: "REMOVE_ITEM", payload: id })
            toast.success("Item removed from cart")
          } else {
            throw new Error(data.message || 'Failed to remove item from cart')
          }
        } else {
          throw new Error('Failed to remove item from cart')
        }
      } catch (error) {
        console.error("Error removing item from cart:", error)
        toast.error("Failed to remove item from cart")
      }
    } else {
      dispatch({ type: "REMOVE_ITEM", payload: id })
      toast.success("Item removed from cart")
    }
  }

  const updateQuantity = async (id: string, quantity: number) => {
    if (user && token) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/cart/update/${id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
          } else {
            throw new Error(data.message || 'Failed to update cart item')
          }
        } else {
          throw new Error('Failed to update cart item')
        }
      } catch (error) {
        console.error("Error updating cart item:", error)
        toast.error("Failed to update cart item")
      }
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
    }
  }

  const clearCart = async () => {
    if (user && token) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/cart/clear`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            dispatch({ type: "CLEAR_CART" })
            toast.success("Cart cleared")
          } else {
            throw new Error(data.message || 'Failed to clear cart')
          }
        } else {
          throw new Error('Failed to clear cart')
        }
      } catch (error) {
        console.error("Error clearing cart:", error)
        toast.error("Failed to clear cart")
      }
    } else {
      dispatch({ type: "CLEAR_CART" })
      toast.success("Cart cleared")
    }
  }

  // Backward compatibility methods
  const addToCart = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    addItem(item).catch(console.error)
  }

  const removeFromCart = (id: string) => {
    removeItem(id).catch(console.error)
  }

  return (
    <CartContext.Provider
      value={{
        state,
        items: state.items,
        total: state.total,
        subtotal: state.subtotal,
        itemCount: state.itemCount,
        shippingCost: state.shippingCost,
        freeShippingThreshold: state.freeShippingThreshold,
        qualifiesForFreeShipping: state.qualifiesForFreeShipping,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        refreshCart,
        addToCart,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

