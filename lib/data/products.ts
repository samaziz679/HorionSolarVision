import { createSupabaseServerClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import type { Product } from "@/lib/supabase/types"

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
      type,
      quantity,
      prix_achat,
      prix_vente_detail_1,
      prix_vente_detail_2,
      prix_vente_gros,
      unit,
      image,
      created_at
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch products.")
  }

  return data as Product[]
}

export async function fetchProductById(id: string) {
  noStore()
  if (!id) return null

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

  if (error) {
    console.error("Database Error:", error)
    return null
  }

  return data as Product | null
}

export async function fetchProductsForForm() {
  noStore()
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("products").select("id, name, prix_vente_detail_1")

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch products for form.")
  }

  return data
}
