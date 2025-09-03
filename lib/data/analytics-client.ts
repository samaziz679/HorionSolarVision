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
  stockValueDetail1: number
  stockValueDetail2: number
  stockValueGros: number
  stockRotation: number
  outOfStockCount: number
  stockMovements: Array<{
    product: string
    type: "sale" | "purchase"
    quantity: number
    date: string
    value: number
    lotNumber?: string
  }>
  batchAnalytics: {
    totalBatches: number
    averageBatchAge: number
    oldestBatchDays: number
    batchTurnover: number
    agingInventory: Array<{
      productName: string
      lotNumber: string
      daysOld: number
      quantity: number
      value: number
    }>
  }
}

export async function getAnalyticsData(startDate?: string, endDate?: string): Promise<AnalyticsData> {
  const supabase = createClient()

  try {
    // Set default date range if not provided
    const start = startDate || new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]
    const end = endDate || new Date().toISOString().split("T")[0]

    console.log("[v0] Analytics date range:", { start, end })

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

    const { data: productsData } = await supabase.from("current_stock_with_batches").select("*")

    console.log("[v0] Products data:", productsData?.length, "products found")
    console.log("[v0] Sample product:", productsData?.[0])

    const { data: stockLotsData } = await supabase
      .from("stock_lots")
      .select(`
        *,
        products (name)
      `)
      .gt("quantity_available", 0)

    const { data: stockMovementsData } = await supabase
      .from("stock_movements")
      .select(`
        *,
        stock_lots (
          lot_number,
          products (name)
        )
      `)
      .gte("created_at", start)
      .lte("created_at", end)
      .order("created_at", { ascending: false })
      .limit(20)

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
        const quantity = product.total_quantity || 0
        const avgCost = product.average_cost || 0
        return sum + quantity * avgCost
      }, 0) || 0

    const stockValueDetail1 =
      productsData?.reduce((sum, product) => {
        const quantity = product.total_quantity || 0
        const price = product.prix_vente_detail_1 || 0
        return sum + quantity * price
      }, 0) || 0

    const stockValueDetail2 =
      productsData?.reduce((sum, product) => {
        const quantity = product.total_quantity || 0
        const price = product.prix_vente_detail_2 || 0
        return sum + quantity * price
      }, 0) || 0

    const stockValueGros =
      productsData?.reduce((sum, product) => {
        const quantity = product.total_quantity || 0
        const price = product.prix_vente_gros || 0
        return sum + quantity * price
      }, 0) || 0

    console.log("[v0] Stock values calculated:", {
      totalStockValue,
      stockValueDetail1,
      stockValueDetail2,
      stockValueGros,
    })

    const outOfStockCount = productsData?.filter((product) => (product.total_quantity || 0) === 0).length || 0

    // Calculate stock rotation (simplified: total sales value / average stock value)
    const totalSalesQuantity = salesData?.reduce((sum, sale) => sum + (sale.quantity || 0), 0) || 0
    const averageStockQuantity = productsData?.reduce((sum, product) => sum + (product.total_quantity || 0), 0) || 0
    const stockRotation =
      averageStockQuantity > 0 ? Math.round((totalSalesQuantity / averageStockQuantity) * 10) / 10 : 0

    const stockMovements: Array<{
      product: string
      type: "sale" | "purchase"
      quantity: number
      date: string
      value: number
      lotNumber?: string
    }> = []

    // Add stock movements from the new stock_movements table
    stockMovementsData?.forEach((movement) => {
      const productName = movement.stock_lots?.products?.name || "Unknown Product"
      const lotNumber = movement.stock_lots?.lot_number

      stockMovements.push({
        product: productName,
        type: movement.movement_type === "OUT" ? "sale" : "purchase",
        quantity: movement.quantity,
        date: movement.created_at,
        value: Math.abs(movement.quantity) * 100, // Simplified value calculation
        lotNumber: lotNumber,
      })
    })

    const now = new Date()
    const totalBatches = stockLotsData?.length || 0

    const batchAges =
      stockLotsData?.map((lot) => {
        const purchaseDate = new Date(lot.purchase_date)
        return Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24))
      }) || []

    const averageBatchAge =
      batchAges.length > 0 ? Math.round(batchAges.reduce((sum, age) => sum + age, 0) / batchAges.length) : 0

    const oldestBatchDays = batchAges.length > 0 ? Math.max(...batchAges) : 0

    // Calculate batch turnover (batches sold vs total batches)
    const totalBatchesEverCreated = await supabase.from("stock_lots").select("id", { count: "exact", head: true })

    const batchTurnover =
      totalBatchesEverCreated.count && totalBatches > 0
        ? Math.round(((totalBatchesEverCreated.count - totalBatches) / totalBatchesEverCreated.count) * 100)
        : 0

    // Create aging inventory analysis
    const agingInventory =
      stockLotsData
        ?.map((lot) => {
          const purchaseDate = new Date(lot.purchase_date)
          const daysOld = Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24))
          const value = (lot.quantity_available || 0) * (lot.unit_cost || 0)

          return {
            productName: lot.products?.name || "Unknown Product",
            lotNumber: lot.lot_number,
            daysOld,
            quantity: lot.quantity_available || 0,
            value,
          }
        })
        .filter((item) => item.daysOld > 30) // Only show items older than 30 days
        .sort((a, b) => b.daysOld - a.daysOld)
        .slice(0, 10) || []

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

    const stockAlerts =
      productsData
        ?.map((product) => ({
          name: product.name,
          currentStock: product.total_quantity || 0,
          status:
            (product.total_quantity || 0) <= 5
              ? (product.total_quantity || 0) === 0
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
      stockValueDetail1,
      stockValueDetail2,
      stockValueGros,
      stockRotation,
      outOfStockCount,
      stockMovements: stockMovements.slice(0, 10),
      batchAnalytics: {
        totalBatches,
        averageBatchAge,
        oldestBatchDays,
        batchTurnover,
        agingInventory,
      },
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
      stockValueDetail1: 0,
      stockValueDetail2: 0,
      stockValueGros: 0,
      stockRotation: 0,
      outOfStockCount: 0,
      stockMovements: [],
      batchAnalytics: {
        totalBatches: 0,
        averageBatchAge: 0,
        oldestBatchDays: 0,
        batchTurnover: 0,
        agingInventory: [],
      },
    }
  }
}
