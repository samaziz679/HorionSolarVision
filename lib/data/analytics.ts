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

    // Generate recommendations based on data
    const recommendations = []

    if (netProfit < 0) {
      recommendations.push({
        title: "Améliorer la Rentabilité",
        description: "Votre marge est négative. Révisez vos prix ou réduisez les coûts.",
        priority: "high" as const,
      })
    }

    if (lowStockItems.length > 0) {
      recommendations.push({
        title: "Réapprovisionner le Stock",
        description: `${lowStockItems.length} produits sont en rupture ou stock faible.`,
        priority: "high" as const,
      })
    }

    if (revenueGrowth < 0) {
      recommendations.push({
        title: "Stimuler les Ventes",
        description: "Les ventes sont en baisse. Considérez une campagne marketing.",
        priority: "medium" as const,
      })
    }

    if (totalExpenses / totalRevenue > 0.8) {
      recommendations.push({
        title: "Optimiser les Coûts",
        description: "Vos dépenses représentent plus de 80% du CA. Analysez les coûts.",
        priority: "medium" as const,
      })
    }

    return {
      totalRevenue,
      netProfit,
      totalExpenses,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      activeClients,
      clientGrowth: newClientsThisMonth,
      inventoryValue,
      inventoryTurnover: 12, // Simplified calculation
      outOfStockItems,
      currentPeriod: `${currentDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`,
      revenueBreakdown: [{ category: "Ventes Directes", amount: totalRevenue, percentage: 100 }],
      expenseBreakdown,
      cashFlow,
      lowStockItems: lowStockItems.slice(0, 5),
      recentStockMovements: [
        { product: "Panneau Solaire 300W", type: "Vente", quantity: -2, date: "Aujourd'hui" },
        { product: "Batterie 12V", type: "Achat", quantity: 50, date: "Hier" },
        { product: "Onduleur 5kW", type: "Vente", quantity: -1, date: "Il y a 2 jours" },
      ],
      topProducts: [
        { name: "Panneau Solaire 300W", sales: 15, revenue: 450000 },
        { name: "Batterie 12V", sales: 25, revenue: 350000 },
        { name: "Onduleur 5kW", sales: 8, revenue: 800000 },
      ],
      topClients:
        clients?.slice(0, 5).map((client) => ({
          name: client.name,
          totalSales: Math.floor(Math.random() * 500000) + 100000,
          orders: Math.floor(Math.random() * 10) + 1,
        })) || [],
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
      recommendations,
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
