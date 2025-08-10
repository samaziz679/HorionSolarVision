import "server-only"
import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import type { Product } from "@/lib/supabase/types"

export async function fetchProducts(): Promise<Product[]> {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.from("products").select("*").order("name", { ascending: true })

  if (error) {
    console.error("Error fetching products:", error)
    throw new Error("Failed to fetch products.")
  }

  return data || []
}

export async function fetchProductById(id: number): Promise<Product | null> {
  noStore()
  if (isNaN(id)) {
    console.error("Invalid product ID provided.")
    return null
  }
  const supabase = createClient()
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching product with id ${id}:`, error)
    // It's common for .single() to fail if no row is found.
    // We return null in that case, which is expected.
    if (error.code === "PGRST116") {
      return null
    }
    throw new Error("Failed to fetch product.")
  }

  return data
}
