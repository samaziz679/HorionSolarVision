"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"

const FormSchema = z.object({
  id: z.string(),
  bank_name: z.string().min(1, "Bank name is required."),
  account_holder: z.string().min(1, "Account holder name is required."),
  account_number: z.string().min(1, "Account number is required."),
  branch_name: z.string().optional(),
  initial_balance: z.coerce.number().nonnegative("Initial balance cannot be negative."),
})

const CreateBankingSchema = FormSchema.omit({ id: true })
const UpdateBankingSchema = FormSchema.omit({ id: true })

export type State = {
  errors?: {
    bank_name?: string[]
    account_holder?: string[]
    account_number?: string[]
    branch_name?: string[]
    initial_balance?: string[]
  }
  message?: string | null
  success?: boolean
}

export async function createBankAccount(prevState: State, formData: FormData) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const validatedFields = CreateBankingSchema.safeParse({
    bank_name: formData.get("bank_name"),
    account_holder: formData.get("account_holder"),
    account_number: formData.get("account_number"),
    branch_name: formData.get("branch_name"),
    initial_balance: formData.get("initial_balance"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to create bank account.",
      success: false,
    }
  }

  const supabase = createClient()
  const { error } = await supabase.from("banking").insert({
    ...validatedFields.data,
    branch_name: validatedFields.data.branch_name || null,
    user_id: user.id,
  })

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to create bank account.", success: false }
  }

  revalidatePath("/banking")
  redirect("/banking")
}

export async function updateBankAccount(id: number, prevState: State, formData: FormData) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const validatedFields = UpdateBankingSchema.safeParse({
    bank_name: formData.get("bank_name"),
    account_holder: formData.get("account_holder"),
    account_number: formData.get("account_number"),
    branch_name: formData.get("branch_name"),
    initial_balance: formData.get("initial_balance"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to update bank account.",
      success: false,
    }
  }

  const { bank_name, account_holder, account_number, branch_name, initial_balance } = validatedFields.data
  const supabase = createClient()

  const { error } = await supabase
    .from("banking")
    .update({
      bank_name,
      account_holder,
      account_number,
      branch_name: branch_name || null,
      initial_balance,
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to update bank account.", success: false }
  }

  revalidatePath("/banking")
  revalidatePath(`/banking/${id}/edit`)
  redirect("/banking")
}

export async function deleteBankAccount(id: number) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const supabase = createClient()
  const { error } = await supabase.from("banking").delete().eq("id", id).eq("user_id", user.id)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to delete bank account.", success: false }
  }

  revalidatePath("/banking")
  return { message: "Bank account deleted successfully.", success: true }
}
