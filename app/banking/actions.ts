"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { redirect } from "next/navigation"

const FormSchema = z.object({
  id: z.string(),
  account_name: z.string().min(1, "Account name is required."),
  bank_name: z.string().min(1, "Bank name is required."),
  account_number: z.string().min(1, "Account number is required."),
  balance: z.coerce.number().min(0, "Balance must be a positive number."),
})

const CreateBankAccount = FormSchema.omit({ id: true })
const UpdateBankAccount = FormSchema.omit({ id: true, balance: true }) // Balance updates via transactions, not direct edit

export type State = {
  errors?: {
    account_name?: string[]
    bank_name?: string[]
    account_number?: string[]
    balance?: string[]
  }
  message?: string | null
  success?: boolean
}

export async function createBankAccount(prevState: State, formData: FormData) {
  const supabase = createClient()
  const validatedFields = CreateBankAccount.safeParse({
    account_name: formData.get("account_name"),
    bank_name: formData.get("bank_name"),
    account_number: formData.get("account_number"),
    balance: formData.get("balance"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Failed to create bank account. Please check the fields.",
      success: false,
    }
  }

  const { error } = await supabase.from("banking").insert(validatedFields.data)

  if (error) {
    console.error(error)
    return { message: "Database Error: Failed to create bank account.", success: false }
  }

  revalidatePath("/banking")
  redirect("/banking")
}

export async function updateBankAccount(id: string, prevState: State, formData: FormData) {
  const supabase = createClient()
  const validatedFields = UpdateBankAccount.safeParse({
    account_name: formData.get("account_name"),
    bank_name: formData.get("bank_name"),
    account_number: formData.get("account_number"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Failed to update bank account. Please check the fields.",
      success: false,
    }
  }

  const { error } = await supabase.from("banking").update(validatedFields.data).eq("id", id)

  if (error) {
    console.error(error)
    return { message: "Database Error: Failed to update bank account.", success: false }
  }

  revalidatePath("/banking")
  revalidatePath(`/banking/${id}/edit`)
  redirect("/banking")
}

export async function deleteBankAccount(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("banking").delete().eq("id", id)

  if (error) {
    return { message: "Database Error: Failed to delete bank account." }
  }

  revalidatePath("/banking")
  return { message: "Bank account deleted successfully." }
}
