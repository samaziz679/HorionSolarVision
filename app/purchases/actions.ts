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

  const { product_id, supplier_id, quantity, unit_price, total, purchase_date } = validatedFields.data

  const supabase = createClient()

  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .insert({
      created_by: user.id,
      product_id,
      supplier_id,
      quantity,
      unit_price,
      total,
      purchase_date,
    })
    .select()
    .single()

  if (purchaseError) {
    console.error("Database Error:", purchaseError)
    return { message: "Database Error: Failed to create purchase.", success: false }
  }

  const { error: stockLotError } = await supabase.from("stock_lots").insert({
    product_id,
    purchase_id: purchase.id,
    quantity_received: quantity,
    quantity_available: quantity,
    unit_cost: unit_price,
    purchase_date,
    created_by: user.id,
  })

  if (stockLotError) {
    console.error("Stock Lot Error:", stockLotError)
    // If stock lot creation fails, we should ideally rollback the purchase
    // For now, we'll continue but log the error
    console.error("Warning: Purchase created but stock lot creation failed")
  }

  revalidatePath("/purchases")
  revalidatePath("/inventory")
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

  const { data: originalPurchase, error: fetchError } = await supabase
    .from("purchases")
    .select("*")
    .eq("id", id)
    .single()

  if (fetchError) {
    console.error("Database Error:", fetchError)
    return { message: "Database Error: Failed to fetch original purchase.", success: false }
  }

  const { error } = await supabase
    .from("purchases")
    .update({
      product_id,
      supplier_id,
      quantity,
      unit_price,
      total,
      purchase_date,
    })
    .eq("id", id)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to update purchase.", success: false }
  }

  if (originalPurchase.quantity !== quantity || originalPurchase.unit_price !== unit_price) {
    const quantityDifference = quantity - originalPurchase.quantity

    const { error: stockLotError } = await supabase
      .from("stock_lots")
      .update({
        quantity_received: quantity,
        quantity_available: supabase.raw(`quantity_available + ${quantityDifference}`),
        unit_cost: unit_price,
        purchase_date,
      })
      .eq("purchase_id", id)

    if (stockLotError) {
      console.error("Stock Lot Update Error:", stockLotError)
      console.error("Warning: Purchase updated but stock lot update failed")
    }
  }

  revalidatePath("/purchases")
  revalidatePath(`/purchases/${id}/edit`)
  revalidatePath("/inventory")
  redirect("/purchases")
}

export async function deletePurchase(id: string) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const supabase = createClient()

  const { data: stockLot, error: stockLotFetchError } = await supabase
    .from("stock_lots")
    .select("quantity_received, quantity_available")
    .eq("purchase_id", id)
    .single()

  if (stockLotFetchError && stockLotFetchError.code !== "PGRST116") {
    console.error("Database Error:", stockLotFetchError)
    return { message: "Database Error: Failed to check stock lot status.", success: false }
  }

  if (stockLot && stockLot.quantity_available < stockLot.quantity_received) {
    return {
      message: "Cannot delete purchase: Some items from this batch have already been sold.",
      success: false,
    }
  }

  const { error } = await supabase.from("purchases").delete().eq("id", id)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to delete purchase.", success: false }
  }

  revalidatePath("/purchases")
  revalidatePath("/inventory")
  return { message: "Purchase deleted successfully.", success: true }
}
