import { createSupabaseServerClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import type { ProductWithSupplier } from "@/lib/supabase/types"

export async function fetchProducts() {
  noStore()
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      description,
      price,
      stock_quantity,
      created_at,
      suppliers (id, name)
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch products.")
  }

  return data as ProductWithSupplier[]
}

export async function fetchProductById(id: number) {
  noStore()
  if (isNaN(id)) return null

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      suppliers (id, name)
    `,
    )
    .eq("id", id)
    .single()

  if (error) {
    console.error("Database Error:", error)
    return null
  }

  return data as ProductWithSupplier | null
}

export async function fetchProductsForForm() {
  noStore()
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("products").select("id, name, price")

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch products for form.")
  }

  return data
}
