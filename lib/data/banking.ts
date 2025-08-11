import { createSupabaseServerClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import type { BankAccount } from "@/lib/supabase/types"

export async function fetchBankAccounts() {
  noStore()
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("banking").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch bank accounts.")
  }

  return data as BankAccount[]
}

export async function fetchBankAccountById(id: number) {
  noStore()
  if (isNaN(id)) return null

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("banking").select("*").eq("id", id).single()

  if (error) {
    console.error("Database Error:", error)
    return null
  }

  return data as BankAccount | null
}
