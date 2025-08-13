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

  if (salesError) {
    console.error("Error fetching sales count:", salesError)
  }
  if (purchasesError) {
    console.error("Error fetching purchases count:", purchasesError)
  }
  if (clientsError) {
    console.error("Error fetching clients count:", clientsError)
  }
  if (productsError) {
    console.error("Error fetching products count:", productsError)
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
    .select(`
      id,
      sale_date,
      total_price,
      clients!sales_client_id_fkey (
        name,
        email
      )
    `)
    .order("sale_date", { ascending: false })
    .limit(5)

  if (error) {
    console.error("Error fetching recent sales:", error)
    return []
  }

  return (data || []).map((sale) => ({
    id: sale.id,
    date: sale.sale_date,
    total_amount: sale.total_price,
    client_name: sale.clients?.name ?? "N/A",
    client_email: sale.clients?.email ?? "N/A",
  }))
}

export async function getDashboardData(supabase: any) {
  noStore()

  // Get counts
  const { count: totalSales } = await supabase.from("sales").select("*", { count: "exact", head: true })

  const { count: totalProducts } = await supabase.from("products").select("*", { count: "exact", head: true })

  const { count: totalClients } = await supabase.from("clients").select("*", { count: "exact", head: true })

  const { count: totalSuppliers } = await supabase.from("suppliers").select("*", { count: "exact", head: true })

  // Get recent sales
  const { data: recentSalesData } = await supabase
    .from("sales")
    .select(`
      id,
      sale_date,
      total_price,
      clients!sales_client_id_fkey (
        name
      )
    `)
    .order("sale_date", { ascending: false })
    .limit(5)

  // Get low stock items
  const { data: lowStockData } = await supabase.from("products").select("name, quantity").lt("quantity", 10).limit(5)

  const recentSales = (recentSalesData || []).map((sale: any) => ({
    id: sale.id,
    total_amount: sale.total_price,
    client_name: sale.clients?.name ?? "Unknown Client",
  }))

  const lowStockItems = lowStockData || []

  return {
    totalSales: totalSales ?? 0,
    totalProducts: totalProducts ?? 0,
    totalClients: totalClients ?? 0,
    totalSuppliers: totalSuppliers ?? 0,
    recentSales,
    lowStockItems,
  }
}
