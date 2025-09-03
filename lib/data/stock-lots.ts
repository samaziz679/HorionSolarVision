import { createClient } from "@/lib/supabase/server"

export interface StockLot {
  id: string
  product_id: string
  purchase_id: string | null
  lot_number: string
  quantity_received: number
  quantity_available: number
  unit_cost: number
  purchase_date: string
  expiry_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface ProductWithBatches {
  id: string
  name: string
  type: string
  unit: string
  prix_vente_detail_1: number
  prix_vente_detail_2: number
  prix_vente_gros: number
  image: string | null
  total_quantity: number
  batch_count: number
  oldest_batch_date: string | null
  newest_batch_date: string | null
  average_cost: number
  stock_status: "Critical" | "Low Stock" | "Normal"
  stock_lots: StockLot[]
}

export async function fetchProductsWithBatches(
  page = 1,
  limit = 10,
): Promise<{
  products: ProductWithBatches[]
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}> {
  const supabase = createClient()
  const offset = (page - 1) * limit

  // Get products with aggregated stock lot information
  const { data: products, error: productsError } = await supabase
    .from("current_stock_with_batches")
    .select("*")
    .range(offset, offset + limit - 1)

  if (productsError) {
    console.error("Error fetching products with batches:", productsError)
    throw new Error("Failed to fetch products with batches")
  }

  const productIds = products?.map((p) => p.id) || []

  // Only fetch stock lots if we have valid product IDs
  if (productIds.length === 0) {
    return {
      products: [],
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    }
  }

  const { data: stockLots, error: stockLotsError } = await supabase
    .from("stock_lots")
    .select("*")
    .in("product_id", productIds)
    .gt("quantity_available", 0)
    .order("purchase_date", { ascending: true })

  if (stockLotsError) {
    console.error("Error fetching stock lots:", stockLotsError)
    throw new Error("Failed to fetch stock lots")
  }

  // Group stock lots by product
  const stockLotsByProduct = (stockLots || []).reduce(
    (acc, lot) => {
      if (!acc[lot.product_id]) {
        acc[lot.product_id] = []
      }
      acc[lot.product_id].push(lot)
      return acc
    },
    {} as Record<string, StockLot[]>,
  )

  const productsWithBatches: ProductWithBatches[] = (products || []).map((product) => ({
    id: product.id,
    name: product.name,
    type: product.type || "Product",
    unit: product.unit || "pcs",
    prix_vente_detail_1: product.prix_vente_detail_1 || 0,
    prix_vente_detail_2: product.prix_vente_detail_2 || 0,
    prix_vente_gros: product.prix_vente_gros || 0,
    image: product.image || null,
    total_quantity: product.total_quantity || 0,
    batch_count: product.batch_count || 0,
    oldest_batch_date: product.oldest_batch_date,
    newest_batch_date: product.newest_batch_date,
    average_cost: product.average_cost || 0,
    stock_status:
      product.stock_status === "rupture_stock" || product.stock_status === "out_of_stock"
        ? "Critical"
        : product.stock_status === "stock_faible" || product.stock_status === "low_stock"
          ? "Low Stock"
          : "Normal",
    stock_lots: stockLotsByProduct[product.id] || [],
  }))

  // Get total count for pagination
  const { count, error: countError } = await supabase
    .from("current_stock_with_batches")
    .select("*", { count: "exact", head: true })

  if (countError) {
    console.error("Error counting products:", countError)
    throw new Error("Failed to count products")
  }

  const totalPages = Math.ceil((count || 0) / limit)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  return {
    products: productsWithBatches,
    totalPages,
    hasNextPage,
    hasPrevPage,
  }
}

export async function fetchStockLotsByProduct(productId: string): Promise<StockLot[]> {
  const supabase = createClient()

  const { data: stockLots, error } = await supabase
    .from("stock_lots")
    .select("*")
    .eq("product_id", productId)
    .gt("quantity_available", 0)
    .order("purchase_date", { ascending: true })

  if (error) {
    console.error("Error fetching stock lots for product:", error)
    throw new Error("Failed to fetch stock lots for product")
  }

  return stockLots || []
}

export async function fetchStockMovements(stockLotId?: string, limit = 50): Promise<any[]> {
  const supabase = createClient()

  let query = supabase
    .from("stock_movements")
    .select(`
      *,
      stock_lots (
        lot_number,
        products (name)
      )
    `)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (stockLotId) {
    query = query.eq("stock_lot_id", stockLotId)
  }

  const { data: movements, error } = await query

  if (error) {
    console.error("Error fetching stock movements:", error)
    throw new Error("Failed to fetch stock movements")
  }

  return movements || []
}
