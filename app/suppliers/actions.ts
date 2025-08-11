"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const SupplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required."),
  contact_person: z.string().optional(),
  email: z.string().email("Invalid email address.").optional().or(z.literal("")),
  phone_number: z.string().optional(),
  address: z.string().optional(),
})

export async function createSupplier(prevState: any, formData: FormData) {
  const supabase = createClient()
  const validatedFields = SupplierSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Error: Please check the form fields.",
    }
  }

  const { data, error } = await supabase.from("suppliers").insert(validatedFields.data).select().single()

  if (error) {
    return {
      errors: {},
      message: `Database Error: Failed to create supplier. ${error.message}`,
    }
  }

  revalidatePath("/suppliers")
  return {
    errors: {},
    message: `Successfully created supplier ${data.name}.`,
  }
}

export async function updateSupplier(id: string, prevState: any, formData: FormData) {
  const supabase = createClient()
  const validatedFields = SupplierSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Error: Please check the form fields.",
    }
  }

  const { data, error } = await supabase.from("suppliers").update(validatedFields.data).eq("id", id).select().single()

  if (error) {
    return {
      errors: {},
      message: `Database Error: Failed to update supplier. ${error.message}`,
    }
  }

  revalidatePath("/suppliers")
  revalidatePath(`/suppliers/${id}/edit`)
  return {
    errors: {},
    message: `Successfully updated supplier ${data.name}.`,
  }
}

export async function deleteSupplier(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("suppliers").delete().eq("id", id)

  if (error) {
    return {
      message: `Database Error: Failed to delete supplier. ${error.message}`,
    }
  }

  revalidatePath("/suppliers")
  return {
    message: "Successfully deleted supplier.",
  }
}
