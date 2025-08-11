"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"

const SaleItemSchema = z.object({
  product_id: z.string().min(1, "Product is required."),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1."),
  unit_price: z.coerce.number().positive("Unit price must be positive."),
})

const FormSchema = z.object({
  id: z.string().optional(),
  client_id: z.string().min(1, "Client is required."),
  sale_date: z.string().min(1, "Sale Date is required."),
  items: z.array(SaleItemSchema).min(1, "At least one item is required."),
  total_amount: z.coerce.number().positive("Total amount must be positive."),
})

const CreateSaleSchema = FormSchema.omit({ id: true })
const UpdateSaleSchema = FormSchema.extend({ id: z.string().min(1) })

export type State = {
  errors?: {
    client_id?: string[]
    sale_date?: string[]
    items?: string[]
    total_amount?: string[]
    form?: string[]
  }
  message?: string | null
}

export async function createSale(prevState: State, formData: FormData): Promise<State> {
  const user = await getAuthUser()
  if (!user) return { message: "Authentication required." }

  const rawData = {
    client_id: formData.get("client_id"),
    sale_date: formData.get("sale_date"),
    total_amount: formData.get("total_amount"),
    items: JSON.parse((formData.get("items") as string) || "[]"),
  }

  const validatedFields = CreateSaleSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to create sale.",
    }
  }

  const { client_id, sale_date, items, total_amount } = validatedFields.data
  const supabase = createClient()

  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .insert({
      client_id: Number(client_id),
      date: sale_date,
      total_amount,
      user_id: user.id,
    })
    .select()
    .single()

  if (saleError || !sale) {
    console.error("Database Error (Create Sale):", saleError)
    return { message: "Database Error: Failed to create sale record." }
  }

  const saleItemsToInsert = items.map((item) => ({
    sale_id: sale.id,
    product_id: Number(item.product_id),
    quantity: item.quantity,
    unit_price: item.unit_price,
    user_id: user.id,
  }))

  const { error: itemsError } = await supabase.from("sale_items").insert(saleItemsToInsert)

  if (itemsError) {
    await supabase.from("sales").delete().eq("id", sale.id)
    return { message: "Database Error: Failed to create sale items. Sale was rolled back." }
  }

  for (const item of items) {
    const { error: stockError } = await supabase.rpc("decrease_stock", {
      p_product_id: Number(item.product_id),
      p_quantity: item.quantity,
    })
    if (stockError) {
      return {
        message: `Database Error: Failed to update stock for product ID ${item.product_id}. Please check inventory.`,
      }
    }
  }

  revalidatePath("/sales")
  revalidatePath("/inventory")
  redirect("/sales")
}

export async function updateSale(id: string, prevState: State, formData: FormData): Promise<State> {
  const user = await getAuthUser()
  if (!user) return { message: "Authentication required." }

  const rawData = {
    id,
    client_id: formData.get("client_id"),
    sale_date: formData.get("sale_date"),
    total_amount: formData.get("total_amount"),
    items: JSON.parse((formData.get("items") as string) || "[]"),
  }

  const validatedFields = UpdateSaleSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to update sale.",
    }
  }

  const { client_id, sale_date, items, total_amount } = validatedFields.data
  const supabase = createClient()

  // This is not a true transaction, but it's the best we can do in this context.
  try {
    // 1. Get old sale items to revert stock
    const { data: oldSaleItems, error: oldItemsError } = await supabase
      .from("sale_items")
      .select("product_id, quantity")
      .eq("sale_id", id)
    if (oldItemsError) throw new Error("Failed to fetch old sale items.")

    // 2. Revert stock for old items
    for (const item of oldSaleItems) {
      await supabase.rpc("increase_stock", {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      })
    }

    // 3. Delete old sale items
    await supabase.from("sale_items").delete().eq("sale_id", id)

    // 4. Update the main sale record
    const { error: saleUpdateError } = await supabase
      .from("sales")
      .update({
        client_id: Number(client_id),
        date: sale_date,
        total_amount,
      })
      .eq("id", id)
    if (saleUpdateError) throw new Error("Failed to update sale record.")

    // 5. Insert new sale items
    const newSaleItemsToInsert = items.map((item) => ({
      sale_id: Number(id),
      product_id: Number(item.product_id),
      quantity: item.quantity,
      unit_price: item.unit_price,
      user_id: user.id,
    }))
    const { error: newItemsError } = await supabase.from("sale_items").insert(newSaleItemsToInsert)
    if (newItemsError) throw new Error("Failed to insert new sale items.")

    // 6. Decrease stock for new items
    for (const item of items) {
      await supabase.rpc("decrease_stock", {
        p_product_id: Number(item.product_id),
        p_quantity: item.quantity,
      })
    }
  } catch (error) {
    console.error("Update Sale Error:", error)
    return { message: "Database Error: Failed to update sale. The operation may be partially complete." }
  }

  revalidatePath("/sales")
  revalidatePath(`/sales/${id}/edit`)
  revalidatePath("/inventory")
  redirect("/sales")
}
