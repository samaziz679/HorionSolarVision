import { createSupabaseServerClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import type { Expense } from "@/lib/supabase/types"

export async function fetchExpenses(page = 1, limit = 10) {
  noStore()
  const supabase = createSupabaseServerClient()

  const offset = (page - 1) * limit

  // Get total count
  const { count } = await supabase.from("expenses").select("*", { count: "exact", head: true })

  // Get paginated data
  const { data, error } = await supabase
    .from("expenses")
    .select(`
      *
    `)
    .order("expense_date", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch expenses.")
  }

  const totalPages = Math.ceil((count || 0) / limit)

  return {
    expenses: data as Expense[],
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    totalCount: count || 0,
  }
}

export async function fetchExpenseById(id: string) {
  noStore()
  if (!id) return null

  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.from("expenses").select(`*`).eq("id", id).single()

  if (error) {
    console.error("Database Error:", error)
    return null
  }

  return data as Expense | null
}
