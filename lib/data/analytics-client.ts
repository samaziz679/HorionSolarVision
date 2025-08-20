import { createClient } from "@/lib/supabase/client"

export interface AnalyticsData {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  totalClients: number
  topProducts: Array<{
    name: string
    quantity: number
    revenue: number
  }>
  topClients: Array<{
    name: string
    totalSpent: number
    orderCount: number
  }>
  monthlyData: Array<{
    month: string
    revenue: number
    expenses: number
    profit: number
    margin: number
  }>
  stockAlerts: Array<{
    name: string
    currentStock: number
    status: "critical" | "low" | "ok"
  }>
  revenueBySource: Array<{
    source: string
    amount: number
    percentage: number
  }>
  totalStockValue: number
  stockRotation: number
  outOfStockCount: number
  stockMovements: Array<{
    product: string
    type: "sale" | "purchase"
    quantity: number
    date: string
    value: number
  }>
}

export async function getAnalyticsData(startDate?: string, endDate?: string): Promise<AnalyticsData> {
  const supabase = createClient()

  try {
    // Set default date range if not provided
    const start = startDate || new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]
    const end = endDate || new Date().toISOString().split("T")[0]

    // Get total revenue from sales
    const { data: salesData } = await supabase
      .from("sales")
      .select("total, sale_date, client_id, product_id, quantity")
      .gte("sale_date", start)
      .lte("sale_date", end)

    // Get total expenses
    const { data: expensesData } = await supabase
      .from("expenses")
      .select("amount, expense_date")
      .gte("expense_date", start)
      .lte("expense_date", end)

    // Get clients data
    const { data: clientsData } = await supabase.from("clients").select("id, name")

    const { data: productsData } = await supabase
      .from("products")
      .select("id, name, quantity, seuil_stock_bas, prix_achat, prix_detail_1")

    const { data: purchasesData } = await supabase
      .from("purchases")
      .select("product_id, quantity, unit_price, purchase_date")
      .gte("purchase_date", start)
      .lte("purchase_date", end)

    // Calculate totals
    const totalRevenue = salesData?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0
    const totalExpenses = expensesData?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0
    const netProfit = totalRevenue - totalExpenses
    const totalClients = clientsData?.length || 0

    const totalStockValue =
      productsData?.reduce((sum, product) => {
        const quantity = product.quantity || 0
        const purchasePrice = product.prix_achat || 0
        return sum + quantity * purchasePrice
      }, 0) || 0

    const outOfStockCount = productsData?.filter((product) => (product.quantity || 0) === 0).length || 0

    // Calculate stock rotation (simplified: total sales value / average stock value)
    const totalSalesQuantity = salesData?.reduce((sum, sale) => sum + (sale.quantity || 0), 0) || 0
    const averageStockQuantity = productsData?.reduce((sum, product) => sum + (product.quantity || 0), 0) || 0
    const stockRotation =
      averageStockQuantity > 0 ? Math.round((totalSalesQuantity / averageStockQuantity) * 10) / 10 : 0

    const stockMovements: Array<{
      product: string
      type: "sale" | "purchase"
      quantity: number
      date: string
      value: number
    }> = []

    // Add sales movements
    salesData?.forEach((sale) => {
      const product = productsData?.find((p) => p.id === sale.product_id)
      if (product) {
        stockMovements.push({
          product: product.name,
          type: "sale",
          quantity: -(sale.quantity || 0), // Negative for sales (stock reduction)
          date: sale.sale_date,
          value: sale.total || 0,
        })
      }
    })

    // Add purchase movements
    purchasesData?.forEach((purchase) => {
      const product = productsData?.find((p) => p.id === purchase.product_id)
      if (product) {
        stockMovements.push({
          product: product.name,
          type: "purchase",
          quantity: purchase.quantity || 0, // Positive for purchases (stock increase)
          date: purchase.purchase_date,
          value: (purchase.quantity || 0) * (purchase.unit_price || 0),
        })
      }
    })

    // Sort stock movements by date (most recent first)
    stockMovements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Get top products
    const productSales = new Map()
    salesData?.forEach((sale) => {
      const productId = sale.product_id
      if (!productSales.has(productId)) {
        productSales.set(productId, { quantity: 0, revenue: 0 })
      }
      const current = productSales.get(productId)
      current.quantity += sale.quantity || 0
      current.revenue += sale.total || 0
    })

    const topProducts = Array.from(productSales.entries())
      .map(([productId, data]) => {
        const product = productsData?.find((p) => p.id === productId)
        return {
          name: product?.name || "Unknown Product",
          quantity: data.quantity,
          revenue: data.revenue,
        }
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Get top clients
    const clientSales = new Map()
    salesData?.forEach((sale) => {
      const clientId = sale.client_id
      if (!clientSales.has(clientId)) {
        clientSales.set(clientId, { totalSpent: 0, orderCount: 0 })
      }
      const current = clientSales.get(clientId)
      current.totalSpent += sale.total || 0
      current.orderCount += 1
    })

    const topClients = Array.from(clientSales.entries())
      .map(([clientId, data]) => {
        const client = clientsData?.find((c) => c.id === clientId)
        return {
          name: client?.name || "Unknown Client",
          totalSpent: data.totalSpent,
          orderCount: data.orderCount,
        }
      })
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)

    // Calculate monthly data
    const monthlyMap = new Map()

    // Process sales by month
    salesData?.forEach((sale) => {
      const month = new Date(sale.sale_date).toISOString().slice(0, 7) // YYYY-MM
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, { revenue: 0, expenses: 0 })
      }
      monthlyMap.get(month).revenue += sale.total || 0
    })

    // Process expenses by month
    expensesData?.forEach((expense) => {
      const month = new Date(expense.expense_date).toISOString().slice(0, 7) // YYYY-MM
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, { revenue: 0, expenses: 0 })
      }
      monthlyMap.get(month).expenses += expense.amount || 0
    })

    const monthlyData = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        expenses: data.expenses,
        profit: data.revenue - data.expenses,
        margin: data.revenue > 0 ? ((data.revenue - data.expenses) / data.revenue) * 100 : 0,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // Calculate stock alerts
    const stockAlerts =
      productsData
        ?.map((product) => ({
          name: product.name,
          currentStock: product.quantity || 0,
          status:
            (product.quantity || 0) <= (product.seuil_stock_bas || 5)
              ? (product.quantity || 0) === 0
                ? ("critical" as const)
                : ("low" as const)
              : ("ok" as const),
        }))
        .filter((alert) => alert.status !== "ok") || []

    // Revenue by source (simplified - all direct sales for now)
    const revenueBySource =
      totalRevenue > 0
        ? [
            {
              source: "Ventes Directes",
              amount: totalRevenue,
              percentage: 100,
            },
          ]
        : []

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      totalClients,
      topProducts,
      topClients,
      monthlyData,
      stockAlerts,
      revenueBySource,
      totalStockValue,
      stockRotation,
      outOfStockCount,
      stockMovements: stockMovements.slice(0, 10), // Limit to 10 most recent movements
    }
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      totalClients: 0,
      topProducts: [],
      topClients: [],
      monthlyData: [],
      stockAlerts: [],
      revenueBySource: [],
      totalStockValue: 0,
      stockRotation: 0,
      outOfStockCount: 0,
      stockMovements: [],
    }
  }
}
