"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const FormSchema = z.object({
  id: z.string(),
  supplier_id: z.string({ required_error: "Supplier is required." }),
  purchase_date: z.string({ required_error: "Purchase date is required." }),
  items: z
    .array(
      z.object({
        product_id: z.string(),
        quantity: z.coerce.number().gt(0, "Quantity must be greater than 0."),
        price: z.coerce.number().gt(0, "Price must be greater than 0."),
      }),
    )
    .min(1, "At least one item is required."),
})

const CreatePurchase = FormSchema.omit({ id: true })
const UpdatePurchase = FormSchema

export type State = {
  errors?: {
    supplier_id?: string[]
    purchase_date?: string[]
    items?: string
  }
  message?: string | null
}

export async function createPurchase(prevState: State, formData: FormData) {
  const supabase = createClient()

  const items = JSON.parse(formData.get("items") as string)
  const validatedFields = CreatePurchase.safeParse({
    supplier_id: formData.get("supplier_id"),
    purchase_date: formData.get("purchase_date"),
    items: items,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Failed to create purchase. Please check the fields.",
    }
  }

  const { supplier_id, purchase_date, items: purchaseItems } = validatedFields.data
  const total_amount = purchaseItems.reduce((acc, item) => acc + item.quantity * item.price, 0)

  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .insert({ supplier_id, purchase_date, total_amount })
    .select()
    .single()

  if (purchaseError) {
    return { message: "Database Error: Failed to create purchase." }
  }

  const purchase_items_to_insert = purchaseItems.map((item) => ({
    purchase_id: purchase.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
  }))

  const { error: itemsError } = await supabase.from("purchase_items").insert(purchase_items_to_insert)

  if (itemsError) {
    return { message: "Database Error: Failed to create purchase items." }
  }

  revalidatePath("/purchases")
  return { message: "Purchase created successfully." }
}

export async function updatePurchase(id: string, prevState: State, formData: FormData) {
  const supabase = createClient()

  const items = JSON.parse(formData.get("items") as string)
  const validatedFields = UpdatePurchase.safeParse({
    id: id,
    supplier_id: formData.get("supplier_id"),
    purchase_date: formData.get("purchase_date"),
    items: items,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Failed to update purchase. Please check the fields.",
    }
  }

  const { supplier_id, purchase_date, items: purchaseItems } = validatedFields.data
  const total_amount = purchaseItems.reduce((acc, item) => acc + item.quantity * item.price, 0)

  const { error: purchaseError } = await supabase
    .from("purchases")
    .update({ supplier_id, purchase_date, total_amount })
    .eq("id", id)

  if (purchaseError) {
    return { message: "Database Error: Failed to update purchase." }
  }

  // This is a simplified update. A real app would handle item updates more granularly.
  await supabase.from("purchase_items").delete().eq("purchase_id", id)

  const purchase_items_to_insert = purchaseItems.map((item) => ({
    purchase_id: id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
  }))

  const { error: itemsError } = await supabase.from("purchase_items").insert(purchase_items_to_insert)

  if (itemsError) {
    return { message: "Database Error: Failed to update purchase items." }
  }

  revalidatePath("/purchases")
  revalidatePath(`/purchases/${id}/edit`)
  return { message: "Purchase updated successfully." }
}

export async function deletePurchase(id: string) {
  const supabase = createClient()

  // First delete related purchase items due to foreign key constraints
  const { error: itemsError } = await supabase.from("purchase_items").delete().eq("purchase_id", id)
  if (itemsError) {
    return { message: "Database Error: Failed to delete purchase items." }
  }

  const { error: purchaseError } = await supabase.from("purchases").delete().eq("id", id)
  if (purchaseError) {
    return { message: "Database Error: Failed to delete purchase." }
  }

  revalidatePath("/purchases")
  return { message: "Purchase deleted successfully." }
}
