import { createClient } from "@/lib/supabase/server"

export interface SaleWithMargin {
  id: string
  sale_date: string
  product_id: string
  product_name: string
  client_name: string
  quantity: number
  unit_price: number
  total: number
  purchase_price: number | null
  gross_margin: number | null
  margin_percentage: number | null
  price_plan: string
}

export interface MarginSummary {
  total_sales: number
  total_cost: number
  total_margin: number
  average_margin_percentage: number
  sales_count: number
}

export interface PriceSuggestion {
  product_id: string
  product_name: string
  current_purchase_price: number
  suggested_price_detail1: number
  suggested_price_detail2: number
  suggested_price_gros: number
  target_margin: number
}

export async function calculateSaleMargin(
  salePrice: number,
  productId: string,
  quantity = 1,
): Promise<{
  purchasePrice: number | null
  grossMargin: number | null
  marginPercentage: number | null
}> {
  const supabase = createClient()

  // Get the most recent purchase price for this product
  const { data: recentPurchase } = await supabase
    .from("purchases")
    .select("unit_price")
    .eq("product_id", productId)
    .order("purchase_date", { ascending: false })
    .limit(1)
    .single()

  if (!recentPurchase || !recentPurchase.unit_price) {
    // Fallback to product's prix_achat if no purchase history
    const { data: product } = await supabase.from("products").select("prix_achat").eq("id", productId).single()

    const purchasePrice = product?.prix_achat || null

    if (!purchasePrice) {
      return {
        purchasePrice: null,
        grossMargin: null,
        marginPercentage: null,
      }
    }

    const grossMargin = salePrice - purchasePrice * quantity
    const marginPercentage = ((salePrice - purchasePrice * quantity) / (purchasePrice * quantity)) * 100

    return {
      purchasePrice,
      grossMargin,
      marginPercentage,
    }
  }

  const purchasePrice = recentPurchase.unit_price
  const grossMargin = salePrice - purchasePrice * quantity
  const marginPercentage = ((salePrice - purchasePrice * quantity) / (purchasePrice * quantity)) * 100

  return {
    purchasePrice,
    grossMargin,
    marginPercentage,
  }
}

export async function fetchSalesWithMargins(
  startDate?: string,
  endDate?: string,
  productId?: string,
  clientId?: string,
): Promise<SaleWithMargin[]> {
  const supabase = createClient()

  let query = supabase
    .from("sales")
    .select(
      `
      id,
      sale_date,
      product_id,
      quantity,
      unit_price,
      total,
      price_plan,
      products!inner(name),
      clients!inner(name)
    `,
    )
    .order("sale_date", { ascending: false })

  if (startDate) {
    query = query.gte("sale_date", startDate)
  }

  if (endDate) {
    query = query.lte("sale_date", endDate)
  }

  if (productId) {
    query = query.eq("product_id", productId)
  }

  if (clientId) {
    query = query.eq("client_id", clientId)
  }

  const { data: sales, error } = await query

  if (error) {
    console.error("Error fetching sales:", error)
    return []
  }

  // Calculate margins for each sale
  const salesWithMargins = await Promise.all(
    (sales || []).map(async (sale: any) => {
      const { purchasePrice, grossMargin, marginPercentage } = await calculateSaleMargin(
        sale.total,
        sale.product_id,
        sale.quantity,
      )

      return {
        id: sale.id,
        sale_date: sale.sale_date,
        product_id: sale.product_id,
        product_name: sale.products?.name || "Produit Inconnu",
        client_name: sale.clients?.name || "Client Inconnu",
        quantity: sale.quantity,
        unit_price: sale.unit_price,
        total: sale.total,
        purchase_price: purchasePrice,
        gross_margin: grossMargin,
        margin_percentage: marginPercentage,
        price_plan: sale.price_plan,
      }
    }),
  )

  return salesWithMargins
}

export async function getMarginSummary(startDate?: string, endDate?: string): Promise<MarginSummary> {
  const salesWithMargins = await fetchSalesWithMargins(startDate, endDate)

  const totalSales = salesWithMargins.reduce((sum, sale) => sum + sale.total, 0)
  const totalCost = salesWithMargins.reduce((sum, sale) => sum + (sale.purchase_price || 0) * sale.quantity, 0)
  const totalMargin = salesWithMargins.reduce((sum, sale) => sum + (sale.gross_margin || 0), 0)

  const salesWithMarginData = salesWithMargins.filter((sale) => sale.margin_percentage !== null)
  const averageMarginPercentage =
    salesWithMarginData.length > 0
      ? salesWithMarginData.reduce((sum, sale) => sum + (sale.margin_percentage || 0), 0) / salesWithMarginData.length
      : 0

  return {
    total_sales: totalSales,
    total_cost: totalCost,
    total_margin: totalMargin,
    average_margin_percentage: averageMarginPercentage,
    sales_count: salesWithMargins.length,
  }
}

export async function generatePriceSuggestions(targetMargin = 30): Promise<PriceSuggestion[]> {
  const supabase = createClient()

  // Get all products with their current purchase prices
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, prix_achat")
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  const suggestions: PriceSuggestion[] = (products || []).map((product) => {
    const purchasePrice = product.prix_achat || 0
    const marginMultiplier = 1 + targetMargin / 100

    return {
      product_id: product.id,
      product_name: product.name,
      current_purchase_price: purchasePrice,
      suggested_price_detail1: Math.round(purchasePrice * marginMultiplier),
      suggested_price_detail2: Math.round(purchasePrice * marginMultiplier * 0.95), // 5% less than detail 1
      suggested_price_gros: Math.round(purchasePrice * marginMultiplier * 0.85), // 15% less than detail 1
      target_margin: targetMargin,
    }
  })

  return suggestions
}

export async function getMarginByProduct(
  startDate?: string,
  endDate?: string,
): Promise<
  Array<{
    product_id: string
    product_name: string
    total_sales: number
    total_margin: number
    average_margin_percentage: number
    sales_count: number
  }>
> {
  const salesWithMargins = await fetchSalesWithMargins(startDate, endDate)

  const productMargins = salesWithMargins.reduce(
    (acc, sale) => {
      if (!acc[sale.product_id]) {
        acc[sale.product_id] = {
          product_id: sale.product_id,
          product_name: sale.product_name,
          total_sales: 0,
          total_margin: 0,
          margin_sum: 0,
          sales_count: 0,
        }
      }

      acc[sale.product_id].total_sales += sale.total
      acc[sale.product_id].total_margin += sale.gross_margin || 0
      acc[sale.product_id].margin_sum += sale.margin_percentage || 0
      acc[sale.product_id].sales_count += 1

      return acc
    },
    {} as Record<
      string,
      {
        product_id: string
        product_name: string
        total_sales: number
        total_margin: number
        margin_sum: number
        sales_count: number
      }
    >,
  )

  return Object.values(productMargins).map((product) => ({
    product_id: product.product_id,
    product_name: product.product_name,
    total_sales: product.total_sales,
    total_margin: product.total_margin,
    average_margin_percentage: product.sales_count > 0 ? product.margin_sum / product.sales_count : 0,
    sales_count: product.sales_count,
  }))
}
