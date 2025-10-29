import "server-only"
import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export async function getDashboardStats() {
  noStore()
  const supabase = await createClient()

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
  const supabase = await createClient()

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

export async function getFinancialHealth(supabase: any) {
  noStore()

  // Get total revenue from sales
  const { data: revenueData } = await supabase
    .from("sales")
    .select("total")
    .gte("sale_date", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

  const totalRevenue = (revenueData || []).reduce((sum: number, sale: any) => sum + (sale.total || 0), 0)

  // Get operating expenses (not including inventory purchases)
  const { data: expenseData } = await supabase
    .from("expenses")
    .select("amount")
    .gte("expense_date", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

  const totalExpenses = (expenseData || []).reduce((sum: number, expense: any) => sum + (expense.amount || 0), 0)

  // Get cost of goods sold (COGS) from purchases
  const { data: cogsData } = await supabase
    .from("purchases")
    .select("total")
    .gte("purchase_date", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

  const totalCOGS = (cogsData || []).reduce((sum: number, purchase: any) => sum + (purchase.total || 0), 0)

  // Calculate metrics
  const grossProfit = totalRevenue - totalCOGS
  const netProfit = grossProfit - totalExpenses
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
  const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0

  return {
    totalRevenue,
    totalExpenses,
    totalCOGS,
    grossProfit,
    netProfit,
    profitMargin,
    expenseRatio,
  }
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
      total,
      clients!sales_client_id_fkey (
        name
      )
    `)
    .order("sale_date", { ascending: false })
    .limit(5)

  const { data: lowStockData } = await supabase
    .from("current_stock_with_batches")
    .select("name, total_stock, seuil_stock_bas, is_low_stock")
    .or("total_stock.eq.0,is_low_stock.eq.true")
    .limit(10)

  const recentSales = (recentSalesData || []).map((sale: any) => ({
    id: sale.id,
    total_amount: sale.total,
    client_name: sale.clients?.name ?? "Unknown Client",
  }))

  const lowStockItems = (lowStockData || []).map((item: any) => ({
    name: item.name,
    quantity: item.total_stock || 0,
    threshold: item.seuil_stock_bas || 5,
    status: (item.total_stock || 0) === 0 ? "Critique" : "Stock Bas",
  }))

  return {
    totalSales: totalSales ?? 0,
    totalProducts: totalProducts ?? 0,
    totalClients: totalClients ?? 0,
    totalSuppliers: totalSuppliers ?? 0,
    recentSales,
    lowStockItems,
  }
}
