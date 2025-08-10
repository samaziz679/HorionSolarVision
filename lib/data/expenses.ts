import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export type Expense = {
  id: string
  amount: number
  category: string | null
  description: string | null
  date: string
  created_at: string
}

export async function fetchExpenses(): Promise<Expense[]> {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.from("expenses").select("*").order("date", { ascending: false })

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch expenses.")
  }

  return data || []
}

export async function fetchExpenseById(id: string): Promise<Expense | null> {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.from("expenses").select("*").eq("id", id).single()

  if (error) {
    console.error("Database Error:", error)
    return null
  }

  return data
}
