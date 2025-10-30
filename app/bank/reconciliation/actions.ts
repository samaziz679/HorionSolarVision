"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getAuthUser } from "@/lib/auth"

export async function linkSalesToBankEntry(bankEntryId: string, salesData: Array<{ saleId: string; amount: number }>) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const supabase = await createClient()

  // Validate that amounts are positive
  if (salesData.some((sale) => sale.amount <= 0)) {
    return { message: "All amounts must be positive.", success: false }
  }

  // Get the bank entry to validate total amount
  const { data: bankEntry, error: bankError } = await supabase
    .from("bank_entries")
    .select("amount")
    .eq("id", bankEntryId)
    .single()

  if (bankError || !bankEntry) {
    return { message: "Bank entry not found.", success: false }
  }

  // Calculate total reconciled amount for this bank entry
  const { data: existingReconciliations } = await supabase
    .from("bank_sales_reconciliation")
    .select("reconciled_amount")
    .eq("bank_entry_id", bankEntryId)

  const existingTotal = existingReconciliations?.reduce((sum, rec) => sum + rec.reconciled_amount, 0) || 0
  const newTotal = salesData.reduce((sum, sale) => sum + sale.amount, 0)

  if (existingTotal + newTotal > bankEntry.amount) {
    return {
      message: `Total reconciled amount (${existingTotal + newTotal}) exceeds bank entry amount (${bankEntry.amount}).`,
      success: false,
    }
  }

  // Insert reconciliation records
  const reconciliations = salesData.map((sale) => ({
    bank_entry_id: bankEntryId,
    sale_id: sale.saleId,
    reconciled_amount: sale.amount,
    created_by: user.id,
  }))

  const { error: insertError } = await supabase.from("bank_sales_reconciliation").insert(reconciliations)

  if (insertError) {
    console.error("Database Error:", insertError)
    return { message: "Database Error: Failed to link sales to bank entry.", success: false }
  }

  revalidatePath("/bank/reconciliation")
  revalidatePath("/bank")
  revalidatePath("/sales")
  return { message: "Sales linked to bank entry successfully.", success: true }
}

export async function unlinkSaleFromBankEntry(reconciliationId: string) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const supabase = await createClient()

  const { error } = await supabase.from("bank_sales_reconciliation").delete().eq("id", reconciliationId)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to unlink sale from bank entry.", success: false }
  }

  revalidatePath("/bank/reconciliation")
  revalidatePath("/bank")
  revalidatePath("/sales")
  return { message: "Sale unlinked from bank entry successfully.", success: true }
}
