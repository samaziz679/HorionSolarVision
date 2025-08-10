import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export type PurchaseWithRelations = {
  id: string
  quantity: number
  total_amount: number
  purchase_date: string
  created_at: string
  products: { name: string } | null
  suppliers: { name: string } | null
}

export async function fetchPurchases(): Promise<PurchaseWithRelations[]> {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase
    .from("purchases")
    .select(`
      id,
      quantity,
      total_amount,
      purchase_date,
      created_at,
      products(name),
      suppliers(name)
    `)
    .order("purchase_date", { ascending: false })

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch purchases.")
  }

  return data as PurchaseWithRelations[]
}

export async function fetchPurchaseById(id: string) {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.from("purchases").select("*").eq("id", id).single()

  if (error) {
    console.error("Database Error:", error)
    return null
  }

  return data
}
