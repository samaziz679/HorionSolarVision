"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"

const FormSchema = z.object({
  id: z.string(),
  product_id: z.string().min(1, "Product is required."),
  supplier_id: z.string().min(1, "Supplier is required."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
  unit_price: z.coerce.number().min(0, "Unit price cannot be negative."),
  total: z.coerce.number().min(0, "Total cannot be negative."),
  purchase_date: z.string().min(1, "Purchase date is required."),
})

const CreatePurchaseSchema = FormSchema.omit({ id: true })
const UpdatePurchaseSchema = FormSchema

export type State = {
  errors?: {
    product_id?: string[]
    supplier_id?: string[]
    quantity?: string[]
    unit_price?: string[]
    total?: string[]
    purchase_date?: string[]
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
    unit_price: formData.get("unit_price"),
    total: formData.get("total"),
    purchase_date: formData.get("purchase_date"),
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
    created_by: user.id,
  })

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to create purchase.", success: false }
  }

  revalidatePath("/purchases")
  redirect("/purchases")
}

export async function updatePurchase(id: string, prevState: State, formData: FormData) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const validatedFields = UpdatePurchaseSchema.safeParse({
    id: id,
    product_id: formData.get("product_id"),
    supplier_id: formData.get("supplier_id"),
    quantity: formData.get("quantity"),
    unit_price: formData.get("unit_price"),
    total: formData.get("total"),
    purchase_date: formData.get("purchase_date"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to update purchase.",
      success: false,
    }
  }

  const { product_id, supplier_id, quantity, unit_price, total, purchase_date } = validatedFields.data
  const supabase = createClient()

  const { error } = await supabase
    .from("purchases")
    .update({ product_id, supplier_id, quantity, unit_price, total, purchase_date })
    .eq("id", id)
    .eq("created_by", user.id)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to update purchase.", success: false }
  }

  revalidatePath("/purchases")
  revalidatePath(`/purchases/${id}/edit`)
  redirect("/purchases")
}

export async function deletePurchase(id: string) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const supabase = createClient()
  const { error } = await supabase.from("purchases").delete().eq("id", id).eq("created_by", user.id)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to delete purchase.", success: false }
  }

  revalidatePath("/purchases")
  return { message: "Purchase deleted successfully.", success: true }
}
