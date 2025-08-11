"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"

const FormSchema = z.object({
  id: z.string(),
  description: z.string().optional(),
  amount: z.coerce.number().gt(0, "Amount must be greater than 0."),
  category: z.string().optional(),
  expense_date: z.string().min(1, "Expense date is required."),
})

const CreateExpenseSchema = FormSchema.omit({ id: true })
const UpdateExpenseSchema = FormSchema

export type State = {
  errors?: {
    description?: string[]
    amount?: string[]
    category?: string[]
    expense_date?: string[]
  }
  message?: string | null
  success?: boolean
}

export async function createExpense(prevState: State, formData: FormData) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const validatedFields = CreateExpenseSchema.safeParse({
    description: formData.get("description"),
    amount: formData.get("amount"),
    category: formData.get("category"),
    expense_date: formData.get("expense_date"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to create expense.",
      success: false,
    }
  }

  const supabase = createClient()
  const { error } = await supabase.from("expenses").insert({
    description: validatedFields.data.description || null,
    category: validatedFields.data.category || null,
    amount: validatedFields.data.amount,
    expense_date: validatedFields.data.expense_date,
    created_by: user.id,
  })

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to create expense.", success: false }
  }

  revalidatePath("/expenses")
  redirect("/expenses")
}

export async function updateExpense(id: string, prevState: State, formData: FormData) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const validatedFields = UpdateExpenseSchema.safeParse({
    id: id,
    description: formData.get("description"),
    amount: formData.get("amount"),
    category: formData.get("category"),
    expense_date: formData.get("expense_date"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to update expense.",
      success: false,
    }
  }

  const { description, amount, category, expense_date } = validatedFields.data
  const supabase = createClient()

  const { error } = await supabase
    .from("expenses")
    .update({
      description: description || null,
      amount,
      category: category || null,
      expense_date,
    })
    .eq("id", id)
    .eq("created_by", user.id)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to update expense.", success: false }
  }

  revalidatePath("/expenses")
  revalidatePath(`/expenses/${id}/edit`)
  redirect("/expenses")
}

export async function deleteExpense(id: string) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const supabase = createClient()
  const { error } = await supabase.from("expenses").delete().eq("id", id).eq("created_by", user.id)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to delete expense.", success: false }
  }

  revalidatePath("/expenses")
  return { message: "Expense deleted successfully.", success: true }
}
