"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"

const FormSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Description is required."),
  amount: z.coerce.number().gt(0, "Amount must be greater than 0."),
  category: z.string().min(1, "Category is required."),
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
  console.log("[v0] createExpense called")
  const user = await getAuthUser()
  if (!user) {
    console.log("[v0] No user found")
    return { message: "Authentication error. Please sign in.", success: false }
  }
  console.log("[v0] User authenticated:", user.id)

  const validatedFields = CreateExpenseSchema.safeParse({
    description: formData.get("description"),
    amount: formData.get("amount"),
    category: formData.get("category"),
    expense_date: formData.get("expense_date"),
  })

  console.log("[v0] Form data:", {
    description: formData.get("description"),
    amount: formData.get("amount"),
    category: formData.get("category"),
    expense_date: formData.get("expense_date"),
  })

  if (!validatedFields.success) {
    console.log("[v0] Validation failed:", validatedFields.error)
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to create expense.",
      success: false,
    }
  }
  console.log("[v0] Validation successful:", validatedFields.data)

  const supabase = createClient()

  // Get the category name from the ID
  const { data: categoryData } = await supabase
    .from("expense_categories")
    .select("name_fr")
    .eq("id", validatedFields.data.category)
    .single()

  console.log("[v0] Category data:", categoryData)

  if (!categoryData) {
    console.log("[v0] No category found for ID:", validatedFields.data.category)
    return { message: "Invalid category selected.", success: false }
  }

  const categoryEnumMap: Record<string, string> = {
    Assurance: "autre",
    Autre: "autre",
    Carburant: "carburant",
    Équipement: "autre",
    "Fournitures de Bureau": "autre",
    "Frais de livraison": "autre",
    "Frais internet": "internet",
    "Loyer boutique": "loyer",
    Maintenance: "maintenance",
    Marketing: "autre",
    "Produits en vente": "autre",
    "Salaire vendeur": "salaire",
    "Services Professionnels": "autre",
    "Services Publics": "electricite",
    Transport: "autre",
  }

  const enumValue = categoryEnumMap[categoryData.name_fr] || categoryData.name_fr.toLowerCase().replace(/\s+/g, "_")
  console.log("[v0] Enum value:", enumValue)

  const insertData = {
    description: validatedFields.data.description,
    category: enumValue,
    amount: validatedFields.data.amount,
    expense_date: validatedFields.data.expense_date,
    created_by: user.id,
  }
  console.log("[v0] Insert data:", insertData)

  const { error } = await supabase.from("expenses").insert(insertData)

  if (error) {
    console.error("[v0] Database Error:", error)
    return { message: "Database Error: Failed to create expense.", success: false }
  }

  console.log("[v0] Expense created successfully")
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

  const { description, amount, expense_date } = validatedFields.data
  const supabase = createClient()

  const { data: categoryData } = await supabase
    .from("expense_categories")
    .select("name_fr")
    .eq("id", validatedFields.data.category)
    .single()

  if (!categoryData) {
    return { message: "Invalid category selected.", success: false }
  }

  const categoryEnumMap: Record<string, string> = {
    Assurance: "autre",
    Autre: "autre",
    Carburant: "carburant",
    Équipement: "autre",
    "Fournitures de Bureau": "autre",
    "Frais de livraison": "autre",
    "Frais internet": "internet",
    "Loyer boutique": "loyer",
    Maintenance: "maintenance",
    Marketing: "autre",
    "Produits en vente": "autre",
    "Salaire vendeur": "salaire",
    "Services Professionnels": "autre",
    "Services Publics": "electricite",
    Transport: "autre",
  }

  const enumValue = categoryEnumMap[categoryData.name_fr] || categoryData.name_fr.toLowerCase().replace(/\s+/g, "_")

  const { error } = await supabase
    .from("expenses")
    .update({
      description,
      amount,
      category: enumValue,
      expense_date,
    })
    .eq("id", id)

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
  const { error } = await supabase.from("expenses").delete().eq("id", id)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to delete expense.", success: false }
  }

  revalidatePath("/expenses")
  return { message: "Expense deleted successfully.", success: true }
}
