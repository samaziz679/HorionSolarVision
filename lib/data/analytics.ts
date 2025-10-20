import { createClient } from "@/lib/supabase/server"

export interface AnalyticsData {
  // Financial KPIs
  totalRevenue: number
  grossProfit: number // Added gross profit
  netProfit: number
  totalExpenses: number
  totalCOGS: number // Added COGS
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
    cogs: number // Added COGS to cash flow data
    expenses: number
    profit: number // Now using net profit (after COGS and expenses)
    margin: number
  }>

  // Inventory insights
  lowStockItems: Array<{
    name: string
    currentStock: number
    threshold: number
  }>

  stockAlerts: Array<{
    name: string
    currentStock: number
    status: "critical" | "low"
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

  // Inventory value breakdown by price tier
  inventoryValueByPricing: {
    purchasePrice: number
    retailPrice1: number
    retailPrice2: number
    wholesalePrice: number
  }
}

export async function getAnalyticsData(startDate?: string, endDate?: string): Promise<AnalyticsData> {
  const supabase = createClient()

  try {
    const currentDate = new Date()
    let periodLabel: string

    if (!startDate || !endDate) {
      // Default: show all data (last 12 months)
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()
      startDate = new Date(currentYear, currentMonth - 12, 1).toISOString().split("T")[0]
      endDate = currentDate.toISOString().split("T")[0]
      periodLabel = "12 derniers mois"
    } else {
      periodLabel = "Période personnalisée"
    }

    const { data: currentSales, error: salesError } = await supabase
      .from("sales")
      .select(`
        total, 
        sale_date, 
        client_id, 
        quantity,
        product_id,
        id,
        products!inner(name, prix_achat)
      `)
      .gte("sale_date", startDate)
      .lte("sale_date", endDate)

    if (salesError) {
      console.error("Sales query error:", salesError)
    }

    // Fetch previous period for comparison
    const startDateObj = new Date(startDate)
    const endDateObj = new Date(endDate)
    const prevStartDate = new Date(startDateObj.getTime() - (endDateObj.getTime() - startDateObj.getTime()))
    const prevEndDate = startDateObj

    const { data: prevSales } = await supabase
      .from("sales")
      .select("total")
      .gte("sale_date", prevStartDate.toISOString().split("T")[0])
      .lte("sale_date", prevEndDate.toISOString().split("T")[0])

    const { data: currentExpenses, error: expensesError } = await supabase
      .from("expenses")
      .select("amount, expense_date")
      .gte("expense_date", startDate)
      .lte("expense_date", endDate)

    if (expensesError) {
      console.error("Expenses query error:", expensesError)
    }

    const { data: currentPurchases } = await supabase
      .from("purchases")
      .select("total, purchase_date")
      .gte("purchase_date", startDate)
      .lte("purchase_date", endDate)

    const { data: clients } = await supabase.from("clients").select(`
        id, 
        name, 
        created_at,
        sales!inner(total, sale_date)
      `)

    // Fetch inventory data
    const { data: inventory, error: inventoryError } = await supabase
      .from("products")
      .select("name, quantity, prix_achat, seuil_stock_bas, prix_vente_detail_1, prix_vente_detail_2, prix_vente_gros")

    if (inventoryError) {
      console.error("Inventory query error:", inventoryError)
    }

    const { data: stockMovements } = await supabase
      .from("stock_movements")
      .select(`
        reference_id,
        quantity,
        unit_price,
        movement_type,
        movement_date,
        products!inner(name)
      `)
      .eq("movement_type", "sale")
      .gte("movement_date", startDate)
      .lte("movement_date", endDate)

    // Calculate financial metrics
    const totalRevenue = currentSales?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0
    const prevRevenue = prevSales?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0
    const totalExpenses = currentExpenses?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0

    const totalCOGS =
      stockMovements?.reduce((sum, movement) => {
        const unitCost = movement.unit_price || 0
        const quantity = Math.abs(movement.quantity || 0)
        return sum + unitCost * quantity
      }, 0) || 0

    const fallbackCOGS =
      totalCOGS === 0
        ? currentSales?.reduce((sum, sale) => {
            const purchasePrice = sale.products?.prix_achat || 0
            const quantity = sale.quantity || 0
            return sum + purchasePrice * quantity
          }, 0) || 0
        : totalCOGS

    const grossProfit = totalRevenue - fallbackCOGS
    const netProfit = grossProfit - totalExpenses

    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0

    // Calculate inventory metrics
    const inventoryValuePurchase =
      inventory?.reduce((sum, product) => sum + (product.quantity || 0) * (product.prix_achat || 0), 0) || 0

    const inventoryValueRetail1 =
      inventory?.reduce((sum, product) => sum + (product.quantity || 0) * (product.prix_vente_detail_1 || 0), 0) || 0

    const inventoryValueRetail2 =
      inventory?.reduce((sum, product) => sum + (product.quantity || 0) * (product.prix_vente_detail_2 || 0), 0) || 0

    const inventoryValueWholesale =
      inventory?.reduce((sum, product) => sum + (product.quantity || 0) * (product.prix_vente_gros || 0), 0) || 0

    const inventoryValue = inventoryValuePurchase
    const lowStockItems =
      inventory
        ?.filter((product) => (product.quantity || 0) <= (product.seuil_stock_bas || 10))
        .map((product) => ({
          name: product.name || "Produit Inconnu",
          currentStock: product.quantity || 0,
          threshold: product.seuil_stock_bas || 10,
        }))
        .slice(0, 5) || []

    const outOfStockItems = inventory?.filter((product) => (product.quantity || 0) === 0).length || 0

    // Calculate client metrics
    const activeClients = new Set(currentSales?.map((sale) => sale.client_id)).size || 0
    const newClientsThisMonth =
      clients?.filter((client) => {
        const createdDate = new Date(client.created_at)
        return createdDate >= startDateObj && createdDate <= endDateObj
      }).length || 0

    const { data: expenseCategories } = await supabase
      .from("expenses")
      .select(`
        amount,
        expense_categories!inner(name_fr)
      `)
      .gte("expense_date", startDate)
      .lte("expense_date", endDate)

    const expenseByCat: Record<string, number> = {}
    expenseCategories?.forEach((expense: any) => {
      const category = expense.expense_categories?.name_fr || "Dépenses Générales"
      expenseByCat[category] = (expenseByCat[category] || 0) + (expense.amount || 0)
    })

    const expenseBreakdown = Object.entries(expenseByCat).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    }))

    const cashFlow = []
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString().split("T")[0]
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).toISOString().split("T")[0]
      const monthName = monthDate.toISOString().slice(0, 7) // YYYY-MM format

      // Fetch real monthly sales
      const { data: monthlySales } = await supabase
        .from("sales")
        .select("total, id")
        .gte("sale_date", monthStart)
        .lte("sale_date", monthEnd)

      const { data: monthlyStockMovements } = await supabase
        .from("stock_movements")
        .select("quantity, unit_price")
        .eq("movement_type", "sale")
        .gte("movement_date", monthStart)
        .lte("movement_date", monthEnd)

      // Fetch real monthly expenses
      const { data: monthlyExpenses } = await supabase
        .from("expenses")
        .select("amount")
        .gte("expense_date", monthStart)
        .lte("expense_date", monthEnd)

      const monthRevenue = monthlySales?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0

      const monthCOGS =
        monthlyStockMovements?.reduce((sum, movement) => {
          const unitCost = movement.unit_price || 0
          const quantity = Math.abs(movement.quantity || 0)
          return sum + unitCost * quantity
        }, 0) || 0

      const monthExpenseTotal = monthlyExpenses?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0

      const monthGrossProfit = monthRevenue - monthCOGS
      const monthNetProfit = monthGrossProfit - monthExpenseTotal
      const monthMargin = monthRevenue > 0 ? Math.round((monthNetProfit / monthRevenue) * 100 * 10) / 10 : 0

      cashFlow.push({
        month: monthName,
        revenue: monthRevenue,
        cogs: monthCOGS, // Added COGS to cash flow data
        expenses: monthExpenseTotal,
        profit: monthNetProfit, // Now using net profit (after COGS and expenses)
        margin: monthMargin,
      })
    }

    const productSales: Record<string, { sales: number; revenue: number; name: string }> = {}
    currentSales?.forEach((sale: any) => {
      const productName = sale.products?.name || "Produit Inconnu"
      if (!productSales[productName]) {
        productSales[productName] = { sales: 0, revenue: 0, name: productName }
      }
      productSales[productName].sales += sale.quantity || 1
      productSales[productName].revenue += sale.total || 0
    })

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    const clientSales: Record<string, { totalSales: number; orders: number; name: string }> = {}
    currentSales?.forEach((sale: any) => {
      const clientId = sale.client_id
      if (clientId && !clientSales[clientId]) {
        // Find client name from clients data
        const client = clients?.find((c) => c.id === clientId)
        clientSales[clientId] = {
          totalSales: 0,
          orders: 0,
          name: client?.name || "Client Inconnu",
        }
      }
      if (clientId) {
        clientSales[clientId].totalSales += sale.total || 0
        clientSales[clientId].orders += 1
      }
    })

    const topClients = Object.values(clientSales)
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5)

    const inventoryTurnover = inventoryValue > 0 ? Math.round((fallbackCOGS / inventoryValue) * 12 * 10) / 10 : 0

    const recommendations = []

    if (totalRevenue === 0) {
      recommendations.push({
        title: "Enregistrer Vos Premières Ventes",
        description: "Commencez par enregistrer vos ventes pour voir les analyses en temps réel.",
        priority: "high" as const,
      })
    }

    if (lowStockItems.length > 0) {
      const productList = lowStockItems.map((item) => item.name).join(", ")
      recommendations.push({
        title: "Réapprovisionner le Stock",
        description: `${lowStockItems.length} produit(s) ont un stock faible et nécessitent un réapprovisionnement: ${productList}`,
        priority: "high" as const,
      })
    }

    if (netProfit < 0) {
      recommendations.push({
        title: "Optimiser les Coûts",
        description: "Vos dépenses dépassent vos revenus. Analysez vos coûts pour améliorer la rentabilité.",
        priority: "high" as const,
      })
    }

    if (activeClients < 5) {
      recommendations.push({
        title: "Développer la Base Client",
        description: "Concentrez-vous sur l'acquisition de nouveaux clients pour augmenter les ventes.",
        priority: "medium" as const,
      })
    }

    const stockAlerts = lowStockItems.map((item) => ({
      name: item.name,
      currentStock: item.currentStock,
      status: item.currentStock === 0 ? ("critical" as const) : ("low" as const),
    }))

    const recentStockMovements =
      stockMovements?.slice(0, 10).map((movement: any) => ({
        product: movement.products?.name || "Produit Inconnu",
        type: movement.movement_type === "sale" ? "Vente" : "Achat",
        quantity: movement.movement_type === "sale" ? -Math.abs(movement.quantity) : Math.abs(movement.quantity),
        date: new Date(movement.movement_date).toLocaleDateString("fr-FR"),
      })) || []

    return {
      totalRevenue,
      grossProfit,
      netProfit,
      totalExpenses,
      totalCOGS: fallbackCOGS, // Use fallback COGS that includes lot-specific prices
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      activeClients,
      clientGrowth: newClientsThisMonth,
      inventoryValue,
      inventoryTurnover,
      outOfStockItems,
      currentPeriod: periodLabel,
      revenueBreakdown: [{ category: "Ventes Directes", amount: totalRevenue, percentage: 100 }],
      expenseBreakdown,
      cashFlow,
      lowStockItems,
      stockAlerts,
      recentStockMovements,
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
      recommendations,
      inventoryValueByPricing: {
        purchasePrice: inventoryValuePurchase,
        retailPrice1: inventoryValueRetail1,
        retailPrice2: inventoryValueRetail2,
        wholesalePrice: inventoryValueWholesale,
      },
    }
  } catch (error) {
    console.error("Error fetching analytics data:", error)

    // Return safe default data in case of error
    return {
      totalRevenue: 0,
      grossProfit: 0,
      netProfit: 0,
      totalExpenses: 0,
      totalCOGS: 0,
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
      stockAlerts: [],
      recentStockMovements: [],
      topProducts: [],
      topClients: [],
      salesTarget: { target: 0, achieved: 0, percentage: 0 },
      clientTarget: { target: 0, achieved: 0, percentage: 0 },
      recommendations: [
        {
          title: "Commencer à Utiliser le Système",
          description: "Ajoutez vos premiers produits, clients et ventes pour voir les analyses.",
          priority: "high",
        },
      ],
      inventoryValueByPricing: {
        purchasePrice: 0,
        retailPrice1: 0,
        retailPrice2: 0,
        wholesalePrice: 0,
      },
    }
  }
}
