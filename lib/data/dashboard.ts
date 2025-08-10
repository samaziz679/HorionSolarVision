import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export async function fetchFinancialSummary() {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_financial_summary")

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch financial summary.")
  }
  return data[0]
}

export async function fetchRecentSales() {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase
    .from("sales")
    .select(`
      id,
      total_amount,
      sale_date,
      clients ( name )
    `)
    .order("sale_date", { ascending: false })
    .limit(5)

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch recent sales.")
  }
  return data
}

export async function fetchTopSellingProducts() {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_top_selling_products")

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch top selling products.")
  }
  return data
}
