import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export async function fetchExpenses() {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.from("expenses").select("*").order("expense_date", { ascending: false })

  if (error) {
    console.error("Error fetching expenses:", error)
    throw new Error("Failed to fetch expenses.")
  }

  return data
}

export async function fetchExpenseById(id: string) {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.from("expenses").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching expense by ID:", error)
    return null
  }

  return data
}
