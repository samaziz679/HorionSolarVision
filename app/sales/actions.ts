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

async function deductStockFIFO(
  supabase: any,
  productId: string,
  quantityToDeduct: number,
  saleId: string,
  userId: string,
): Promise<{ success: boolean; message?: string }> {
  // Get available stock lots for the product, ordered by purchase date (FIFO)
  const { data: stockLots, error: fetchError } = await supabase
    .from("stock_lots")
    .select("*")
    .eq("product_id", productId)
    .gt("quantity_available", 0)
    .order("purchase_date", { ascending: true })

  if (fetchError) {
    console.error("Error fetching stock lots:", fetchError)
    return { success: false, message: "Failed to fetch stock lots" }
  }

  if (!stockLots || stockLots.length === 0) {
    return { success: false, message: "No stock available for this product" }
  }

  // Check if we have enough total stock
  const totalAvailable = stockLots.reduce((sum, lot) => sum + lot.quantity_available, 0)
  if (totalAvailable < quantityToDeduct) {
    return {
      success: false,
      message: `Insufficient stock. Available: ${totalAvailable}, Required: ${quantityToDeduct}`,
    }
  }

  let remainingToDeduct = quantityToDeduct

  // Deduct from stock lots in FIFO order
  for (const lot of stockLots) {
    if (remainingToDeduct <= 0) break

    const deductFromThisLot = Math.min(remainingToDeduct, lot.quantity_available)
    const newAvailableQuantity = lot.quantity_available - deductFromThisLot

    // Update stock lot quantity
    const { error: updateError } = await supabase
      .from("stock_lots")
      .update({ quantity_available: newAvailableQuantity })
      .eq("id", lot.id)

    if (updateError) {
      console.error("Error updating stock lot:", updateError)
      return { success: false, message: "Failed to update stock lot" }
    }

    // Create stock movement record
    const { error: movementError } = await supabase.from("stock_movements").insert({
      stock_lot_id: lot.id,
      movement_type: "OUT",
      quantity: -deductFromThisLot, // Negative for outgoing
      reference_type: "SALE",
      reference_id: saleId,
      notes: `Sale deduction - Lot: ${lot.lot_number}`,
      created_by: userId,
    })

    if (movementError) {
      console.error("Error creating stock movement:", movementError)
      return { success: false, message: "Failed to record stock movement" }
    }

    remainingToDeduct -= deductFromThisLot
  }

  return { success: true }
}

async function restoreStockFromSale(supabase: any, saleId: string): Promise<{ success: boolean; message?: string }> {
  // Get all stock movements for this sale
  const { data: movements, error: fetchError } = await supabase
    .from("stock_movements")
    .select("*, stock_lots(*)")
    .eq("reference_type", "SALE")
    .eq("reference_id", saleId)

  if (fetchError) {
    console.error("Error fetching stock movements:", fetchError)
    return { success: false, message: "Failed to fetch stock movements" }
  }

  if (!movements || movements.length === 0) {
    return { success: true } // No movements to restore
  }

  // Restore quantities to stock lots
  for (const movement of movements) {
    const restoreQuantity = Math.abs(movement.quantity) // Convert negative back to positive

    const { error: updateError } = await supabase
      .from("stock_lots")
      .update({
        quantity_available: supabase.raw(`quantity_available + ${restoreQuantity}`),
      })
      .eq("id", movement.stock_lot_id)

    if (updateError) {
      console.error("Error restoring stock lot:", updateError)
      return { success: false, message: "Failed to restore stock lot" }
    }
  }

  // Delete the stock movements
  const { error: deleteError } = await supabase
    .from("stock_movements")
    .delete()
    .eq("reference_type", "SALE")
    .eq("reference_id", saleId)

  if (deleteError) {
    console.error("Error deleting stock movements:", deleteError)
    return { success: false, message: "Failed to delete stock movements" }
  }

  return { success: true }
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

  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .insert({
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
    .select()
    .single()

  if (saleError) {
    console.error("Database Error:", saleError)
    return { message: "Database Error: Failed to create sale.", success: false }
  }

  const stockResult = await deductStockFIFO(
    supabase,
    validatedFields.data.product_id,
    validatedFields.data.quantity,
    sale.id,
    user.id,
  )

  if (!stockResult.success) {
    // If stock deduction fails, delete the sale
    await supabase.from("sales").delete().eq("id", sale.id)
    return { message: stockResult.message || "Failed to deduct stock.", success: false }
  }

  revalidatePath("/sales")
  revalidatePath("/inventory")
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

  const { data: originalSale, error: fetchError } = await supabase.from("sales").select("*").eq("id", id).single()

  if (fetchError) {
    console.error("Database Error:", fetchError)
    return { message: "Database Error: Failed to fetch original sale.", success: false }
  }

  const restoreResult = await restoreStockFromSale(supabase, id)
  if (!restoreResult.success) {
    return { message: restoreResult.message || "Failed to restore stock.", success: false }
  }

  // Update the sale
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

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to update sale.", success: false }
  }

  const stockResult = await deductStockFIFO(
    supabase,
    validatedFields.data.product_id,
    validatedFields.data.quantity,
    id,
    user.id,
  )

  if (!stockResult.success) {
    return { message: stockResult.message || "Failed to deduct stock.", success: false }
  }

  revalidatePath("/sales")
  revalidatePath(`/sales/${id}/edit`)
  revalidatePath("/inventory")
  redirect("/sales")
}

export async function deleteSale(id: string) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const supabase = createClient()

  const restoreResult = await restoreStockFromSale(supabase, id)
  if (!restoreResult.success) {
    return { message: restoreResult.message || "Failed to restore stock.", success: false }
  }

  const { error } = await supabase.from("sales").delete().eq("id", id)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to delete sale.", success: false }
  }

  revalidatePath("/sales")
  revalidatePath("/inventory")
  return { message: "Sale deleted successfully.", success: true }
}
