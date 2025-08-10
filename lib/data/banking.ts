import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export async function fetchBankAccounts() {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.from("bank_accounts").select("*").order("account_name", { ascending: true })

  if (error) {
    console.error("Error fetching bank accounts:", error)
    throw new Error("Failed to fetch bank accounts.")
  }

  return data
}

export async function fetchBankAccountById(id: string) {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.from("bank_accounts").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching bank account by ID:", error)
    return null
  }

  return data
}
