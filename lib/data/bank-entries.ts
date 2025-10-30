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

export async function fetchBankEntries(page = 1, limit = 10) {
  noStore()
  const supabase = await createSupabaseServerClient()

  const offset = (page - 1) * limit

  // Get total count
  const { count } = await supabase.from("bank_entries").select("*", { count: "exact", head: true })

  // Get paginated data
  const { data, error } = await supabase
    .from("bank_entries")
    .select("*")
    .order("entry_date", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch bank entries.")
  }

  const totalPages = Math.ceil((count || 0) / limit)

  return {
    entries: data as BankEntry[],
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
  const { data, error } = await supabase.from("bank_entries").select("*").eq("id", id).single()

  if (error) {
    console.error("Database Error:", error)
    return null
  }

  return data as BankEntry | null
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
