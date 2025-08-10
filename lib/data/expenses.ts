import "server-only"
import { unstable_noStore as noStore } from "next/cache"
import { getAdminClient } from "@/lib/supabase/admin"
import type { Expense } from "@/lib/supabase/types"

export async function fetchExpenses(): Promise<Expense[]> {
  noStore()
  const supabase = getAdminClient()
  const { data, error } = await supabase.from("expenses").select("*").order("date", { ascending: false })

  if (error) {
    console.error("Database Error (fetchExpenses):", error)
    throw new Error("Failed to fetch expenses.")
  }

  return (data ?? []) as Expense[]
}

export async function fetchExpenseById(id: string): Promise<Expense | null> {
  noStore()
  const supabase = getAdminClient()
  const { data, error } = await supabase.from("expenses").select("*").eq("id", id).single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    console.error("Database Error (fetchExpenseById):", error)
    throw new Error("Failed to fetch expense.")
  }

  return (data ?? null) as Expense | null
}
