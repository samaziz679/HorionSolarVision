import { createSupabaseServerClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import type { SaleWithDetails } from "@/lib/supabase/types"

export interface SaleWithReconciliation {
  id: string
  sale_date: string
  total: number
  client_name: string
  is_reconciled: boolean
  bank_entry_id?: string | null
}

export async function fetchSales(page = 1, limit = 10) {
  noStore()
  const supabase = await createSupabaseServerClient()

  // Calculate offset for pagination
  const offset = (page - 1) * limit

  // Get total count for pagination info
  const { count } = await supabase.from("sales").select("*", { count: "exact", head: true })

  const { data, error } = await supabase
    .from("sales")
    .select(
      `
      id,
      sale_date,
      total,
      clients!sales_client_id_fkey (id, name)
    `,
    )
    .order("sale_date", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch sales.")
  }

  const totalPages = Math.ceil((count || 0) / limit)

  const salesData = data.map((sale) => ({
    id: sale.id,
    date: sale.sale_date,
    total_amount: sale.total,
    client_name: sale.clients?.name || "N/A",
  }))

  return {
    sales: salesData,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    totalCount: count || 0,
  }
}

export async function fetchSaleById(id: string) {
  noStore()
  if (!id) return null

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("sales")
    .select(
      `
      *,
      clients (*),
      products (*)
    `,
    )
    .eq("id", id)
    .single()

  if (error) {
    console.error("Database Error:", error)
    return null
  }

  return data as SaleWithDetails | null
}

export async function fetchUnreconciledSales() {
  noStore()
  const supabase = await createSupabaseServerClient()

  // Get all sales
  const { data: salesData, error: salesError } = await supabase
    .from("sales")
    .select(`
      id,
      sale_date,
      total,
      clients!sales_client_id_fkey (name)
    `)
    .order("sale_date", { ascending: false })

  if (salesError) {
    console.error("Database Error:", salesError)
    throw new Error("Failed to fetch sales.")
  }

  // Get all bank entries with sale_id
  const { data: bankEntries, error: bankError } = await supabase
    .from("bank_entries")
    .select("sale_id")
    .not("sale_id", "is", null)

  if (bankError) {
    console.error("Database Error:", bankError)
    throw new Error("Failed to fetch bank entries.")
  }

  // Filter out sales that are already linked to bank entries
  const reconciledSaleIds = new Set(bankEntries.map((entry) => entry.sale_id))
  const unreconciledSales = salesData.filter((sale) => !reconciledSaleIds.has(sale.id))

  return unreconciledSales.map((sale) => ({
    id: sale.id,
    sale_date: sale.sale_date,
    total: sale.total,
    client_name: sale.clients?.name || "N/A",
  }))
}

export async function getSaleReconciliationStatus(saleId: string) {
  noStore()
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("bank_entries")
    .select("id, entry_date, amount")
    .eq("sale_id", saleId)
    .single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "not found" error
    console.error("Database Error:", error)
    return null
  }

  return data
}
