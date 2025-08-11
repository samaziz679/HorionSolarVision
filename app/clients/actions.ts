"use server"

import { z } from "zod"
import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"

const FormSchema = z.object({
  id: z.string(),
  first_name: z.string().min(1, "First name is required."),
  last_name: z.string().min(1, "Last name is required."),
  email: z.string().email("Invalid email address.").min(1, "Email is required."),
  phone: z.string().optional(),
  address: z.string().optional(),
})

const CreateClientSchema = FormSchema.omit({ id: true })
const UpdateClientSchema = FormSchema

export type State = {
  errors?: {
    first_name?: string[]
    last_name?: string[]
    email?: string[]
    phone?: string[]
    address?: string[]
  }
  message?: string | null
  success?: boolean
}

export async function createClient(prevState: State, formData: FormData) {
  const user = await getAuthUser()
  if (!user) {
    return {
      message: "Authentication error. Please sign in.",
      success: false,
    }
  }

  const validatedFields = CreateClientSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to create client.",
      success: false,
    }
  }

  const { first_name, last_name, email, phone, address } = validatedFields.data
  const supabase = createSupabaseClient()

  const { error } = await supabase.from("clients").insert({
    first_name,
    last_name,
    email,
    phone: phone || null,
    address: address || null,
    user_id: user.id,
  })

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to create client.", success: false }
  }

  revalidatePath("/clients")
  redirect("/clients")
}

export async function updateClient(id: number, prevState: State, formData: FormData) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const validatedFields = UpdateClientSchema.safeParse({
    id: id.toString(),
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or invalid fields. Failed to update client.",
      success: false,
    }
  }

  const { first_name, last_name, email, phone, address } = validatedFields.data
  const supabase = createSupabaseClient()

  const { error } = await supabase
    .from("clients")
    .update({ first_name, last_name, email, phone: phone || null, address: address || null })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to update client.", success: false }
  }

  revalidatePath("/clients")
  revalidatePath(`/clients/${id}/edit`)
  redirect("/clients")
}

export async function deleteClientAction(id: number) {
  const user = await getAuthUser()
  if (!user) {
    return { message: "Authentication error. Please sign in.", success: false }
  }

  const supabase = createSupabaseClient()
  const { error } = await supabase.from("clients").delete().eq("id", id).eq("user_id", user.id)

  if (error) {
    console.error("Database Error:", error)
    return { message: "Database Error: Failed to delete client.", success: false }
  }

  revalidatePath("/clients")
  return { message: "Client deleted successfully.", success: true }
}
