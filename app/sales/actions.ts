"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"

const FormSchema = z.object({
  id: z.string(),
  product_id: z.string().min(1, "Product is required."),
  client_id: z.string().min(1, "Client is required."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
  price_plan: z.string().min(1, "Price plan is required."),
  unit_price: z.coerce.number().min(0, "Unit price cannot be negative."),
  sale_date: z.string().min(1, "Sale date is required."),
  notes: z.string().optional(),
})

const CreateSaleSchema = FormSchema.omit({ id: true })
const UpdateSaleSchema = FormSchema

export type State = {
  errors?: {
    product_id?: string[]
    client_id?: string[]
    quantity?: string[]
    price_plan?: string[]
    unit_price?: string[]
    sale_date?: string[]
    notes?: string[]
  }
  message?: string | null
  success?: boolean
}

export async function createSale(prevState: State, formData: FormData) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const validatedFields = CreateSaleSchema.safeParse({
    product_id: formData.get("product_id"),
    client_id: formData.get("client_id"),
    quantity: formData.get("quantity"),
    price_plan: formData.get("price_plan"),
    unit_price: formData.get("unit_price"),
    sale_date: formData.get("sale_date"),
    notes: formData.get("notes"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to create sale.",
      success: false,
    }
  }

  const total = validatedFields.data.quantity * validatedFields.data.unit_price
  const supabase = createClient()

  const { error } = await supabase.from("sales").insert({
    product_id: validatedFields.data.product_id,
    client_id: validatedFields.data.client_id,
    quantity: validatedFields.data.quantity,
    price_plan: validatedFields.data.price_plan,
    unit_price: validatedFields.data.unit_price,
    total: total,
    sale_date: validatedFields.data.sale_date,
    quantity_sold: validatedFields.data.quantity,
    total_price: total,
    created_by: user.id,
    notes: validatedFields.data.notes,
  })

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to create sale.", success: false }
  }

  revalidatePath("/sales")
  redirect("/sales")
}

export async function updateSale(id: string, prevState: State, formData: FormData) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const validatedFields = UpdateSaleSchema.safeParse({
    id: id,
    product_id: formData.get("product_id"),
    client_id: formData.get("client_id"),
    quantity: formData.get("quantity"),
    price_plan: formData.get("price_plan"),
    unit_price: formData.get("unit_price"),
    sale_date: formData.get("sale_date"),
    notes: formData.get("notes"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to update sale.",
      success: false,
    }
  }

  const total = validatedFields.data.quantity * validatedFields.data.unit_price
  const supabase = createClient()

  const { error } = await supabase
    .from("sales")
    .update({
      product_id: validatedFields.data.product_id,
      client_id: validatedFields.data.client_id,
      quantity: validatedFields.data.quantity,
      price_plan: validatedFields.data.price_plan,
      unit_price: validatedFields.data.unit_price,
      total: total,
      sale_date: validatedFields.data.sale_date,
      quantity_sold: validatedFields.data.quantity,
      total_price: total,
      notes: validatedFields.data.notes,
    })
    .eq("id", id)
    .eq("created_by", user.id)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to update sale.", success: false }
  }

  revalidatePath("/sales")
  revalidatePath(`/sales/${id}/edit`)
  redirect("/sales")
}

export async function deleteSale(id: string) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const supabase = createClient()

  const { error } = await supabase.from("sales").delete().eq("id", id).eq("created_by", user.id)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to delete sale.", success: false }
  }

  revalidatePath("/sales")
  return { message: "Sale deleted successfully.", success: true }
}
