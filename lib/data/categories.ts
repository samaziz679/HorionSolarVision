import { createClient } from "@/lib/supabase/server"

export interface ExpenseCategory {
  id: string
  name_fr: string
  name_en: string
  is_default: boolean
}

export async function fetchExpenseCategories(): Promise<ExpenseCategory[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("expense_categories")
    .select("*")
    .order("is_default", { ascending: false })
    .order("name_fr", { ascending: true })

  if (error) {
    console.error("Error fetching expense categories:", error)
    return []
  }

  return data || []
}

export async function createExpenseCategory(name_fr: string): Promise<ExpenseCategory | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("expense_categories")
    .insert([
      {
        name_fr,
        name_en: name_fr, // Use French name as English fallback
        is_default: false,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Error creating expense category:", error)
    return null
  }

  return data
}
