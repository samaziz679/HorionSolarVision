"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const FormSchema = z.object({
  id: z.string(),
  account_name: z.string().min(1, "Account name is required."),
  bank_name: z.string().min(1, "Bank name is required."),
  account_number: z.string().min(1, "Account number is required."),
  initial_balance: z.coerce.number(),
})

const CreateBankAccount = FormSchema.omit({ id: true })
const UpdateBankAccount = FormSchema.omit({ initial_balance: true }) // Balance updates via transactions

export type State = {
  errors?: {
    account_name?: string[]
    bank_name?: string[]
    account_number?: string[]
    initial_balance?: string[]
  }
  message?: string | null
}

export async function createBankAccount(prevState: State, formData: FormData) {
  const supabase = createClient()
  const validatedFields = CreateBankAccount.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Failed to create bank account. Please check the fields.",
    }
  }

  const { error } = await supabase.from("bank_accounts").insert(validatedFields.data)

  if (error) {
    return { message: "Database Error: Failed to create bank account." }
  }

  revalidatePath("/banking")
  return { message: "Bank account created successfully." }
}

export async function updateBankAccount(id: string, prevState: State, formData: FormData) {
  const supabase = createClient()
  const validatedFields = UpdateBankAccount.safeParse({
    ...Object.fromEntries(formData.entries()),
    id,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Failed to update bank account. Please check the fields.",
    }
  }

  const { error } = await supabase.from("bank_accounts").update(validatedFields.data).eq("id", id)

  if (error) {
    return { message: "Database Error: Failed to update bank account." }
  }

  revalidatePath("/banking")
  revalidatePath(`/banking/${id}/edit`)
  return { message: "Bank account updated successfully." }
}

export async function deleteBankAccount(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("bank_accounts").delete().eq("id", id)

  if (error) {
    return { message: "Database Error: Failed to delete bank account." }
  }

  revalidatePath("/banking")
  return { message: "Bank account deleted successfully." }
}
