"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"

const FormSchema = z.object({
  id: z.string(),
  account_type: z.enum(["in", "out"], {
    errorMap: () => ({ message: "Please select In or Out." }),
  }),
  description: z.string().min(1, "Description is required."),
  amount: z.coerce.number().gt(0, "Amount must be greater than 0."),
  entry_date: z.string().min(1, "Entry date is required."),
  notes: z.string().optional(),
})

const CreateBankEntrySchema = FormSchema.omit({ id: true })
const UpdateBankEntrySchema = FormSchema

export type State = {
  errors?: {
    account_type?: string[]
    description?: string[]
    amount?: string[]
    entry_date?: string[]
    notes?: string[]
  }
  message?: string | null
  success?: boolean
}

export async function createBankEntry(prevState: State, formData: FormData) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const validatedFields = CreateBankEntrySchema.safeParse({
    account_type: formData.get("account_type"),
    description: formData.get("description"),
    amount: formData.get("amount"),
    entry_date: formData.get("entry_date"),
    notes: formData.get("notes"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to create bank entry.",
      success: false,
    }
  }

  const supabase = await createClient()

  const insertData = {
    account_type: validatedFields.data.account_type,
    description: validatedFields.data.description,
    amount: validatedFields.data.amount,
    entry_date: validatedFields.data.entry_date,
    notes: validatedFields.data.notes || null,
    created_by: user.id,
  }

  const { error } = await supabase.from("bank_entries").insert(insertData)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to create bank entry.", success: false }
  }

  revalidatePath("/bank")
  revalidatePath("/reports")
  redirect("/bank")
}

export async function updateBankEntry(id: string, prevState: State, formData: FormData) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const validatedFields = UpdateBankEntrySchema.safeParse({
    id: id,
    account_type: formData.get("account_type"),
    description: formData.get("description"),
    amount: formData.get("amount"),
    entry_date: formData.get("entry_date"),
    notes: formData.get("notes"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to update bank entry.",
      success: false,
    }
  }

  const supabase = await createClient()

  const updateData = {
    account_type: validatedFields.data.account_type,
    description: validatedFields.data.description,
    amount: validatedFields.data.amount,
    entry_date: validatedFields.data.entry_date,
    notes: validatedFields.data.notes || null,
  }

  const { error } = await supabase.from("bank_entries").update(updateData).eq("id", id)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to update bank entry.", success: false }
  }

  revalidatePath("/bank")
  revalidatePath("/reports")
  revalidatePath(`/bank/${id}/edit`)
  redirect("/bank")
}

export async function deleteBankEntry(id: string) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("bank_entries").delete().eq("id", id)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to delete bank entry.", success: false }
  }

  revalidatePath("/bank")
  revalidatePath("/reports")
  return { message: "Bank entry deleted successfully.", success: true }
}
