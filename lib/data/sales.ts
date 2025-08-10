import "server-only"
import { unstable_noStore as noStore } from "next/cache"
import { getAdminClient } from "@/lib/supabase/admin"
import type { SaleWithItems } from "@/lib/supabase/types"

export async function fetchSales() {
  noStore()
  const supabase = getAdminClient()
  const { data, error } = await supabase.from("sales_with_client_name").select("*").order("date", { ascending: false })

  if (error) {
    console.error("Database Error (fetchSales):", error)
    throw new Error("Failed to fetch sales.")
  }
  return data
}

export async function fetchSaleById(id: string): Promise<SaleWithItems | null> {
  noStore()
  const supabase = getAdminClient()
  const { data: saleData, error: saleError } = await supabase.from("sales").select("*").eq("id", id).single()

  if (saleError) {
    if (saleError.code === "PGRST116") {
      return null
    }
    console.error("Database Error (fetchSaleById - sale):", saleError)
    throw new Error("Failed to fetch sale.")
  }

  const { data: itemsData, error: itemsError } = await supabase
    .from("sale_items")
    .select("*, products(name)")
    .eq("sale_id", id)

  if (itemsError) {
    console.error("Database Error (fetchSaleById - items):", itemsError)
    throw new Error("Failed to fetch sale items.")
  }

  return {
    ...saleData,
    sale_items: itemsData.map((item) => ({
      ...item,
      product_name: item.products?.name ?? "Unknown Product",
    })),
  }
}
