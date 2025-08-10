import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export type BankingAccount = {
  id: string
  bank_name: string
  account_name: string
  account_number: string
  balance: number
  created_at: string
}

export async function fetchBankingAccounts(): Promise<BankingAccount[]> {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.from("banking_accounts").select("*").order("bank_name", { ascending: true })

  if (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch banking accounts.")
  }

  return data || []
}

export async function fetchBankingAccountById(id: string): Promise<BankingAccount | null> {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.from("banking_accounts").select("*").eq("id", id).single()

  if (error) {
    console.error("Database Error:", error)
    return null
  }

  return data
}
