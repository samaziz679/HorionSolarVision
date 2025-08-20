import { createSupabaseServerClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import type { Product } from "@/lib/supabase/types"

export async function fetchProducts(page = 1, limit = 10) {
  noStore()
  const supabase = await createSupabaseServerClient()

  // Calculate offset for pagination
  const offset = (page - 1) * limit

  // Get total count for pagination info
  const { count } = await supabase.from("products").select("*", { count: "exact", head: true })

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
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch products.")
  }

  const totalPages = Math.ceil((count || 0) / limit)

  return {
    products: data as Product[],
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    totalCount: count || 0,
  }
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
