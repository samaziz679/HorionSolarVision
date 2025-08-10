import "server-only"
import { unstable_noStore as noStore } from "next/cache"
import { getAdminClient } from "@/lib/supabase/admin"
import type { PurchaseWithItems } from "@/lib/supabase/types"
import { fetchProductOptions } from "./products" // Corrected import
import { fetchSupplierOptions } from "./suppliers" // Corrected import

export async function fetchPrerequisitesForPurchaseForm() {
  noStore()
  // Corrected to call the new 'Options' functions
  const [products, suppliers] = await Promise.all([fetchProductOptions(), fetchSupplierOptions()])
  return { products, suppliers }
}

export async function fetchPurchases() {
  noStore()
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from("purchases_with_supplier_name")
    .select("*")
    .order("date", { ascending: false })

  if (error) {
    console.error("Database Error (fetchPurchases):", error)
    throw new Error("Failed to fetch purchases.")
  }
  return data
}

export async function fetchPurchaseById(id: string): Promise<PurchaseWithItems | null> {
  noStore()
  const supabase = getAdminClient()
  const { data: purchaseData, error: purchaseError } = await supabase
    .from("purchases")
    .select("*")
    .eq("id", id)
    .single()

  if (purchaseError) {
    if (purchaseError.code === "PGRST116") {
      return null
    }
    console.error("Database Error (fetchPurchaseById - purchase):", purchaseError)
    throw new Error("Failed to fetch purchase.")
  }

  const { data: itemsData, error: itemsError } = await supabase
    .from("purchase_items")
    .select("*, products(name)")
    .eq("purchase_id", id)

  if (itemsError) {
    console.error("Database Error (fetchPurchaseById - items):", itemsError)
    throw new Error("Failed to fetch purchase items.")
  }

  return {
    ...purchaseData,
    purchase_items: itemsData.map((item) => ({
      ...item,
      product_name: item.products?.name ?? "Unknown Product",
    })),
  }
}
