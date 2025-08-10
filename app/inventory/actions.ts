"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const ProductSchema = z.object({
  name: z.string().min(1, "Name is required."),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be a positive number."),
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative."),
  supplier_id: z.coerce.number().int().positive("Supplier is required."),
})

export async function createProduct(prevState: any, formData: FormData) {
  const validatedFields = ProductSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Failed to create product. Please check the fields.",
    }
  }

  const supabase = createClient()
  const { error } = await supabase.from("products").insert(validatedFields.data)

  if (error) {
    console.error("Supabase error:", error)
    return {
      message: "Database Error: Failed to Create Product.",
    }
  }

  revalidatePath("/inventory")
  redirect("/inventory")
}

export async function updateProduct(id: number, prevState: any, formData: FormData) {
  const validatedFields = ProductSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Failed to update product. Please check the fields.",
    }
  }

  const supabase = createClient()
  const { error } = await supabase.from("products").update(validatedFields.data).eq("id", id)

  if (error) {
    return {
      message: "Database Error: Failed to Update Product.",
    }
  }

  revalidatePath("/inventory")
  revalidatePath(`/inventory/${id}/edit`)
  redirect("/inventory")
}

export async function deleteProduct(id: number) {
  const supabase = createClient()
  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) {
    return {
      message: "Database Error: Failed to Delete Product.",
    }
  }

  revalidatePath("/inventory")
}
