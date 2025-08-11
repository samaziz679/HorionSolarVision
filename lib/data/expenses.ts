import { createSupabaseServerClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import type { Expense } from "@/lib/supabase/types"

export async function fetchExpenses() {
  noStore()
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("expenses").select("*").order("expense_date", { ascending: false })

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch expenses.")
  }

  return data as Expense[]
}

export async function fetchExpenseById(id: number) {
  noStore()
  if (isNaN(id)) return null

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("expenses").select("*").eq("id", id).single()

  if (error) {
    console.error("Database Error:", error)
    return null
  }

  return data as Expense | null
}
