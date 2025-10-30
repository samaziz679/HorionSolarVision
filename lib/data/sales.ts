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
  reconciled_amount?: number
  bank_entries?: Array<{
    id: string
    entry_date: string
    amount: number
    description: string
  }>
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
      clients!sales_client_id_fkey (id, name),
      reconciliations:bank_sales_reconciliation (
        reconciled_amount
      )
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
    reconciled_amount: sale.reconciliations?.reduce((sum, rec) => sum + (rec.reconciled_amount || 0), 0) || 0,
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
      products (*),
      reconciliations:bank_sales_reconciliation (
        reconciled_amount,
        bank_entries:bank_entry_id (
          id,
          entry_date,
          amount,
          description
        )
      )
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

  const { data: salesData, error: salesError } = await supabase
    .from("sales")
    .select(`
      id,
      sale_date,
      total,
      clients!sales_client_id_fkey (name),
      reconciliations:bank_sales_reconciliation (
        reconciled_amount
      )
    `)
    .order("sale_date", { ascending: false })

  if (salesError) {
    console.error("Database Error:", salesError)
    throw new Error("Failed to fetch sales.")
  }

  const unreconciledSales = salesData.filter((sale: any) => {
    const totalReconciled =
      sale.reconciliations?.reduce((sum: number, rec: any) => sum + (rec.reconciled_amount || 0), 0) || 0
    return totalReconciled < sale.total
  })

  return unreconciledSales.map((sale: any) => ({
    id: sale.id,
    sale_date: sale.sale_date,
    total: sale.total,
    client_name: sale.clients?.name || "N/A",
    reconciled_amount:
      sale.reconciliations?.reduce((sum: number, rec: any) => sum + (rec.reconciled_amount || 0), 0) || 0,
  }))
}

export async function getSaleReconciliationStatus(saleId: string) {
  noStore()
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("bank_sales_reconciliation")
    .select(`
      id,
      reconciled_amount,
      bank_entries:bank_entry_id (
        id,
        entry_date,
        amount,
        description
      )
    `)
    .eq("sale_id", saleId)

  if (error) {
    console.error("Database Error:", error)
    return null
  }

  return data
}
