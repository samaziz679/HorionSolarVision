"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"

const FormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required."),
  contact_person: z.string().optional(),
  email: z.string().email("Invalid email address.").min(1, "Email is required."),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
})

const CreateSupplierSchema = FormSchema.omit({ id: true })
const UpdateSupplierSchema = FormSchema

export type State = {
  errors?: {
    name?: string[]
    contact_person?: string[]
    email?: string[]
    phone?: string[]
    address?: string[]
    notes?: string[]
  }
  message?: string | null
  success?: boolean
}

export async function createSupplier(prevState: State, formData: FormData) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const validatedFields = CreateSupplierSchema.safeParse({
    name: formData.get("name"),
    contact_person: formData.get("contact_person"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    notes: formData.get("notes"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to create supplier.",
      success: false,
    }
  }

  const { name, contact_person, email, phone, address, notes } = validatedFields.data
  const supabase = createClient()

  const { error } = await supabase.from("suppliers").insert({
    name,
    contact_person: contact_person || null,
    email,
    phone: phone || null,
    address: address || null,
    notes: notes || null,
    created_by: user.id,
  })

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to create supplier.", success: false }
  }

  revalidatePath("/suppliers")
  redirect("/suppliers")
}

export async function updateSupplier(id: string, prevState: State, formData: FormData) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const validatedFields = UpdateSupplierSchema.safeParse({
    id: id,
    name: formData.get("name"),
    contact_person: formData.get("contact_person"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    notes: formData.get("notes"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to update supplier.",
      success: false,
    }
  }

  const { name, contact_person, email, phone, address, notes } = validatedFields.data
  const supabase = createClient()

  const { error } = await supabase
    .from("suppliers")
    .update({
      name,
      contact_person: contact_person || null,
      email,
      phone: phone || null,
      address: address || null,
      notes: notes || null,
    })
    .eq("id", id)

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
  const { error } = await supabase.from("suppliers").delete().eq("id", id)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to delete supplier.", success: false }
  }

  revalidatePath("/suppliers")
  return { message: "Supplier deleted successfully.", success: true }
}
