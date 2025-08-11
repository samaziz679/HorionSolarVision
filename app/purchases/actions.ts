"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"

const FormSchema = z.object({
  id: z.string(),
  product_id: z.coerce.number().min(1, "Product is required."),
  supplier_id: z.coerce.number().min(1, "Supplier is required."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
  total_cost: z.coerce.number().min(0, "Total cost cannot be negative."),
  date: z.string().min(1, "Purchase date is required."),
})

const CreatePurchaseSchema = FormSchema.omit({ id: true })
const UpdatePurchaseSchema = FormSchema

export type State = {
  errors?: {
    product_id?: string[]
    supplier_id?: string[]
    quantity?: string[]
    total_cost?: string[]
    date?: string[]
  }
  message?: string | null
  success?: boolean
}

export async function createPurchase(prevState: State, formData: FormData) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const validatedFields = CreatePurchaseSchema.safeParse({
    product_id: formData.get("product_id"),
    supplier_id: formData.get("supplier_id"),
    quantity: formData.get("quantity"),
    total_cost: formData.get("total_cost"),
    date: formData.get("date"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to create purchase.",
      success: false,
    }
  }

  const supabase = createClient()
  const { error } = await supabase.from("purchases").insert({
    ...validatedFields.data,
    user_id: user.id,
  })

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to create purchase.", success: false }
  }

  revalidatePath("/purchases")
  redirect("/purchases")
}

export async function updatePurchase(id: number, prevState: State, formData: FormData) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const validatedFields = UpdatePurchaseSchema.safeParse({
    id: id.toString(),
    product_id: formData.get("product_id"),
    supplier_id: formData.get("supplier_id"),
    quantity: formData.get("quantity"),
    total_cost: formData.get("total_cost"),
    date: formData.get("date"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to update purchase.",
      success: false,
    }
  }

  const { product_id, supplier_id, quantity, total_cost, date } = validatedFields.data
  const supabase = createClient()

  const { error } = await supabase
    .from("purchases")
    .update({ product_id, supplier_id, quantity, total_cost, date })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to update purchase.", success: false }
  }

  revalidatePath("/purchases")
  revalidatePath(`/purchases/${id}/edit`)
  redirect("/purchases")
}

export async function deletePurchase(id: number) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const supabase = createClient()
  const { error } = await supabase.from("purchases").delete().eq("id", id).eq("user_id", user.id)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to delete purchase.", success: false }
  }

  revalidatePath("/purchases")
  return { message: "Purchase deleted successfully.", success: true }
}
