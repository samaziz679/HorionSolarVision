import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import type { Banking } from "../supabase/types"

export async function fetchBankAccounts() {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.from("banking").select("*")

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch bank accounts.")
  }

  return data
}

export async function fetchBankAccountById(id: string): Promise<Banking | null> {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.from("banking").select("*").eq("id", id).single()

  if (error) {
    console.error("Database Error:", error)
    // Don't throw for not found, just return null
    if (error.code === "PGRST116") {
      return null
    }
    throw new Error("Failed to fetch bank account.")
  }

  return data
}
