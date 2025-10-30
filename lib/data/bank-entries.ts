import { createSupabaseServerClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export interface BankEntry {
  id: string
  account_type: string
  description: string
  amount: number
  entry_date: string
  created_by: string | null
  notes: string | null
}

export interface BankSalesReconciliation {
  id: string
  bank_entry_id: string
  sale_id: string
  reconciled_amount: number
  created_at: string
  created_by: string | null
  notes: string | null
}

export interface BankEntryWithSales extends BankEntry {
  reconciliations?: Array<{
    id: string
    reconciled_amount: number
    sales: {
      id: string
      sale_date: string
      total: number
      clients?: {
        name: string
      }
    }
  }>
  total_reconciled?: number
}

export async function fetchBankEntries(page = 1, limit = 10) {
  noStore()
  const supabase = await createSupabaseServerClient()

  const offset = (page - 1) * limit

  const { count } = await supabase.from("bank_entries").select("*", { count: "exact", head: true })

  const { data, error } = await supabase
    .from("bank_entries")
    .select(`
      *,
      reconciliations:bank_sales_reconciliation (
        id,
        reconciled_amount,
        sales (
          id,
          sale_date,
          total,
          clients!sales_client_id_fkey (name)
        )
      )
    `)
    .order("entry_date", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch bank entries.")
  }

  const entriesWithTotals = data.map((entry: any) => ({
    ...entry,
    total_reconciled:
      entry.reconciliations?.reduce((sum: number, rec: any) => sum + (rec.reconciled_amount || 0), 0) || 0,
  }))

  const totalPages = Math.ceil((count || 0) / limit)

  return {
    entries: entriesWithTotals as BankEntryWithSales[],
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    totalCount: count || 0,
  }
}

export async function fetchBankEntryById(id: string) {
  noStore()
  if (!id) return null

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("bank_entries")
    .select(`
      *,
      reconciliations:bank_sales_reconciliation (
        id,
        reconciled_amount,
        sales (
          id,
          sale_date,
          total,
          clients!sales_client_id_fkey (name)
        )
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Database Error:", error)
    return null
  }

  return {
    ...data,
    total_reconciled:
      data.reconciliations?.reduce((sum: number, rec: any) => sum + (rec.reconciled_amount || 0), 0) || 0,
  } as BankEntryWithSales | null
}

export async function getBankSummary(startDate?: string, endDate?: string) {
  noStore()
  const supabase = await createSupabaseServerClient()

  let query = supabase.from("bank_entries").select("amount, account_type, entry_date")

  if (startDate) {
    query = query.gte("entry_date", startDate)
  }
  if (endDate) {
    query = query.lte("entry_date", endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error("Database Error:", error)
    return { totalIn: 0, totalOut: 0, balance: 0 }
  }

  const totalIn =
    data?.filter((entry) => entry.account_type === "in").reduce((sum, entry) => sum + (entry.amount || 0), 0) || 0

  const totalOut =
    data?.filter((entry) => entry.account_type === "out").reduce((sum, entry) => sum + (entry.amount || 0), 0) || 0

  return {
    totalIn,
    totalOut,
    balance: totalIn - totalOut,
  }
}

export async function fetchUnreconciledBankInflows() {
  noStore()
  const supabase = await createSupabaseServerClient()

  const { data: allInflows, error: inflowsError } = await supabase
    .from("bank_entries")
    .select(`
      *,
      reconciliations:bank_sales_reconciliation (
        reconciled_amount
      )
    `)
    .eq("account_type", "in")
    .order("entry_date", { ascending: false })

  if (inflowsError) {
    console.error("Database Error:", inflowsError)
    throw new Error("Failed to fetch unreconciled bank inflows.")
  }

  const unreconciledInflows = allInflows.filter((entry: any) => {
    const totalReconciled =
      entry.reconciliations?.reduce((sum: number, rec: any) => sum + (rec.reconciled_amount || 0), 0) || 0
    return totalReconciled < entry.amount
  })

  return unreconciledInflows.map((entry: any) => ({
    ...entry,
    total_reconciled:
      entry.reconciliations?.reduce((sum: number, rec: any) => sum + (rec.reconciled_amount || 0), 0) || 0,
  })) as BankEntryWithSales[]
}

export async function fetchReconciledEntries(page = 1, limit = 10) {
  noStore()
  const supabase = await createSupabaseServerClient()
  const offset = (page - 1) * limit

  const { data: reconciledIds } = await supabase.from("bank_sales_reconciliation").select("bank_entry_id")

  if (!reconciledIds || reconciledIds.length === 0) {
    return {
      entries: [],
      totalPages: 0,
      currentPage: page,
      totalCount: 0,
    }
  }

  const uniqueIds = [...new Set(reconciledIds.map((r) => r.bank_entry_id))]

  const { data, error } = await supabase
    .from("bank_entries")
    .select(`
      *,
      reconciliations:bank_sales_reconciliation (
        id,
        reconciled_amount,
        sales (
          id,
          sale_date,
          total,
          clients!sales_client_id_fkey (name)
        )
      )
    `)
    .in("id", uniqueIds)
    .order("entry_date", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch reconciled entries.")
  }

  const entriesWithTotals = data.map((entry: any) => ({
    ...entry,
    total_reconciled:
      entry.reconciliations?.reduce((sum: number, rec: any) => sum + (rec.reconciled_amount || 0), 0) || 0,
  }))

  const totalPages = Math.ceil(uniqueIds.length / limit)

  return {
    entries: entriesWithTotals as BankEntryWithSales[],
    totalPages,
    currentPage: page,
    totalCount: uniqueIds.length,
  }
}
