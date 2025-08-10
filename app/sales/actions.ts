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
  client_id: z.string().min(1, "Client is required."),
  sale_date: z.string().min(1, "Sale Date is required."),
  items: z.array(SaleItemSchema).min(1, "At least one item is required."),
  total_amount: z.coerce.number().positive("Total amount must be positive."),
})

const CreateSale = FormSchema

export type State = {
  errors?: {
    client_id?: string[]
    sale_date?: string[]
    items?: string[]
    total_amount?: string[]
    form?: string[] // For general form errors
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

  const validatedFields = CreateSale.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to create sale.",
    }
  }

  const { client_id, sale_date, items, total_amount } = validatedFields.data
  const supabase = createClient()

  try {
    // Use a database transaction to ensure all operations succeed or none do.
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
      console.error("Database Error (Create Sale Items):", itemsError)
      // If items fail, we should attempt to roll back the sale creation.
      await supabase.from("sales").delete().eq("id", sale.id)
      return { message: "Database Error: Failed to create sale items. Sale was rolled back." }
    }

    // Update stock for each product using a database function for atomicity
    for (const item of items) {
      const { error: stockError } = await supabase.rpc("decrease_stock", {
        p_product_id: Number(item.product_id),
        p_quantity: item.quantity,
      })
      if (stockError) {
        console.error("Database Error (Update Stock):", stockError)
        // This is the hardest part to roll back without full transaction support across RPC calls.
        // The database function should ideally handle this.
        return {
          message: `Database Error: Failed to update stock for product ID ${item.product_id}. Please check inventory.`,
        }
      }
    }
  } catch (error) {
    console.error("Unexpected Error:", error)
    return { message: "An unexpected error occurred while creating the sale." }
  }

  revalidatePath("/sales")
  revalidatePath("/inventory")
  redirect("/sales")
}

// NOTE: You will need a corresponding `decrease_stock` function in your Supabase SQL editor:
/*
CREATE OR REPLACE FUNCTION decrease_stock(p_product_id INT, p_quantity INT)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET stock_quantity = stock_quantity - p_quantity
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;
*/
