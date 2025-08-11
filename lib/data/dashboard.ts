import "server-only"
import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export async function getDashboardStats() {
  noStore()
  const supabase = createClient()

  const { count: totalSales, error: salesError } = await supabase
    .from("sales")
    .select("*", { count: "exact", head: true })

  const { count: totalPurchases, error: purchasesError } = await supabase
    .from("purchases")
    .select("*", { count: "exact", head: true })

  const { count: totalClients, error: clientsError } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })

  const { count: totalProducts, error: productsError } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })

  if (salesError || purchasesError || clientsError || productsError) {
    console.error("Error fetching dashboard stats:", {
      salesError,
      purchasesError,
      clientsError,
      productsError,
    })
    throw new Error("Could not fetch dashboard statistics.")
  }

  return {
    totalSales: totalSales ?? 0,
    totalPurchases: totalPurchases ?? 0,
    totalClients: totalClients ?? 0,
    totalProducts: totalProducts ?? 0,
  }
}

export async function getRecentSales() {
  noStore()
  const supabase = createClient()

  const { data, error } = await supabase
    .from("sales")
    .select(
      `
      id,
      sale_date,
      total_price,
      clients (
        name,
        email
      )
    `,
    )
    .order("sale_date", { ascending: false })
    .limit(5)

  if (error) {
    console.error("Error fetching recent sales:", error)
    throw new Error("Could not fetch recent sales.")
  }

  return (data || []).map((sale) => ({
    id: sale.id,
    date: sale.sale_date,
    total_amount: sale.total_price,
    client_name: sale.clients?.name ?? "N/A",
    client_email: sale.clients?.email ?? "N/A",
  }))
}
