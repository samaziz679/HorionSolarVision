"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getAuthUser } from "@/lib/auth"

export async function linkBankEntryToSale(bankEntryId: string, saleId: string) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const supabase = await createClient()

  // Check if the bank entry is already linked
  const { data: existingEntry } = await supabase.from("bank_entries").select("sale_id").eq("id", bankEntryId).single()

  if (existingEntry?.sale_id) {
    return { message: "This bank entry is already linked to a sale.", success: false }
  }

  // Check if the sale is already linked to another bank entry
  const { data: existingSale } = await supabase.from("bank_entries").select("id").eq("sale_id", saleId).single()

  if (existingSale) {
    return { message: "This sale is already linked to another bank entry.", success: false }
  }

  // Link the bank entry to the sale
  const { error } = await supabase.from("bank_entries").update({ sale_id: saleId }).eq("id", bankEntryId)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to link bank entry to sale.", success: false }
  }

  revalidatePath("/bank/reconciliation")
  revalidatePath("/bank")
  revalidatePath("/sales")
  return { message: "Bank entry linked to sale successfully.", success: true }
}

export async function unlinkBankEntryFromSale(bankEntryId: string) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const supabase = await createClient()

  const { error } = await supabase.from("bank_entries").update({ sale_id: null }).eq("id", bankEntryId)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to unlink bank entry from sale.", success: false }
  }

  revalidatePath("/bank/reconciliation")
  revalidatePath("/bank")
  revalidatePath("/sales")
  return { message: "Bank entry unlinked from sale successfully.", success: true }
}
