import "server-only"
import { unstable_noStore as noStore } from "next/cache"
import { getAdminClient } from "@/lib/supabase/admin"
import type { BankingAccount } from "@/lib/supabase/types"

export async function fetchBankingAccounts(): Promise<BankingAccount[]> {
  noStore()
  const supabase = getAdminClient()
  const { data, error } = await supabase.from("banking_accounts").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Database Error (fetchBankingAccounts):", error)
    throw new Error("Failed to fetch banking accounts.")
  }

  return (data ?? []) as BankingAccount[]
}

export async function fetchBankingAccountById(id: string): Promise<BankingAccount | null> {
  noStore()
  const supabase = getAdminClient()
  const { data, error } = await supabase.from("banking_accounts").select("*").eq("id", id).single()

  if (error) {
    // It's not an error if no row is found
    if (error.code === "PGRST116") {
      return null
    }
    console.error("Database Error (fetchBankingAccountById):", error)
    throw new Error("Failed to fetch banking account.")
  }

  return (data ?? null) as BankingAccount | null
}
