"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"

const SaleItemSchema = z.object({
  product_id: z.coerce.number().min(1, "Product is required."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
  unit_price: z.coerce.number().min(0, "Unit price cannot be negative."),
})

const FormSchema = z.object({
  id: z.string(),
  client_id: z.coerce.number().min(1, "Client is required."),
  date: z.string().min(1, "Sale date is required."),
  sale_items: z.array(SaleItemSchema).min(1, "At least one item is required."),
})

const CreateSaleSchema = FormSchema.omit({ id: true })
const UpdateSaleSchema = FormSchema

export type State = {
  errors?: {
    client_id?: string[]
    date?: string[]
    sale_items?: string[]
    total_amount?: string[]
  }
  message?: string | null
  success?: boolean
}

async function upsertSale(
  data: z.infer<typeof CreateSaleSchema> | z.infer<typeof UpdateSaleSchema>,
  user_id: string,
  sale_id?: number,
) {
  const supabase = createClient()
  const { client_id, date, sale_items } = data

  const total_amount = sale_items.reduce((acc, item) => acc + item.quantity * item.unit_price, 0)

  const { data: saleData, error: saleError } = await supabase
    .from("sales")
    .upsert({
      id: sale_id,
      client_id,
      date,
      total_amount,
      user_id,
    })
    .select()
    .single()

  if (saleError) {
    console.error("Sale Upsert Error:", saleError)
    return { message: "Database Error: Failed to save sale.", success: false }
  }

  // If updating, first delete old items
  if (sale_id) {
    const { error: deleteError } = await supabase.from("sale_items").delete().eq("sale_id", sale_id)
    if (deleteError) {
      console.error("Sale Items Delete Error:", deleteError)
      return { message: "Database Error: Failed to update sale items.", success: false }
    }
  }

  const itemsToInsert = sale_items.map((item) => ({
    ...item,
    sale_id: saleData.id,
    user_id,
  }))

  const { error: itemsError } = await supabase.from("sale_items").insert(itemsToInsert)

  if (itemsError) {
    console.error("Sale Items Insert Error:", itemsError)
    return { message: "Database Error: Failed to save sale items.", success: false }
  }

  return { success: true, saleId: saleData.id }
}

export async function createSale(prevState: State, formData: FormData) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const saleItems = JSON.parse(formData.get("sale_items") as string)

  const validatedFields = CreateSaleSchema.safeParse({
    client_id: formData.get("client_id"),
    date: formData.get("date"),
    sale_items: saleItems,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to create sale.",
      success: false,
    }
  }

  const result = await upsertSale(validatedFields.data, user.id)
  if (!result.success) {
    return { message: result.message, success: false }
  }

  revalidatePath("/sales")
  redirect("/sales")
}

export async function updateSale(id: number, prevState: State, formData: FormData) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const saleItems = JSON.parse(formData.get("sale_items") as string)

  const validatedFields = UpdateSaleSchema.safeParse({
    id: id.toString(),
    client_id: formData.get("client_id"),
    date: formData.get("date"),
    sale_items: saleItems,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to update sale.",
      success: false,
    }
  }

  const result = await upsertSale(validatedFields.data, user.id, id)
  if (!result.success) {
    return { message: result.message, success: false }
  }

  revalidatePath("/sales")
  revalidatePath(`/sales/${id}/edit`)
  redirect("/sales")
}

export async function deleteSale(id: number) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const supabase = createClient()

  // Must delete from sale_items first due to foreign key constraint
  const { error: itemsError } = await supabase.from("sale_items").delete().eq("sale_id", id).eq("user_id", user.id)
  if (itemsError) {
    console.error("Database Error:", itemsError)
    return { message: "Database Error: Failed to delete sale items.", success: false }
  }

  const { error: saleError } = await supabase.from("sales").delete().eq("id", id).eq("user_id", user.id)
  if (saleError) {
    console.error("Database Error:", saleError)
    return { message: "Database Error: Failed to delete sale.", success: false }
  }

  revalidatePath("/sales")
  return { message: "Sale deleted successfully.", success: true }
}
