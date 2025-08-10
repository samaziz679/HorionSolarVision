"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const FormSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Description is required."),
  amount: z.coerce.number().gt(0, "Amount must be greater than 0."),
  expense_date: z.string({ required_error: "Expense date is required." }),
  category: z.string().min(1, "Category is required."),
})

const CreateExpense = FormSchema.omit({ id: true })
const UpdateExpense = FormSchema

export type State = {
  errors?: {
    description?: string[]
    amount?: string[]
    expense_date?: string[]
    category?: string[]
  }
  message?: string | null
}

export async function createExpense(prevState: State, formData: FormData) {
  const supabase = createClient()
  const validatedFields = CreateExpense.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Failed to create expense. Please check the fields.",
    }
  }

  const { error } = await supabase.from("expenses").insert(validatedFields.data)

  if (error) {
    return { message: "Database Error: Failed to create expense." }
  }

  revalidatePath("/expenses")
  return { message: "Expense created successfully." }
}

export async function updateExpense(id: string, prevState: State, formData: FormData) {
  const supabase = createClient()
  const validatedFields = UpdateExpense.safeParse({
    ...Object.fromEntries(formData.entries()),
    id,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Failed to update expense. Please check the fields.",
    }
  }

  const { error } = await supabase.from("expenses").update(validatedFields.data).eq("id", id)

  if (error) {
    return { message: "Database Error: Failed to update expense." }
  }

  revalidatePath("/expenses")
  revalidatePath(`/expenses/${id}/edit`)
  return { message: "Expense updated successfully." }
}

export async function deleteExpense(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("expenses").delete().eq("id", id)

  if (error) {
    return { message: "Database Error: Failed to delete expense." }
  }

  revalidatePath("/expenses")
  return { message: "Expense deleted successfully." }
}
