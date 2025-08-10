import "server-only"
import { unstable_noStore as noStore } from "next/cache"
import { getAdminClient } from "@/lib/supabase/admin"
import type { Product } from "@/lib/supabase/types"

export type ProductOption = {
  id: string
  name: string
  prix_vente_detail_1: number | null
  prix_vente_gros_1: number | null
  prix_achat: number | null
}

export async function fetchProducts(): Promise<Product[]> {
  noStore()
  const supabase = getAdminClient()
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Database Error (fetchProducts):", error)
    throw new Error("Failed to fetch products.")
  }

  return (data ?? []) as Product[]
}

export async function fetchProductById(id: string): Promise<Product | null> {
  noStore()
  const supabase = getAdminClient()
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

  if (error) {
    if (error.code === "PGRST116") return null
    console.error("Database Error (fetchProductById):", error)
    throw new Error("Failed to fetch product.")
  }

  return (data ?? null) as Product | null
}

export async function fetchProductOptions(): Promise<ProductOption[]> {
  noStore()
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from("products")
    .select("id, name, prix_vente_detail_1, prix_vente_gros_1, prix_achat")
    .order("name", { ascending: true })

  if (error) {
    console.error("Database Error (fetchProductOptions):", error)
    throw new Error("Failed to fetch product options.")
  }

  return (data ?? []).map((p) => ({
    id: String(p.id),
    name: p.name ?? "",
    prix_vente_detail_1: p.prix_vente_detail_1 as number | null,
    prix_vente_gros_1: p.prix_vente_gros_1 as number | null,
    prix_achat: p.prix_achat as number | null,
  }))
}
