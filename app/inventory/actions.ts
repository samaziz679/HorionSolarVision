"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"

const FormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Product name is required."),
  description: z.string().optional(),
  price: z.coerce.number().gt(0, "Price must be greater than 0."),
  stock_quantity: z.coerce.number().int().nonnegative("Stock quantity must be a non-negative integer."),
  category: z.string().optional(),
  supplier_id: z.coerce.number().optional(),
})

const CreateProductSchema = FormSchema.omit({ id: true })
const UpdateProductSchema = FormSchema

export type State = {
  errors?: {
    name?: string[]
    description?: string[]
    price?: string[]
    stock_quantity?: string[]
    category?: string[]
    supplier_id?: string[]
  }
  message?: string | null
  success?: boolean
}

export async function createProduct(prevState: State, formData: FormData) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const validatedFields = CreateProductSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock_quantity: formData.get("stock_quantity"),
    category: formData.get("category"),
    supplier_id: formData.get("supplier_id"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to create product.",
      success: false,
    }
  }

  const { name, description, price, stock_quantity, category, supplier_id } = validatedFields.data
  const supabase = createClient()

  const { error } = await supabase.from("products").insert({
    name,
    description: description || null,
    price,
    stock_quantity,
    category: category || null,
    supplier_id: supplier_id || null,
    user_id: user.id,
  })

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to create product.", success: false }
  }

  revalidatePath("/inventory")
  redirect("/inventory")
}

export async function updateProduct(id: number, prevState: State, formData: FormData) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const validatedFields = UpdateProductSchema.safeParse({
    id: id.toString(),
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock_quantity: formData.get("stock_quantity"),
    category: formData.get("category"),
    supplier_id: formData.get("supplier_id"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to update product.",
      success: false,
    }
  }

  const { name, description, price, stock_quantity, category, supplier_id } = validatedFields.data
  const supabase = createClient()

  const { error } = await supabase
    .from("products")
    .update({
      name,
      description: description || null,
      price,
      stock_quantity,
      category: category || null,
      supplier_id: supplier_id || null,
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to update product.", success: false }
  }

  revalidatePath("/inventory")
  revalidatePath(`/inventory/${id}/edit`)
  redirect("/inventory")
}

export async function deleteProduct(id: number) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const supabase = createClient()
  const { error } = await supabase.from("products").delete().eq("id", id).eq("user_id", user.id)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to delete product.", success: false }
  }

  revalidatePath("/inventory")
  return { message: "Product deleted successfully.", success: true }
}
