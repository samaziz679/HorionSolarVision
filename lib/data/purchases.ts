import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import type { Purchase } from "@/lib/supabase/types"

export async function fetchPurchases() {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase
    .from("purchases")
    .select(
      `
      id,
      purchase_date,
      total_amount,
      suppliers ( name ),
      purchase_items ( quantity, products ( name, price ) )
    `,
    )
    .order("purchase_date", { ascending: false })

  if (error) {
    console.error("Error fetching purchases:", error)
    throw new Error("Failed to fetch purchases.")
  }

  return data as unknown as Purchase[]
}

export async function fetchPurchaseById(id: string) {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase
    .from("purchases")
    .select(
      `
      *,
      purchase_items ( id, product_id, quantity, price )
    `,
    )
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching purchase by ID:", error)
    return null
  }

  return data
}
