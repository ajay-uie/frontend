// app/order-confirmation/[id]/page.tsx

import { notFound } from "next/navigation"
import OrderConfirmationClient from "./orderConfirmationClient"
import api from "@/lib/api"

// Fix: Use the exact Next.js 15 expected type structure
interface PageProps {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  // Await the params promise
  const { id } = await params
  
  // Defensive null check
  if (!id) return notFound()

  const order = await api.orders.getById(id)

  if (!order?.success || !order?.data) {
    return notFound()
  }

  return <OrderConfirmationClient order={order.data} />
}