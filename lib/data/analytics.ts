import { createClient } from "@/lib/supabase/server"

export interface AnalyticsData {
  // Financial KPIs
  totalRevenue: number
  netProfit: number
  totalExpenses: number
  revenueGrowth: number

  // Customer metrics
  activeClients: number
  clientGrowth: number

  // Inventory metrics
  inventoryValue: number
  inventoryTurnover: number
  outOfStockItems: number

  // Period info
  currentPeriod: string

  // Detailed breakdowns
  revenueBreakdown: Array<{
    category: string
    amount: number
    percentage: number
  }>

  expenseBreakdown: Array<{
    category: string
    amount: number
    percentage: number
  }>

  cashFlow: Array<{
    month: string
    revenue: number
    expenses: number
    profit: number
    margin: number
  }>

  // Inventory insights
  lowStockItems: Array<{
    name: string
    currentStock: number
    threshold: number
  }>

  recentStockMovements: Array<{
    product: string
    type: string
    quantity: number
    date: string
  }>

  // Performance metrics
  topProducts: Array<{
    name: string
    sales: number
    revenue: number
  }>

  topClients: Array<{
    name: string
    totalSales: number
    orders: number
  }>

  // Targets and goals
  salesTarget: {
    target: number
    achieved: number
    percentage: number
  }

  clientTarget: {
    target: number
    achieved: number
    percentage: number
  }

  // AI-powered recommendations
  recommendations: Array<{
    title: string
    description: string
    priority: "high" | "medium" | "low"
  }>
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const supabase = createClient()

  try {
    // Get current month data
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1)
    const endOfMonth = new Date(currentYear, currentMonth, 0)

    // Get previous month for comparison
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear
    const startOfPrevMonth = new Date(prevYear, prevMonth - 1, 1)
    const endOfPrevMonth = new Date(prevYear, prevMonth, 0)

    // Fetch sales data
    const { data: currentSales } = await supabase
      .from("sales")
      .select("total_amount, created_at, client_id")
      .gte("created_at", startOfMonth.toISOString())
      .lte("created_at", endOfMonth.toISOString())

    const { data: prevSales } = await supabase
      .from("sales")
      .select("total_amount")
      .gte("created_at", startOfPrevMonth.toISOString())
      .lte("created_at", endOfPrevMonth.toISOString())

    // Fetch expenses data
    const { data: currentExpenses } = await supabase
      .from("expenses")
      .select("amount, category, created_at")
      .gte("created_at", startOfMonth.toISOString())
      .lte("created_at", endOfMonth.toISOString())

    // Fetch purchases data (cost of goods sold)
    const { data: currentPurchases } = await supabase
      .from("purchases")
      .select("total_cost, created_at")
      .gte("created_at", startOfMonth.toISOString())
      .lte("created_at", endOfMonth.toISOString())

    // Fetch inventory data
    const { data: inventory } = await supabase.from("products").select("name, quantity, price, low_stock_threshold")

    // Fetch clients data
    const { data: clients } = await supabase.from("clients").select("id, name, created_at")

    // Calculate financial metrics
    const totalRevenue = currentSales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0
    const prevRevenue = prevSales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0
    const totalExpenses = currentExpenses?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0
    const totalCOGS = currentPurchases?.reduce((sum, purchase) => sum + (purchase.total_cost || 0), 0) || 0
    const netProfit = totalRevenue - totalExpenses - totalCOGS

    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0

    // Calculate inventory metrics
    const inventoryValue = inventory?.reduce((sum, product) => sum + product.quantity * product.price, 0) || 0
    const lowStockItems =
      inventory
        ?.filter((product) => product.quantity <= (product.low_stock_threshold || 10))
        .map((product) => ({
          name: product.name,
          currentStock: product.quantity,
          threshold: product.low_stock_threshold || 10,
        })) || []

    const outOfStockItems = inventory?.filter((product) => product.quantity === 0).length || 0

    // Calculate client metrics
    const activeClients = new Set(currentSales?.map((sale) => sale.client_id)).size || 0
    const newClientsThisMonth =
      clients?.filter((client) => {
        const createdDate = new Date(client.created_at)
        return createdDate >= startOfMonth && createdDate <= endOfMonth
      }).length || 0

    // Expense breakdown
    const expenseCategories =
      currentExpenses?.reduce(
        (acc, expense) => {
          const category = expense.category || "Autres"
          acc[category] = (acc[category] || 0) + expense.amount
          return acc
        },
        {} as Record<string, number>,
      ) || {}

    const expenseBreakdown = Object.entries(expenseCategories).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    }))

    // Generate cash flow for last 6 months
    const cashFlow = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentYear, currentMonth - 1 - i, 1)
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

      const { data: monthSales } = await supabase
        .from("sales")
        .select("total_amount")
        .gte("created_at", monthStart.toISOString())
        .lte("created_at", monthEnd.toISOString())

      const { data: monthExpenses } = await supabase
        .from("expenses")
        .select("amount")
        .gte("created_at", monthStart.toISOString())
        .lte("created_at", monthEnd.toISOString())

      const monthRevenue = monthSales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0
      const monthExpenseTotal = monthExpenses?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0
      const monthProfit = monthRevenue - monthExpenseTotal
      const monthMargin = monthRevenue > 0 ? Math.round((monthProfit / monthRevenue) * 100) : 0

      cashFlow.push({
        month: monthDate.toLocaleDateString("fr-FR", { month: "short", year: "numeric" }),
        revenue: monthRevenue,
        expenses: monthExpenseTotal,
        profit: monthProfit,
        margin: monthMargin,
      })
    }

    const { data: salesWithProducts } = await supabase
      .from("sales")
      .select(`
        total_amount,
        sale_items (
          quantity,
          unit_price,
          products (
            name
          )
        )
      `)
      .gte("created_at", startOfMonth.toISOString())
      .lte("created_at", endOfMonth.toISOString())

    // Calculate real top products from sales data
    const productSales: Record<string, { sales: number; revenue: number }> = {}

    salesWithProducts?.forEach((sale) => {
      sale.sale_items?.forEach((item) => {
        const productName = item.products?.name || "Produit Inconnu"
        if (!productSales[productName]) {
          productSales[productName] = { sales: 0, revenue: 0 }
        }
        productSales[productName].sales += item.quantity || 0
        productSales[productName].revenue += (item.quantity || 0) * (item.unit_price || 0)
      })
    })

    const topProducts = Object.entries(productSales)
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(([name, data]) => ({ name, ...data }))

    const { data: clientSalesData } = await supabase
      .from("sales")
      .select(`
        total_amount,
        clients (
          name
        )
      `)
      .gte("created_at", startOfMonth.toISOString())
      .lte("created_at", endOfMonth.toISOString())

    const clientSales: Record<string, { totalSales: number; orders: number }> = {}

    clientSalesData?.forEach((sale) => {
      const clientName = sale.clients?.name || "Client Inconnu"
      if (!clientSales[clientName]) {
        clientSales[clientName] = { totalSales: 0, orders: 0 }
      }
      clientSales[clientName].totalSales += sale.total_amount || 0
      clientSales[clientName].orders += 1
    })

    const topClients = Object.entries(clientSales)
      .sort(([, a], [, b]) => b.totalSales - a.totalSales)
      .slice(0, 5)
      .map(([name, data]) => ({ name, ...data }))

    const { data: recentSales } = await supabase
      .from("sales")
      .select(`
        created_at,
        sale_items (
          quantity,
          products (
            name
          )
        )
      `)
      .order("created_at", { ascending: false })
      .limit(10)

    const { data: recentPurchases } = await supabase
      .from("purchases")
      .select(`
        created_at,
        purchase_items (
          quantity,
          products (
            name
          )
        )
      `)
      .order("created_at", { ascending: false })
      .limit(10)

    const recentStockMovements = []

    // Add recent sales (stock out)
    recentSales?.forEach((sale) => {
      sale.sale_items?.forEach((item) => {
        const daysAgo = Math.floor((Date.now() - new Date(sale.created_at).getTime()) / (1000 * 60 * 60 * 24))
        const dateText = daysAgo === 0 ? "Aujourd'hui" : daysAgo === 1 ? "Hier" : `Il y a ${daysAgo} jours`

        recentStockMovements.push({
          product: item.products?.name || "Produit Inconnu",
          type: "Vente",
          quantity: -(item.quantity || 0),
          date: dateText,
        })
      })
    })

    // Add recent purchases (stock in)
    recentPurchases?.forEach((purchase) => {
      purchase.purchase_items?.forEach((item) => {
        const daysAgo = Math.floor((Date.now() - new Date(purchase.created_at).getTime()) / (1000 * 60 * 60 * 24))
        const dateText = daysAgo === 0 ? "Aujourd'hui" : daysAgo === 1 ? "Hier" : `Il y a ${daysAgo} jours`

        recentStockMovements.push({
          product: item.products?.name || "Produit Inconnu",
          type: "Achat",
          quantity: item.quantity || 0,
          date: dateText,
        })
      })
    })

    // Sort by most recent and limit to 5
    recentStockMovements.sort((a, b) => {
      const aDate =
        a.date === "Aujourd'hui" ? 0 : a.date === "Hier" ? 1 : Number.parseInt(a.date.match(/\d+/)?.[0] || "999")
      const bDate =
        b.date === "Aujourd'hui" ? 0 : b.date === "Hier" ? 1 : Number.parseInt(b.date.match(/\d+/)?.[0] || "999")
      return aDate - bDate
    })

    const totalInventoryValue = inventory?.reduce((sum, product) => sum + product.quantity * product.price, 0) || 1
    const inventoryTurnover = totalInventoryValue > 0 ? Math.round((totalCOGS / totalInventoryValue) * 12 * 10) / 10 : 0

    return {
      totalRevenue,
      netProfit,
      totalExpenses,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      activeClients,
      clientGrowth: newClientsThisMonth,
      inventoryValue,
      inventoryTurnover,
      outOfStockItems,
      currentPeriod: `${currentDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`,
      revenueBreakdown: [{ category: "Ventes Directes", amount: totalRevenue, percentage: 100 }],
      expenseBreakdown,
      cashFlow,
      lowStockItems: lowStockItems.slice(0, 5),
      recentStockMovements: recentStockMovements.slice(0, 5),
      topProducts,
      topClients,
      salesTarget: {
        target: 2000000,
        achieved: totalRevenue,
        percentage: Math.min(Math.round((totalRevenue / 2000000) * 100), 100),
      },
      clientTarget: {
        target: 10,
        achieved: newClientsThisMonth,
        percentage: Math.min(Math.round((newClientsThisMonth / 10) * 100), 100),
      },
      recommendations: [
        {
          title: "Configurer la Base de Données",
          description: "Connectez votre base de données pour voir les analyses en temps réel.",
          priority: "high",
        },
      ],
    }
  } catch (error) {
    console.error("Error fetching analytics data:", error)

    // Return default data in case of error
    return {
      totalRevenue: 0,
      netProfit: 0,
      totalExpenses: 0,
      revenueGrowth: 0,
      activeClients: 0,
      clientGrowth: 0,
      inventoryValue: 0,
      inventoryTurnover: 0,
      outOfStockItems: 0,
      currentPeriod: new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
      revenueBreakdown: [],
      expenseBreakdown: [],
      cashFlow: [],
      lowStockItems: [],
      recentStockMovements: [],
      topProducts: [],
      topClients: [],
      salesTarget: { target: 0, achieved: 0, percentage: 0 },
      clientTarget: { target: 0, achieved: 0, percentage: 0 },
      recommendations: [
        {
          title: "Configurer la Base de Données",
          description: "Connectez votre base de données pour voir les analyses en temps réel.",
          priority: "high",
        },
      ],
    }
  }
}
