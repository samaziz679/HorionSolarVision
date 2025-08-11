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
  prix_achat: z.coerce.number().gt(0, "Purchase price must be greater than 0."),
  prix_vente_detail_1: z.coerce.number().gt(0, "Retail price 1 must be greater than 0."),
  prix_vente_detail_2: z.coerce.number().optional(),
  prix_vente_gros: z.coerce.number().optional(),
  quantity: z.coerce.number().int().nonnegative("Quantity must be a non-negative integer."),
  type: z.string().optional(),
  unit: z.string().optional(),
  seuil_stock_bas: z.coerce.number().int().optional(),
})

const CreateProductSchema = FormSchema.omit({ id: true })
const UpdateProductSchema = FormSchema

export type State = {
  errors?: {
    name?: string[]
    description?: string[]
    prix_achat?: string[]
    prix_vente_detail_1?: string[]
    prix_vente_detail_2?: string[]
    prix_vente_gros?: string[]
    quantity?: string[]
    type?: string[]
    unit?: string[]
    seuil_stock_bas?: string[]
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
    prix_achat: formData.get("prix_achat"),
    prix_vente_detail_1: formData.get("prix_vente_detail_1"),
    prix_vente_detail_2: formData.get("prix_vente_detail_2"),
    prix_vente_gros: formData.get("prix_vente_gros"),
    quantity: formData.get("quantity"),
    type: formData.get("type"),
    unit: formData.get("unit"),
    seuil_stock_bas: formData.get("seuil_stock_bas"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to create product.",
      success: false,
    }
  }

  const {
    name,
    description,
    prix_achat,
    prix_vente_detail_1,
    prix_vente_detail_2,
    prix_vente_gros,
    quantity,
    type,
    unit,
    seuil_stock_bas,
  } = validatedFields.data
  const supabase = createClient()

  const { error } = await supabase.from("products").insert({
    name,
    description,
    prix_achat,
    prix_vente_detail_1,
    prix_vente_detail_2,
    prix_vente_gros,
    quantity,
    type,
    unit,
    seuil_stock_bas,
    created_by: user.id,
  })

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to create product.", success: false }
  }

  revalidatePath("/inventory")
  redirect("/inventory")
}

export async function updateProduct(id: string, prevState: State, formData: FormData) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const validatedFields = UpdateProductSchema.safeParse({
    id,
    name: formData.get("name"),
    description: formData.get("description"),
    prix_achat: formData.get("prix_achat"),
    prix_vente_detail_1: formData.get("prix_vente_detail_1"),
    prix_vente_detail_2: formData.get("prix_vente_detail_2"),
    prix_vente_gros: formData.get("prix_vente_gros"),
    quantity: formData.get("quantity"),
    type: formData.get("type"),
    unit: formData.get("unit"),
    seuil_stock_bas: formData.get("seuil_stock_bas"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to update product.",
      success: false,
    }
  }

  const {
    name,
    description,
    prix_achat,
    prix_vente_detail_1,
    prix_vente_detail_2,
    prix_vente_gros,
    quantity,
    type,
    unit,
    seuil_stock_bas,
  } = validatedFields.data
  const supabase = createClient()

  const { error } = await supabase
    .from("products")
    .update({
      name,
      description,
      prix_achat,
      prix_vente_detail_1,
      prix_vente_detail_2,
      prix_vente_gros,
      quantity,
      type,
      unit,
      seuil_stock_bas,
    })
    .eq("id", id)
    .eq("created_by", user.id)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to update product.", success: false }
  }

  revalidatePath("/inventory")
  revalidatePath(`/inventory/${id}/edit`)
  redirect("/inventory")
}

export async function deleteProduct(id: string) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const supabase = createClient()
  const { error } = await supabase.from("products").delete().eq("id", id).eq("created_by", user.id)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to delete product.", success: false }
  }

  revalidatePath("/inventory")
  return { message: "Product deleted successfully.", success: true }
}
