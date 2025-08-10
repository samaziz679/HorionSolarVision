// v2.0 Final - Corrected
"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"

const FormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Supplier name is required."),
  contact_person: z.string().optional(),
  email: z.string().email("Invalid email address.").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
})

const CreateSupplier = FormSchema.omit({ id: true })
const UpdateSupplier = FormSchema

export type State = {
  errors?: {
    name?: string[]
    contact_person?: string[]
    email?: string[]
    phone?: string[]
    address?: string[]
  }
  message?: string | null
  success?: boolean
}

export async function createSupplierAction(prevState: State, formData: FormData) {
  const user = await getAuthUser()
  if (!user) {
    return {
      message: "Authentication error. Please sign in.",
      success: false,
    }
  }

  const validatedFields = CreateSupplier.safeParse({
    name: formData.get("name"),
    contact_person: formData.get("contact_person"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to create supplier.",
      success: false,
    }
  }

  const { name, contact_person, email, phone, address } = validatedFields.data
  const supabase = createClient()

  const { error } = await supabase.from("suppliers").insert({
    name,
    contact_person,
    email,
    phone,
    address,
    user_id: user.id,
  })

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to create supplier.", success: false }
  }

  revalidatePath("/suppliers")
  redirect("/suppliers")
}

export async function updateSupplierAction(id: string, prevState: State, formData: FormData) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const validatedFields = UpdateSupplier.safeParse({
    id,
    name: formData.get("name"),
    contact_person: formData.get("contact_person"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to update supplier.",
      success: false,
    }
  }

  const { name, contact_person, email, phone, address } = validatedFields.data
  const supabase = createClient()

  const { error } = await supabase
    .from("suppliers")
    .update({ name, contact_person, email, phone, address })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to update supplier.", success: false }
  }

  revalidatePath("/suppliers")
  revalidatePath(`/suppliers/${id}/edit`)
  redirect("/suppliers")
}

export async function deleteSupplierAction(id: string) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const supabase = createClient()
  const { error } = await supabase.from("suppliers").delete().eq("id", id).eq("user_id", user.id)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to delete supplier.", success: false }
  }

  revalidatePath("/suppliers")
  return { message: "Supplier deleted successfully.", success: true }
}
