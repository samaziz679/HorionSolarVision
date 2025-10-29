import { createSupabaseServerClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import type { PurchaseWithDetails } from "@/lib/supabase/types"

export async function fetchPurchases() {
  noStore()
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("purchases")
    .select(
      `
      id,
      purchase_date,
      total,
      quantity,
      unit_price,
      products (id, name),
      suppliers (id, name)
    `,
    )
    .order("purchase_date", { ascending: false })

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch purchases.")
  }

  return data as PurchaseWithDetails[]
}

export async function fetchPurchaseById(id: string) {
  noStore()
  if (!id) return null

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("purchases")
    .select(
      `
      *,
      products (id, name)
    `,
    )
    .eq("id", id)
    .single()

  if (error) {
    console.error("Database Error:", error)
    return null
  }

  return data as PurchaseWithDetails | null
}
